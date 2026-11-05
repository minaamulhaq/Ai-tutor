"use client";

import React from "react";
import { Search, X, LayoutGrid, List, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FavoriteSortOption =
  | "rating-desc"
  | "reviews-desc"
  | "price-asc"
  | "price-desc"
  | "name-asc";

interface FavoriteFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  availableSubjects: string[];
  sortOption: FavoriteSortOption;
  onSortChange: (sort: FavoriteSortOption) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  totalMatches: number;
  onResetFilters: () => void;
  isFiltered: boolean;
}

export function FavoriteFilters({
  searchQuery,
  onSearchChange,
  selectedSubject,
  onSubjectChange,
  availableSubjects,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalMatches,
  onResetFilters,
  isFiltered,
}: FavoriteFiltersProps) {
  return (
    <Card className="p-4 rounded-2xl border-slate-200 bg-white shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search Bar with Clear Icon */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search saved tutors by name, subject, or university..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9.5 pr-8 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus-visible:ring-orange-500 focus-visible:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Right: Controls & Filters */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Subject Filter */}
          <div className="w-full sm:w-44">
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs font-semibold bg-white cursor-pointer w-full">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg text-xs">
                <SelectItem value="all">All Subjects</SelectItem>
                {availableSubjects.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By Filter */}
          <div className="w-full sm:w-44">
            <Select value={sortOption} onValueChange={(val) => onSortChange(val as FavoriteSortOption)}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs font-semibold bg-white cursor-pointer w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg text-xs">
                <SelectItem value="rating-desc">Highest Rated</SelectItem>
                <SelectItem value="reviews-desc">Most Reviews</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-white text-orange-600 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-700"
              )}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-1.5 rounded-lg transition-all cursor-pointer",
                viewMode === "list"
                  ? "bg-white text-orange-600 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-700"
              )}
              title="Detailed List View"
              aria-label="List view"
            >
              <List className="size-4" />
            </button>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-10 px-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0 cursor-pointer"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
