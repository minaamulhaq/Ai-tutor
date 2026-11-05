"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* 1. Header Card Skeleton (No Background Image / Only Avatar) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Skeleton className="size-24 sm:size-28 rounded-full" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-52 rounded-lg" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-80 rounded-md" />
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-40 rounded-md" />
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>

        {/* Strength Dropdown Skeleton */}
        <div className="pt-4 border-t border-slate-100">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>

      {/* 2. Professional Details Card Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-72 rounded-md" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-xl" />
        </div>
        <Skeleton className="h-28 rounded-xl" />
      </div>

      {/* 3. Teaching Preferences Card Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>

      {/* 4. Experience Card Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-52 rounded-md" />
              <Skeleton className="h-3.5 w-60 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-xl" />
            <Skeleton className="size-8 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-20 rounded-xl" />
      </div>

      {/* 5. Education Card Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44 rounded-md" />
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-xl" />
            <Skeleton className="size-8 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-20 rounded-xl" />
      </div>

      {/* 6. Certificates Card Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-3.5 w-60 rounded-md" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-xl" />
            <Skeleton className="size-8 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-20 rounded-xl" />
      </div>

      {/* 7. Account Info Card Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-52 rounded-md" />
              <Skeleton className="h-3.5 w-64 rounded-md" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
