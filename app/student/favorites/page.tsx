"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  Compass,
  ArrowUpDown,
  RotateCcw,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Home,
} from "lucide-react";
import { Teacher } from "@/types/teacher";
import {
  getFavoriteTeachers,
  toggleFavorite as apiToggleFavorite,
} from "@/services/teacherService";
import { FavoriteStats } from "@/components/student/favorites/favorite-stats";
import {
  FavoriteFilters,
  FavoriteSortOption,
} from "@/components/student/favorites/favorite-filters";
import { FavoriteEmptyState } from "@/components/student/favorites/favorite-empty-state";
import { TeacherCard } from "@/components/teacher/TeacherCard";
import { TeacherProfileModal } from "@/components/teacher/TeacherProfileModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function FavoriteTeachersPage() {
  const [favorites, setFavorites] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Filters & display state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortOption, setSortOption] = useState<FavoriteSortOption>("rating-desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Quick profile modal state
  const [selectedTeacherForPreview, setSelectedTeacherForPreview] =
    useState<Teacher | null>(null);

  // Undo notification state when removing favorite
  const [lastRemovedTeacher, setLastRemovedTeacher] = useState<Teacher | null>(null);

  // Load favorites on mount
  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await getFavoriteTeachers();
      setFavorites(data);
    } catch (err) {
      console.error("Failed to load favorite teachers", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Extract unique subjects from favorites for the filter dropdown
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    favorites.forEach((t) => {
      t.subjects?.forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [favorites]);

  // Handle unfavorite toggle with optimistic update & undo capability
  const handleToggleFavorite = async (teacherId: string) => {
    const target = favorites.find((t) => t.id === teacherId);
    if (!target) return;

    // Remove from local list optimistically
    setFavorites((prev) => prev.filter((t) => t.id !== teacherId));
    setLastRemovedTeacher(target);

    try {
      await apiToggleFavorite(teacherId, true);
    } catch (err) {
      console.error("Failed to toggle favorite status", err);
      // Rollback on failure
      setFavorites((prev) => [...prev, target]);
      setLastRemovedTeacher(null);
    }
  };

  // Undo removal of last teacher
  const handleUndoRemove = async () => {
    if (!lastRemovedTeacher) return;
    const restored = lastRemovedTeacher;
    setLastRemovedTeacher(null);
    setFavorites((prev) => [...prev, restored]);

    try {
      await apiToggleFavorite(restored.id, false);
    } catch (err) {
      console.error("Failed to undo favorite removal", err);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSubject("all");
    setSortOption("rating-desc");
  };

  const isFiltered = searchQuery.trim() !== "" || selectedSubject !== "all";

  // Filter and sort favorites
  const filteredFavorites = useMemo(() => {
    let result = [...favorites];

    // 1. Search Query filter (matches name, headline, bio, subjects, or education)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((t) => {
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesHeadline = t.headline.toLowerCase().includes(q);
        const matchesBio = (t.bio || "").toLowerCase().includes(q);
        const matchesSubject = t.subjects.some((s) => s.toLowerCase().includes(q));
        const matchesEdu = (t.education || []).some(
          (edu) =>
            edu.degree.toLowerCase().includes(q) ||
            edu.institution.toLowerCase().includes(q)
        );
        return matchesName || matchesHeadline || matchesBio || matchesSubject || matchesEdu;
      });
    }

    // 2. Subject filter
    if (selectedSubject !== "all") {
      result = result.filter((t) => t.subjects.includes(selectedSubject));
    }

    // 3. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "reviews-desc":
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case "price-asc":
          return a.hourlyRate - b.hourlyRate;
        case "price-desc":
          return b.hourlyRate - a.hourlyRate;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [favorites, searchQuery, selectedSubject, sortOption]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link
          href="/student"
          className="flex items-center gap-1 hover:text-slate-900 transition-colors"
        >
          <Home className="size-3.5 text-slate-400" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <span className="font-semibold text-slate-900">Favorite Teachers</span>
      </nav>

      {/* 2. Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Favorite Teachers
            </h1>
            <span className="size-7 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <Heart className="size-4 fill-rose-500 text-rose-500" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Quickly access, compare, and book 1-on-1 sessions with the instructors you&apos;ve saved.
          </p>
        </div>

        <Button
          asChild
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-5 shadow-sm shadow-orange-500/20 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Link href="/student/find-teachers">
            <Compass className="size-3.5 mr-1.5" />
            <span>Discover More Teachers</span>
          </Link>
        </Button>
      </div>

      {/* 3. Summary Metric Cards */}
      <FavoriteStats favorites={favorites} />

      {/* 4. Undo Notification Banner */}
      {lastRemovedTeacher && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs">
            <Heart className="size-3.5 text-rose-400" />
            <span>
              Removed <strong>{lastRemovedTeacher.name}</strong> from your favorites.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndoRemove}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => setLastRemovedTeacher(null)}
              className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 5. Search & Filters Bar */}
      <FavoriteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        availableSubjects={availableSubjects}
        sortOption={sortOption}
        onSortChange={setSortOption}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalMatches={filteredFavorites.length}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* 6. Results Count & Subtitle */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <div>
          Showing <strong className="font-bold text-slate-900">{filteredFavorites.length}</strong> of{" "}
          <strong className="font-bold text-slate-900">{favorites.length}</strong> saved{" "}
          {favorites.length === 1 ? "instructor" : "instructors"}
        </div>
      </div>

      {/* 7. Loading, Error, Empty, and Teachers List */}
      {isLoading ? (
        /* Loading Skeletons */
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              : "space-y-4"
          )}
        >
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card
              key={idx}
              className="p-6 rounded-2xl border-slate-200 bg-white space-y-4 shadow-xs"
            >
              <div className="flex items-start gap-4">
                <Skeleton className="size-16 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        /* Error State */
        <Card className="max-w-md mx-auto p-8 rounded-2xl border-slate-200 bg-white text-center space-y-4 my-8">
          <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Unable to Load Saved Teachers</h3>
            <p className="text-xs text-slate-500">
              There was a connection issue loading your favorites list.
            </p>
          </div>
          <Button
            type="button"
            onClick={loadFavorites}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            <span>Try Again</span>
          </Button>
        </Card>
      ) : filteredFavorites.length === 0 ? (
        /* Empty States */
        <FavoriteEmptyState
          isFiltered={isFiltered && favorites.length > 0}
          onResetFilters={handleResetFilters}
        />
      ) : (
        /* Favorites Grid or List */
        <div
          className={cn(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              : "space-y-4"
          )}
        >
          {filteredFavorites.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={{ ...teacher, isFavorite: true }}
              viewMode={viewMode}
              onToggleFavorite={handleToggleFavorite}
              onViewQuickProfile={(t) => setSelectedTeacherForPreview(t)}
            />
          ))}
        </div>
      )}

      {/* 8. Quick Profile Preview Modal */}
      <TeacherProfileModal
        teacher={selectedTeacherForPreview}
        isOpen={Boolean(selectedTeacherForPreview)}
        onClose={() => setSelectedTeacherForPreview(null)}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}
