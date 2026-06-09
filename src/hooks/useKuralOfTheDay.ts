import { useState, useEffect, useMemo } from 'react';
import { KuralRecord } from 'src/types/types';
import { getKuralById } from 'src/data/services';
import { useTranslation } from 'src/content/translation';

export const useKuralOfTheDay = () => {
  const { t } = useTranslation('uiChrome', 'cards');
  const [kural, setKural] = useState<KuralRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculates the target ID based on calendar rules
  const kuralIdForTheDay = useMemo(() => {
    const now = new Date();

    // 1. Force calculations based on local calendar dates to avoid midnight shifts
    const year = now.getFullYear();

    // 2. Compute the precise Day of the Year
    const startOfYear = new Date(year, 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // 3. Apply your preferred pseudo-random formula
    const targetId = ((dayOfYear * year) % 1330) + 1;

    return targetId;
  }, []); // Keeps it static during the active app session context

  useEffect(() => {
    let isMounted = true;

    const fetchDailyKural = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getKuralById(kuralIdForTheDay);

        if (isMounted) {
          setKural(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(t('kuralLoadFailed'));
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDailyKural();

    // Cleanup subscription to prevent memory leaks/state updates on unmounted view components
    return () => {
      isMounted = false;
    };
  }, [kuralIdForTheDay, t]); // Runs safely whenever the ID recalculates

  return { kural, loading, error };
};
