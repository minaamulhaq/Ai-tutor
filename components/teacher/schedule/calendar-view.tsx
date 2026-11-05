"use client";

import React, { useState, useMemo } from "react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DaySchedule, DayOfWeek, BlockedDate } from "./types";
import { format12Hour, breakdownSlotIntoHourlyIntervals } from "./time-utils";
import {
  Clock,
  CalendarOff,
  Video,
  CheckCircle2,
  Pencil,
  Plus,
  Sparkles,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export interface BookedClass {
  id: string;
  studentName: string;
  studentAvatar: string;
  subject: string;
  dateStr: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  status: "confirmed" | "completed";
}

interface TeacherCalendarViewProps {
  schedule: DaySchedule[];
  blockedDates: BlockedDate[];
  bookedClasses?: BookedClass[];
  onEditDay: (day: DayOfWeek) => void;
  onBlockDate: (date?: Date) => void;
  onUnblockDate: (id: string) => void;
  timezoneLabel: string;
}

// Map JavaScript Date.getDay() to our DayOfWeek key
const dayOfWeekMap: Record<number, DayOfWeek> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

export function TeacherCalendarView({
  schedule,
  blockedDates,
  bookedClasses = [],
  onEditDay,
  onBlockDate,
  onUnblockDate,
  timezoneLabel,
}: TeacherCalendarViewProps) {
  // Currently selected date on the calendar (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Quick lookup helpers
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDayKey = dayOfWeekMap[selectedDate.getDay()];
  const selectedDaySchedule = schedule.find((d) => d.day === selectedDayKey);
  const isSelectedDayEnabled = !!selectedDaySchedule?.isEnabled;

  // Check if selected date is blocked for time off
  const blockedRecord = blockedDates.find((b) => b.date === selectedDateStr);
  const isDateBlocked = !!blockedRecord;

  // Breakdown all windows for the selected day into discrete 1-hour slots
  const hourlySlots = useMemo(() => {
    if (!isSelectedDayEnabled || isDateBlocked || !selectedDaySchedule) return [];

    const list: { startTime: string; endTime: string; booked?: BookedClass }[] = [];
    selectedDaySchedule.slots.forEach((s) => {
      const hours = breakdownSlotIntoHourlyIntervals(s);
      hours.forEach((h) => {
        // Find if any real student booked this hour on this specific date
        const matchBooking = bookedClasses.find(
          (b) =>
            b.dateStr === selectedDateStr &&
            b.startTime === h.startTime
        );
        list.push({
          startTime: h.startTime,
          endTime: h.endTime,
          booked: matchBooking,
        });
      });
    });

    return list;
  }, [isSelectedDayEnabled, isDateBlocked, selectedDaySchedule, selectedDateStr, bookedClasses]);

  // Calendar modifier checks for dates
  const isDateHavingSlots = (date: Date) => {
    const dKey = dayOfWeekMap[date.getDay()];
    const dSched = schedule.find((d) => d.day === dKey);
    const dateStr = format(date, "yyyy-MM-dd");
    const isBlocked = blockedDates.some((b) => b.date === dateStr);
    return !!(dSched?.isEnabled && dSched.slots.length > 0 && !isBlocked);
  };

  const isDateBlockedModifier = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return blockedDates.some((b) => b.date === dateStr);
  };

  const isDateHavingBookings = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return bookedClasses.some((b) => b.dateStr === dateStr);
  };

  // Human date label
  const getFriendlyDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE");
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Selected Date
            </span>
            <span className="size-2 rounded-full bg-orange-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {format(selectedDate, "MMM d, yyyy")}
          </p>
          <span className="text-xs text-slate-500 font-medium">
            {getFriendlyDateLabel(selectedDate)} • {selectedDaySchedule?.label}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Day Status
            </span>
            <Clock className="size-4 text-orange-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {isDateBlocked
              ? "Time Off"
              : isSelectedDayEnabled
              ? `${hourlySlots.length} Slots (1h)`
              : "Day Off"}
          </p>
          <span className="text-xs text-slate-500 font-medium">
            {isDateBlocked
              ? "All slots hidden"
              : isSelectedDayEnabled
              ? "Available for tutoring"
              : "No teaching hours"}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Bookings
            </span>
            <BookOpen className="size-4 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-emerald-700 mt-1">
            {bookedClasses.length} {bookedClasses.length === 1 ? "Class" : "Classes"}
          </p>
          <span className="text-xs text-slate-500 font-medium">
            Confirmed 1-on-1 sessions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Blocked Dates
            </span>
            <CalendarOff className="size-4 text-red-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {blockedDates.length} {blockedDates.length === 1 ? "Date" : "Dates"}
          </p>
          <span className="text-xs text-slate-500 font-medium">
            Holidays & vacation days
          </span>
        </div>
      </div>

      {/* Main Two-Column Calendar & Slots Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Shadcn Calendar (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Interactive Calendar</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any date to inspect available 1-hour slots.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 active:scale-95 rounded-lg transition-all cursor-pointer"
              >
                Jump to Today
              </button>
            </div>

            {/* Shadcn Calendar Component (Full Width & Spacious) */}
            <div className="w-full rounded-2xl border border-slate-200/80 p-2 sm:p-3 bg-slate-50/60 shadow-2xs">
              <Calendar
                calendarSize="full"
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className="w-full"
                modifiers={{
                  hasSlots: (date) => isDateHavingSlots(date),
                  isBlocked: (date) => isDateBlockedModifier(date),
                  hasBookings: (date) => isDateHavingBookings(date),
                }}
                modifiersClassNames={{
                  hasSlots: "after:content-[''] after:absolute after:bottom-1.5 after:size-1.5 after:rounded-full after:bg-orange-500 data-[selected-single=true]:after:bg-white",
                  isBlocked: "after:content-[''] after:absolute after:bottom-1.5 after:size-1.5 after:rounded-full after:bg-red-500",
                  hasBookings: "after:content-[''] after:absolute after:bottom-1.5 after:size-1.5 after:rounded-full after:bg-emerald-500 data-[selected-single=true]:after:bg-emerald-200",
                }}
              />
            </div>

            {/* Calendar Legend */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-orange-500 shadow-2xs" />
                <span>Available Slots</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500 shadow-2xs" />
                <span>Confirmed Class</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-red-500 shadow-2xs" />
                <span>Time Off</span>
              </div>
            </div>

            {/* Quick Actions Under Calendar */}
            <div className="pt-1 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onBlockDate(selectedDate)}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 rounded-xl transition-all cursor-pointer"
              >
                <CalendarOff className="size-4 text-slate-500" />
                <span>Block {format(selectedDate, "MMM d")}</span>
              </button>
              <button
                type="button"
                onClick={() => onEditDay(selectedDayKey)}
                className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 active:scale-98 rounded-xl transition-all cursor-pointer"
              >
                <Pencil className="size-4 text-orange-600" />
                <span>Edit {selectedDaySchedule?.label}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Date's Slots & Bookings Inspector (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            {/* Inspector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {format(selectedDate, "EEEE, MMMM do, yyyy")}
                  </h3>
                  {isToday(selectedDate) && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Timezone: <span className="font-medium text-slate-700">{timezoneLabel}</span>
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {isDateBlocked ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                    <CalendarOff className="size-3.5" />
                    Blocked (Time Off)
                  </span>
                ) : isSelectedDayEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Available ({hourlySlots.length} 1-hr slots)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    Day Off / Unavailable
                  </span>
                )}
              </div>
            </div>

            {/* Case 1: Date is Blocked */}
            {isDateBlocked && (
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <CalendarOff className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-900">Date Blocked for Time Off</h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      Reason: <strong className="font-semibold">{blockedRecord?.reason}</strong>
                    </p>
                    <p className="text-xs text-red-600/80 mt-1">
                      Students cannot book any 1-on-1 private classes on this date.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-200/60">
                  <button
                    type="button"
                    onClick={() => blockedRecord && onUnblockDate(blockedRecord.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-white hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
                  >
                    Unblock this Date
                  </button>
                </div>
              </div>
            )}

            {/* Case 2: Date has Available Slots */}
            {!isDateBlocked && isSelectedDayEnabled && hourlySlots.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-wider">
                    1-Hour Teaching Slots ({hourlySlots.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Minimum class duration: 1 hour
                  </span>
                </div>

                <div className="space-y-2.5">
                  {hourlySlots.map((slot, idx) => {
                    const isBooked = !!slot.booked;

                    return (
                      <div
                        key={`slot-${slot.startTime}-${idx}`}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isBooked
                            ? "bg-emerald-50/50 border-emerald-200 shadow-2xs"
                            : "bg-white border-slate-200 hover:border-orange-200 hover:shadow-2xs"
                        }`}
                      >
                        {/* Time & Duration */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isBooked
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            <Clock className="size-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {format12Hour(slot.startTime)} – {format12Hour(slot.endTime)}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                1 Hour Class
                              </span>
                            </div>

                            {isBooked ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-800 mt-1 font-medium">
                                <span className="size-5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center justify-center overflow-hidden shrink-0">
                                  {slot.booked?.studentAvatar?.startsWith("http") ? (
                                    <img
                                      src={slot.booked.studentAvatar}
                                      alt={slot.booked.studentName}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    (slot.booked?.studentName || "ST").slice(0, 2).toUpperCase()
                                  )}
                                </span>
                                <span>{slot.booked?.studentName}</span>
                                <span className="text-emerald-400">•</span>
                                <span className="text-slate-500 text-[11px]">
                                  {slot.booked?.subject}
                                </span>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 mt-0.5">
                                Open for private 1:1 student booking
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status / Action */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {isBooked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
                              <CheckCircle2 className="size-3.5 text-emerald-600" />
                              Confirmed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
                              <Sparkles className="size-3 text-orange-600" />
                              Open Slot
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Edit Availability Shortcut */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Need to change these hours?</span>
                  <button
                    type="button"
                    onClick={() => onEditDay(selectedDayKey)}
                    className="inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    <span>Edit {selectedDaySchedule?.label} availability</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Case 3: Day is Off or No Slots Configured */}
            {!isDateBlocked && (!isSelectedDayEnabled || hourlySlots.length === 0) && (
              <div className="p-8 rounded-xl bg-slate-50/70 border border-slate-200 text-center space-y-3">
                <div className="size-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <Clock className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    No Teaching Hours on {selectedDaySchedule?.label}s
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You currently have {selectedDaySchedule?.label} marked as unavailable or no 1-hour slots are scheduled.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEditDay(selectedDayKey)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Configure {selectedDaySchedule?.label} Slots</span>
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Confirmed Classes Across the Month */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Video className="size-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Confirmed Classes</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {bookedClasses.length} Booked
              </span>
            </div>

            {bookedClasses.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <p className="font-semibold text-slate-700">No upcoming confirmed classes right now.</p>
                <p className="text-slate-400">
                  When students book your available time slots, their scheduled classes will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {bookedClasses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      try {
                        setSelectedDate(parseISO(item.dateStr));
                      } catch {}
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {(() => {
                          try {
                            return format(parseISO(item.dateStr), "EEE, MMM d");
                          } catch {
                            return item.dateStr;
                          }
                        })()}
                      </span>
                      <span className="text-[11px] font-semibold text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md">
                        {format12Hour(item.startTime)} – {format12Hour(item.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="size-6 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px] flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-slate-200">
                        {item.studentAvatar?.startsWith("http") ? (
                          <img
                            src={item.studentAvatar}
                            alt={item.studentName}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span>{(item.studentName || "ST").slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 truncate">{item.studentName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{item.subject}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
