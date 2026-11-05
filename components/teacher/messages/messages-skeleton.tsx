"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function MessagesSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden h-full min-h-[560px] grid grid-cols-1 md:grid-cols-12 animate-pulse">
      {/* Left Panel Skeleton: 4 or 5 columns */}
      <div className="md:col-span-4 lg:col-span-4 xl:col-span-4 border-r border-slate-200 flex flex-col h-full bg-white">
        {/* Header / Search bar */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-6 w-14 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 p-2 space-y-2 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-transparent">
              <Skeleton className="size-11 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-12 rounded-md" />
                </div>
                <Skeleton className="h-3.5 w-44 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel Skeleton: Chat Panel */}
      <div className="hidden md:flex md:col-span-8 lg:col-span-8 xl:col-span-8 flex-col h-full bg-slate-50/50">
        {/* Header */}
        <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>

        {/* Message History */}
        <div className="flex-1 p-6 space-y-5 overflow-hidden">
          <div className="flex justify-center">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          {/* Student Bubble (Left) */}
          <div className="flex justify-start">
            <Skeleton className="h-14 w-72 rounded-2xl rounded-bl-sm" />
          </div>
          {/* Teacher Bubble (Right) */}
          <div className="flex justify-end">
            <Skeleton className="h-12 w-64 rounded-2xl rounded-br-sm bg-orange-100/60" />
          </div>
          {/* Student Bubble (Left) */}
          <div className="flex justify-start">
            <Skeleton className="h-16 w-80 rounded-2xl rounded-bl-sm" />
          </div>
          {/* Teacher Bubble (Right) */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-48 rounded-2xl rounded-br-sm bg-orange-100/60" />
          </div>
        </div>

        {/* Composer */}
        <div className="p-4 bg-white border-t border-slate-200">
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
