"use client";

import React from "react";
import { Users, SearchX, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "empty-directory" | "no-search-results" | "error";
  onResetFilters?: () => void;
  onRetry?: () => void;
}

export function StudentsEmptyState({
  type,
  onResetFilters,
  onRetry,
}: EmptyStateProps) {
  if (type === "empty-directory") {
    return (
      <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 max-w-xl mx-auto my-8">
        <div className="size-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-2xs">
          <Users className="size-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">No students yet</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Your students will appear here when you start receiving bookings.
          </p>
        </div>
      </div>
    );
  }

  if (type === "no-search-results") {
    return (
      <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 max-w-md mx-auto my-8">
        <div className="size-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
          <SearchX className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            No students match your search.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
            We couldn&apos;t find any students matching your current filter criteria.
          </p>
        </div>
        {onResetFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="rounded-xl border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs sm:text-sm h-9 gap-2 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Search & Filters</span>
          </Button>
        )}
      </div>
    );
  }

  // Error state
  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center bg-white rounded-2xl border border-rose-200 shadow-2xs space-y-4 max-w-md mx-auto my-8">
      <div className="size-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Unable to load students
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
          An error occurred while fetching your student directory. Please try again.
        </p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm h-9 gap-2 cursor-pointer shadow-2xs"
        >
          <RotateCcw className="size-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}
