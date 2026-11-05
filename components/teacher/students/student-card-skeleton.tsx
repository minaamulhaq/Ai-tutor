import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function StudentCardSkeleton() {
  return (
    <div className="flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs text-center items-center">
      <div className="flex flex-col items-center w-full">
        {/* Avatar skeleton */}
        <Skeleton className="size-20 sm:size-22 rounded-full mb-4 bg-slate-100" />

        {/* Full Name skeleton */}
        <Skeleton className="h-5 w-32 rounded-md bg-slate-100 mb-2" />

        {/* Subtitle skeleton */}
        <Skeleton className="h-3.5 w-24 rounded-md bg-slate-100" />
      </div>

      {/* Button skeleton */}
      <div className="w-full pt-5 mt-auto">
        <Skeleton className="h-10 w-full rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export function StudentGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <StudentCardSkeleton key={idx} />
      ))}
    </div>
  );
}
