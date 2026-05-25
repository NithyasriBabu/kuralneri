import { useState, useEffect, useCallback, useMemo } from 'react';
import { getPaginatedKurals, getKuralsCount } from 'src/data/services';
import { KuralRecord } from 'src/types/database.types';

export function useKuralFeed(userLimit: number = 30) {
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

  // 🎯 NEW: Generate a smart 7-page sliding window centered around the active page
  const visiblePageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 7; // Size of your sliding window

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    // Adjust boundaries if we are near the end pages
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

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

  // Reset back to page 1 seamlessly if the user swaps their limit settings
  useEffect(() => {
    fetchPageData(1);
  }, [userLimit]);

  return {
    kurals,
    loading,
    page,
    hasMore: page < totalPages,
    totalPages,
    visiblePageNumbers, // 👈 Exposes only the 7 centered window options
    nextPage: () => fetchPageData(page + 1),
    prevPage: () => fetchPageData(page - 1),
    goToPage: (pageNumber: number) => fetchPageData(pageNumber),
  };
}
