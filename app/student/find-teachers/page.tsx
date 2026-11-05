"use client";

import React, { useState } from "react";
import {
  ArrowUpDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { useTeachers } from "@/hooks/useTeachers";
import { Teacher, TeacherSortOption } from "@/types/teacher";
import { TeacherSearch } from "@/components/teacher/TeacherSearch";
import { TeacherFilters } from "@/components/teacher/TeacherFilters";
import { TeacherGrid } from "@/components/teacher/TeacherGrid";
import { TeacherProfileModal } from "@/components/teacher/TeacherProfileModal";
import { cn } from "@/lib/utils";

export default function FindTeachersPage() {
  const {
    teachers,
    totalCount,
    hasMore,
    isLoadingMore,
    loadMore,
    catalogs,
    filters,
    sort,
    isLoading,
    isError,
    errorMessage,
    activeFilterCount,
    setFilter,
    setSearch,
    clearFilters,
    setSort,
    toggleFavorite,
    refetch,
  } = useTeachers({
    pageSize: 6,
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTeacherForPreview, setSelectedTeacherForPreview] =
    useState<Teacher | null>(null);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as TeacherSortOption);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Page Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Teachers
        </h1>
        <p className="text-sm text-slate-500">
          Discover expert teachers and book your next class.
        </p>
      </div>

      {/* 2. Search Bar: Full-Width Prominent Search */}
      <div className="w-full">
        <TeacherSearch
          value={filters.search}
          onChange={setSearch}
          onSelectSuggestion={(tag) => setSearch(tag)}
          isLoading={isLoading}
          placeholder="Search teachers by name, subject, skill, or university..."
        />
      </div>

      {/* 3. Filters Bar: Directly Underneath the Search Bar */}
      <div className="w-full">
        <TeacherFilters
          filters={filters}
          catalogs={catalogs}
          activeFilterCount={activeFilterCount}
          onFilterChange={setFilter}
          onClearFilters={clearFilters}
        />
      </div>

      {/* 4. Results Metadata Bar: Count, View Switcher & Sort */}
      <div className="flex items-center justify-between gap-4 px-1 py-1">
        <div className="text-xs font-medium text-slate-600">
          <strong className="text-slate-900 font-bold">{totalCount}</strong>{" "}
            {totalCount === 1 ? "expert teacher" : "expert teachers"} available
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher: Grid vs List */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-white text-orange-600 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-700"
                )}
                title="Grid View"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={cn(
                  "p-1.5 rounded-lg transition-all cursor-pointer",
                  viewMode === "list"
                    ? "bg-white text-orange-600 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-700"
                )}
                title="List Detailed View"
              >
                <List className="size-4" />
              </button>
            </div>

            {/* Sorting Select */}
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="teacher-sort-select"
                className="text-xs font-semibold text-slate-500 hidden sm:inline-flex items-center gap-1"
              >
                <ArrowUpDown className="size-3 text-slate-400" />
                Sort:
              </label>

              <div className="relative">
                <select
                  id="teacher-sort-select"
                  value={sort}
                  onChange={handleSortChange}
                  className="h-8.5 pl-3 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer appearance-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="reviews-desc">Most Reviewed</option>
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▼
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* 5. Teachers Results Feed (Full-Width Responsive Grid with Equal-Height Cards) */}
      <div className="w-full">
        <TeacherGrid
          teachers={teachers}
          viewMode={viewMode}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isError={isError}
          errorMessage={errorMessage}
          onRetry={refetch}
          onClearFilters={clearFilters}
          onToggleFavorite={toggleFavorite}
          onViewQuickProfile={(t) => setSelectedTeacherForPreview(t)}
        />
      </div>

      {/* Quick View Profile Modal */}
      <TeacherProfileModal
        teacher={selectedTeacherForPreview}
        isOpen={Boolean(selectedTeacherForPreview)}
        onClose={() => setSelectedTeacherForPreview(null)}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
