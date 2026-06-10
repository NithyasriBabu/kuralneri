import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { db } from 'src/data/database';
import { runWebDbTask } from 'src/data/webDbQueue';
import { KuralRecord } from 'src/types/types';
import {
  GuruCitationRow,
  GuruCitationView,
  GuruDbRunResult,
  GuruGeneratedReply,
  GuruIntent,
  GuruMessageRow,
  GuruMessageRecord,
  GuruMessageRole,
  GuruSessionListItem,
  GuruSessionRow,
  GuruSessionRecord,
  GuruSummaryResult,
  GuruThreadMessage,
  GuruTurnResult,
} from 'src/types/guru';
import { getKuralById } from 'src/data/services/kuralService';

const GURU_CONTEXT_WINDOW_SIZE = 10;
const GURU_SESSION_MESSAGE_LIMIT = 30;
const GURU_MAX_CITATIONS = 3;

function nowIso(): string {
  return new Date().toISOString();
}

function createSessionId(): string {
  return `guru_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function withGuruDb<T>(
  handler: (targetDb: SQLite.SQLiteDatabase) => Promise<T> | T,
): Promise<T> {
  const targetDb = (Platform.OS === 'web' ? await db : db) as SQLite.SQLiteDatabase;
  return handler(targetDb);
}

type GuruDbQueryMode = 'select' | 'run' | 'runResult';

async function queryGuruDb<T>(
  mode: GuruDbQueryMode,
  querySQL: string,
  args: any[] = [],
): Promise<T> {
  return runWebDbTask(async () =>
    withGuruDb(async (targetDb) => {
      try {
        if (mode === 'select') {
          return Platform.OS === 'web'
            ? ((await targetDb.getAllAsync<T>(querySQL, args)) as T)
            : ((targetDb.getAllSync<T>(querySQL, args) as T) ?? ([] as T));
        }

        if (mode === 'run') {
          if (Platform.OS === 'web') {
            await targetDb.runAsync(querySQL, args);
          } else {
            targetDb.runSync(querySQL, args);
          }
          return undefined as T;
        }

        return Platform.OS === 'web'
          ? ((await targetDb.runAsync(querySQL, args)) as T)
          : (targetDb.runSync(querySQL, args) as T);
      } catch (error) {
        const verb = mode === 'select' ? 'query' : 'write';
        console.error(`Guru ${verb} failed: "${querySQL.substring(0, 80)}..."`, error);
        return mode === 'select' ? ([] as T) : (undefined as T);
      }
    }),
  );
}

function isActiveId(id?: number): boolean {
  return id != null && id > 0;
}

function uniqueIds(ids: number[]): number[] {
  return [...new Set(ids)].filter((id) => Number.isFinite(id) && id > 0);
}

function toBool(value: number): boolean {
  return value === 1;
}

function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function containsAny(text: string, patterns: readonly string[]): boolean {
  const lower = text.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
}

function extractOrdinalIndex(text: string): number | null {
  const lower = text.toLowerCase();
  const ordinalMap: Record<string, number> = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    last: -1,
  };

  for (const [word, value] of Object.entries(ordinalMap)) {
    if (lower.includes(word)) return value;
  }

  const numericMatch = lower.match(/\b(?:kural|verse|number)?\s*#?\s*(\d{1,4})\b/);
  if (!numericMatch) return null;
  const parsed = Number(numericMatch[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function detectIntent(text: string): GuruIntent {
  const lower = text.toLowerCase();

  if (containsAny(lower, ['summarize', 'summary', 'sum up', 'recap'])) return 'summary';
  if (
    containsAny(lower, ['anger', 'angry', 'furious', 'rage', 'irritated', 'resent', 'frustrated'])
  )
    return 'anger';
  if (containsAny(lower, ['grief', 'sad', 'sadness', 'loss', 'mourning', 'pain', 'hurt', 'sorrow']))
    return 'grief';
  if (
    containsAny(lower, [
      'ambition',
      'career',
      'goal',
      'goals',
      'success',
      'leadership',
      'growth',
      'work',
    ])
  )
    return 'ambition';
  if (containsAny(lower, ['love', 'relationship', 'marriage', 'bond', 'affection', 'trust']))
    return 'love';
  if (containsAny(lower, ['duty', 'responsibility', 'family', 'household', 'virtue', 'obligation']))
    return 'duty';
  if (
    containsAny(lower, ['learn', 'learning', 'study', 'knowledge', 'wisdom', 'education', 'skill'])
  )
    return 'learning';

  return 'other';
}

async function searchKuralIdsByTerms(
  terms: string[],
  limit = GURU_MAX_CITATIONS * 2,
): Promise<number[]> {
  const cleanTerms = terms
    .map((term) => term.trim())
    .filter((term) => term.length > 0)
    .slice(0, 8);

  if (cleanTerms.length === 0) return [];

  const clauses = cleanTerms
    .map(
      () =>
        '(k.line1 LIKE ? OR k.line2 LIKE ? OR k.translation LIKE ? OR k.explanation LIKE ? OR k.couplet LIKE ?)',
    )
    .join(' OR ');
  const args = cleanTerms.flatMap((term) => {
    const pattern = `%${term}%`;
    return [pattern, pattern, pattern, pattern, pattern];
  });

  const rows = await queryGuruDb<{ id: number }[]>(
    'select',
    `
      SELECT DISTINCT k.id
      FROM kurals k
      WHERE ${clauses}
      ORDER BY k.id ASC
      LIMIT ?;
    `,
    [...args, limit],
  );

  return rows.map((row) => row.id);
}

async function loadKuralRecords(ids: number[]): Promise<KuralRecord[]> {
  const unique = uniqueIds(ids).slice(0, GURU_MAX_CITATIONS);
  const records: KuralRecord[] = [];

  for (const id of unique) {
    const record = await getKuralById(id);
    if (record) records.push(record);
  }

  return records;
}

async function loadSession(sessionId: string): Promise<GuruSessionRecord | null> {
  const rows = await queryGuruDb<GuruSessionRow[]>(
    'select',
    `
      SELECT
        s.session_id,
        s.title,
        s.summary_text,
        s.summary_updated_at,
        s.created_at,
        s.updated_at,
        s.last_active_at,
        s.message_count,
        s.context_limit,
        s.is_closed,
        COALESCE(
          (
            SELECT m.content
            FROM chat_messages m
            WHERE m.session_id = s.session_id
            ORDER BY m.id DESC
            LIMIT 1
          ),
          ''
        ) AS last_message_preview,
        (
          SELECT m.role
          FROM chat_messages m
          WHERE m.session_id = s.session_id
          ORDER BY m.id DESC
          LIMIT 1
        ) AS last_message_role
      FROM chat_sessions s
      WHERE s.session_id = ?
      LIMIT 1;
    `,
    [sessionId],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    session_id: row.session_id,
    title: row.title,
    summary_text: row.summary_text,
    summary_updated_at: row.summary_updated_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_active_at: row.last_active_at,
    message_count: row.message_count,
    context_limit: row.context_limit,
    is_closed: toBool(row.is_closed),
  };
}

async function loadSessionRows(): Promise<GuruSessionListItem[]> {
  const rows = await queryGuruDb<GuruSessionRow[]>(
    'select',
    `
      SELECT
        s.session_id,
        s.title,
        s.summary_text,
        s.summary_updated_at,
        s.created_at,
        s.updated_at,
        s.last_active_at,
        s.message_count,
        s.context_limit,
        s.is_closed,
        COALESCE(
          (
            SELECT m.content
            FROM chat_messages m
            WHERE m.session_id = s.session_id
            ORDER BY m.id DESC
            LIMIT 1
          ),
          s.title
        ) AS last_message_preview,
        (
          SELECT m.role
          FROM chat_messages m
          WHERE m.session_id = s.session_id
          ORDER BY m.id DESC
          LIMIT 1
        ) AS last_message_role
      FROM chat_sessions s
      ORDER BY s.updated_at DESC, s.last_active_at DESC, s.created_at DESC;
    `,
  );

  return rows.map((row) => ({
    session_id: row.session_id,
    title: row.title,
    summary_text: row.summary_text,
    summary_updated_at: row.summary_updated_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_active_at: row.last_active_at,
    message_count: row.message_count,
    context_limit: row.context_limit,
    is_closed: toBool(row.is_closed),
    last_message_preview: row.last_message_preview ?? '',
    last_message_role: row.last_message_role,
  }));
}

async function createSessionRow(title = 'New conversation'): Promise<GuruSessionRecord> {
  const sessionId = createSessionId();
  const timestamp = nowIso();
  await queryGuruDb<undefined>(
    'run',
    `
      INSERT INTO chat_sessions (
        session_id,
        title,
        summary_text,
        summary_updated_at,
        created_at,
        updated_at,
        last_active_at,
        message_count,
        context_limit,
        is_closed
      )
      VALUES (?, ?, '', NULL, ?, ?, ?, 0, ?, 0);
    `,
    [sessionId, title, timestamp, timestamp, timestamp, GURU_SESSION_MESSAGE_LIMIT],
  );

  return {
    session_id: sessionId,
    title,
    summary_text: '',
    summary_updated_at: null,
    created_at: timestamp,
    updated_at: timestamp,
    last_active_at: timestamp,
    message_count: 0,
    context_limit: GURU_SESSION_MESSAGE_LIMIT,
    is_closed: false,
  };
}

async function getRecentMessages(
  sessionId: string,
  limit = GURU_CONTEXT_WINDOW_SIZE,
): Promise<GuruMessageRecord[]> {
  const rows = await queryGuruDb<GuruMessageRow[]>(
    'select',
    `
      SELECT id, session_id, role, content, intent_label, created_at, updated_at
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY id DESC
      LIMIT ?;
    `,
    [sessionId, limit],
  );

  return rows.reverse().map((row) => ({
    id: row.id,
    session_id: row.session_id,
    role: row.role,
    content: row.content,
    intent_label: row.intent_label,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

async function getMessageCitations(messageIds: number[]): Promise<Map<number, GuruCitationView[]>> {
  const unique = uniqueIds(messageIds);
  if (unique.length === 0) return new Map();

  const placeholders = unique.map(() => '?').join(', ');
  const rows = await queryGuruDb<(GuruCitationRow & { kural_label: string })[]>(
    'select',
    `
      SELECT
        c.message_id,
        c.kural_id,
        c.citation_order,
        k.translation AS kural_label
      FROM chat_citations c
      JOIN kurals k ON k.id = c.kural_id
      WHERE c.message_id IN (${placeholders})
      ORDER BY c.message_id ASC, c.citation_order ASC, c.kural_id ASC;
    `,
    unique,
  );

  const map = new Map<number, GuruCitationView[]>();
  for (const row of rows) {
    const list = map.get(row.message_id) ?? [];
    list.push({
      kural_id: row.kural_id,
      citation_order: row.citation_order,
      kural_label: row.kural_label,
    });
    map.set(row.message_id, list);
  }
  return map;
}

async function buildThreadMessages(sessionId: string): Promise<GuruThreadMessage[]> {
  const messages = await getRecentMessages(sessionId, 500);
  const citations = await getMessageCitations(messages.map((message) => message.id));

  return messages.map((message) => ({
    ...message,
    citations: citations.get(message.id) ?? [],
  }));
}

async function storeCitations(messageId: number, kuralIds: number[]): Promise<void> {
  const unique = uniqueIds(kuralIds).slice(0, GURU_MAX_CITATIONS);
  for (const [index, kuralId] of unique.entries()) {
    await queryGuruDb<undefined>(
      'run',
      `
        INSERT OR REPLACE INTO chat_citations (message_id, kural_id, citation_order)
        VALUES (?, ?, ?);
      `,
      [messageId, kuralId, index + 1],
    );
  }
}

function buildReplyTitle(intent: GuruIntent, text: string): string {
  const trimmed = normalizeText(text);
  const words = trimmed.split(' ').slice(0, 4).join(' ');
  switch (intent) {
    case 'anger':
      return words ? `Anger: ${words}` : 'Anger and restraint';
    case 'grief':
      return words ? `Grief: ${words}` : 'Grief and steadiness';
    case 'ambition':
      return words ? `Ambition: ${words}` : 'Ambition and effort';
    case 'love':
      return words ? `Love: ${words}` : 'Love and trust';
    case 'duty':
      return words ? `Duty: ${words}` : 'Duty and responsibility';
    case 'learning':
      return words ? `Learning: ${words}` : 'Learning and insight';
    case 'summary':
      return 'Conversation summary';
    default:
      return words ? `On ${words}` : 'Moral reflection';
  }
}

async function resolveFollowUpCitationIds(sessionId: string, userText: string): Promise<number[]> {
  const ordinal = extractOrdinalIndex(userText);
  if (ordinal == null) return [];

  const messages = await getGuruSessionContext(sessionId);
  const lastGuruMessage = [...messages].reverse().find((message) => message.role === 'guru');
  const citationIds = lastGuruMessage?.citations.map((citation) => citation.kural_id) ?? [];
  if (citationIds.length === 0) return [];

  if (ordinal === -1) return [citationIds[citationIds.length - 1]];
  const selected = citationIds[ordinal - 1];
  return isActiveId(selected) ? [selected] : [];
}

async function selectCitationIds(
  intent: GuruIntent,
  sessionId: string,
  userText: string,
): Promise<number[]> {
  const followUpIds = await resolveFollowUpCitationIds(sessionId, userText);
  if (followUpIds.length > 0) return followUpIds;

  const intentTerms: Record<Exclude<GuruIntent, 'summary'>, string[]> = {
    anger: ['anger', 'patience', 'forbearance', 'self-control', 'temper', 'calm'],
    grief: ['grief', 'sorrow', 'misfortune', 'fortitude', 'loss', 'pain'],
    ambition: ['effort', 'energy', 'work', 'leadership', 'goal', 'success'],
    love: ['love', 'affection', 'friendship', 'trust', 'bond', 'desire'],
    duty: ['duty', 'virtue', 'responsibility', 'household', 'hospitality', 'discipline'],
    learning: ['learning', 'knowledge', 'wisdom', 'study', 'education', 'skill'],
    bridge: ['virtue', 'self-control', 'truth', 'kindness', 'learning', 'discipline'],
    other: ['virtue', 'kindness', 'discipline', 'learning', 'truth'],
  };

  const terms =
    intent === 'summary'
      ? intentTerms.other
      : intent === 'anger' ||
          intent === 'grief' ||
          intent === 'ambition' ||
          intent === 'love' ||
          intent === 'duty' ||
          intent === 'learning' ||
          intent === 'bridge' ||
          intent === 'other'
        ? intentTerms[intent]
        : intentTerms.other;
  const searchTerms = terms.filter(Boolean);
  const ids = await searchKuralIdsByTerms(searchTerms, GURU_MAX_CITATIONS * 3);
  return uniqueIds(ids).slice(0, GURU_MAX_CITATIONS);
}

function buildResponseParagraphs(
  intent: Exclude<GuruIntent, 'summary'>,
  verses: KuralRecord[],
  userText: string,
): string[] {
  const themeLabel = verses[0]?.translation?.trim() || 'the moral anchor';
  const introMap: Record<Exclude<GuruIntent, 'summary'>, string> = {
    anger: 'I hear heat in this. The Kural answers anger with restraint, not silence.',
    grief: 'I hear grief in this. The Kural does not rush sorrow; it asks for steadiness.',
    ambition: 'I hear ambition in this. The Kural treats effort as discipline, not noise.',
    love: 'I hear attachment in this. The Kural speaks about tenderness, trust, and measure.',
    duty: 'I hear responsibility in this. The Kural keeps returning to duty, order, and consequence.',
    learning: 'I hear a wish to understand. The Kural treats learning as humility plus attention.',
    bridge:
      'This question is not directly answered by the Kural, but its moral lens still gives a bridge.',
    other: 'I can answer only through the Kural, so I will keep the reply anchored there.',
  };

  const verseLine =
    verses.length > 0
      ? `The verses leaning closest to this are ${verses.map((verse) => `Kural ${verse.id}`).join(', ')}.`
      : 'I do not have a close verse match, so I am using a general moral anchor.';

  const followThrough = `The strongest anchor here is ${themeLabel}. Keep the question tied to the same life problem, and I can stay with it.`;

  const directBridge =
    intent === 'bridge'
      ? `If you want a practical bridge, I would translate this into the Kural's language of character, restraint, and consequence.`
      : `If you want to push deeper, ask about the specific verse number and I will unpack it line by line.`;

  const detail =
    normalizeText(userText).length > 0
      ? `Your question was: “${normalizeText(userText)}”.`
      : 'I am answering the current thread of thought as it stands.';

  return [introMap[intent], detail, verseLine, followThrough, directBridge];
}

