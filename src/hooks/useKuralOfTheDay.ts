import { useState, useEffect, useMemo } from 'react';
import { KuralRecord } from 'src/types/types';
import { getKuralById } from 'src/data/services';

export const useKuralOfTheDay = () => {
  const [kural, setKural] = useState<KuralRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const kuralIdForTheDay = useMemo(() => {
    const now = new Date();
    const startOfEpoch = new Date(0);
    const diffInMs = now.getTime() - startOfEpoch.getTime();
    const daysSinceEpoch = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    return (daysSinceEpoch % 1330) + 1;
  }, []);

  useEffect(() => {
    const fetchDailyKural = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getKuralById(kuralIdForTheDay);
        setKural(data);
      } catch (err) {
        setError('திருக்குறளைப் பதிவிறக்க முடியவில்லை / Failed to load daily Kural.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyKural();
  }, []);

  return { kural, loading, error };
};
