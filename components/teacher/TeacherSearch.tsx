"use client";

import React, { useState, useEffect } from "react";
import { Search, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface TeacherSearchProps {
  value: string;
  onChange: (query: string) => void;
  onSelectSuggestion?: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

const POPULAR_SEARCH_TAGS = [
  "Python",
  "Mathematics",
  "Calculus",
  "Physics",
  "O/A-Levels",
  "Chemistry",
  "IELTS",
];

export function TeacherSearch({
  value,
  onChange,
  onSelectSuggestion,
  placeholder = "Search teachers by name, subject, skill, or university...",
  isLoading = false,
  className,
}: TeacherSearchProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced search trigger (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [internalValue, value, onChange]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(internalValue);
  };

  const handleTagClick = (tag: string) => {
    setInternalValue(tag);
    if (onSelectSuggestion) {
      onSelectSuggestion(tag);
    } else {
      onChange(tag);
    }
  };

  return (
    <div className={cn("space-y-2.5", className)}>
      <form
        onSubmit={handleSubmit}
        className="relative w-full flex items-center"
        role="search"
      >
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />

          <Input
            type="text"
            value={internalValue}
            onChange={(e) => setInternalValue(e.target.value)}
            placeholder={placeholder}
            className="h-12 pl-12 pr-28 rounded-2xl bg-white border-slate-200 text-sm placeholder:text-slate-400 shadow-2xs focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20 transition-all"
          />

          {/* Action cluster inside search bar */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isLoading && (
              <Loader2 className="size-4 text-orange-500 animate-spin mr-1" />
            )}

            {internalValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleClear}
                aria-label="Clear search input"
                className="size-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-3.5" />
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs cursor-pointer h-8.5 px-4"
            >
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Popular quick tags for student discovery */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 px-1">
        <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <Sparkles className="size-3 text-amber-500" />
          Popular searches:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer border border-transparent"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
