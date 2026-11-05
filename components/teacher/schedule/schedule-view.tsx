"use client";

import React, { useState, useMemo } from "react";
import {
  DaySchedule,
  DayOfWeek,
  TimeSlot,
  BlockedDate,
  TimezoneOption,
} from "./types";
import { format12Hour, calculateDuration, calculateTotalHours } from "./time-utils";
import { SlotModal } from "./slot-modal";
import { CopyAvailabilityModal } from "./copy-availability-modal";
import { BlockDateModal } from "./block-date-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { TeacherCalendarView } from "./calendar-view";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CalendarDays,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Copy,
  CalendarOff,
  Globe2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";

const timezoneOptions: { id: string; label: string }[] = [
  { id: "Asia/Karachi", label: "Pakistan Standard Time (UTC+05:00)" },
  { id: "Asia/Dubai", label: "Gulf Standard Time (UTC+04:00)" },
  { id: "Asia/Kolkata", label: "India Standard Time (UTC+05:30)" },
  { id: "Europe/London", label: "Greenwich Mean Time (UTC+00:00)" },
  { id: "America/New_York", label: "Eastern Standard Time (UTC-05:00)" },
  { id: "America/Los_Angeles", label: "Pacific Standard Time (UTC-08:00)" },
];

// Initial prompt-specified configuration
const initialSampleSchedule: DaySchedule[] = [
  {
    day: "monday",
    label: "Monday",
    isEnabled: true,
    slots: [{ id: "slot-mon-1", startTime: "16:00", endTime: "20:00" }],
  },
  {
    day: "tuesday",
    label: "Tuesday",
    isEnabled: true,
    slots: [{ id: "slot-tue-1", startTime: "16:00", endTime: "19:00" }],
  },
  {
    day: "wednesday",
    label: "Wednesday",
    isEnabled: false,
    slots: [],
  },
  {
    day: "thursday",
    label: "Thursday",
    isEnabled: true,
    slots: [{ id: "slot-thu-1", startTime: "16:00", endTime: "20:00" }],
  },
  {
    day: "friday",
    label: "Friday",
    isEnabled: true,
    slots: [{ id: "slot-fri-1", startTime: "14:00", endTime: "18:00" }],
  },
  {
    day: "saturday",
    label: "Saturday",
    isEnabled: false,
    slots: [],
  },
  {
    day: "sunday",
    label: "Sunday",
    isEnabled: false,
    slots: [],
  },
];

