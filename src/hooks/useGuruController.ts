import { useCallback, useEffect, useState } from 'react';

import {
  appendGuruMessage,
  createGuruSession,
  deleteGuruSession,
  getGuruSession,
  getGuruThread,
  listGuruSessions,
  summarizeGuruSession,
} from 'src/data/services';
import { GuruSessionListItem, GuruSessionRecord, GuruThreadMessage } from 'src/types/guru';

function sortSessions(sessions: GuruSessionListItem[]): GuruSessionListItem[] {
  return [...sessions].sort((left, right) => {
    const leftTime = left.updated_at || left.last_active_at || left.created_at;
    const rightTime = right.updated_at || right.last_active_at || right.created_at;
    return rightTime.localeCompare(leftTime);
  });
}

function toSessionListItem(session: GuruSessionRecord): GuruSessionListItem {
  return {
    ...session,
    last_message_preview: '',
    last_message_role: null,
  };
}

export function useGuruController() {
  const [sessions, setSessions] = useState<GuruSessionListItem[]>([]);
  const [activeSession, setActiveSession] = useState<GuruSessionRecord | null>(null);
  const [messages, setMessages] = useState<GuruThreadMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSessionId = activeSession?.session_id ?? null;
  const contextLimitReached = Boolean(activeSession?.is_closed);

  const syncActiveSession = useCallback(async (sessionId: string) => {
    const session = await getGuruSession(sessionId);
    const thread = await getGuruThread(sessionId);
    setActiveSession(session);
    setMessages(thread);
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const initialSessions = sortSessions(await listGuruSessions());
      if (initialSessions.length === 0) {
        const created = await createGuruSession();
        setSessions([toSessionListItem(created)]);
        await syncActiveSession(created.session_id);
        return;
      }

      setSessions(initialSessions);
      await syncActiveSession(initialSessions[0].session_id);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unable to load Guru.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [syncActiveSession]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const refreshSessions = useCallback(
    async (preferredSessionId?: string) => {
      const nextSessions = sortSessions(await listGuruSessions());

      if (nextSessions.length === 0) {
        const created = await createGuruSession();
        setSessions([toSessionListItem(created)]);
        await syncActiveSession(created.session_id);
        return created.session_id;
      }

      setSessions(nextSessions);
      const targetId =
        preferredSessionId &&
        nextSessions.some((session) => session.session_id === preferredSessionId)
          ? preferredSessionId
          : (activeSessionId ?? nextSessions[0].session_id);

      await syncActiveSession(targetId);
      return targetId;
    },
    [activeSessionId, syncActiveSession],
  );

  const selectSession = useCallback(
    async (sessionId: string) => {
      if (sessionId === activeSessionId) return;
      setLoading(true);
      try {
        await syncActiveSession(sessionId);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Unable to open session.');
      } finally {
        setLoading(false);
      }
    },
    [activeSessionId, syncActiveSession],
  );

  const startNewSession = useCallback(async () => {
    setLoading(true);
    try {
      const created = await createGuruSession();
      setSessions((current) =>
        sortSessions([
          toSessionListItem(created),
          ...current.filter((item) => item.session_id !== created.session_id),
        ]),
      );
      await syncActiveSession(created.session_id);
      setDraft('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create session.');
    } finally {
      setLoading(false);
    }
  }, [syncActiveSession]);

  const sendMessage = useCallback(async () => {
    if (!activeSessionId || !draft.trim() || sending || contextLimitReached) return;

    const text = draft.trim();
    setSending(true);
    setError(null);

    try {
      const result = await appendGuruMessage(activeSessionId, text);
      await refreshSessions(result.session.session_id);
      setDraft('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  }, [activeSessionId, contextLimitReached, draft, refreshSessions, sending]);

  const summarizeCurrentSession = useCallback(async () => {
    if (!activeSessionId) return;

    setSummaryLoading(true);
    setError(null);
    try {
      const result = await summarizeGuruSession(activeSessionId);
      if (!result) return;
      await refreshSessions(result.session.session_id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to summarize session.');
    } finally {
      setSummaryLoading(false);
    }
  }, [activeSessionId, refreshSessions]);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      await deleteGuruSession(sessionId);
      const nextSessions = sortSessions((await listGuruSessions()).filter(Boolean));
      setSessions(nextSessions);

      if (nextSessions.length === 0) {
        const created = await createGuruSession();
        setSessions([toSessionListItem(created)]);
        await syncActiveSession(created.session_id);
        return;
      }

      const nextActive = nextSessions[0];
      await syncActiveSession(nextActive.session_id);
    },
    [syncActiveSession],
  );

  const activeSessionSummary = activeSession?.summary_text ?? '';

  return {
    activeSession,
    activeSessionId,
    activeSessionSummary,
    contextLimitReached,
    deleteSession,
    draft,
    error,
    loading,
    messages,
    refreshSessions,
    selectSession,
    sending,
    sessions,
    setDraft,
    sendMessage,
    startNewSession,
    summarizeCurrentSession,
    summaryLoading,
  };
}