export function buildGuruStubReply(
  input: {
    sessionId: string;
    userText: string;
    intent: GuruIntent;
    summaryMode?: boolean;
  },
  verses: KuralRecord[],
): GuruGeneratedReply {
  const { sessionId, userText, intent, summaryMode = false } = input;
  const title = buildReplyTitle(intent, userText);

  if (summaryMode) {
    return {
      intent: 'summary',
      summaryMode: true,
      title,
      isBridge: false,
      paragraphs: [
        "This chat has stayed within the Kural's moral frame.",
        `It has moved through ${verses.length} verse anchors and a recurring concern with ${verses[0]?.translation ?? 'character'}.`,
        'The thread can continue from the last cited verse, or you can ask for a narrower summary of any single turn.',
      ],
      citationKuralIds: verses.map((verse) => verse.id).slice(0, GURU_MAX_CITATIONS),
    };
  }

  const isBridge = intent === 'bridge' || intent === 'other';
  return {
    intent,
    summaryMode: false,
    title,
    isBridge,
    paragraphs: buildResponseParagraphs(
      (isBridge ? 'bridge' : intent) as Exclude<GuruIntent, 'summary'>,
      verses,
      userText,
    ),
    citationKuralIds: verses.map((verse) => verse.id).slice(0, GURU_MAX_CITATIONS),
  };
}

