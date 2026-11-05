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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarX, Loader2, AlertTriangle } from "lucide-react";
import { ClassSession } from "./types";

interface DeclineBookingDialogProps {
  session: ClassSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDecline: (session: ClassSession, reason: string) => Promise<void> | void;
}

export function DeclineBookingDialog({
  session,
  open,
  onOpenChange,
  onConfirmDecline,
}: DeclineBookingDialogProps) {
  const [reasonCategory, setReasonCategory] = useState("conflict");
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      let finalReason = "Schedule conflict";
      if (reasonCategory === "outside_scope") {
        finalReason = "Topic is outside instructor's current specialization";
      } else if (reasonCategory === "unavailable") {
        finalReason = "Teacher unavailable at requested time";
      } else if (reasonCategory === "other" && customReason.trim()) {
        finalReason = customReason.trim();
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      await onConfirmDecline(session, finalReason);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
        <DialogHeader className="space-y-2">
          <div className="size-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-200/60 mb-1">
            <CalendarX className="size-6 text-rose-500" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Decline Booking Request
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Declining this request will notify the student and release their payment authorization immediately.
          </DialogDescription>
        </DialogHeader>

        {/* Student Snippet */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <Avatar className="size-9 ring-1 ring-slate-200">
            <AvatarImage src={session.student.avatarUrl} alt={session.student.name} />
            <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-bold">
              {session.student.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {session.student.name} · {session.subject}
            </h4>
            <p className="text-[11px] text-slate-500 truncate">
              {session.date} at {session.startTime} - {session.endTime}
            </p>
          </div>
        </div>

        {/* Reason Section */}
        <div className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Reason for Declining
            </Label>
            <Select value={reasonCategory} onValueChange={(val) => setReasonCategory(val || "conflict")}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conflict">Time / schedule conflict</SelectItem>
                <SelectItem value="outside_scope">Subject outside my teaching scope</SelectItem>
                <SelectItem value="unavailable">Taking time off / unavailable</SelectItem>
                <SelectItem value="other">Other reason</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reasonCategory === "other" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Additional Note for Student (Optional)
              </Label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Kindly explain why you are declining..."
                className="text-xs min-h-[70px]"
              />
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="size-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed">
              Frequent declining may affect your response rate metrics on the marketplace.
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
            Keep Request
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer min-w-28"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Declining...
              </>
            ) : (
              "Confirm Decline"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
