"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarX, AlertTriangle, Loader2 } from "lucide-react";
import { ClassSession } from "./types";

interface CancelClassDialogProps {
  session: ClassSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel: (session: ClassSession, reason: string) => Promise<void> | void;
}

export function CancelClassDialog({
  session,
  open,
  onOpenChange,
  onConfirmCancel,
}: CancelClassDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const finalReason = reason.trim() || "Cancelled by instructor";
      await new Promise((resolve) => setTimeout(resolve, 500));
      await onConfirmCancel(session, finalReason);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        <AlertDialogHeader className="space-y-2">
          <div className="size-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-200/60 mb-1">
            <CalendarX className="size-6 text-rose-500" />
          </div>
          <AlertDialogTitle className="text-lg font-bold text-slate-900">
            Cancel Confirmed Class
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-500">
            Are you sure you want to cancel this session? This action cannot be undone. The student will be notified and any held escrow funds will be refunded.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Target Session Details */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{session.topicTitle}</span>
            <span className="text-[11px] font-mono text-slate-500">#{session.bookingReference}</span>
          </div>
          <p className="text-slate-600">
            Student: <span className="font-semibold text-slate-800">{session.student.name}</span>
          </p>
          <p className="text-slate-600">
            Scheduled: <span className="font-medium text-slate-700">{session.date} at {session.startTime} - {session.endTime}</span>
          </p>
        </div>

        {/* Cancellation Reason */}
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-semibold text-slate-700">
            Cancellation Reason (Required)
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a clear reason for the cancellation..."
            className="text-xs min-h-[75px]"
          />
        </div>

        {/* Policy Notice */}
        <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
          <span className="text-[11px] leading-relaxed">
            Teacher Cancellation Policy: Cancellations initiated by teachers do not incur student fees. Repeated cancellations may impact your badge eligibility.
          </span>
        </div>

        <AlertDialogFooter className="flex items-center justify-end gap-2 pt-3">
          <AlertDialogCancel
            disabled={isSubmitting}
            className="text-xs font-medium cursor-pointer"
          >
            Keep Session
          </AlertDialogCancel>
          <Button
            type="button"
            disabled={isSubmitting || !reason.trim()}
            onClick={handleConfirm}
            className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
