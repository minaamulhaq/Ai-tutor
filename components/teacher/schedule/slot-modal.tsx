"use client";

import React, { useState, useEffect } from "react";
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
  timeToMinutes,
  minutesToTime,
} from "./time-utils";
import { Clock, AlertCircle, Plus, Trash2, CalendarDays } from "lucide-react";

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDaySlots: (day: DayOfWeek, slots: TimeSlot[]) => void;
  initialDay: DayOfWeek;
  existingSlotsByDay: Record<DayOfWeek, TimeSlot[]>;
}

const dayOptions: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export function SlotModal({
  isOpen,
  onClose,
  onSaveDaySlots,
  initialDay,
  existingSlotsByDay,
}: SlotModalProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(initialDay);
  const [slots, setSlots] = useState<{ id: string; startTime: string; endTime: string }[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hourly options: 06:00 AM to 11:00 PM (1-hour steps)
  const timeOptions = generateTimeOptions(60);

  // Sync state whenever modal opens or day changes
  useEffect(() => {
    if (isOpen) {
      setSelectedDay(initialDay);
      const current = existingSlotsByDay[initialDay] || [];
      if (current.length > 0) {
        setSlots(current.map((s) => ({ ...s })));
      } else {
        // Default single 1-hour minimum slot (4:00 PM to 8:00 PM)
        setSlots([{ id: `slot-${Date.now()}`, startTime: "16:00", endTime: "20:00" }]);
      }
      setValidationError(null);
    }
  }, [isOpen, initialDay, existingSlotsByDay]);

  // When changing day inside modal, load that day's existing slots
  const handleDayChange = (newDay: DayOfWeek) => {
    setSelectedDay(newDay);
    const existing = existingSlotsByDay[newDay] || [];
    if (existing.length > 0) {
      setSlots(existing.map((s) => ({ ...s })));
    } else {
      setSlots([{ id: `slot-${Date.now()}`, startTime: "16:00", endTime: "20:00" }]);
    }
    setValidationError(null);
  };

  // Real-time validation for all slots on this day
  useEffect(() => {
    if (slots.length === 0) {
      setValidationError("Please add at least one teaching slot or cancel.");
      return;
    }

    // 1. Duration check for each slot (must be >= 60 mins)
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const startMin = timeToMinutes(slot.startTime);
      const endMin = timeToMinutes(slot.endTime);

      if (endMin <= startMin) {
        setValidationError(`Slot #${i + 1}: End time must be later than start time.`);
        return;
      }

      if (endMin - startMin < 60) {
        setValidationError(
          `Slot #${i + 1}: Minimum class duration is 1 hour. 30-minute classes are not allowed.`
        );
        return;
      }
    }

    // 2. Overlap check among slots on the same day
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const s1Start = timeToMinutes(slots[i].startTime);
        const s1End = timeToMinutes(slots[i].endTime);
        const s2Start = timeToMinutes(slots[j].startTime);
        const s2End = timeToMinutes(slots[j].endTime);

        if (s1Start < s2End && s1End > s2Start) {
          setValidationError(
            `Conflict between Slot #${i + 1} (${format12Hour(slots[i].startTime)}–${format12Hour(
              slots[i].endTime
            )}) and Slot #${j + 1} (${format12Hour(slots[j].startTime)}–${format12Hour(
              slots[j].endTime
            )}). Times cannot overlap.`
          );
          return;
        }
      }
    }

    setValidationError(null);
  }, [slots]);

  // Update a single slot's time
  const handleSlotChange = (index: number, field: "startTime" | "endTime", value: string) => {
    setSlots((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, [field]: value } : s))
    );
  };

  // Add another slot row for this day
  const handleAddSlotRow = () => {
    const lastSlot = slots[slots.length - 1];
    let nextStart = "18:00";
    let nextEnd = "20:00";

    if (lastSlot) {
      const lastEndMin = timeToMinutes(lastSlot.endTime);
      // Start 1 hour after the last slot if possible
      const proposedStart = Math.min(lastEndMin + 60, 1320); // up to 10 PM
      const proposedEnd = Math.min(proposedStart + 60, 1380); // up to 11 PM
      nextStart = minutesToTime(proposedStart);
      nextEnd = minutesToTime(proposedEnd);
    }

    setSlots((prev) => [
      ...prev,
      { id: `slot-${Date.now()}-${prev.length}`, startTime: nextStart, endTime: nextEnd },
    ]);
  };

  // Remove a slot row
  const handleRemoveSlotRow = (index: number) => {
    setSlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) return;

    // Sort slots chronologically
    const sorted = [...slots].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    onSaveDaySlots(selectedDay, sorted);
    onClose();
  };

  const dayLabel = dayOptions.find((d) => d.value === selectedDay)?.label;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Clock className="size-4.5" />
            </div>
            <DialogTitle>Teaching Hours — {dayLabel}</DialogTitle>
          </div>
          <DialogDescription>
            Configure one or multiple 1-hour teaching windows for this day.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Day of the week Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Day of the week
            </label>
            <Select value={selectedDay} onValueChange={(val) => val && handleDayChange(val as DayOfWeek)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a day">{dayLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[var(--anchor-width)] min-w-[var(--anchor-width)]">
                {dayOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Multiple Slots List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Time Slots for {dayLabel} ({slots.length})
              </label>
              <span className="text-[11px] font-medium text-slate-400">
                1-hour minimum per class
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {slots.map((slot, index) => {
                const duration = calculateDuration(slot.startTime, slot.endTime);

                return (
                  <div
                    key={slot.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Slot #{index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-md">
                          {duration}
                        </span>
                        {slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSlotRow(index)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove this slot"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Start Time */}
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                          Start
                        </span>
                        <Select
                          value={slot.startTime}
                          onValueChange={(val) => val && handleSlotChange(index, "startTime", val)}
                        >
                          <SelectTrigger className="w-full h-9 text-xs">
                            <SelectValue placeholder="Start">
                              {format12Hour(slot.startTime)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="w-full min-w-[130px] max-h-52">
                            {timeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* End Time */}
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                          End
                        </span>
                        <Select
                          value={slot.endTime}
                          onValueChange={(val) => val && handleSlotChange(index, "endTime", val)}
                        >
                          <SelectTrigger className="w-full h-9 text-xs">
                            <SelectValue placeholder="End">
                              {format12Hour(slot.endTime)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="w-full min-w-[130px] max-h-52">
                            {timeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Another Slot Button */}
            <button
              type="button"
              onClick={handleAddSlotRow}
              className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-orange-400 bg-white hover:bg-orange-50/50 text-xs font-semibold text-orange-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>+ Add another time slot for {dayLabel}</span>
            </button>
          </div>

          {/* Validation Warning */}
          {validationError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 animate-in fade-in duration-150">
              <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{validationError}</div>
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!validationError}
              className="px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Save Hours for {dayLabel}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
