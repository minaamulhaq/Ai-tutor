"use client";

import React from "react";
import Link from "next/link";
import { Heart, Search, Compass, RotateCcw, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FavoriteEmptyStateProps {
  isFiltered: boolean;
  onResetFilters?: () => void;
}

export function FavoriteEmptyState({
  isFiltered,
  onResetFilters,
}: FavoriteEmptyStateProps) {
  if (isFiltered) {
    return (
      <Card className="p-10 rounded-2xl border-slate-200 bg-white text-center space-y-4 max-w-md mx-auto my-8 shadow-xs">
        <div className="size-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto ring-8 ring-orange-50/50">
          <Search className="size-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            No Matching Saved Teachers
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            None of your favorite tutors match your search query or subject filter.
          </p>
        </div>
        {onResetFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            <span>Clear Filters</span>
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-12 sm:p-16 rounded-2xl border-slate-200 bg-white text-center space-y-5 max-w-lg mx-auto my-8 shadow-xs">
      <div className="size-20 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
        <Heart className="size-10 fill-rose-500/20 text-rose-500 stroke-[1.5]" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Your Favorites List is Empty
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          Save teachers you love or want to learn with later by tapping the{" "}
          <strong className="text-rose-600 font-semibold">heart icon</strong> on any
          instructor&apos;s profile. They&apos;ll be kept right here for one-click booking.
        </p>
      </div>

      <div className="pt-2">
        <Button
          asChild
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-11 px-6 shadow-md shadow-orange-500/20 cursor-pointer"
        >
          <Link href="/student/find-teachers">
            <Compass className="size-4 mr-2" />
            <span>Discover Top Instructors</span>
          </Link>
        </Button>
      </div>
    </Card>
  );
}
