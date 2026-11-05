"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StudentFiltersState } from "./types";

interface StudentSearchFiltersProps {
  filters: StudentFiltersState;
  onFilterChange: (filters: Partial<StudentFiltersState>) => void;
  onResetFilters: () => void;
  availableSubjects: string[];
  totalFiltered: number;
  totalStudents: number;
}

export function StudentSearchFilters({
  filters,
  onFilterChange,
  onResetFilters,
  availableSubjects,
  totalFiltered,
  totalStudents,
}: StudentSearchFiltersProps) {
  const isFiltered =
    filters.searchQuery.trim() !== "" ||
    filters.subject !== "all" ||
    filters.status !== "all";

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search students by name..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="pl-9 h-10 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl"
          />
        </div>

        {/* Subject Filter */}
        <div className="w-full sm:w-44 shrink-0">
          <Select
            value={filters.subject}
            onValueChange={(val) => onFilterChange({ subject: val })}
          >
            <SelectTrigger className="h-10 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl w-full">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {availableSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-36 shrink-0">
          <Select
            value={filters.status}
            onValueChange={(val) => onFilterChange({ status: val })}
          >
            <SelectTrigger className="h-10 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="attended">Attended Classes</SelectItem>
              <SelectItem value="active">Active (Upcoming)</SelectItem>
              <SelectItem value="inactive">Past Students</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Action */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={onResetFilters}
            className="h-10 px-3 text-xs sm:text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl shrink-0 gap-1.5 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Filter status counter / feedback */}
      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 px-0.5 pt-0.5">
        <span>
          Showing <span className="font-semibold text-slate-900">{totalFiltered}</span> of{" "}
          <span className="font-semibold text-slate-900">{totalStudents}</span> students
        </span>

        {isFiltered && (
          <span className="text-orange-600 font-medium">Filtered results</span>
        )}
      </div>
    </div>
  );
}
