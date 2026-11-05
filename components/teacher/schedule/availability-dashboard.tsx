"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DayOfWeek,
  TimeSlot,
  BlockedDate,
  TimezoneOption,
  AvailabilityOverviewStats,
} from "./types";
import {
  format12Hour,
  calculateDuration,
  calculateTotalHours,
} from "./time-utils";
import { AddAvailabilityModal } from "./add-availability-modal";
import { EditAvailabilityModal } from "./edit-availability-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { TeacherCalendarView } from "./calendar-view";
import { BlockDateModal } from "./block-date-modal";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  getTeacherAvailabilityAction,
  deleteAvailabilityWindowAction,
  toggleDayAvailabilityAction,
  addBlockedDateAction,
  removeBlockedDateAction,
  updateTeacherTimezoneAction,
  DayScheduleData,
  BookedClassItem,
} from "@/app/actions/availability";
import {
  CalendarDays,
  Clock,
  Plus,
  Pencil,
  Trash2,
  CalendarOff,
  Globe2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Check,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const timezoneOptions: { id: string; label: string }[] = [
  { id: "Asia/Karachi", label: "Pakistan Standard Time (UTC+05:00)" },
  { id: "Asia/Dubai", label: "Gulf Standard Time (UTC+04:00)" },
  { id: "Asia/Kolkata", label: "India Standard Time (UTC+05:30)" },
  { id: "Europe/London", label: "Greenwich Mean Time (UTC+00:00)" },
  { id: "America/New_York", label: "Eastern Standard Time (UTC-05:00)" },
  { id: "America/Los_Angeles", label: "Pacific Standard Time (UTC-08:00)" },
];

export function TeacherAvailabilityDashboard() {
  // Navigation tabs: Weekly Schedule vs Calendar Grid
  const [activeTab, setActiveTab] = useState<"schedule" | "calendar">("schedule");

  // Timezone selection (default: Asia/Karachi)
  const [selectedTimezone, setSelectedTimezone] = useState<string>("Asia/Karachi");

  // Core Schedule & Stats State
  const [schedule, setSchedule] = useState<DayScheduleData[]>([]);
  const [stats, setStats] = useState<AvailabilityOverviewStats>({
    activeDaysCount: 0,
    totalWeeklyHours: 0,
    totalSlotsCount: 0,
    upcomingBookedClassesCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Blocked dates and booked classes from real PostgreSQL tables
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [bookedClasses, setBookedClasses] = useState<BookedClassItem[]>([]);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalInitialDay, setAddModalInitialDay] = useState<DayOfWeek>("monday");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    day: DayOfWeek;
    slot: TimeSlot;
  } | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<{
    day: DayOfWeek;
    slotId: string;
    windowLabel: string;
  } | null>(null);

  const [blockDateModalOpen, setBlockDateModalOpen] = useState(false);
  const [selectedBlockDate, setSelectedBlockDate] = useState<Date | undefined>(undefined);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch availability data from Server Action
  const fetchAvailability = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getTeacherAvailabilityAction();

      if (res.success && res.data) {
        setSchedule(res.data.schedule);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.timezone) {
          setSelectedTimezone(res.data.timezone);
        }
        if (res.data.blockedDates) {
          setBlockedDates(res.data.blockedDates);
        }
        if (res.data.bookedClasses) {
          setBookedClasses(res.data.bookedClasses);
        }
      } else {
        triggerToast(res.error || "Failed to load availability.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error loading schedule.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Lookup map for existing windows per day (used in overlap detection)
  const existingScheduleByDay = useMemo(() => {
    const map: Record<DayOfWeek, TimeSlot[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
    schedule.forEach((d) => {
      map[d.day] = d.slots;
    });
    return map;
  }, [schedule]);

  // Current timezone label
  const currentTimezoneObj = useMemo(() => {
    return (
      timezoneOptions.find((tz) => tz.id === selectedTimezone) ||
      timezoneOptions[0]
    );
  }, [selectedTimezone]);

  // Toggle Day active status
  const handleToggleDay = async (dayKey: DayOfWeek, enabled: boolean) => {
    // Optimistic update
    setSchedule((prev) =>
      prev.map((d) => (d.day === dayKey ? { ...d, isEnabled: enabled } : d))
    );

    try {
      const res = await toggleDayAvailabilityAction(dayKey, enabled);
      if (!res.success) {
        // Revert on failure
        setSchedule((prev) =>
          prev.map((d) => (d.day === dayKey ? { ...d, isEnabled: !enabled } : d))
        );
        triggerToast(res.error || "Failed to update day availability.", "error");
      } else {
        triggerToast(
          `${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)} availability ${
            enabled ? "enabled" : "paused"
          }.`
        );
      }
    } catch {
      fetchAvailability();
    }
  };

  // Open Add modal with specified initial day
  const handleOpenAdd = (day: DayOfWeek = "monday") => {
    setAddModalInitialDay(day);
    setAddModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (day: DayOfWeek, slot: TimeSlot) => {
    setEditingItem({ day, slot });
    setEditModalOpen(true);
  };

  // Prompt delete confirmation
  const handlePromptDelete = (day: DayOfWeek, slot: TimeSlot) => {
    setSlotToDelete({
      day,
      slotId: slot.id,
      windowLabel: `${format12Hour(slot.startTime)} – ${format12Hour(slot.endTime)}`,
    });
    setDeleteModalOpen(true);
  };

  // Execute delete
  const handleConfirmDelete = async () => {
    if (!slotToDelete) return;
    const { slotId } = slotToDelete;

    // Optimistic removal
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== slotToDelete.day) return d;
        const filtered = d.slots.filter((s) => s.id !== slotId);
        return {
          ...d,
          slots: filtered,
          isEnabled: filtered.length > 0 ? d.isEnabled : false,
        };
      })
    );

    setDeleteModalOpen(false);

    try {
      const res = await deleteAvailabilityWindowAction(slotId);
      if (!res.success) {
        triggerToast(res.error || "Failed to delete slot.", "error");
        fetchAvailability();
      } else {
        triggerToast("Availability window removed.");
        fetchAvailability();
      }
    } catch {
      fetchAvailability();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="size-5 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* =========================================================================
          PAGE HEADER
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                My Availability
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                <Sparkles className="size-3 text-orange-600" />
                1-Hour Classes
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              Define your regular weekly teaching hours. ZuhDemy automatically generates 1-hour student booking slots so students can book private 1-on-1 classes.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Block a date */}
            <button
              type="button"
              onClick={() => {
                setSelectedBlockDate(undefined);
                setBlockDateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <CalendarOff className="size-4 text-orange-500" />
              <span>Block Date / Holiday</span>
              {blockedDates.length > 0 && (
                <span className="size-4.5 rounded-full bg-slate-100 text-slate-700 text-[11px] flex items-center justify-center font-bold">
                  {blockedDates.length}
                </span>
              )}
            </button>

            {/* Primary Add Availability CTA */}
            <button
              type="button"
              onClick={() => handleOpenAdd("monday")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Add Availability</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            QUICK OVERVIEW CARDS
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* 1. Available Days */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden group hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Available Days
              </span>
              <div className="size-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <CalendarDays className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.activeDaysCount} <span className="text-sm font-semibold text-slate-400">/ 7 active</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.activeDaysCount === 7
                  ? "Available all 7 days of the week"
                  : stats.activeDaysCount > 0
                  ? "Regular weekly teaching schedule active"
                  : "No days currently set as available"}
              </p>
            </div>
            {/* Days indicator pills */}
            <div className="flex items-center gap-1 pt-1">
              {schedule.map((day) => {
                const isActive = day.isEnabled && day.slots.length > 0;
                return (
                  <span
                    key={day.day}
                    className={`size-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-orange-500 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-400"
                    }`}
                    title={`${day.label}: ${isActive ? "Available" : "Unavailable"}`}
                  >
                    {day.label.charAt(0)}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 2. Total Weekly Teaching Hours */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden group hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Weekly Teaching Hours
              </span>
              <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
                <span>{stats.totalWeeklyHours}</span>
                <span className="text-sm font-semibold text-slate-400">hrs / week</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Generates <strong className="text-slate-800 font-bold">{stats.totalSlotsCount}</strong> one-hour student booking slots weekly.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              100% 1-hour lesson duration
            </div>
          </div>

          {/* 3. Upcoming Booked Classes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden group hover:border-orange-200 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Upcoming Booked Classes
              </span>
              <div className="size-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
                <span>{stats.upcomingBookedClassesCount}</span>
                <span className="text-sm font-semibold text-slate-400">confirmed</span>
              </div>
              {stats.nextBookedClass ? (
                <div className="text-xs text-slate-600 mt-1 truncate">
                  <span className="font-semibold text-slate-800">{stats.nextBookedClass.studentName}</span> • {stats.nextBookedClass.date} at {format12Hour(stats.nextBookedClass.startTime)}
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Ready for new student bookings.
                </p>
              )}
            </div>
            <Link
              href="/teacher/classes"
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <span>View all classes</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* View Switcher Tabs & Timezone Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-b border-slate-200 pb-3">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "schedule"
                  ? "bg-white text-orange-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="size-3.5" />
              <span>Weekly Schedule View</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-white text-orange-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarIcon className="size-3.5" />
              <span>Calendar Grid View</span>
            </button>
          </div>

          {/* Timezone Selector */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                aria-label="Change timezone"
              >
                <Globe2 className="size-3.5 text-orange-500 shrink-0" />
                <span>{currentTimezoneObj.label}</span>
                <ChevronDown className="size-3 text-slate-400 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 min-w-72 p-1 rounded-xl shadow-lg border border-slate-200 bg-white"
              >
                <DropdownMenuRadioGroup
                  value={selectedTimezone}
                  onValueChange={async (val) => {
                    if (val) {
                      setSelectedTimezone(val);
                      try {
                        await updateTeacherTimezoneAction(val);
                        triggerToast(`Timezone updated to ${val}`);
                      } catch {
                        triggerToast(`Timezone updated to ${val}`);
                      }
                    }
                  }}
                >
                  {timezoneOptions.map((tz) => (
                    <DropdownMenuRadioItem
                      key={tz.id}
                      value={tz.id}
                      className="text-xs py-2 px-3 rounded-lg cursor-pointer font-medium text-slate-800 focus:bg-orange-50 focus:text-orange-950 transition-colors"
                    >
                      {tz.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchAvailability}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Refresh availability"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: WEEKLY SCHEDULE VIEW (PRIMARY DASHBOARD)
         ========================================================================= */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          {schedule.map((dayItem) => {
            const dayHours = calculateTotalHours(dayItem.slots);
            const totalDaySlots = dayItem.slots.reduce(
              (acc, s) => acc + (s.generatedSlots?.length || 0),
              0
            );

            return (
              <div
                key={dayItem.day}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                  dayItem.isEnabled
                    ? "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                    : "bg-slate-50/70 border-slate-200/60 opacity-80"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Day Toggle & Status */}
                  <div className="flex items-start gap-3.5 min-w-[220px]">
                    <div className="pt-0.5">
                      <Switch
                        checked={dayItem.isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleDay(dayItem.day, checked)
                        }
                      />
                    </div>
                    <div>
                      <h3
                        className={`text-base font-bold tracking-tight ${
                          dayItem.isEnabled ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {dayItem.label}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {dayItem.isEnabled ? (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {dayHours} hr{dayHours !== 1 ? "s" : ""} • {totalDaySlots} slot
                            {totalDaySlots !== 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">
                            Unavailable / Day off
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Availability Windows & Generated 1-Hour Slots */}
                  <div className="flex-1 space-y-3">
                    {dayItem.isEnabled ? (
                      dayItem.slots.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span>No active teaching windows configured for {dayItem.label}.</span>
                          <button
                            type="button"
                            onClick={() => handleOpenAdd(dayItem.day)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                          >
                            <Plus className="size-3.5" />
                            <span>Add window</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dayItem.slots.map((window, wIdx) => {
                            const windowDuration = calculateDuration(
                              window.startTime,
                              window.endTime
                            );

                            return (
                              <div
                                key={window.id || wIdx}
                                className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2.5"
                              >
                                {/* Window Header Bar */}
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                                      <Clock className="size-3.5 text-orange-500" />
                                      <span>
                                        {format12Hour(window.startTime)} –{" "}
                                        {format12Hour(window.endTime)}
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                      {windowDuration}
                                    </span>
                                  </div>

                                  {/* Actions for this window */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEdit(dayItem.day, window)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                                      title="Edit window"
                                    >
                                      <Pencil className="size-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePromptDelete(dayItem.day, window)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Delete window"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Generated 1-Hour Booking Slots List */}
                                <div className="pt-0.5">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                    Generated 1-Hour Booking Slots ({window.generatedSlots?.length || 0})
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {window.generatedSlots && window.generatedSlots.length > 0 ? (
                                      window.generatedSlots.map((slot) => (
                                        <div
                                          key={slot.id}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs"
                                        >
                                          <span className="size-1.5 rounded-full bg-emerald-500" />
                                          <span>
                                            {format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}
                                          </span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-xs text-slate-400 italic">
                                        No 1-hour slots generated.
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      <div className="text-xs text-slate-400 italic py-1">
                        Availability paused for {dayItem.label}. Students cannot book sessions on this day.
                      </div>
                    )}
                  </div>

                  {/* Right Column: Quick Add Window Button for this day */}
                  <div className="shrink-0 self-start lg:self-center">
                    {dayItem.isEnabled && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd(dayItem.day)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Add Window</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Protected Booking Information Banner */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldCheck className="size-4.5 text-emerald-600" />
              <span>How ZuhDemy Availability & Booking Works</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">
                  1. 1-Hour Booking Slots
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Every availability window you configure is automatically divided into 1-hour student booking slots aligned with ZuhDemy 1-on-1 classes.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">
                  2. Conflict Prevention
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Overlapping availability entries on the same day are blocked automatically. Multiple non-overlapping windows per day are fully supported.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">
                  3. Confirmed Bookings Safe
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Modifying your weekly schedule will never cancel existing booked classes. Students only see available, unreserved slots.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CALENDAR GRID VIEW
         ========================================================================= */}
      {activeTab === "calendar" && (
        <TeacherCalendarView
          schedule={schedule}
          blockedDates={blockedDates}
          bookedClasses={bookedClasses}
          onEditDay={(day) => handleOpenAdd(day)}
          onBlockDate={(date) => {
            setSelectedBlockDate(date);
            setBlockDateModalOpen(true);
          }}
          onUnblockDate={async (id) => {
            setBlockedDates((prev) => prev.filter((b) => b.id !== id));
            try {
              const res = await removeBlockedDateAction(id);
              if (res.success) {
                triggerToast("Blocked date removed.");
              } else {
                triggerToast(res.error || "Failed to remove blocked date.", "error");
                fetchAvailability();
              }
            } catch {
              fetchAvailability();
            }
          }}
          timezoneLabel={currentTimezoneObj.label}
        />
      )}

      {/* =========================================================================
          MODALS
         ========================================================================= */}
      {/* 1. Add Availability Modal (Multi-day support & live 1h slot generation) */}
      <AddAvailabilityModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          triggerToast("Availability window added successfully!");
          fetchAvailability();
        }}
        existingScheduleByDay={existingScheduleByDay}
        initialDay={addModalInitialDay}
      />

      {/* 2. Edit Availability Modal */}
      {editingItem && (
        <EditAvailabilityModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            triggerToast("Availability window updated.");
            fetchAvailability();
          }}
          day={editingItem.day}
          slot={editingItem.slot}
          existingDaySlots={existingScheduleByDay[editingItem.day] || []}
        />
      )}

      {/* 3. Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSlotToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* 4. Block Date Modal */}
      <BlockDateModal
        isOpen={blockDateModalOpen}
        onClose={() => {
          setBlockDateModalOpen(false);
          setSelectedBlockDate(undefined);
        }}
        initialDate={selectedBlockDate}
        blockedDates={blockedDates}
        onAddBlockedDate={async (newBlock) => {
          try {
            const res = await addBlockedDateAction(newBlock);
            if (res.success && res.id) {
              setBlockedDates((prev) => [
                ...prev,
                { ...newBlock, id: res.id! },
              ]);
              triggerToast(`Date ${newBlock.date} blocked.`);
            } else {
              triggerToast(res.error || "Failed to block date.", "error");
            }
          } catch {
            triggerToast("Failed to block date.", "error");
          }
        }}
        onRemoveBlockedDate={async (id) => {
          setBlockedDates((prev) => prev.filter((b) => b.id !== id));
          try {
            const res = await removeBlockedDateAction(id);
            if (res.success) {
              triggerToast("Blocked date removed.");
            } else {
              triggerToast(res.error || "Failed to unblock date.", "error");
              fetchAvailability();
            }
          } catch {
            fetchAvailability();
          }
        }}
      />
    </div>
  );
}
