"use client";

import React, { useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  Star,
  DollarSign,
  Calendar,
  Languages,
  GraduationCap,
  BookOpen,
  ChevronDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TeacherFilterState, FilterCatalogs, DayOfWeek } from "@/types/teacher";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export interface TeacherFiltersProps {
  filters: TeacherFilterState;
  catalogs: FilterCatalogs | null;
  activeFilterCount: number;
  onFilterChange: (partial: Partial<TeacherFilterState>) => void;
  onClearFilters: () => void;
  className?: string;
}

const DAY_LABELS: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

export function TeacherFilters({
  filters,
  catalogs,
  activeFilterCount,
  onFilterChange,
  onClearFilters,
  className,
}: TeacherFiltersProps) {
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const toggleSubject = (subject: string) => {
    const exists = filters.subjects.includes(subject);
    const updated = exists
      ? filters.subjects.filter((s) => s !== subject)
      : [...filters.subjects, subject];
    onFilterChange({ subjects: updated });
  };

  const toggleStudentLevel = (level: string) => {
    const exists = filters.studentLevels.includes(level);
    const updated = exists
      ? filters.studentLevels.filter((l) => l !== level)
      : [...filters.studentLevels, level];
    onFilterChange({ studentLevels: updated });
  };

  const toggleDay = (day: DayOfWeek) => {
    const exists = filters.availableDays.includes(day);
    const updated = exists
      ? filters.availableDays.filter((d) => d !== day)
      : [...filters.availableDays, day];
    onFilterChange({ availableDays: updated });
  };

  const allSubjects = catalogs?.subjects || [
    "Computer Science",
    "Python Programming",
    "Data Structures",
    "Algorithms",
    "Mathematics",
    "Calculus",
    "Linear Algebra",
    "Physics",
    "Mechanics & Electromagnetism",
    "Chemistry",
    "Biology",
    "English Literature",
    "Statistics & Probability",
    "Web Development",
    "Machine Learning",
  ];

  const levelsList = catalogs?.studentLevels || [
    "Middle School (Grade 6-8)",
    "O-Levels / IGCSE",
    "A-Levels / FSc",
    "Undergraduate (University)",
    "Adult Professional & Career Transition",
  ];

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Horizontal Filter Bar: Directly underneath the search bar */}
      <div className="flex items-center gap-2 flex-wrap p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        {/* 1. Subject Filter Popover */}
        <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer inline-flex items-center",
              filters.subjects.length > 0 &&
                "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
            )}
          >
            <BookOpen className="size-3.5 text-orange-500" />
            <span>
              {filters.subjects.length === 0
                ? "Subject"
                : filters.subjects.length === 1
                ? filters.subjects[0]
                : `Subject (${filters.subjects.length})`}
            </span>
            <ChevronDown className="size-3 text-slate-400 ml-0.5" />
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 max-h-80 overflow-y-auto space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Select Subjects</span>
              {filters.subjects.length > 0 && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ subjects: [] })}
                  className="text-[11px] text-orange-600 font-semibold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allSubjects.map((subject) => {
                const isSelected = filters.subjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border flex items-center gap-1",
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500 font-semibold shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {isSelected && <Check className="size-3 stroke-[3]" />}
                    <span>{subject}</span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 2. Target Student Level Popover */}
        <Popover open={levelOpen} onOpenChange={setLevelOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer inline-flex items-center",
              filters.studentLevels.length > 0 &&
                "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
            )}
          >
            <GraduationCap className="size-3.5 text-orange-500" />
            <span>
              {filters.studentLevels.length === 0
                ? "Student Level"
                : filters.studentLevels.length === 1
                ? filters.studentLevels[0].split(" ")[0]
                : `Levels (${filters.studentLevels.length})`}
            </span>
            <ChevronDown className="size-3 text-slate-400 ml-0.5" />
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Student Level</span>
              {filters.studentLevels.length > 0 && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ studentLevels: [] })}
                  className="text-[11px] text-orange-600 font-semibold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1 pt-1">
              {levelsList.map((level) => {
                const isSelected = filters.studentLevels.includes(level);
                return (
                  <div
                    key={level}
                    onClick={() => toggleStudentLevel(level)}
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors border",
                      isSelected
                        ? "bg-orange-50/70 border-orange-200 text-orange-950 font-semibold"
                        : "bg-white border-transparent text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "size-4 rounded-md border flex items-center justify-center transition-all shrink-0",
                        isSelected
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {isSelected && <Check className="size-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{level}</span>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 3. Class Price Popover */}
        <Popover open={priceOpen} onOpenChange={setPriceOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer inline-flex items-center",
              (filters.minPrice !== undefined || filters.maxPrice !== undefined) &&
                "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
            )}
          >
            <DollarSign className="size-3.5 text-orange-500" />
            <span>
              {filters.minPrice === undefined && filters.maxPrice === undefined
                ? "Price (PKR)"
                : filters.maxPrice && !filters.minPrice
                ? `Under ${filters.maxPrice.toLocaleString()}`
                : filters.minPrice && !filters.maxPrice
                ? `${filters.minPrice.toLocaleString()}+`
                : `${filters.minPrice?.toLocaleString()} - ${filters.maxPrice?.toLocaleString()}`}
            </span>
            <ChevronDown className="size-3 text-slate-400 ml-0.5" />
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Price Range (PKR / hour)</span>
              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ minPrice: undefined, maxPrice: undefined })}
                  className="text-[11px] text-orange-600 font-semibold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Min Price</span>
                <Input
                  type="number"
                  min={0}
                  step={500}
                  placeholder="2,000"
                  value={filters.minPrice ?? ""}
                  onChange={(e) =>
                    onFilterChange({
                      minPrice: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Max Price</span>
                <Input
                  type="number"
                  min={0}
                  step={500}
                  placeholder="6,000"
                  value={filters.maxPrice ?? ""}
                  onChange={(e) =>
                    onFilterChange({
                      maxPrice: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => onFilterChange({ minPrice: undefined, maxPrice: 3000 })}
                className="text-[11px] rounded-md cursor-pointer"
              >
                Under 3,000
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => onFilterChange({ minPrice: 3000, maxPrice: 4500 })}
                className="text-[11px] rounded-md cursor-pointer"
              >
                3,000 - 4,500
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => onFilterChange({ minPrice: 4500, maxPrice: undefined })}
                className="text-[11px] rounded-md cursor-pointer"
              >
                4,500+
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* 4. Availability Popover */}
        <Popover open={availOpen} onOpenChange={setAvailOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer inline-flex items-center",
              ((filters.scheduleType && filters.scheduleType !== "all") ||
                filters.availableDays.length > 0) &&
                "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
            )}
          >
            <Calendar className="size-3.5 text-orange-500" />
            <span>
              {filters.scheduleType === "weekdays"
                ? "Weekdays"
                : filters.scheduleType === "weekends"
                ? "Weekends"
                : filters.availableDays.length > 0
                ? `${filters.availableDays.length} days`
                : "Availability"}
            </span>
            <ChevronDown className="size-3 text-slate-400 ml-0.5" />
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Schedule & Days</span>
              {((filters.scheduleType && filters.scheduleType !== "all") ||
                filters.availableDays.length > 0) && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ scheduleType: "all", availableDays: [] })}
                  className="text-[11px] text-orange-600 font-semibold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Schedule Type */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 text-xs font-medium">
              <button
                type="button"
                onClick={() => onFilterChange({ scheduleType: "all" })}
                className={cn(
                  "py-1 rounded-lg text-center transition-all cursor-pointer",
                  !filters.scheduleType || filters.scheduleType === "all"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ scheduleType: "weekdays" })}
                className={cn(
                  "py-1 rounded-lg text-center transition-all cursor-pointer",
                  filters.scheduleType === "weekdays"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => onFilterChange({ scheduleType: "weekends" })}
                className={cn(
                  "py-1 rounded-lg text-center transition-all cursor-pointer",
                  filters.scheduleType === "weekends"
                    ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Weekends
              </button>
            </div>

            {/* Day pills */}
            <div className="flex flex-wrap gap-1 pt-1">
              {DAY_LABELS.map((day) => {
                const isSelected = filters.availableDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "size-8 rounded-lg text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer border",
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 5. Rating Filter Popover */}
        <Popover open={ratingOpen} onOpenChange={setRatingOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 gap-1.5 cursor-pointer inline-flex items-center",
              filters.minRating !== undefined &&
                filters.minRating > 0 &&
                "border-amber-500 bg-amber-50/70 text-amber-950 font-bold"
            )}
          >
            <Star className="size-3.5 fill-amber-500 text-amber-500" />
            <span>
              {filters.minRating === undefined
                ? "Rating"
                : `${filters.minRating}+ Stars`}
            </span>
            <ChevronDown className="size-3 text-slate-400 ml-0.5" />
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 space-y-1">
            <span className="text-xs font-bold text-slate-900 block px-2 py-1">
              Minimum Rating
            </span>
            {[
              { value: undefined, label: "Any Rating" },
              { value: 4.5, label: "4.5+ ★ Very Good" },
              { value: 4.8, label: "4.8+ ★ Excellent" },
            ].map((opt) => {
              const isSelected = filters.minRating === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    onFilterChange({ minRating: opt.value });
                    setRatingOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between",
                    isSelected
                      ? "bg-amber-50 text-amber-900 font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="size-3.5 text-amber-600 stroke-[3]" />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {/* Reset All Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2.5 rounded-xl text-xs font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 ml-auto cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
