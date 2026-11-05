"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Users, Sparkles, RefreshCw, Radio } from "lucide-react";
import { StudentProfile, StudentFiltersState } from "./types";
import { apiFetchStudents } from "./students-service";
import { StudentCard } from "./student-card";
import { StudentGridSkeleton } from "./student-card-skeleton";
import { StudentSearchFilters } from "./student-search-filters";
import { StudentsEmptyState } from "./students-empty-state";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

const initialFilters: StudentFiltersState = {
  searchQuery: "",
  subject: "all",
  status: "all",
};

export function TeacherStudentsView() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [filters, setFilters] = useState<StudentFiltersState>(initialFilters);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Load students from server action
  const loadStudents = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setHasError(false);
    try {
      const res = await apiFetchStudents();
      setStudents(res.students);
      if (res.teacherId) {
        setTeacherId(res.teacherId);
      }
    } catch (err) {
      console.error("Error loading students:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStudents(true);
  }, [loadStudents]);

  // Realtime Supabase Channel for instant updates when bookings are created, confirmed, or completed
  useEffect(() => {
    if (!teacherId) return;

    let channel: any = null;
    try {
      const supabase = createClient();
      const channelName = `teacher-students-sync:${teacherId}`;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `teacher_id=eq.${teacherId}`,
          },
          () => {
            // Re-fetch directory in background on any booking change
            loadStudents(false);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsRealtimeActive(true);
          }
        });
    } catch (err) {
      console.warn("Supabase Realtime notice in TeacherStudentsView:", err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [teacherId, loadStudents]);

  // Extract distinct subjects available across all students
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      s.subjects.forEach((subj) => set.add(subj));
    });
    return Array.from(set).sort();
  }, [students]);

  // Filter students based on search query, subject, and status
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. Search by full name or email
      if (filters.searchQuery.trim() !== "") {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesEmail = student.email.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail) return false;
      }

      // 2. Subject filter
      if (filters.subject !== "all") {
        if (!student.subjects.includes(filters.subject)) return false;
      }

      // 3. Status filter
      if (filters.status !== "all") {
        if (filters.status === "attended") {
          if (student.completedClassesCount === 0) return false;
        } else if (filters.status === "active") {
          if (student.status !== "active") return false;
        } else if (filters.status === "inactive") {
          if (student.status !== "inactive") return false;
        }
      }

      return true;
    });
  }, [students, filters]);

  const handleFilterChange = (updates: Partial<StudentFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Aggregate attended count
  const attendedCount = useMemo(() => {
    return students.filter((s) => s.completedClassesCount > 0).length;
  }, [students]);

  const upcomingCount = useMemo(() => {
    return students.filter((s) => s.upcomingClassesCount > 0).length;
  }, [students]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Compact Page Header with Attended Classes Summary & Real-time Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Students
            </h1>
            {!isLoading && !hasError && (
              <>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  {students.length} Total
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ {attendedCount} Attended Classes
                </span>
                {upcomingCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                    {upcomingCount} Upcoming
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Directory of students who have booked or attended classes with you.
          </p>
        </div>

        {/* Right Header: Manual Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadStudents(false)}
            disabled={isLoading || isRefreshing}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 text-xs h-8.5 px-3 gap-1.5 shadow-2xs cursor-pointer"
            title="Refresh students directory"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin text-orange-500" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="h-14 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          <StudentGridSkeleton count={8} />
        </div>
      ) : hasError ? (
        <StudentsEmptyState type="error" onRetry={() => loadStudents(true)} />
      ) : students.length === 0 ? (
        <StudentsEmptyState type="empty-directory" />
      ) : (
        <div className="space-y-6">
          {/* Search & Filter Toolbar */}
          <StudentSearchFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            availableSubjects={availableSubjects}
            totalFiltered={filteredStudents.length}
            totalStudents={students.length}
          />

          {/* Student Card Grid or No-Match State */}
          {filteredStudents.length === 0 ? (
            <StudentsEmptyState
              type="no-search-results"
              onResetFilters={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
