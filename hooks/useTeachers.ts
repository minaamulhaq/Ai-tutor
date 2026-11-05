"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Teacher,
  TeacherFilterState,
  TeacherSortOption,
  TeacherQueryResult,
  FilterCatalogs,
} from "@/types/teacher";
import {
  getTeachers,
  toggleFavorite as apiToggleFavorite,
  getTeacherFilterCatalogs,
} from "@/services/teacherService";

export const DEFAULT_TEACHER_FILTERS: TeacherFilterState = {
  search: "",
  subjects: [],
  studentLevels: [],
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  teachingLanguages: [],
  availableDays: [],
  availableTimesOfDay: [],
  scheduleType: "all",
};

export interface UseTeachersOptions {
  initialFilters?: Partial<TeacherFilterState>;
  initialSort?: TeacherSortOption;
  pageSize?: number;
}

export function useTeachers({
  initialFilters = {},
  initialSort = "relevance",
  pageSize = 6,
}: UseTeachersOptions = {}) {
  const [filters, setFilters] = useState<TeacherFilterState>({
    ...DEFAULT_TEACHER_FILTERS,
    ...initialFilters,
  });
  const [sort, setSort] = useState<TeacherSortOption>(initialSort);
  const [page, setPage] = useState<number>(1);

  // Accumulated teachers for scroll-based pagination
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [catalogs, setCatalogs] = useState<FilterCatalogs | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestIdRef = useRef<number>(0);

  // Load catalogs on mount
  useEffect(() => {
    let isMounted = true;
    getTeacherFilterCatalogs()
      .then((cat) => {
        if (isMounted) setCatalogs(cat);
      })
      .catch((err) => {
        console.error("Failed to fetch filter catalogs", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Primary data fetching
  const executeFetch = useCallback(
    async (
      currentFilters: TeacherFilterState,
      currentSort: TeacherSortOption,
      currentPage: number,
      isNextPage: boolean
    ) => {
      const currentRequestId = ++requestIdRef.current;

      if (isNextPage) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);
      setErrorMessage(null);

      try {
        const result = await getTeachers(currentFilters, currentSort, {
          page: currentPage,
          pageSize,
        });

        // Ignore stale requests
        if (currentRequestId === requestIdRef.current) {
          if (isNextPage) {
            setTeachers((prev) => {
              // Deduplicate by ID
              const existingIds = new Set(prev.map((t) => t.id));
              const newItems = result.teachers.filter((t) => !existingIds.has(t.id));
              return [...prev, ...newItems];
            });
          } else {
            setTeachers(result.teachers);
          }

          setTotalCount(result.totalCount);
          setTotalPages(result.totalPages);
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      } catch (err: unknown) {
        if (currentRequestId === requestIdRef.current) {
          const msg =
            err instanceof Error
              ? err.message
              : "Unable to load teachers at this time. Please check your connection and retry.";
          setIsError(true);
          setErrorMessage(msg);
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [pageSize]
  );

  // When filters or sort change, reset page to 1 and fetch fresh
  useEffect(() => {
    setPage(1);
    executeFetch(filters, sort, 1, false);
  }, [filters, sort, executeFetch]);

  // When page changes > 1, append new items
  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    executeFetch(filters, sort, nextPage, true);
  }, [isLoading, isLoadingMore, page, totalPages, filters, sort, executeFetch]);

  // Set filter updates (resets page)
  const setFilter = useCallback((partial: Partial<TeacherFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...partial,
    }));
  }, []);

  // Set search query
  const setSearch = useCallback((search: string) => {
    setFilters((prev) => {
      if (prev.search === search) return prev;
      return { ...prev, search };
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_TEACHER_FILTERS);
  }, []);

  // Sort change handler
  const handleSortChange = useCallback((newSort: TeacherSortOption) => {
    setSort(newSort);
  }, []);

  // Optimistic favorite toggler with rollback
  const toggleFavorite = useCallback(
    async (teacherId: string) => {
      const target = teachers.find((t) => t.id === teacherId);
      if (!target) return;

      const previousStatus = Boolean(target.isFavorite);
      const nextStatus = !previousStatus;

      // Optimistic update
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === teacherId ? { ...t, isFavorite: nextStatus } : t
        )
      );

      try {
        await apiToggleFavorite(teacherId, previousStatus);
      } catch (err) {
        console.error("Failed to update favorite status", err);
        // Rollback
        setTeachers((prev) =>
          prev.map((t) =>
            t.id === teacherId ? { ...t, isFavorite: previousStatus } : t
          )
        );
      }
    },
    [teachers]
  );

  const hasMore = page < totalPages;

  const activeFilterCount =
    (filters.search.trim() ? 1 : 0) +
    filters.subjects.length +
    filters.studentLevels.length +
    filters.teachingLanguages.length +
    filters.availableDays.length +
    (filters.availableTimesOfDay?.length || 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.minRating !== undefined && filters.minRating > 0 ? 1 : 0) +
    (filters.scheduleType && filters.scheduleType !== "all" ? 1 : 0);

  return {
    teachers,
    totalCount,
    page,
    totalPages,
    hasMore,
    catalogs,
    filters,
    sort,
    isLoading,
    isLoadingMore,
    isError,
    errorMessage,
    activeFilterCount,
    setFilter,
    setSearch,
    clearFilters,
    setSort: handleSortChange,
    loadMore,
    toggleFavorite,
    refetch: () => executeFetch(filters, sort, 1, false),
  };
}
