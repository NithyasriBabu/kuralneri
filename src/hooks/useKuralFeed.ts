import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPaginatedKurals, getKuralsCount } from 'src/data/services';
import { KuralRecord } from 'src/types/database.types';

export function useKuralFeed(userLimit: number = 30, screenWidth: number = 375) {
  const [kurals, setKurals] = useState<KuralRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Fetch total count once on mount
  useEffect(() => {
    async function initializeCount() {
      const count = await getKuralsCount();
      setTotalRecords(count);
    }
    initializeCount();
  }, []);

  // Calculate dynamic total pages
  const totalPages = useMemo(() => {
    if (totalRecords === 0) return 1;
    return Math.ceil(totalRecords / userLimit);
  }, [totalRecords, userLimit]);

  const visiblePageNumbers = useMemo(() => {
    const pages: number[] = [];

    let maxVisible = 3;
    if (screenWidth > 1024) {
      maxVisible = 7;
    } else if (screenWidth > 600) {
      maxVisible = 5;
    }

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages, screenWidth]);

  const fetchPageData = useCallback(
    async (targetPage: number) => {
      if (targetPage < 1 || (totalPages > 0 && targetPage > totalPages)) return;

      setLoading(true);
      const exactOffset = (targetPage - 1) * userLimit;
      const records = await getPaginatedKurals(userLimit, exactOffset);

      setKurals(records);
      setPage(targetPage);
      setLoading(false);
    },
    [userLimit, totalPages],
  );

  useEffect(() => {
    if (page === 1 && kurals.length === 0) {
      fetchPageData(1);
      return;
    }

    if (totalRecords === 0) return;

    const currentStartingKural = (page - 1) * (kurals.length || userLimit) + 1;
    const targetPage = Math.ceil(currentStartingKural / userLimit);
    const safePage = Math.min(targetPage, Math.ceil(totalRecords / userLimit));

    fetchPageData(safePage || 1);

    // We intentionally watch userLimit to handle configuration updates safely
  }, [userLimit]);

  const kuralRange = useMemo(() => {
    if (totalRecords === 0) return { from: 0, to: 0 };

    const from = (page - 1) * userLimit + 1;
    const to = Math.min(page * userLimit, totalRecords);

    return { from, to };
  }, [page, userLimit, totalRecords]);

  return {
    kurals,
    loading,
    page,
    hasMore: page < totalPages,
    totalPages,
    visiblePageNumbers,
    kuralFrom: kuralRange.from,
    kuralTo: kuralRange.to,
    nextPage: () => fetchPageData(page + 1),
    prevPage: () => fetchPageData(page - 1),
    goToPage: (pageNumber: number) => fetchPageData(pageNumber),
  };
}
