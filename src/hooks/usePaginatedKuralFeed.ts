import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getPaginatedKurals,
  getKuralsCount,
  getDistinctKuralFilterIds,
  loadTaxonomy,
  getPaalIdForIyal,
  getParentsForAdhigaram,
} from 'src/data/services';
import {
  KuralRecord,
  PaalRecord,
  KuralFilters,
  IyalRecord,
  AdhigaramRecord,
} from 'src/types/types';

const normalizeId = (value: unknown): number => Number(value) || 0;

export function usePaginatedKuralFeed(userLimit: number = 30, isBookmarkedOnly: boolean = false) {
  const [kurals, setKurals] = useState<KuralRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [taxonomyReady, setTaxonomyReady] = useState(false);
  const [paalOptions, setPaalOptions] = useState<PaalRecord[]>([]);
  const [iyalOptions, setIyalOptions] = useState<IyalRecord[]>([]);
  const [adhigaramOptions, setAdhigaramOptions] = useState<AdhigaramRecord[]>([]);

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

  const filteredIyalOptions = useMemo(
    () => iyalOptions.filter((item) => selectedPaal === 0 || item.paal_id === selectedPaal),
    [iyalOptions, selectedPaal],
  );

  const filteredAdhigaramOptions = useMemo(() => {
    if (selectedIyal > 0) {
      return adhigaramOptions.filter((item) => item.iyal_id === selectedIyal);
    }
    if (selectedPaal > 0) {
      const validIyalIds = new Set(filteredIyalOptions.map((item) => item.id));
      return adhigaramOptions.filter((item) => validIyalIds.has(item.iyal_id));
    }
    return adhigaramOptions;
  }, [adhigaramOptions, filteredIyalOptions, selectedIyal, selectedPaal]);

  const syncFilterOptions = useCallback(
    async (filters: KuralFilters & { isBookmarked?: boolean }) => {
      const taxonomy = await loadTaxonomy();
      const rows = await getDistinctKuralFilterIds(filters);
      const paalIdSet = new Set(rows.map((row) => row.paal_id));
      const iyalIdSet = new Set(rows.map((row) => row.iyal_id));
      const adhigaramIdSet = new Set(rows.map((row) => row.adhigaram_id));

      setPaalOptions(taxonomy.paals.filter((item) => paalIdSet.has(item.id)));
      setIyalOptions(taxonomy.iyals.filter((item) => iyalIdSet.has(item.id)));
      setAdhigaramOptions(taxonomy.adhigarams.filter((item) => adhigaramIdSet.has(item.id)));
    },
    [],
  );

  const fetchPageData = useCallback(
    async (targetPage: number) => {
      const requestId = ++fetchIdRef.current;
      setLoading(true);

      const offset = (targetPage - 1) * userLimit;

      try {
        // Assumes your query services accept the updated filters object
        // containing the boolean flag for filtering.
        const [records, count] = await Promise.all([
          getPaginatedKurals(userLimit, offset, activeFilters),
          getKuralsCount(activeFilters),
          syncFilterOptions(activeFilters),
        ]);

        if (requestId !== fetchIdRef.current) return;

        setTotalRecords(count);
        setKurals(records);
        setPage(targetPage);
      } finally {
        if (requestId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [userLimit, activeFilters, syncFilterOptions],
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

      const validIyals = iyalOptions.filter((i) => i.paal_id === paalId);
      if (selectedIyal && !validIyals.some((i) => i.id === selectedIyal)) {
        setSelectedIyal(0);
        setSelectedAdhigaram(0);
        return;
      }

      if (selectedIyal > 0 && selectedAdhigaram > 0) {
        const validChapters = adhigaramOptions.filter((a) => a.iyal_id === selectedIyal);
        if (!validChapters.some((a) => a.id === selectedAdhigaram)) {
          setSelectedAdhigaram(0);
        }
      }
    },
    [adhigaramOptions, iyalOptions, selectedIyal, selectedAdhigaram],
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

      const validChapters = adhigaramOptions.filter((a) => a.iyal_id === iyalId);
      if (selectedAdhigaram && !validChapters.some((a) => a.id === selectedAdhigaram)) {
        setSelectedAdhigaram(0);
      }
    },
    [adhigaramOptions, selectedPaal, selectedAdhigaram],
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
    iyalOptions: filteredIyalOptions,
    adhigaramOptions: filteredAdhigaramOptions,

    nextPage: () => fetchPageData(page + 1),
    prevPage: () => fetchPageData(page - 1),
    goToPage: (pageNumber: number) => fetchPageData(pageNumber),
    updateKuralBookmarkStatus,
  };
}
