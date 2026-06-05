import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getBookmarkAdhigaramOptions,
  getBookmarkIyalOptions,
  getBookmarkKurals,
  getBookmarkPaalOptions,
} from 'src/data/services';
import {
  AdhigaramRecord,
  IyalRecord,
  KuralFilters,
  KuralRecord,
  PaalRecord,
} from 'src/types/types';

const normalizeId = (value: unknown): number => Number(value) || 0;
const BOOKMARK_FETCH_LIMIT = 2000;

export function useBookmarkFeed(userLimit: number = 30, screenWidth: number = 375) {
  const [allBookmarks, setAllBookmarks] = useState<KuralRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [paalOptions, setPaalOptions] = useState<PaalRecord[]>([]);
  const [iyalOptions, setIyalOptions] = useState<IyalRecord[]>([]);
  const [adhigaramOptions, setAdhigaramOptions] = useState<AdhigaramRecord[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaal, setSelectedPaal] = useState(0);
  const [selectedIyal, setSelectedIyal] = useState(0);
  const [selectedAdhigaram, setSelectedAdhigaram] = useState(0);

  const activeFilters = useMemo<KuralFilters>(
    () => ({
      search: searchQuery.trim() || undefined,
      paalId: selectedPaal || undefined,
      iyalId: selectedIyal || undefined,
      adhigaramId: selectedAdhigaram || undefined,
    }),
    [searchQuery, selectedPaal, selectedIyal, selectedAdhigaram],
  );

  const filteredBookmarks = useMemo(() => {
    const search = activeFilters.search?.toLowerCase();
    return allBookmarks.filter((kural) => {
      if (selectedPaal > 0 && kural.paal_id !== selectedPaal) return false;
      if (selectedIyal > 0 && kural.iyal_id !== selectedIyal) return false;
      if (selectedAdhigaram > 0 && kural.adhikaram_id !== selectedAdhigaram) return false;

      if (!search) return true;
      if (!Number.isNaN(Number(search)) && Number(search) === kural.id) return true;

      const haystack = [kural.line1, kural.line2, kural.translation, kural.explanation]
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [allBookmarks, activeFilters.search, selectedPaal, selectedIyal, selectedAdhigaram]);

  const bookmarkIyalOptions = useMemo(() => {
    if (selectedPaal > 0) {
      return iyalOptions.filter((iyal) => iyal.paal_id === selectedPaal);
    }
    return iyalOptions;
  }, [iyalOptions, selectedPaal]);

  const bookmarkAdhigaramOptions = useMemo(() => {
    if (selectedIyal > 0) {
      return adhigaramOptions.filter((adhigaram) => adhigaram.iyal_id === selectedIyal);
    }
    if (selectedPaal > 0) {
      const validIyalIds = new Set(bookmarkIyalOptions.map((iyal) => iyal.id));
      return adhigaramOptions.filter((adhigaram) => validIyalIds.has(adhigaram.iyal_id));
    }
    return adhigaramOptions;
  }, [adhigaramOptions, bookmarkIyalOptions, selectedPaal, selectedIyal]);

  const totalRecords = filteredBookmarks.length;
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

  const bookmarks = useMemo(() => {
    const offset = (page - 1) * userLimit;
    return filteredBookmarks.slice(offset, offset + userLimit);
  }, [filteredBookmarks, page, userLimit]);

  const bookmarkRange = useMemo(() => {
    if (totalRecords === 0) return { from: 0, to: 0 };
    const from = (page - 1) * userLimit + 1;
    const to = Math.min(page * userLimit, totalRecords);
    return { from, to };
  }, [page, userLimit, totalRecords]);

  useEffect(() => {
    let cancelled = false;

    const loadBookmarks = async () => {
      try {
        setLoading(true);
        const [records, paals, iyals, adhigarams] = await Promise.all([
          getBookmarkKurals(BOOKMARK_FETCH_LIMIT, 0, undefined),
          getBookmarkPaalOptions(),
          getBookmarkIyalOptions(),
          getBookmarkAdhigaramOptions(),
        ]);

        if (cancelled) return;

        setAllBookmarks(records);
        setPaalOptions(paals);
        setIyalOptions(iyals);
        setAdhigaramOptions(adhigarams);
        setPage(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBookmarks();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeFilters.search, selectedPaal, selectedIyal, selectedAdhigaram]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (selectedIyal > 0 && !bookmarkIyalOptions.some((iyal) => iyal.id === selectedIyal)) {
      setSelectedIyal(0);
      setSelectedAdhigaram(0);
      return;
    }

    if (
      selectedAdhigaram > 0 &&
      !bookmarkAdhigaramOptions.some((adhigaram) => adhigaram.id === selectedAdhigaram)
    ) {
      setSelectedAdhigaram(0);
    }
  }, [bookmarkIyalOptions, bookmarkAdhigaramOptions, selectedIyal, selectedAdhigaram]);

  const selectPaal = useCallback(
    (value: unknown) => {
      const paalId = normalizeId(value);
      setSelectedPaal(paalId);

      if (paalId === 0) return;

      const validIyals = iyalOptions.filter((iyal) => iyal.paal_id === paalId);
      if (selectedIyal && !validIyals.some((iyal) => iyal.id === selectedIyal)) {
        setSelectedIyal(0);
        setSelectedAdhigaram(0);
        return;
      }

      if (selectedAdhigaram > 0) {
        const validChapters = adhigaramOptions.filter((chapter) => {
          const chapterIyal = iyalOptions.find((iyal) => iyal.id === chapter.iyal_id);
          return chapterIyal?.paal_id === paalId;
        });
        if (!validChapters.some((chapter) => chapter.id === selectedAdhigaram)) {
          setSelectedAdhigaram(0);
        }
      }
    },
    [adhigaramOptions, iyalOptions, selectedAdhigaram, selectedIyal],
  );

  const selectIyal = useCallback(
    (value: unknown) => {
      const iyalId = normalizeId(value);
      if (iyalId === 0) {
        setSelectedIyal(0);
        return;
      }

      const paalId = iyalOptions.find((iyal) => iyal.id === iyalId)?.paal_id;
      if (paalId) setSelectedPaal(paalId);
      setSelectedIyal(iyalId);

      if (selectedAdhigaram > 0) {
        const validChapters = adhigaramOptions.filter((chapter) => chapter.iyal_id === iyalId);
        if (!validChapters.some((chapter) => chapter.id === selectedAdhigaram)) {
          setSelectedAdhigaram(0);
        }
      }
    },
    [adhigaramOptions, iyalOptions, selectedAdhigaram],
  );

  const selectAdhigaram = useCallback(
    (value: unknown) => {
      const adhigaramId = normalizeId(value);
      if (adhigaramId === 0) {
        setSelectedAdhigaram(0);
        return;
      }

      const chapter = adhigaramOptions.find((item) => item.id === adhigaramId);
      if (chapter) {
        const parentIyal = iyalOptions.find((iyal) => iyal.id === chapter.iyal_id);
        if (parentIyal) {
          setSelectedPaal(parentIyal.paal_id);
          setSelectedIyal(parentIyal.id);
        }
      }
      setSelectedAdhigaram(adhigaramId);
    },
    [adhigaramOptions, iyalOptions],
  );

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedPaal(0);
    setSelectedIyal(0);
    setSelectedAdhigaram(0);
  }, []);

  const hasMore = page < totalPages;

  const nextPage = useCallback(() => {
    if (hasMore) setPage((current) => Math.min(current + 1, totalPages));
  }, [hasMore, totalPages]);

  const prevPage = useCallback(() => {
    setPage((current) => Math.max(1, current - 1));
  }, []);

  const goToPage = useCallback(
    (targetPage: number) => {
      setPage(Math.min(Math.max(1, targetPage), totalPages));
    },
    [totalPages],
  );

  const updateKuralBookmarkStatus = useCallback((kuralId: number, isBookmarked: boolean) => {
    setAllBookmarks((current) =>
      isBookmarked
        ? current.map((kural) => (kural.id === kuralId ? { ...kural, is_bookmarked: true } : kural))
        : current.filter((kural) => kural.id !== kuralId),
    );
  }, []);

  return {
    kurals: bookmarks,
    loading,
    page,
    hasMore,
    totalPages,
    visiblePageNumbers,
    kuralFrom: bookmarkRange.from,
    kuralTo: bookmarkRange.to,
    totalRecords,

    searchQuery,
    setSearchQuery,
    selectedPaal,
    selectedIyal,
    selectedAdhigaram,
    selectPaal,
    selectIyal,
    selectAdhigaram,
    paalOptions,
    iyalOptions: bookmarkIyalOptions,
    adhigaramOptions: bookmarkAdhigaramOptions,
    clearAllFilters,
    nextPage,
    prevPage,
    goToPage,
    updateKuralBookmarkStatus,
  };
}
