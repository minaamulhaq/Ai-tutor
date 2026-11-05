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
import { DayOfWeek, DaySchedule } from "./types";
import { format12Hour } from "./time-utils";
import { Copy, AlertTriangle, CheckSquare, Square } from "lucide-react";

interface CopyAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCopy: (sourceDay: DayOfWeek, targetDays: DayOfWeek[]) => void;
  schedule: DaySchedule[];
  initialSourceDay?: DayOfWeek;
}

const allDays: { key: DayOfWeek; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export function CopyAvailabilityModal({
  isOpen,
  onClose,
  onApplyCopy,
  schedule,
  initialSourceDay = "monday",
}: CopyAvailabilityModalProps) {
  const [sourceDay, setSourceDay] = useState<DayOfWeek>(initialSourceDay);
  const [targetDays, setTargetDays] = useState<DayOfWeek[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSourceDay(initialSourceDay);
      // Auto pre-select other weekdays excluding sourceDay
      const defaultTargets = allDays
        .filter((d) => d.key !== initialSourceDay && d.key !== "saturday" && d.key !== "sunday")
        .map((d) => d.key);
      setTargetDays(defaultTargets);
    }
  }, [isOpen, initialSourceDay]);

  const sourceDaySchedule = schedule.find((d) => d.day === sourceDay);
  const sourceSlots = sourceDaySchedule?.slots || [];

  const toggleTarget = (day: DayOfWeek) => {
    if (day === sourceDay) return;
    if (targetDays.includes(day)) {
      setTargetDays(targetDays.filter((d) => d !== day));
    } else {
      setTargetDays([...targetDays, day]);
    }
  };

  const handleSelectAllWeekdays = () => {
    const weekdays: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const filtered = weekdays.filter((d) => d !== sourceDay);
    setTargetDays(filtered);
  };

  const handleSelectAll = () => {
    const all = allDays.map((d) => d.key).filter((d) => d !== sourceDay);
    setTargetDays(all);
  };

  const handleClear = () => {
    setTargetDays([]);
  };

  const handleApply = () => {
    if (targetDays.length === 0) return;
    onApplyCopy(sourceDay, targetDays);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Copy className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">Copy Availability</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Duplicate hours from one day to multiple days with one click.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-1">
          {/* Source Day Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Copy From (Source Day)
            </label>
            <Select
              value={sourceDay}
              onValueChange={(val) => {
                if (val) {
                  const newSource = val as DayOfWeek;
                  setSourceDay(newSource);
                  setTargetDays((prev) => prev.filter((d) => d !== newSource));
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select source day">
                  {allDays.find((d) => d.key === sourceDay)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[var(--anchor-width)] min-w-[var(--anchor-width)]">
                {allDays.map((d) => (
                  <SelectItem key={d.key} value={d.key}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Slot Preview */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600">
                Slots to copy from {allDays.find((d) => d.key === sourceDay)?.label}:
              </span>
              {sourceSlots.length > 0 && (
                <span className="text-[10px] font-medium text-slate-500">
                  {sourceSlots.length} {sourceSlots.length === 1 ? "slot" : "slots"}
                </span>
              )}
            </div>
            {sourceSlots.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                No slots configured (destination days will be set to Unavailable).
              </span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {sourceSlots.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs"
                  >
                    {format12Hour(s.startTime)} – {format12Hour(s.endTime)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Target Days Multi-Select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Apply To (Destination Days)
              </label>
              <div className="flex items-center gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={handleSelectAllWeekdays}
                  className="text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Weekdays
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  All Days
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {allDays.map((d) => {
                const isSource = d.key === sourceDay;
                const isSelected = targetDays.includes(d.key);

                return (
                  <button
                    key={d.key}
                    type="button"
                    disabled={isSource}
                    onClick={() => toggleTarget(d.key)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium text-left transition-all ${
                      isSource
                        ? "opacity-45 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400"
                        : isSelected
                        ? "bg-orange-50 border-orange-300 text-orange-900 shadow-2xs cursor-pointer"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer"
                    }`}
                  >
                    {isSelected ? (
                      <CheckSquare className="size-3.5 text-orange-600 shrink-0" />
                    ) : (
                      <Square className="size-3.5 text-slate-300 shrink-0" />
                    )}
                    <span className="truncate">
                      {d.label} {isSource && <span className="text-[10px] text-slate-400 font-normal">(Source)</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Warning Banner */}
          {targetDays.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <p className="leading-snug text-[11px]">
                Replaces existing slots on destination days. Remember to save changes.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={targetDays.length === 0}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Copy Availability ({targetDays.length} {targetDays.length === 1 ? "day" : "days"})
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
