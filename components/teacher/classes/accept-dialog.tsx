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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, DollarSign, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { ClassSession, formatPKR } from "./types";

interface AcceptBookingDialogProps {
  session: ClassSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmAccept: (session: ClassSession) => Promise<void> | void;
}

export function AcceptBookingDialog({
  session,
  open,
  onOpenChange,
  onConfirmAccept,
}: AcceptBookingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Simulate backend server latency and conflict check
      await new Promise((resolve) => setTimeout(resolve, 600));
      await onConfirmAccept(session);
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
            <CheckCircle2 className="size-6 text-orange-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Accept Booking Request
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Review the requested session details before confirming. Upon acceptance, a Google Meet link will be generated and the student will be notified.
          </DialogDescription>
        </DialogHeader>

        {/* Student & Session Overview Box */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 ring-1 ring-slate-200">
              <AvatarImage src={session.student.avatarUrl} alt={session.student.name} />
              <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-bold">
                {session.student.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {session.student.name}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {session.student.gradeLevel}
              </p>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 font-semibold text-xs">
              {session.subject}
            </Badge>
          </div>

          <div className="text-xs font-semibold text-slate-800 pt-1 border-t border-slate-200">
            {session.topicTitle}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-orange-500" />
              <span>{session.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-slate-400" />
              <span>{session.startTime} - {session.endTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>{session.durationMinutes} min ({session.sessionType})</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
              <DollarSign className="size-3.5" />
              <span>Net payout: {formatPKR(session.teacherEarnings)}</span>
            </div>
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
            className="text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white cursor-pointer min-w-32"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Confirming...
              </>
            ) : (
              "Confirm Acceptance"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
