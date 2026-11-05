"use client";

import React from "react";
import { Search, X, Calendar, BookOpen, SlidersHorizontal, RotateCcw } from "lucide-react";
import { ClassFilterState } from "@/types/class";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ClassFiltersProps {
  filters: ClassFilterState;
  onChange: (updated: Partial<ClassFilterState>) => void;
  onReset: () => void;
  availableSubjects: string[];
  totalMatches: number;
}

export function ClassFilters({
  filters,
  onChange,
  onReset,
  availableSubjects,
  totalMatches,
}: ClassFiltersProps) {
  const isFiltered =
    filters.searchQuery !== "" ||
    filters.dateRange !== "all" ||
    filters.subject !== "all" ||
    filters.sortBy !== "date-asc";

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* 1. Search Bar (Lg: Col span 5) using Shadcn Input */}
        <div className="sm:col-span-2 lg:col-span-5 relative">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <Input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Search by teacher name, subject, or topic..."
            className="pl-10 pr-9 text-xs h-10 rounded-xl bg-slate-50/60 hover:bg-white focus:bg-white transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* 2. Date Range Filter using Shadcn Select (Lg: Col span 3) */}
        <div className="lg:col-span-3">
          <Select
            value={filters.dateRange}
            onValueChange={(val) => onChange({ dateRange: val as any })}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50/60 hover:bg-white text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <Calendar className="size-3.5 text-orange-500 shrink-0" />
                <SelectValue placeholder="Select Date Range" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today / This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="past-3-months">Past 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 3. Subject Filter using Shadcn Select (Lg: Col span 2) */}
        <div className="lg:col-span-2">
          <Select
            value={filters.subject}
            onValueChange={(val) => onChange({ subject: val })}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50/60 hover:bg-white text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <BookOpen className="size-3.5 text-orange-500 shrink-0" />
                <SelectValue placeholder="All Subjects" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 4. Sort Dropdown using Shadcn Select (Lg: Col span 2) */}
        <div className="lg:col-span-2">
          <Select
            value={filters.sortBy}
            onValueChange={(val) => onChange({ sortBy: val as any })}
          >
            <SelectTrigger className="w-full h-10 rounded-xl bg-slate-50/60 hover:bg-white text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <SlidersHorizontal className="size-3.5 text-orange-500 shrink-0" />
                <SelectValue placeholder="Sort Order" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date: Soonest First</SelectItem>
              <SelectItem value="date-desc">Date: Latest First</SelectItem>
              <SelectItem value="fee-high">Fee: High to Low</SelectItem>
              <SelectItem value="fee-low">Fee: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Status & Reset Action */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
        <span className="font-medium">
          Showing <strong>{totalMatches}</strong> matching classes
        </span>

        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onReset}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 rounded-lg cursor-pointer"
          >
            <RotateCcw className="size-3 mr-1" />
            <span>Reset All Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