export async function listGuruSessions(): Promise<GuruSessionListItem[]> {
  return loadSessionRows();
}

export async function getGuruSession(sessionId: string): Promise<GuruSessionRecord | null> {
  return loadSession(sessionId);
}

export async function getGuruThread(sessionId: string): Promise<GuruThreadMessage[]> {
  return buildThreadMessages(sessionId);
}

export async function createGuruSession(title = 'New conversation'): Promise<GuruSessionRecord> {
  return createSessionRow(title);
}

export async function renameGuruSession(
  sessionId: string,
  title: string,
): Promise<GuruSessionRecord | null> {
  const cleanTitle = normalizeText(title);
  if (!cleanTitle) return getGuruSession(sessionId);

  const timestamp = nowIso();
  await queryGuruDb<undefined>(
    'run',
    `
      UPDATE chat_sessions
      SET title = ?, updated_at = ?, last_active_at = ?
      WHERE session_id = ?;
    `,
    [cleanTitle, timestamp, timestamp, sessionId],
  );
  return getGuruSession(sessionId);
}

export async function deleteGuruSession(sessionId: string): Promise<void> {
  await queryGuruDb<undefined>('run', 'DELETE FROM chat_sessions WHERE session_id = ?;', [
    sessionId,
  ]);
}

export async function markGuruSessionSummary(
  sessionId: string,
  summaryText: string,
): Promise<GuruSessionRecord | null> {
  const timestamp = nowIso();
  await queryGuruDb<undefined>(
    'run',
    `
      UPDATE chat_sessions
      SET summary_text = ?, summary_updated_at = ?, updated_at = ?, last_active_at = ?
      WHERE session_id = ?;
    `,
    [summaryText, timestamp, timestamp, timestamp, sessionId],
  );
  return getGuruSession(sessionId);
}

