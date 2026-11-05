import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function EarningsSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Skeleton */}
      <div className="space-y-2 pb-2">
        <Skeleton className="h-8 w-48 rounded-md bg-slate-200" />
        <Skeleton className="h-4 w-80 rounded-md bg-slate-200" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-slate-100 rounded" />
              <Skeleton className="size-9 rounded-xl bg-slate-100" />
            </div>
            <Skeleton className="h-8 w-36 bg-slate-100 rounded-md" />
            <Skeleton className="h-3 w-44 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Breakdown Chart Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
        <Skeleton className="h-5 w-56 bg-slate-200 rounded" />
        <Skeleton className="h-48 w-full bg-slate-100 rounded-xl" />
      </div>

      {/* Transactions Table Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-48 bg-slate-200 rounded" />
          <Skeleton className="h-10 w-64 bg-slate-100 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
