import { useCallback, useEffect, useState } from 'react';

import { getKuralNotesById } from 'src/data/services';
import { AuthorNote } from 'src/types/types';

export function useKuralNotes(kuralId: number) {
  const [notes, setNotes] = useState<AuthorNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getKuralNotesById(kuralId);
      setNotes(next);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load kural notes.'));
    } finally {
      setLoading(false);
    }
  }, [kuralId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { notes, loading, error, refresh };
}
