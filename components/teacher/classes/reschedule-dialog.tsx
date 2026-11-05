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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, Clock, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ClassSession } from "./types";

interface RescheduleClassDialogProps {
  session: ClassSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReschedule: (
    session: ClassSession,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason: string
  ) => Promise<void> | void;
}

const availableTimeSlots = [
  { start: "09:00", end: "10:00", label: "09:00 AM - 10:00 AM" },
  { start: "10:30", end: "11:30", label: "10:30 AM - 11:30 AM" },
  { start: "14:00", end: "15:00", label: "02:00 PM - 03:00 PM" },
  { start: "15:30", end: "16:30", label: "03:30 PM - 04:30 PM" },
  { start: "16:00", end: "17:00", label: "04:00 PM - 05:00 PM" },
  { start: "17:30", end: "18:30", label: "05:30 PM - 06:30 PM" },
  { start: "19:00", end: "20:00", label: "07:00 PM - 08:00 PM" },
];

export function RescheduleClassDialog({
  session,
  open,
  onOpenChange,
  onConfirmReschedule,
}: RescheduleClassDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string>("16:00-17:00");
  const [reason, setReason] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      try {
        setSelectedDate(parseISO(session.date));
      } catch {
        setSelectedDate(new Date());
      }
      setSelectedSlot(`${session.startTime}-${session.endTime}`);
      setReason("");
    }
  }, [session]);

  if (!session) return null;

  const handleConfirm = async () => {
    if (!selectedDate) return;
    setIsSubmitting(true);

    try {
      const [start, end] = selectedSlot.split("-");
      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      await new Promise((resolve) => setTimeout(resolve, 600));
      await onConfirmReschedule(session, formattedDate, start, end, reason);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="space-y-2">
          <div className="size-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center ring-1 ring-orange-200/60 mb-1">
            <Calendar className="size-6 text-orange-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Reschedule Class Session
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Select a new date and open teaching slot for {session.student.name}. The student will receive an instant reschedule notification.
          </DialogDescription>
        </DialogHeader>

        {/* Current Schedule Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
          <span className="text-slate-400 text-[11px] block font-medium">Currently Scheduled For:</span>
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <CalendarDays className="size-3.5 text-orange-500" />
            <span>{session.date} at {session.startTime} - {session.endTime}</span>
          </div>
        </div>

        {/* New Date & Time Pickers */}
        <div className="space-y-4 pt-1">
          {/* Date Picker using Shadcn Calendar & Popover */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              New Session Date
            </Label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger className="w-full h-10 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-left flex items-center justify-between hover:border-orange-500 transition-colors">
                <span className="flex items-center gap-2 text-slate-800 font-medium">
                  <Calendar className="size-4 text-orange-500" />
                  {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Choose a date"}
                </span>
                <span className="text-[11px] text-orange-600 font-semibold">Change</span>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white rounded-xl shadow-xl border border-slate-200" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setDatePopoverOpen(false);
                    }
                  }}
                  disabled={{ before: new Date() }}
                  className="rounded-xl"
                  calendarSize="default"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slot Picker using Shadcn Select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Available Time Slot (1 Hour)
            </Label>
            <Select value={selectedSlot} onValueChange={(val) => setSelectedSlot(val || "16:00-17:00")}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableTimeSlots.map((slot) => (
                  <SelectItem key={`${slot.start}-${slot.end}`} value={`${slot.start}-${slot.end}`}>
                    {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason for Rescheduling */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Reason for Rescheduling
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Conflict with faculty meeting; proposed new time to suit both schedules."
              className="text-xs min-h-[70px]"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-orange-50/60 border border-orange-200/80 text-xs text-orange-800 flex items-start gap-2">
            <AlertCircle className="size-3.5 text-orange-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              Platform policy: Per ZuhDemy standards, student approval is requested if rescheduled within 6 hours of original start time.
            </span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !selectedDate}
            onClick={handleConfirm}
            className="text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Rescheduling...
              </>
            ) : (
              "Confirm Reschedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
