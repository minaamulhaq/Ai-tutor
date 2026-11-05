"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Compass,
  Sparkles,
  AlertCircle,
  RotateCcw,
  Plus,
  Clock,
} from "lucide-react";
import { StudentClass, ClassStatus, ClassFilterState } from "@/types/class";
import {
  fetchStudentClasses,
  cancelStudentClass,
  submitClassReview,
} from "@/services/classService";
import { ClassSummaryCard } from "@/components/student/classes/class-summary-card";
import { ClassFilters } from "@/components/student/classes/class-filters";
import { ClassCard } from "@/components/student/classes/class-card";
import { ClassCancelDialog } from "@/components/student/classes/class-cancel-dialog";
import { ClassDetailsDialog } from "@/components/student/classes/class-details-dialog";
import { ClassReviewDialog } from "@/components/student/classes/class-review-dialog";
import { ClassEmptyState } from "@/components/student/classes/class-empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function StudentClassesPage() {
  const router = useRouter();

  // Primary state for student classes (ready for API integration)
  const [classes, setClasses] = useState<StudentClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState<ClassStatus>("upcoming");

  // Filtering & Sorting state
  const [filters, setFilters] = useState<ClassFilterState>({
    searchQuery: "",
    dateRange: "all",
    subject: "all",
    sortBy: "date-asc",
  });

  // Modal dialog states
  const [cancelModalItem, setCancelModalItem] = useState<StudentClass | null>(null);
  const [detailsModalItem, setDetailsModalItem] = useState<StudentClass | null>(null);
  const [reviewModalItem, setReviewModalItem] = useState<StudentClass | null>(null);

  // Success toast feedback state
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // 1. Initial Data Fetch (Simulates decoupled API call)
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    fetchStudentClasses()
      .then((data) => {
        if (!isMounted) return;
        setClasses(data);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsError(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Detect return from Safepay payment redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("paid") === "true") {
        setActionSuccessMessage(
          "Payment verified via Safepay! Your funds are held safely in escrow and your booking request has been sent to the instructor."
        );
      }
    }
  }, []);

  // 2. Dynamic summary counts derived directly from state (not hardcoded)
  const summaryCounts = useMemo(() => {
    return {
      total: classes.length,
      upcoming: classes.filter((c) => c.status === "upcoming").length,
      pending: classes.filter((c) => c.status === "pending").length,
      completed: classes.filter((c) => c.status === "completed").length,
      cancelled: classes.filter((c) => c.status === "cancelled" || c.status === "rejected").length,
    };
  }, [classes]);

  // 3. Extract unique available subjects from current data
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => set.add(c.subject));
    return Array.from(set).sort();
  }, [classes]);

  // 4. Filter & Sort classes based on active tab and filter state
  const filteredClasses = useMemo(() => {
    return classes
      .filter((item) => {
        // Tab matching
        if (activeTab === "cancelled") {
          if (item.status !== "cancelled" && item.status !== "rejected") return false;
        } else if (item.status !== activeTab) {
          return false;
        }

        // Search query filter (matches teacher name or subject or topic title)
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = item.teacher.name.toLowerCase().includes(q);
          const matchSubject = item.subject.toLowerCase().includes(q);
          const matchTitle = item.topicTitle.toLowerCase().includes(q);
          if (!matchName && !matchSubject && !matchTitle) return false;
        }

        // Subject filter
        if (filters.subject !== "all" && item.subject !== filters.subject) {
          return false;
        }

        // Date range filter
        if (filters.dateRange !== "all") {
          const classDate = new Date(item.date).getTime();
          const today = new Date().setHours(0, 0, 0, 0);
          const oneWeek = 7 * 24 * 60 * 60 * 1000;
          const oneMonth = 30 * 24 * 60 * 60 * 1000;
          const threeMonths = 90 * 24 * 60 * 60 * 1000;

          if (filters.dateRange === "today") {
            // within next 7 days or today
            const diff = Math.abs(classDate - today);
            if (diff > oneWeek) return false;
          } else if (filters.dateRange === "this-month") {
            const diff = Math.abs(classDate - today);
            if (diff > oneMonth) return false;
          } else if (filters.dateRange === "past-3-months") {
            const diff = Math.abs(classDate - today);
            if (diff > threeMonths) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "date-asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (filters.sortBy === "date-desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (filters.sortBy === "fee-high") {
          return b.feePKR - a.feePKR;
        } else if (filters.sortBy === "fee-low") {
          return a.feePKR - b.feePKR;
        }
        return 0;
      });
  }, [classes, activeTab, filters]);

  // Handlers for state updates
  const handleFilterChange = (updated: Partial<ClassFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      dateRange: "all",
      subject: "all",
      sortBy: "date-asc",
    });
  };

  const handleConfirmCancel = async (classId: string, reason: string) => {
    const result = await cancelStudentClass(classId, reason);
    if (result.success && result.cancelledClass) {
      // Update local state cleanly
      setClasses((prev) =>
        prev.map((item) => (item.id === classId ? result.cancelledClass! : item))
      );
      setActionSuccessMessage("Session successfully cancelled. 100% refund credited to your wallet.");
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const handleConfirmReview = async (classId: string, rating: number, comment: string) => {
    const result = await submitClassReview(classId, rating, comment);
    if (result.success && result.reviewedClass) {
      // Update local state cleanly
      setClasses((prev) =>
        prev.map((item) => (item.id === classId ? result.reviewedClass! : item))
      );
      setActionSuccessMessage("Thank you! Your verified review has been published.");
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
  };

  const handleBookAgain = (classItem: StudentClass) => {
    router.push(`/student/teachers/${classItem.teacher.id}`);
  };

  const handleReschedule = (classItem: StudentClass) => {
    router.push(`/student/teachers/${classItem.teacher.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* 0. Breadcrumbs Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link
          href="/student"
          className="hover:text-slate-900 font-medium transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-900">My Classes</span>
      </nav>

      {/* 1. Header Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="size-7 text-orange-500" />
            <span>My Classes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your upcoming sessions and view your learning history.
          </p>
        </div>

        {/* Quick CTA to Find More Tutors */}
        <Button
          asChild
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-4 shadow-md shadow-orange-500/20 cursor-pointer w-fit"
        >
          <Link href="/student/find-teachers">
            <Plus className="size-4 mr-1.5" />
            <span>Book New Class</span>
          </Link>
        </Button>
      </div>

      {/* Action Success Alert Notification */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Four Overview Cards (Total, Upcoming, Completed, Cancelled) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ClassSummaryCard
          type="total"
          count={summaryCounts.total}
          subtext="All-time bookings"
          isActive={false}
          onClick={() => setActiveTab("upcoming")}
        />
        <ClassSummaryCard
          type="upcoming"
          count={summaryCounts.upcoming}
          subtext="Confirmed 1-on-1s"
          isActive={activeTab === "upcoming"}
          onClick={() => setActiveTab("upcoming")}
        />
        <ClassSummaryCard
          type="completed"
          count={summaryCounts.completed}
          subtext="Past sessions"
          isActive={activeTab === "completed"}
          onClick={() => setActiveTab("completed")}
        />
        <ClassSummaryCard
          type="cancelled"
          count={summaryCounts.cancelled}
          subtext="Refunded sessions"
          isActive={activeTab === "cancelled"}
          onClick={() => setActiveTab("cancelled")}
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <ClassFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        availableSubjects={availableSubjects}
        totalMatches={filteredClasses.length}
      />

      {/* 4. Three Tabs: Upcoming Sessions, Completed, and Cancelled */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as ClassStatus)}
          className="w-full sm:w-auto"
        >
          <TabsList className="h-auto p-1.5 bg-slate-100/90 rounded-2xl w-full sm:w-auto border border-slate-200/80 gap-1.5 shadow-2xs overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              {
                id: "upcoming" as ClassStatus,
                label: "Upcoming Sessions",
                count: summaryCounts.upcoming,
                icon: Calendar,
                activeColor: "text-orange-600 border-orange-200/70",
                badgeActive: "bg-orange-500 text-white border-orange-500",
                activeIconColor: "text-orange-600",
              },
              {
                id: "pending" as ClassStatus,
                label: "Pending Approval",
                count: summaryCounts.pending,
                icon: Clock,
                activeColor: "text-amber-800 border-amber-200/70",
                badgeActive: "bg-amber-500 text-white border-amber-500",
                activeIconColor: "text-amber-600",
              },
              {
                id: "completed" as ClassStatus,
                label: "Completed",
                count: summaryCounts.completed,
                icon: CheckCircle2,
                activeColor: "text-emerald-700 border-emerald-200/70",
                badgeActive: "bg-emerald-600 text-white border-emerald-600",
                activeIconColor: "text-emerald-600",
              },
              {
                id: "cancelled" as ClassStatus,
                label: "Cancelled & Declined",
                count: summaryCounts.cancelled,
                icon: XCircle,
                activeColor: "text-slate-800 border-slate-300/80",
                badgeActive: "bg-rose-500 text-white border-rose-500",
                activeIconColor: "text-rose-500",
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "h-9 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0",
                    isActive
                      ? cn("bg-white shadow-xs border", tab.activeColor)
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/40"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0 transition-colors",
                      isActive ? tab.activeIconColor : "text-slate-400"
                    )}
                  />
                  <span>{tab.label}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0 rounded-full transition-colors",
                      isActive
                        ? tab.badgeActive
                        : "bg-slate-200/80 text-slate-700 border-transparent"
                    )}
                  >
                    {tab.count}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Tab Context Subtitle / Live Counter */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 px-1">
          {activeTab === "upcoming" && (
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{summaryCounts.upcoming} session{summaryCounts.upcoming === 1 ? "" : "s"} scheduled</span>
            </span>
          )}
          {activeTab === "completed" && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              <span>{summaryCounts.completed} completed session{summaryCounts.completed === 1 ? "" : "s"}</span>
            </span>
          )}
          {activeTab === "cancelled" && (
            <span className="flex items-center gap-1.5">
              <XCircle className="size-3.5 text-rose-500" />
              <span>{summaryCounts.cancelled} cancelled session{summaryCounts.cancelled === 1 ? "" : "s"}</span>
            </span>
          )}
        </div>
      </div>

      {/* 5. Class Cards List / Loading / Error / Empty States */}
      {isLoading ? (
        /* Loading Skeletons */
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 rounded-2xl border-slate-200 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-9 w-28 rounded-xl" />
                <Skeleton className="h-9 w-32 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        /* Error State with Retry */
        <Card className="max-w-md mx-auto p-8 rounded-2xl border-slate-200 bg-white text-center space-y-4 my-8">
          <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Unable to Load Classes</h3>
            <p className="text-xs text-slate-500">
              There was a connection issue loading your class schedule.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setIsError(false);
              fetchStudentClasses()
                .then((data) => {
                  setClasses(data);
                  setIsLoading(false);
                })
                .catch(() => {
                  setIsError(true);
                  setIsLoading(false);
                });
            }}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            <span>Try Again</span>
          </Button>
        </Card>
      ) : filteredClasses.length === 0 ? (
        /* Empty State */
        <ClassEmptyState
          statusTab={activeTab}
          isFiltered={
            filters.searchQuery !== "" ||
            filters.dateRange !== "all" ||
            filters.subject !== "all"
          }
          onResetFilters={handleResetFilters}
        />
      ) : (
        /* Responsive Class Cards List */
        <div className="space-y-4">
          {filteredClasses.map((item) => (
            <ClassCard
              key={item.id}
              classItem={item}
              onViewDetails={(item) => setDetailsModalItem(item)}
              onCancel={(item) => setCancelModalItem(item)}
              onReschedule={handleReschedule}
              onLeaveReview={(item) => setReviewModalItem(item)}
              onBookAgain={handleBookAgain}
            />
          ))}
        </div>
      )}

      {/* 6. Interactive Modal Dialogs */}
      {/* A. Cancel Class Confirmation Dialog */}
      <ClassCancelDialog
        isOpen={Boolean(cancelModalItem)}
        onClose={() => setCancelModalItem(null)}
        classItem={cancelModalItem}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* B. Class Full Details Dialog */}
      <ClassDetailsDialog
        isOpen={Boolean(detailsModalItem)}
        onClose={() => setDetailsModalItem(null)}
        classItem={detailsModalItem}
      />

      {/* C. Leave Review Dialog */}
      <ClassReviewDialog
        isOpen={Boolean(reviewModalItem)}
        onClose={() => setReviewModalItem(null)}
        classItem={reviewModalItem}
        onConfirmReview={handleConfirmReview}
      />
    </div>
  );
}