export function ScheduleView() {
  // Navigation tab: Calendar vs Availability
  const [activeTab, setActiveTab] = useState<"calendar" | "availability">("availability");

  // Timezone selection (defaulting to Pakistan Standard Time)
  const [selectedTimezone, setSelectedTimezone] = useState<string>("Asia/Karachi");

  // Core Schedule State
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSampleSchedule);
  const [savedSchedule, setSavedSchedule] = useState<DaySchedule[]>(initialSampleSchedule);

  // Blocked Dates (Holidays/Time-off)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([
    {
      id: "block-1",
      date: "2026-10-24",
      reason: "Faculty Development Workshop",
      allDay: true,
    },
  ]);

  // Modals visibility states
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [activeDayForModal, setActiveDayForModal] = useState<DayOfWeek>("monday");

  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<DayOfWeek>("monday");

  const [blockDateModalOpen, setBlockDateModalOpen] = useState(false);
  const [selectedBlockDate, setSelectedBlockDate] = useState<Date | undefined>(undefined);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<{ day: DayOfWeek; slotId: string } | null>(null);

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check if current schedule differs from saved schedule
  const hasChanges = useMemo(() => {
    return JSON.stringify(schedule) !== JSON.stringify(savedSchedule);
  }, [schedule, savedSchedule]);

  // Map slots for easy lookup during validation
  const existingSlotsByDay = useMemo(() => {
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

  // Overall Weekly Available Hours
  const totalWeeklyHours = useMemo(() => {
    return schedule.reduce((acc, day) => {
      if (!day.isEnabled) return acc;
      return acc + calculateTotalHours(day.slots);
    }, 0);
  }, [schedule]);

  // Current Selected Timezone details
  const currentTimezoneObj = useMemo(() => {
    return (
      timezoneOptions.find((tz) => tz.id === selectedTimezone) ||
      timezoneOptions[0]
    );
  }, [selectedTimezone]);

  // Show auto-dismissing toast
  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle Day Availability
  const handleToggleDay = (dayKey: DayOfWeek, enabled: boolean) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day === dayKey) {
          // If enabling and day has 0 slots, provide a default slot
          const slots = enabled && d.slots.length === 0
            ? [{ id: `slot-${d.day}-${Date.now()}`, startTime: "16:00", endTime: "20:00" }]
            : d.slots;
          return { ...d, isEnabled: enabled, slots };
        }
        return d;
      })
    );
  };

  // Open Add/Edit Slot Modal for day
  const handleOpenAddSlot = (dayKey: DayOfWeek) => {
    setActiveDayForModal(dayKey);
    setSlotModalOpen(true);
  };

  const handleOpenEditSlot = (dayKey: DayOfWeek, _slot?: TimeSlot) => {
    setActiveDayForModal(dayKey);
    setSlotModalOpen(true);
  };

  // Save Day Slots (Supports multiple slots per day)
  const handleSaveDaySlots = (dayKey: DayOfWeek, updatedSlots: TimeSlot[]) => {
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== dayKey) return d;
        return {
          ...d,
          isEnabled: updatedSlots.length > 0,
          slots: updatedSlots,
        };
      })
    );
  };

  // Request Slot Delete with Confirmation
  const handlePromptDeleteSlot = (dayKey: DayOfWeek, slotId: string) => {
    setSlotToDelete({ day: dayKey, slotId });
    setDeleteModalOpen(true);
  };

  // Confirm Slot Delete
  const handleConfirmDeleteSlot = () => {
    if (!slotToDelete) return;
    const { day, slotId } = slotToDelete;

    setSchedule((prev) =>
      prev.map((d) => {
        if (d.day !== day) return d;
        const filtered = d.slots.filter((s) => s.id !== slotId);
        return {
          ...d,
          slots: filtered,
          // If no slots remain, disable day
          isEnabled: filtered.length > 0,
        };
      })
    );
    setSlotToDelete(null);
  };

  // Open Copy Availability Modal
  const handleOpenCopy = (sourceDay: DayOfWeek) => {
    setCopySourceDay(sourceDay);
    setCopyModalOpen(true);
  };

  // Apply Copied Availability
  const handleApplyCopy = (sourceDay: DayOfWeek, targetDays: DayOfWeek[]) => {
    const sourceSchedule = schedule.find((d) => d.day === sourceDay);
    if (!sourceSchedule) return;

    setSchedule((prev) =>
      prev.map((d) => {
        if (!targetDays.includes(d.day)) return d;

        // Clone slots with fresh IDs
        const clonedSlots: TimeSlot[] = sourceSchedule.slots.map((s, idx) => ({
          id: `slot-${d.day}-${Date.now()}-${idx}`,
          startTime: s.startTime,
          endTime: s.endTime,
        }));

        return {
          ...d,
          isEnabled: sourceSchedule.isEnabled && clonedSlots.length > 0,
          slots: clonedSlots,
        };
      })
    );

    triggerToast(`Availability copied from ${sourceSchedule.label} to ${targetDays.length} day(s).`);
  };

  // Block Date handlers
  const handleAddBlockedDate = (newBlock: Omit<BlockedDate, "id">) => {
    const created: BlockedDate = {
      ...newBlock,
      id: `block-${Date.now()}`,
    };
    setBlockedDates((prev) => [...prev, created]);
    triggerToast(`Date ${newBlock.date} blocked successfully.`);
  };

  const handleRemoveBlockedDate = (id: string) => {
    setBlockedDates((prev) => prev.filter((b) => b.id !== id));
    triggerToast("Blocked date removed.");
  };

  // Discard / Cancel Pending Changes
  const handleDiscardChanges = () => {
    if (!hasChanges) return;
    if (confirm("Discard unsaved changes? Your weekly availability will revert to your last saved state.")) {
      setSchedule(savedSchedule);
      triggerToast("Unsaved changes discarded.");
    }
  };

  // Save Availability Action
  const handleSaveAvailability = async () => {
    if (!hasChanges) return;

    setIsSaving(true);

    try {
      /**
       * =========================================================================
       * API INTEGRATION POINT (BACKEND / SUPABASE)
       * =========================================================================
       * Replace this simulation with your actual API endpoint or server action:
       *
       * const res = await fetch("/api/teacher/availability", {
       *   method: "POST",
       *   headers: { "Content-Type": "application/json" },
       *   body: JSON.stringify({
       *     timezone: selectedTimezone,
       *     schedule: schedule,
       *     blockedDates: blockedDates,
       *   }),
       * });
       * if (!res.ok) throw new Error("Failed to save");
       * =========================================================================
       */
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSavedSchedule(schedule);
      triggerToast("Your weekly availability has been saved successfully.");
    } catch (error) {
      console.error("Save failed:", error);
      triggerToast("Failed to save availability. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 pb-20">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium animate-in slide-in-from-top-3 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
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

      {/* =========================================================
          SECTION 3: PAGE HEADER & TABS
         ========================================================= */}
      <div className="space-y-4">
        {/* Title & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Schedule
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your availability and choose when students can book your private classes.
            </p>
          </div>

          {/* Action: Block a Date */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedBlockDate(undefined);
                setBlockDateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <CalendarOff className="size-4 text-orange-500" />
              <span>Block a date</span>
              {blockedDates.length > 0 && (
                <span className="size-5 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">
                  {blockedDates.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tabs & Timezone Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-slate-200 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100/80 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-white text-orange-600 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarIcon className="size-4" />
              <span>Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("availability")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "availability"
                  ? "bg-white text-orange-600 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Clock className="size-4" />
              <span>Availability</span>
            </button>
          </div>

          {/* Timezone Selector using Shadcn DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
              aria-label="Change timezone"
            >
              <Globe2 className="size-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-800">
                {currentTimezoneObj.label}
              </span>
              <ChevronDown className="size-3 text-slate-400 shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={4}
              className="w-72 min-w-72 p-1 rounded-xl shadow-lg border border-slate-200 bg-white"
            >
              <DropdownMenuRadioGroup
                value={selectedTimezone}
                onValueChange={(val) => {
                  if (val) {
                    setSelectedTimezone(val);
                    triggerToast(`Timezone updated to ${val}`);
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
        </div>
      </div>

      {/* When Calendar Tab is Clicked */}
      {activeTab === "calendar" && (
        <TeacherCalendarView
          schedule={schedule}
          blockedDates={blockedDates}
          onEditDay={(day) => handleOpenAddSlot(day)}
          onBlockDate={(date) => {
            setSelectedBlockDate(date);
            setBlockDateModalOpen(true);
          }}
          onUnblockDate={handleRemoveBlockedDate}
          timezoneLabel={currentTimezoneObj.label}
        />
      )}

      {/* =========================================================
          SECTION 4: WEEKLY AVAILABILITY
         ========================================================= */}
      {activeTab === "availability" && (
        <div className="space-y-6">
          {/* Section Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/60 via-slate-50 to-white border border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Weekly Availability
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                  <Sparkles className="size-3 text-orange-600" />
                  {totalWeeklyHours} hrs / week
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                Set your regular teaching hours. Students can book available 1-on-1 time slots within your configured schedule.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenCopy("monday")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all cursor-pointer"
              >
                <Copy className="size-3.5 text-orange-500" />
                <span>Copy between days</span>
              </button>
            </div>
          </div>

          {/* 7 Days of the Week List */}
          <div className="space-y-3">
            {schedule.map((dayItem) => {
              const daySlots = dayItem.slots;
              const dayHours = calculateTotalHours(daySlots);

              return (
                <div
                  key={dayItem.day}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-150 ${
                    dayItem.isEnabled
                      ? "bg-white border-slate-200 shadow-xs"
                      : "bg-slate-50/70 border-slate-200/70"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Day Toggle & Label */}
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <Switch
                        checked={dayItem.isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggleDay(dayItem.day, checked)
                        }
                      />
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-semibold tracking-tight ${
                            dayItem.isEnabled
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {dayItem.label}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {dayItem.isEnabled ? (
                            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              Available • {dayHours} hr{dayHours !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-400">
                              Unavailable
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Slots Area */}
                    <div className="flex-1">
                      {dayItem.isEnabled ? (
                        <div className="space-y-2">
                          {daySlots.length === 0 ? (
                            <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400 flex items-center justify-between">
                              <span>No active time slots for {dayItem.label}.</span>
                              <button
                                type="button"
                                onClick={() => handleOpenAddSlot(dayItem.day)}
                                className="text-orange-600 font-semibold hover:underline cursor-pointer"
                              >
                                + Add first slot
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2.5">
                              {daySlots.map((slot) => {
                                const duration = calculateDuration(slot.startTime, slot.endTime);

                                return (
                                  <div
                                    key={slot.id}
                                    className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-xs transition-all text-xs"
                                  >
                                    <Clock className="size-3.5 text-orange-500 shrink-0" />
                                    <span className="font-semibold text-slate-800">
                                      {format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                      {duration}
                                    </span>

                                    {/* Action Buttons */}
                                    <div className="flex items-center ml-1 border-l border-slate-200 pl-1.5 gap-0.5">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditSlot(dayItem.day, slot)}
                                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="Edit slot"
                                      >
                                        <Pencil className="size-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handlePromptDeleteSlot(dayItem.day, slot.id)}
                                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                        title="Delete slot"
                                      >
                                        <Trash2 className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">
                          No classes will be offered on this day.
                        </div>
                      )}
                    </div>

                    {/* Day Action Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      {dayItem.isEnabled && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenAddSlot(dayItem.day)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Plus className="size-3.5" />
                            <span>Add slot</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCopy(dayItem.day)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title={`Copy ${dayItem.label}'s availability`}
                          >
                            <Copy className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================
              SECTION 9: BOOKING & CALENDAR AWARENESS INFORMATION
             ========================================================= */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>How Student Booking Works on ZuhDemy</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-semibold text-slate-800 block">
                  1. Weekly Windows
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Your availability defines open booking windows. It does not create confirmed classes until students book.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-semibold text-slate-800 block">
                  2. Protected Bookings
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Existing confirmed student sessions are strictly preserved. Schedule adjustments will not silently cancel lessons.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="font-semibold text-slate-800 block">
                  3. Buffer & Exceptions
                </span>
                <p className="text-slate-500 leading-relaxed">
                  Date-specific exceptions and blocked holidays automatically withhold those windows from students.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SECTION 8: STICKY SAVE & CANCEL BAR
         ========================================================= */}
      {activeTab === "availability" && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Informational Protected Notice */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <HelpCircle className="size-4 text-slate-400 shrink-0" />
              <span>
                Students can book only available, unreserved time slots. Existing confirmed classes are protected.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
              <button
                type="button"
                disabled={!hasChanges || isSaving}
                onClick={handleDiscardChanges}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                disabled={!hasChanges || isSaving}
                onClick={handleSaveAvailability}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Availability...</span>
                  </>
                ) : (
                  <span>Save Availability</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODALS
         ========================================================= */}
      {/* 1. Add / Edit Slot Modal */}
      <SlotModal
        isOpen={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        initialDay={activeDayForModal}
        existingSlotsByDay={existingSlotsByDay}
        onSaveDaySlots={handleSaveDaySlots}
      />

      {/* 2. Copy Availability Modal */}
      <CopyAvailabilityModal
        isOpen={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        initialSourceDay={copySourceDay}
        schedule={schedule}
        onApplyCopy={handleApplyCopy}
      />

      {/* 3. Block a Date Modal */}
      <BlockDateModal
        isOpen={blockDateModalOpen}
        onClose={() => {
          setBlockDateModalOpen(false);
          setSelectedBlockDate(undefined);
        }}
        initialDate={selectedBlockDate}
        blockedDates={blockedDates}
        onAddBlockedDate={handleAddBlockedDate}
        onRemoveBlockedDate={handleRemoveBlockedDate}
      />

      {/* 4. Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSlotToDelete(null);
        }}
        onConfirm={handleConfirmDeleteSlot}
      />
    </div>
  );
}
