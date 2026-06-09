import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getPaginatedKurals,
  getKuralsCount,
  loadTaxonomy,
  getIyalOptions,
  getAdhigaramOptions,
  getPaalIdForIyal,
  getParentsForAdhigaram,
} from 'src/data/services';
import { KuralRecord, PaalRecord, KuralFilters } from 'src/types/types';

const normalizeId = (value: unknown): number => Number(value) || 0;

export function usePaginatedKuralFeed(
  userLimit: number = 30,
  isBookmarkedOnly: boolean = false,
  screenWidth: number = 375,
) {
  const [kurals, setKurals] = useState<KuralRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [taxonomyReady, setTaxonomyReady] = useState(false);
  const [paalOptions, setPaalOptions] = useState<PaalRecord[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaal, setSelectedPaal] = useState(0);
  const [selectedIyal, setSelectedIyal] = useState(0);
  const [selectedAdhigaram, setSelectedAdhigaram] = useState(0);

  const fetchIdRef = useRef(0);

  // Merge the isBookmarked condition into the underlying active query filters
  const activeFilters = useMemo<KuralFilters & { isBookmarked?: boolean }>(
    () => ({
      search: searchQuery.trim() || undefined,
      paalId: selectedPaal || undefined,
      iyalId: selectedIyal || undefined,
      adhigaramId: selectedAdhigaram || undefined,
      isBookmarked: isBookmarkedOnly || undefined, // Handled by service query layer
    }),
    [searchQuery, selectedPaal, selectedIyal, selectedAdhigaram, isBookmarkedOnly],
  );

  const iyalOptions = useMemo(
    () => (taxonomyReady ? getIyalOptions(selectedPaal) : []),
    [taxonomyReady, selectedPaal],
  );

  const adhigaramOptions = useMemo(
    () => (taxonomyReady ? getAdhigaramOptions(selectedPaal, selectedIyal) : []),
    [taxonomyReady, selectedPaal, selectedIyal],
  );

  const fetchPageData = useCallback(
    async (targetPage: number) => {
      const requestId = ++fetchIdRef.current;
      setLoading(true);

      const offset = (targetPage - 1) * userLimit;

      // Assumes your query services accept the updated filters object
      // containing the boolean flag for filtering.
      const [records, count] = await Promise.all([
        getPaginatedKurals(userLimit, offset, activeFilters),
        getKuralsCount(activeFilters),
      ]);

      if (requestId !== fetchIdRef.current) return;

      setTotalRecords(count);
      setKurals(records);
      setPage(targetPage);
      setLoading(false);
    },
    [userLimit, activeFilters],
  );

  // Boot: load taxonomy once
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const t = await loadTaxonomy();
      if (cancelled) return;
      setPaalOptions(t.paals);
      setTaxonomyReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Refetch page 1 when filters or bookmark scopes switch
  useEffect(() => {
    if (!taxonomyReady) return;
    fetchPageData(1);
  }, [activeFilters, taxonomyReady, fetchPageData]);

  // Handle adjustments to page sizing gracefully
  useEffect(() => {
    if (!taxonomyReady || totalRecords === 0 || kurals.length === 0 || page === 1) return;

    const currentStartingKural = (page - 1) * kurals.length + 1;
    const targetPage = Math.ceil(currentStartingKural / userLimit);
    const safePage = Math.min(targetPage, Math.ceil(totalRecords / userLimit));

    fetchPageData(safePage || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLimit]);

  const selectPaal = useCallback(
    (value: unknown) => {
      const paalId = normalizeId(value);
      setSelectedPaal(paalId);

      if (paalId === 0) return;

      const validIyals = getIyalOptions(paalId);
      if (selectedIyal && !validIyals.some((i) => i.id === selectedIyal)) {
        setSelectedIyal(0);
        setSelectedAdhigaram(0);
        return;
      }

      if (selectedIyal > 0 && selectedAdhigaram > 0) {
        const validChapters = getAdhigaramOptions(paalId, selectedIyal);
        if (!validChapters.some((a) => a.id === selectedAdhigaram)) {
          setSelectedAdhigaram(0);
        }
      }
    },
    [selectedIyal, selectedAdhigaram],
  );

  const selectIyal = useCallback(
    (value: unknown) => {
      const iyalId = normalizeId(value);
      if (iyalId === 0) {
        setSelectedIyal(0);
        return;
      }

      const paalId = getPaalIdForIyal(iyalId);
      if (paalId) setSelectedPaal(paalId);
      setSelectedIyal(iyalId);

      const validChapters = getAdhigaramOptions(paalId ?? selectedPaal, iyalId);
      if (selectedAdhigaram && !validChapters.some((a) => a.id === selectedAdhigaram)) {
        setSelectedAdhigaram(0);
      }
    },
    [selectedPaal, selectedAdhigaram],
  );

  const selectAdhigaram = useCallback((value: unknown) => {
    const adhigaramId = normalizeId(value);
    if (adhigaramId === 0) {
      setSelectedAdhigaram(0);
      return;
    }

    const parents = getParentsForAdhigaram(adhigaramId);
    if (parents) {
      setSelectedPaal(parents.paalId);
      setSelectedIyal(parents.iyalId);
    }
    setSelectedAdhigaram(adhigaramId);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedPaal(0);
    setSelectedIyal(0);
    setSelectedAdhigaram(0);
  }, []);

  const totalPages = useMemo(() => {
    if (totalRecords === 0) return 1;
    return Math.ceil(totalRecords / userLimit);
  }, [totalRecords, userLimit]);

  const visiblePageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = screenWidth > 1024 ? 7 : screenWidth > 600 ? 5 : 3;

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

  const kuralRange = useMemo(() => {
    if (totalRecords === 0) return { from: 0, to: 0 };
    const from = (page - 1) * userLimit + 1;
    const to = Math.min(page * userLimit, totalRecords);
    return { from, to };
  }, [page, userLimit, totalRecords]);

  // Context-aware bookmark updater
  const updateKuralBookmarkStatus = useCallback(
    (kuralId: number, isBookmarked: boolean) => {
      setKurals((current) => {
        // If we are looking at the Bookmarks tab/feed exclusively,
        // unbookmarking a item should instantly remove it from view.
        if (isBookmarkedOnly && !isBookmarked) {
          return current.filter((kural) => kural.id !== kuralId);
        }
        // Otherwise, just map and update the status inline
        return current.map((kural) =>
          kural.id === kuralId ? { ...kural, is_bookmarked: isBookmarked } : kural,
        );
      });

      // Sync total counts dynamically if items are dropped instantly from view
      if (isBookmarkedOnly && !isBookmarked) {
        setTotalRecords((prev) => Math.max(0, prev - 1));
      }
    },
    [isBookmarkedOnly],
  );

  return {
    kurals,
    loading,
    page,
    hasMore: page < totalPages,
    totalPages,
    visiblePageNumbers,
    kuralFrom: kuralRange.from,
    kuralTo: kuralRange.to,
    totalRecords,

    searchQuery,
    setSearchQuery,
    selectedPaal,
    selectedIyal,
    selectedAdhigaram,
    selectPaal,
    selectIyal,
    selectAdhigaram,
    clearAllFilters,

    paalOptions,
    iyalOptions,
    adhigaramOptions,

    nextPage: () => fetchPageData(page + 1),
    prevPage: () => fetchPageData(page - 1),
    goToPage: (pageNumber: number) => fetchPageData(pageNumber),
    updateKuralBookmarkStatus,
  };
}
