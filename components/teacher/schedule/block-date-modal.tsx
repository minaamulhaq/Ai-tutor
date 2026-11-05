"use client";

import React, { useState, useEffect } from "react";
import {
  format,
  addDays,
  nextFriday,
  nextMonday,
  isBefore,
  startOfToday,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { BlockedDate } from "./types";
import {
  CalendarOff,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  ChevronDown,
  Info,
} from "lucide-react";

interface BlockDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedDates: BlockedDate[];
  onAddBlockedDate: (date: Omit<BlockedDate, "id">) => void;
  onRemoveBlockedDate: (id: string) => void;
  initialDate?: Date;
}

const commonReasonSuggestions = [
  "🏖️ Vacation / Travel",
  "🏛️ Public Holiday",
  "🏥 Medical Leave",
  "📚 Teacher Workshop",
  "🏡 Personal Time Off",
];

export function BlockDateModal({
  isOpen,
  onClose,
  blockedDates,
  onAddBlockedDate,
  onRemoveBlockedDate,
  initialDate,
}: BlockDateModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || addDays(new Date(), 1)
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync initialDate when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        setSelectedDate(initialDate);
      } else {
        setSelectedDate(addDays(new Date(), 1)); // default to tomorrow
      }
      setReason("");
      setError(null);
      setCalendarOpen(false);
    }
  }, [isOpen, initialDate]);

  const handleSelectPresetDate = (d: Date) => {
    setSelectedDate(d);
    if (error) setError(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setError("Please select a date from the calendar to block.");
      return;
    }

    if (isBefore(selectedDate, startOfToday())) {
      setError("Cannot block dates in the past.");
      return;
    }

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    if (blockedDates.some((b) => b.date === dateStr)) {
      setError("This date is already blocked in your schedule.");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason or note (e.g. Public Holiday, Vacation).");
      return;
    }

    onAddBlockedDate({
      date: dateStr,
      reason: reason.trim(),
      allDay: true,
    });

    // Reset fields
    setReason("");
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <CalendarOff className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Block a Date (Time Off)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Override weekly availability for specific dates so students cannot book classes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Add Date Exception Form with Shadcn Popover & Calendar */}
          <form
            onSubmit={handleAdd}
            className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Add Date Override
              </span>
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Info className="size-3 text-slate-400" />
                All-Day Unavailable
              </span>
            </div>

            {/* Shadcn Date Picker Component */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Date to Block
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 shadow-2xs outline-none hover:bg-slate-50 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
                  aria-label="Pick date to block"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CalendarIcon className="size-4 text-orange-500 shrink-0" />
                    <span className="font-semibold text-slate-900">
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Pick a date"}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  sideOffset={6}
                  className="w-auto p-1 border border-slate-200 shadow-2xl bg-white rounded-2xl"
                >
                  <Calendar
                    mode="single"
                    calendarSize="default"
                    selected={selectedDate}
                    onSelect={(d) => {
                      if (d) {
                        setSelectedDate(d);
                        setCalendarOpen(false);
                        if (error) setError(null);
                      }
                    }}
                    disabled={(d) => isBefore(d, startOfToday())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 mr-1">Quick pick:</span>
                <button
                  type="button"
                  onClick={() => handleSelectPresetDate(addDays(new Date(), 1))}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetDate(nextFriday(new Date()))}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  This Friday
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPresetDate(nextMonday(new Date()))}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  Next Monday
                </button>
              </div>
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Reason / Note
              </label>
              <input
                type="text"
                placeholder="e.g. National Holiday, Vacation, Family Event"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-2xs"
              />

              {/* Reason Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {commonReasonSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setReason(suggestion.replace(/^[^\s]+\s/, ""));
                      if (error) setError(null);
                    }}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600 animate-in fade-in duration-150">
                {error}
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Confirm & Block Date</span>
              </button>
            </div>
          </form>

          {/* Currently Blocked Dates List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Blocked Dates ({blockedDates.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Regular schedule resumes automatically after these dates
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {blockedDates.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 rounded-xl border border-dashed border-slate-200">
                  No blocked dates configured. Your weekly availability applies continuously.
                </div>
              ) : (
                blockedDates.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <CalendarOff className="size-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-slate-900 block truncate">
                          {item.date}
                        </span>
                        <span className="text-slate-500 text-[11px] truncate block">
                          {item.reason}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveBlockedDate(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-2"
                      title="Remove date block"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
