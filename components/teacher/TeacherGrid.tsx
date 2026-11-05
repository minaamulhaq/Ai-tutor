"use client";

import React, { useEffect, useRef } from "react";
import { AlertCircle, RefreshCw, SearchX, Sparkles, Loader2 } from "lucide-react";
import { Teacher } from "@/types/teacher";
import { TeacherCard } from "./TeacherCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export interface TeacherGridProps {
  teachers: Teacher[];
  viewMode?: "grid" | "list";
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isError: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onClearFilters?: () => void;
  onToggleFavorite?: (id: string) => void;
  onViewQuickProfile?: (teacher: Teacher) => void;
}

export function TeacherGrid({
  teachers,
  viewMode = "grid",
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  isError,
  errorMessage,
  onRetry,
  onClearFilters,
  onToggleFavorite,
  onViewQuickProfile,
}: TeacherGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Scroll-based pagination trigger using IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "300px" }
    );

    const current = sentinelRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  // 1. Initial Loading Skeleton State
  if (isLoading && teachers.length === 0) {
    if (viewMode === "list") {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card
              key={`skeleton-list-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col sm:flex-row gap-5 items-start"
            >
              <Skeleton className="size-20 rounded-full shrink-0" />
              <div className="space-y-3 flex-1 w-full">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-20 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-md" />
                  <Skeleton className="h-5 w-28 rounded-md" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card
            key={`skeleton-card-${idx}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-start gap-3.5">
              <Skeleton className="size-14 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4.5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>

            <Skeleton className="h-5 w-28 rounded-md" />

            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <Card className="p-8 sm:p-12 rounded-2xl bg-white border-rose-200 text-center space-y-4 shadow-xs">
        <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
          <AlertCircle className="size-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Unable to Load Teachers
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {errorMessage ||
              "We encountered an issue retrieving instructor profiles. Your search and filter preferences have been preserved."}
          </p>
        </div>

        {onRetry && (
          <Button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs cursor-pointer h-9 px-5"
          >
            <RefreshCw className="size-3.5 mr-2" />
            <span>Retry Search</span>
          </Button>
        )}
      </Card>
    );
  }

  // 3. Empty Results State
  if (teachers.length === 0) {
    return (
      <Card className="p-8 sm:p-14 rounded-2xl bg-white border-slate-200 text-center space-y-4 shadow-xs">
        <div className="size-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto ring-8 ring-orange-50/50">
          <SearchX className="size-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            No teachers found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Try changing your search or filters to discover more teachers.
          </p>
        </div>

        {onClearFilters && (
          <Button
            type="button"
            onClick={onClearFilters}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs cursor-pointer h-9 px-5"
          >
            <Sparkles className="size-3.5 text-orange-400 mr-2" />
            <span>Clear Filters</span>
          </Button>
        )}
      </Card>
    );
  }

  // 4. Success State: Grid or List view with Scroll-Based Pagination
  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              viewMode="list"
              onToggleFavorite={onToggleFavorite}
              onViewQuickProfile={onViewQuickProfile}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              viewMode="grid"
              onToggleFavorite={onToggleFavorite}
              onViewQuickProfile={onViewQuickProfile}
            />
          ))}
        </div>
      )}

      {/* Scroll-based pagination trigger & loading state */}
      <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center">
        {isLoadingMore ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-600">
            <Loader2 className="size-4 text-orange-500 animate-spin" />
            <span>Loading more teachers...</span>
          </div>
        ) : hasMore ? (
          <Button
            type="button"
            variant="outline"
            onClick={onLoadMore}
            className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer h-9 px-5"
          >
            Load More Teachers
          </Button>
        ) : teachers.length > 0 ? (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-px w-12 bg-slate-200" />
            <span>End of results</span>
            <span className="h-px w-12 bg-slate-200" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
