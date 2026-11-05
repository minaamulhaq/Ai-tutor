"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, DollarSign, Loader2, Award } from "lucide-react";
import { ClassSession, formatPKR } from "./types";

interface MarkCompletedDialogProps {
  session: ClassSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCompleted: (session: ClassSession) => Promise<void> | void;
}

export function MarkCompletedDialog({
  session,
  open,
  onOpenChange,
  onConfirmCompleted,
}: MarkCompletedDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await onConfirmCompleted(session);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="space-y-2">
          <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-200/60 mb-1">
            <CheckCircle2 className="size-6 text-emerald-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Mark Session as Completed
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Confirm that this tutoring session was completed successfully. Your earnings will be unlocked for the upcoming payout cycle.
          </DialogDescription>
        </DialogHeader>

        {/* Session & Payout Overview */}
        <div className="my-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span>{session.topicTitle}</span>
            <span className="font-mono text-[11px] text-slate-500">#{session.bookingReference}</span>
          </div>

          <p className="text-slate-600">
            Student: <span className="font-semibold text-slate-800">{session.student.name}</span>
          </p>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500">Credited to your balance:</span>
            <span className="font-bold text-emerald-700 text-sm">
              {formatPKR(session.teacherEarnings)}
            </span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
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
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer min-w-36"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Processing...
              </>
            ) : (
              "Confirm Completion"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