export async function summarizeGuruSession(sessionId: string): Promise<GuruSummaryResult | null> {
  const session = await getGuruSession(sessionId);
  if (!session) return null;

  const messages = await getGuruThread(sessionId);
  const userMessages = messages.filter((message) => message.role === 'user');
  const citedIds = uniqueIds(
    messages.flatMap((message) => message.citations.map((citation) => citation.kural_id)),
  );
  const verses = await loadKuralRecords(citedIds.slice(0, GURU_MAX_CITATIONS));

  const paragraphs = [
    `This chat has ${userMessages.length} user turn${userMessages.length === 1 ? '' : 's'} and ${messages.length} total message${messages.length === 1 ? '' : 's'}.`,
    verses.length > 0
      ? `The strongest recurring anchors are ${verses.map((verse) => `Kural ${verse.id}`).join(', ')}; the thread keeps returning to ${verses[0]?.translation ?? 'the same moral concern'}.`
      : 'No citations have been attached yet, so the conversation has not been grounded in a specific verse cluster.',
    'If you want to continue, ask about any cited verse by number and I will reopen the same line of thought.',
  ];

  const summary = paragraphs.join('\n\n');
  const updated = await markGuruSessionSummary(sessionId, summary);
  if (!updated) return null;

  return { session: updated, summary };
}

