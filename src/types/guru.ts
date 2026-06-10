export type GuruMessageRole = 'user' | 'guru';

export type GuruIntent =
  | 'anger'
  | 'grief'
  | 'ambition'
  | 'love'
  | 'duty'
  | 'learning'
  | 'bridge'
  | 'summary'
  | 'other';

export interface GuruSessionRecord {
  session_id: string;
  title: string;
  summary_text: string;
  summary_updated_at: string | null;
  created_at: string;
  updated_at: string;
  last_active_at: string;
  message_count: number;
  context_limit: number;
  is_closed: boolean;
}

export interface GuruSessionListItem extends GuruSessionRecord {
  last_message_preview: string;
  last_message_role: GuruMessageRole | null;
}

export interface GuruMessageRecord {
  id: number;
  session_id: string;
  role: GuruMessageRole;
  content: string;
  intent_label: GuruIntent;
  created_at: string;
}

export interface GuruCitationRecord {
  message_id: number;
  kural_id: number;
  citation_order: number;
}

export interface GuruCitationView {
  kural_id: number;
  citation_order: number;
  kural_label: string;
}

export interface GuruThreadMessage extends GuruMessageRecord {
  citations: GuruCitationView[];
}

export interface GuruTurnResult {
  session: GuruSessionRecord;
  userMessage: GuruThreadMessage;
  guruMessage: GuruThreadMessage;
  isContextExhausted: boolean;
}

export interface GuruGeneratedReply {
  intent: GuruIntent;
  summaryMode: boolean;
  paragraphs: string[];
  citationKuralIds: number[];
  title: string;
  isBridge: boolean;
}

export interface GuruSummaryResult {
  session: GuruSessionRecord;
  summary: string;
}

export interface GuruDbRunResult {
  lastInsertRowId?: number;
  changes?: number;
}

export interface GuruSessionRow {
  session_id: string;
  title: string;
  summary_text: string;
  summary_updated_at: string | null;
  created_at: string;
  updated_at: string;
  last_active_at: string;
  message_count: number;
  context_limit: number;
  is_closed: number;
  last_message_preview: string | null;
  last_message_role: GuruMessageRole | null;
}

export interface GuruMessageRow {
  id: number;
  session_id: string;
  role: GuruMessageRole;
  content: string;
  intent_label: GuruIntent;
  created_at: string;
  updated_at: string;
}

export interface GuruCitationRow {
  message_id: number;
  kural_id: number;
  citation_order: number;
}
