"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DayOfWeek, TimeSlot } from "./types";
import {
  generateTimeOptions,
  format12Hour,
  calculateDuration,
  generateOneHourSlots,
  timeToMinutes,
} from "./time-utils";
import { addAvailabilityWindowAction } from "@/app/actions/availability";
import {
  Clock,
  CalendarDays,
  Sparkles,
  AlertCircle,
  Check,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";

interface AddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingScheduleByDay: Record<DayOfWeek, TimeSlot[]>;
  initialDay?: DayOfWeek;
}

const ALL_WEEKDAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

export function AddAvailabilityModal({
  isOpen,
  onClose,
  onSuccess,
  existingScheduleByDay,
  initialDay = "monday",
}: AddAvailabilityModalProps) {
  // Selected weekdays (multi-select)
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([initialDay]);

  // Times in 24-hour format
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("13:00");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Timepicker options (hourly: 06:00 to 23:00)
  const timeOptions = useMemo(() => generateTimeOptions(60), []);

  // Reset / sync when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedDays([initialDay]);
      setStartTime("09:00");
      setEndTime("13:00");
      setApiError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialDay]);

  // Toggle single weekday
  const handleToggleDay = (dayKey: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey)
        ? prev.filter((d) => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  // Preset helpers
  const handleSelectWeekdays = () => {
    setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
  };

  const handleSelectWeekends = () => {
    setSelectedDays(["saturday", "sunday"]);
  };

  const handleSelectAll = () => {
    setSelectedDays(ALL_WEEKDAYS.map((d) => d.key));
  };

  // Generate 1-hour booking slots live preview
  const generatedSlots = useMemo(() => {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (endMin <= startMin || endMin - startMin < 60) return [];
    return generateOneHourSlots(startTime, endTime);
  }, [startTime, endTime]);

  // Validation checks & Overlap detection across selected days
  const validationError = useMemo(() => {
    if (selectedDays.length === 0) {
      return "Please select at least one day of the week.";
    }

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (endMin <= startMin) {
      return "End time must be later than start time.";
    }

    if (endMin - startMin < 60) {
      return "Availability window must be at least 1 hour (60 minutes).";
    }

    // Overlap checking against each selected day's existing windows
    for (const day of selectedDays) {
      const existingSlots = existingScheduleByDay[day] || [];
      const dayLabel = ALL_WEEKDAYS.find((d) => d.key === day)?.label || day;

      for (const slot of existingSlots) {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);

        // Check collision: newStart < existingEnd && newEnd > existingStart
        if (startMin < slotEnd && endMin > slotStart) {
          return `Overlap on ${dayLabel}: Time ${format12Hour(startTime)}–${format12Hour(
            endTime
          )} conflicts with existing window (${format12Hour(slot.startTime)}–${format12Hour(
            slot.endTime
          )}). Multiple non-overlapping windows per day are permitted.`;
        }
      }
    }

    return null;
  }, [selectedDays, startTime, endTime, existingScheduleByDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await addAvailabilityWindowAction({
        days: selectedDays,
        startTime,
        endTime,
      });

      if (!res.success) {
        setApiError(res.error || "Failed to add availability.");
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setApiError("An unexpected error occurred while saving availability.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationStr = calculateDuration(startTime, endTime);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <CalendarDays className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Add Teaching Availability
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500">
                Choose weekdays, set your available range, and ZuhDemy will generate 1-hour student booking slots.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Weekday Multi-Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Select Weekdays ({selectedDays.length} selected)
              </label>
              {/* Presets */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectWeekdays}
                  className="px-2 py-0.5 rounded-md text-orange-600 hover:bg-orange-50 font-medium transition-colors cursor-pointer"
                >
                  Mon–Fri
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleSelectWeekends}
                  className="px-2 py-0.5 rounded-md text-orange-600 hover:bg-orange-50 font-medium transition-colors cursor-pointer"
                >
                  Weekends
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-0.5 rounded-md text-orange-600 hover:bg-orange-50 font-medium transition-colors cursor-pointer"
                >
                  All Days
                </button>
              </div>
            </div>

            {/* Day Chips */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {ALL_WEEKDAYS.map((day) => {
                const isSelected = selectedDays.includes(day.key);
                const hasExisting = (existingScheduleByDay[day.key] || []).length > 0;

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => handleToggleDay(day.key)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 border-orange-500 text-white shadow-xs shadow-orange-500/20"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span>{day.short}</span>
                    {hasExisting && (
                      <span
                        className={`size-1.5 rounded-full mt-1 ${
                          isSelected ? "bg-white" : "bg-orange-400"
                        }`}
                        title="Already has configured availability"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Range Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                2. Set Time Range (24-Hour Format)
              </label>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100">
                {durationStr} window
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {/* Start Time */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                  Start Time
                </span>
                <Select value={startTime} onValueChange={(val) => val && setStartTime(val)}>
                  <SelectTrigger className="w-full bg-white h-10 text-xs font-medium border-slate-200">
                    <SelectValue placeholder="Start Time">
                      {startTime} ({format12Hour(startTime)})
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {timeOptions.map((opt) => (
                      <SelectItem key={`start-${opt.value}`} value={opt.value}>
                        {opt.value} ({opt.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* End Time */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                  End Time
                </span>
                <Select value={endTime} onValueChange={(val) => val && setEndTime(val)}>
                  <SelectTrigger className="w-full bg-white h-10 text-xs font-medium border-slate-200">
                    <SelectValue placeholder="End Time">
                      {endTime} ({format12Hour(endTime)})
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {timeOptions.map((opt) => (
                      <SelectItem key={`end-${opt.value}`} value={opt.value}>
                        {opt.value} ({opt.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Generated 1-Hour Booking Slots Preview */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="size-3.5 text-orange-500" />
                <span>Generated 1-Hour Booking Slots</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {generatedSlots.length} slot{generatedSlots.length !== 1 ? "s" : ""} per day
                {selectedDays.length > 0 &&
                  ` (${generatedSlots.length * selectedDays.length} total weekly)`}
              </span>
            </div>

            {generatedSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-orange-50/40 border border-orange-100 max-h-40 overflow-y-auto">
                {generatedSlots.map((slot, idx) => (
                  <div
                    key={slot.id || idx}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-orange-200/80 text-[11px] text-slate-700 shadow-2xs"
                  >
                    <Clock className="size-3 text-orange-500 shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {slot.startTime}–{slot.endTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                Select a valid time range of at least 1 hour to preview generated slots.
              </div>
            )}
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in duration-150">
              <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{validationError}</div>
            </div>
          )}

          {/* API Server Error */}
          {apiError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in duration-150">
              <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{apiError}</div>
            </div>
          )}

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!validationError || isSubmitting || selectedDays.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Availability...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="size-3.5" />
                  <span>
                    Save Availability for {selectedDays.length} Day
                    {selectedDays.length !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
