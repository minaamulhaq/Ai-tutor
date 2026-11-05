"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  X,
  RotateCcw,
  Sparkles,
  Inbox,
  CalendarClock,
  CheckCircle2,
  CalendarX,
  AlertCircle,
  Check,
  Info,
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";

// shadcn/ui components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

// Custom Subcomponents
import { ClassSession, formatPKR } from "./types";
import {
  apiFetchClasses,
  apiUpdateClassNotes,
  apiCancelClass,
  apiMarkCompleted,
  apiAcceptBooking,
  apiDeclineBooking,
  apiRescheduleClass,
} from "./classes-service";
import { ClassStatsGrid } from "./class-stats-grid";
import { ClassCard } from "./class-card";
import { ClassDetailsSheet } from "./class-details-sheet";
import { AcceptBookingDialog } from "./accept-dialog";
import { DeclineBookingDialog } from "./decline-dialog";
import { RescheduleClassDialog } from "./reschedule-dialog";
import { CancelClassDialog } from "./cancel-dialog";
import { MarkCompletedDialog } from "./mark-completed-dialog";

export interface TeacherClassesViewProps {
  initialData?: ClassSession[];
  onClassesChange?: (classes: ClassSession[]) => void;
}

export function TeacherClassesView({
  initialData,
  onClassesChange,
}: TeacherClassesViewProps = {}) {
  // Main data state: loaded directly from PostgreSQL database
  const [classes, setClasses] = useState<ClassSession[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);

  const reloadClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetched = await apiFetchClasses();
      setClasses(fetched);
      onClassesChange?.(fetched);
    } catch (err) {
      console.warn("Could not load teacher classes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [onClassesChange]);

  useEffect(() => {
    if (!initialData) {
      reloadClasses();
    }
  }, [initialData, reloadClasses]);

  // Helper to update state and notify optional parent listeners
  const updateClasses = (updater: (prev: ClassSession[]) => ClassSession[]) => {
    setClasses((prev) => {
      const next = updater(prev);
      onClassesChange?.(next);
      return next;
    });
  };

  // Tabs state: "upcoming" | "pending" | "completed" | "cancelled" | "all"
  const [activeTab, setActiveTab] = useState<string>("upcoming");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState<Date | undefined>(undefined);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);


  // Active dialogs state
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<ClassSession | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

  const [sessionToAccept, setSessionToAccept] = useState<ClassSession | null>(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);

  const [sessionToDecline, setSessionToDecline] = useState<ClassSession | null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);

  const [sessionToReschedule, setSessionToReschedule] = useState<ClassSession | null>(null);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  const [sessionToCancel, setSessionToCancel] = useState<ClassSession | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [sessionToComplete, setSessionToComplete] = useState<ClassSession | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Derived filtered classes
  const filteredClasses = useMemo(() => {
    return classes.filter((session) => {
      // 1. Tab Status Filter
      if (activeTab === "upcoming" && session.status !== "confirmed") return false;
      if (activeTab === "pending" && session.status !== "pending") return false;
      if (activeTab === "completed" && session.status !== "completed") return false;
      if (activeTab === "cancelled" && session.status !== "cancelled" && session.status !== "rejected") return false;

      // 2. Search Query (Student Name, Subject, Topic, Booking Ref)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = session.student.name.toLowerCase().includes(query);
        const matchesSubject = session.subject.toLowerCase().includes(query);
        const matchesTopic = session.topicTitle.toLowerCase().includes(query);
        const matchesRef = session.bookingReference.toLowerCase().includes(query);

        if (!matchesName && !matchesSubject && !matchesTopic && !matchesRef) {
          return false;
        }
      }

      // 3. Date Filter
      if (selectedDateFilter) {
        try {
          const sessionDate = parseISO(session.date);
          if (!isSameDay(sessionDate, selectedDateFilter)) {
            return false;
          }
        } catch {
          return false;
        }
      }

      return true;
    });
  }, [classes, activeTab, searchQuery, selectedDateFilter]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedDateFilter
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedDateFilter(undefined);
  };

  // Actions implementations
  const handleConfirmAccept = async (session: ClassSession) => {
    const res = await apiAcceptBooking(session.id);
    if (!res.success) {
      showToast(res.error || "Failed to approve booking request.", "error");
      return;
    }

    await reloadClasses();

    if (res.meetingUrl) {
      showToast(`Booking request for ${session.student.name} approved! Google Meet link ready.`, "success");
    } else {
      showToast(`Booking for ${session.student.name} confirmed!`, "success");
    }
  };

  const handleConfirmDecline = async (session: ClassSession, reason: string) => {
    const res = await apiDeclineBooking(session.id, reason);
    if (!res.success) {
      showToast(res.error || "Failed to decline booking request.", "error");
      return;
    }

    await reloadClasses();
    showToast(`Booking request declined. Reserved slot released and student refunded.`, "info");
  };

  const handleConfirmReschedule = async (
    session: ClassSession,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason: string
  ) => {
    const res = await apiRescheduleClass(session.id, newDate, newStartTime, newEndTime, reason);
    if (!res.success) {
      showToast(res.error || "Failed to reschedule class.", "error");
      return;
    }

    await reloadClasses();
    showToast(`Session successfully rescheduled to ${newDate} at ${newStartTime}.`, "success");
  };

  const handleConfirmCancel = async (session: ClassSession, reason: string) => {
    const res = await apiCancelClass(session.id, reason);
    if (!res.success) {
      showToast(res.error || "Failed to cancel class.", "error");
      return;
    }

    await reloadClasses();
    showToast(`Session #${session.bookingReference} cancelled. Escrow refunded to student.`, "error");
  };

  const handleConfirmCompleted = async (session: ClassSession) => {
    const res = await apiMarkCompleted(session.id);
    if (!res.success) {
      showToast(res.error || "Failed to mark class as completed.", "error");
      return;
    }

    await reloadClasses();
    showToast(`Session #${session.bookingReference} marked as completed! ${formatPKR(session.teacherEarnings)} added to your available balance.`, "success");
  };

  const handleSaveNotes = async (sessionId: string, newNotes: string) => {
    const res = await apiUpdateClassNotes(sessionId, newNotes);
    if (!res.success) {
      showToast(res.error || "Failed to save lesson notes.", "error");
      return;
    }

    await reloadClasses();
    showToast("Class lesson notes saved successfully.", "success");
  };

  // Derive live detail session from current state
  const currentDetailSession = useMemo(() => {
    if (!selectedSessionForDetails) return null;
    return classes.find((c) => c.id === selectedSessionForDetails.id) || selectedSessionForDetails;
  }, [classes, selectedSessionForDetails]);

  // Pending count for tab badge
  const pendingRequestsCount = classes.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : toastMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : "bg-blue-50 border-blue-200 text-blue-900"
          }`}
        >
          {toastMessage.type === "success" && (
            <Check className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          {toastMessage.type === "error" && (
            <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          {toastMessage.type === "info" && (
            <Info className="size-5 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs font-medium leading-relaxed">
            {toastMessage.text}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Classes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your bookings and teaching sessions.
          </p>
        </div>

        {/* Top Header Quick Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setIsLoading(true);
              try {
                const refreshed = await apiFetchClasses();
                if (refreshed && refreshed.length > 0) {
                  setClasses(refreshed);
                }
                showToast("Classes data refreshed.", "info");
              } catch (err) {
                console.error(err);
              } finally {
                setIsLoading(false);
              }
            }}
            className="text-xs font-medium cursor-pointer h-9 text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            <RotateCcw className="size-3.5 mr-1.5 text-slate-400" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setActiveTab("pending");
            }}
            className="text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer h-9 shadow-xs"
          >
            <Inbox className="size-3.5 mr-1.5" />
            Pending Inbox ({pendingRequestsCount})
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <ClassStatsGrid
        classes={classes}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Tabs Container */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val || "upcoming")}
        className="w-full space-y-5"
      >
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
          <TabsList className="bg-slate-100/90 p-1 rounded-xl h-auto flex flex-wrap gap-1">
            <TabsTrigger
              value="upcoming"
              className="text-xs font-medium rounded-lg px-3.5 py-1.5 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-xs font-medium rounded-lg px-3.5 py-1.5 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Pending Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                  {pendingRequestsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-xs font-medium rounded-lg px-3.5 py-1.5 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="text-xs font-medium rounded-lg px-3.5 py-1.5 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              Cancelled
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="text-xs font-medium rounded-lg px-3.5 py-1.5 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
            >
              All Classes
            </TabsTrigger>
          </TabsList>

          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredClasses.length}</span> session{filteredClasses.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by student name, topic, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9.5 pr-8 text-xs h-9.5 rounded-xl border-slate-200 focus-visible:ring-orange-500 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
                <PopoverTrigger className="h-9.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-left flex items-center justify-between gap-2 hover:border-orange-500 transition-colors cursor-pointer min-w-36">
                  <span className="flex items-center gap-1.5 text-slate-700 truncate">
                    <CalendarIcon className="size-3.5 text-orange-500 shrink-0" />
                    {selectedDateFilter ? format(selectedDateFilter, "MMM d, yyyy") : "Filter by date"}
                  </span>
                  {selectedDateFilter && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateFilter(undefined);
                      }}
                      className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="size-3" />
                    </span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white rounded-xl shadow-xl border border-slate-200" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDateFilter}
                    onSelect={(d) => {
                      setSelectedDateFilter(d);
                      setDateFilterOpen(false);
                    }}
                    calendarSize="default"
                  />
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="h-9.5 px-2.5 text-xs text-slate-500 hover:text-slate-900 shrink-0 cursor-pointer"
                  title="Clear all filters"
                >
                  <X className="size-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Classes Content Display */}
        <TabsContent value={activeTab} className="mt-0 outline-none">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-5 sm:p-6 flex items-start justify-between gap-5">
                  <div className="flex items-start gap-4 sm:gap-5 flex-1">
                    <Skeleton className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-56" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-4 w-32" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-9 w-28 rounded-full" />
                        <Skeleton className="h-9 w-28 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredClasses.length === 0 ? (
            /* Specialized Empty States */
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs my-4">
              {hasActiveFilters ? (
                <>
                  <div className="size-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3.5 ring-1 ring-orange-200/50">
                    <Search className="size-7 text-orange-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No classes found
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Try changing your search or clearing your filters to see your tutoring sessions.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearFilters}
                    className="mt-4 text-xs font-medium cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                </>
              ) : activeTab === "upcoming" ? (
                <>
                  <div className="size-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3.5 ring-1 ring-orange-200/50">
                    <CalendarClock className="size-7 text-orange-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No upcoming classes yet
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Your confirmed sessions will appear here when students book your classes.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab("pending")}
                    className="mt-4 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                  >
                    Check Pending Requests ({pendingRequestsCount})
                  </Button>
                </>
              ) : activeTab === "pending" ? (
                <>
                  <div className="size-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5 ring-1 ring-emerald-200/50">
                    <CheckCircle2 className="size-7 text-emerald-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    You're all caught up
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    You don't have any pending booking requests right now.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("upcoming")}
                    className="mt-4 text-xs font-medium cursor-pointer"
                  >
                    View Upcoming Sessions
                  </Button>
                </>
              ) : activeTab === "completed" ? (
                <>
                  <div className="size-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5 ring-1 ring-blue-200/50">
                    <CheckCircle2 className="size-7 text-blue-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No completed sessions yet
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Completed teaching sessions and student lesson notes will be listed here.
                  </p>
                </>
              ) : (
                <>
                  <div className="size-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3.5 ring-1 ring-rose-200/50">
                    <CalendarX className="size-7 text-rose-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No cancelled classes
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Cancelled sessions and their cancellation reasons will appear here.
                  </p>
                </>
              )}
            </div>
          ) : (
            /* Classes List Container */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y divide-slate-100 overflow-hidden">
              {filteredClasses.map((session) => (
                <ClassCard
                  key={session.id}
                  session={session}
                  onViewDetails={(s) => {
                    setSelectedSessionForDetails(s);
                    setDetailsSheetOpen(true);
                  }}
                  onAccept={(s) => {
                    setSessionToAccept(s);
                    setAcceptDialogOpen(true);
                  }}
                  onDecline={(s) => {
                    setSessionToDecline(s);
                    setDeclineDialogOpen(true);
                  }}
                  onReschedule={(s) => {
                    setSessionToReschedule(s);
                    setRescheduleDialogOpen(true);
                  }}
                  onCancel={(s) => {
                    setSessionToCancel(s);
                    setCancelDialogOpen(true);
                  }}
                  onMarkCompleted={(s) => {
                    setSessionToComplete(s);
                    setCompleteDialogOpen(true);
                  }}
                  onOpenNotes={(s) => {
                    setSelectedSessionForDetails(s);
                    setDetailsSheetOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Slide-over Detailed Class View Sheet */}
      <ClassDetailsSheet
        session={currentDetailSession}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        onSaveNotes={handleSaveNotes}
        onShowToast={showToast}
        onJoinMeeting={(url) => window.open(url, "_blank")}
      />

      {/* Accept Booking Confirmation Dialog */}
      <AcceptBookingDialog
        session={sessionToAccept}
        open={acceptDialogOpen}
        onOpenChange={setAcceptDialogOpen}
        onConfirmAccept={handleConfirmAccept}
      />

      {/* Decline Booking Dialog */}
      <DeclineBookingDialog
        session={sessionToDecline}
        open={declineDialogOpen}
        onOpenChange={setDeclineDialogOpen}
        onConfirmDecline={handleConfirmDecline}
      />

      {/* Reschedule Class Dialog */}
      <RescheduleClassDialog
        session={sessionToReschedule}
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        onConfirmReschedule={handleConfirmReschedule}
      />

      {/* Cancel Class Alert Dialog */}
      <CancelClassDialog
        session={sessionToCancel}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* Mark Completed Dialog */}
      <MarkCompletedDialog
        session={sessionToComplete}
        open={completeDialogOpen}
        onOpenChange={setCompleteDialogOpen}
        onConfirmCompleted={handleConfirmCompleted}
      />
    </div>
  );
}
