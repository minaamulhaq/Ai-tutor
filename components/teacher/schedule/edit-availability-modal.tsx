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
import { updateAvailabilityWindowAction } from "@/app/actions/availability";
import { Clock, AlertCircle, Sparkles, Pencil } from "lucide-react";

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  day: DayOfWeek;
  slot: TimeSlot | null;
  existingDaySlots: TimeSlot[];
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function EditAvailabilityModal({
  isOpen,
  onClose,
  onSuccess,
  day,
  slot,
  existingDaySlots,
}: EditAvailabilityModalProps) {
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("13:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const timeOptions = useMemo(() => generateTimeOptions(60), []);

  useEffect(() => {
    if (isOpen && slot) {
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
      setApiError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, slot]);

  // Live slots generated
  const generatedSlots = useMemo(() => {
    const sMin = timeToMinutes(startTime);
    const eMin = timeToMinutes(endTime);
    if (eMin <= sMin || eMin - sMin < 60) return [];
    return generateOneHourSlots(startTime, endTime);
  }, [startTime, endTime]);

  // Overlap and boundary validation
  const validationError = useMemo(() => {
    const sMin = timeToMinutes(startTime);
    const eMin = timeToMinutes(endTime);

    if (eMin <= sMin) {
      return "End time must be later than start time.";
    }

    if (eMin - sMin < 60) {
      return "Availability window must be at least 1 hour (60 minutes).";
    }

    // Overlap check against other slots for the same day (excluding itself)
    for (const other of existingDaySlots) {
      if (slot && other.id === slot.id) continue;

      const oStart = timeToMinutes(other.startTime);
      const oEnd = timeToMinutes(other.endTime);

      if (sMin < oEnd && eMin > oStart) {
        return `Conflict on ${DAY_LABELS[day]}: Time ${format12Hour(startTime)}–${format12Hour(
          endTime
        )} overlaps with existing window (${format12Hour(other.startTime)}–${format12Hour(
          other.endTime
        )}).`;
      }
    }

    return null;
  }, [startTime, endTime, existingDaySlots, slot, day]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot || validationError) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const res = await updateAvailabilityWindowAction({
        id: slot.id,
        dayOfWeek: day,
        startTime,
        endTime,
      });

      if (!res.success) {
        setApiError(res.error || "Failed to update availability.");
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setApiError("An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationStr = calculateDuration(startTime, endTime);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 rounded-2xl">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Pencil className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Edit Availability — {DAY_LABELS[day]}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Update your teaching time window and recalculate generated 1-hour slots.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Time range pickers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Time Window (24-Hour Format)
              </span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-100">
                {durationStr}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
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
                      <SelectItem key={`edit-start-${opt.value}`} value={opt.value}>
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
                      <SelectItem key={`edit-end-${opt.value}`} value={opt.value}>
                        {opt.value} ({opt.label})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Generated 1-hour slots preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="size-3.5 text-orange-500" />
                <span>Generated 1-Hour Booking Slots</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {generatedSlots.length} slot{generatedSlots.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-orange-50/40 border border-orange-100 max-h-40 overflow-y-auto">
              {generatedSlots.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-orange-200/80 text-[11px] text-slate-700 shadow-2xs"
                >
                  <Clock className="size-3 text-orange-500 shrink-0" />
                  <span className="font-semibold text-slate-800">
                    {s.startTime}–{s.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Warning */}
          {validationError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{validationError}</div>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
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
              disabled={!!validationError || isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isSubmitting ? "Updating..." : "Update Availability"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