export async function loadGuruSessionsWithThread(): Promise<{
  sessions: GuruSessionListItem[];
  activeSession: GuruSessionRecord | null;
  activeMessages: GuruThreadMessage[];
}> {
  const sessions = await listGuruSessions();
  const activeSession = sessions[0] ? await getGuruSession(sessions[0].session_id) : null;
  const activeMessages = activeSession ? await getGuruThread(activeSession.session_id) : [];
  return { sessions, activeSession, activeMessages };
}

export async function ensureGuruSession(): Promise<GuruSessionRecord> {
  const sessions = await listGuruSessions();
  if (sessions[0]) {
    const active = await getGuruSession(sessions[0].session_id);
    if (active) return active;
  }
  return createGuruSession();
}

export async function appendGuruMessage(
  sessionId: string,
  userText: string,
): Promise<GuruTurnResult> {
  const session = await getGuruSession(sessionId);
  if (!session) throw new Error('Guru session not found.');
  if (session.is_closed) throw new Error('This Guru session is closed.');
  if (session.message_count >= session.context_limit)
    throw new Error('This Guru session has reached its context window.');

  const cleanText = normalizeText(userText);
  if (!cleanText) throw new Error('Guru message cannot be empty.');

  const now = nowIso();
  const intent = detectIntent(cleanText);
  const verseIds = await selectCitationIds(intent, sessionId, cleanText);
  const verses = await loadKuralRecords(verseIds);
  const reply = buildGuruStubReply({ sessionId, userText: cleanText, intent }, verses);
  const sessionTitle = session.message_count === 0 ? reply.title : session.title;

  const userResult = await queryGuruDb<GuruDbRunResult>(
    'runResult',
    `
      INSERT INTO chat_messages (session_id, role, content, intent_label, created_at, updated_at)
      VALUES (?, 'user', ?, ?, ?, ?);
    `,
    [sessionId, cleanText, intent, now, now],
  );

  const userMessageId = userResult.lastInsertRowId ?? 0;
  const guruResult = await queryGuruDb<GuruDbRunResult>(
    'runResult',
    `
      INSERT INTO chat_messages (session_id, role, content, intent_label, created_at, updated_at)
      VALUES (?, 'guru', ?, ?, ?, ?);
    `,
    [sessionId, reply.paragraphs.join('\n\n'), reply.intent, now, now],
  );
  const guruMessageId = guruResult.lastInsertRowId ?? 0;

  await storeCitations(guruMessageId, reply.citationKuralIds);

  const nextCount = session.message_count + 2;
  const isContextExhausted = nextCount >= session.context_limit;
  await queryGuruDb<undefined>(
    'run',
    `
      UPDATE chat_sessions
      SET
        title = ?,
        updated_at = ?,
        last_active_at = ?,
        message_count = ?,
        is_closed = ?
      WHERE session_id = ?;
    `,
    [sessionTitle, now, now, nextCount, isContextExhausted ? 1 : 0, sessionId],
  );

  const updatedSession = (await getGuruSession(sessionId)) ?? session;
  const citations = await getMessageCitations([userMessageId, guruMessageId]);

  return {
    session: updatedSession,
    userMessage: {
      id: userMessageId,
      session_id: sessionId,
      role: 'user',
      content: cleanText,
      intent_label: intent,
      created_at: now,
      citations: citations.get(userMessageId) ?? [],
    },
    guruMessage: {
      id: guruMessageId,
      session_id: sessionId,
      role: 'guru',
      content: reply.paragraphs.join('\n\n'),
      intent_label: reply.intent,
      created_at: now,
      citations: citations.get(guruMessageId) ?? [],
    },
    isContextExhausted,
  };
}

export async function getGuruSessionContext(sessionId: string): Promise<GuruThreadMessage[]> {
  const messages = await getGuruThread(sessionId);
  return messages.slice(-GURU_CONTEXT_WINDOW_SIZE);
}

export { GURU_CONTEXT_WINDOW_SIZE, GURU_SESSION_MESSAGE_LIMIT };
