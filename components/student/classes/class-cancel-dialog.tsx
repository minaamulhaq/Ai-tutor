"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShieldCheck, Check } from "lucide-react";
import { StudentClass } from "@/types/class";

import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ClassCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: StudentClass | null;
  onConfirmCancel: (classId: string, reason: string) => Promise<void>;
}

const CANCELLATION_REASONS = [
  "Schedule conflict or unexpected personal commitment",
  "School test / exam preparation conflict",
  "Technical issues or device malfunction",
  "Want to book with another tutor",
  "Other reason",
];

export function ClassCancelDialog({
  isOpen,
  onClose,
  classItem,
  onConfirmCancel,
}: ClassCancelDialogProps) {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [otherText, setOtherText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!classItem) return null;

  const handleConfirm = async () => {
    const finalReason = selectedReason === "Other reason" && otherText.trim()
      ? otherText.trim()
      : selectedReason;

    setIsSubmitting(true);
    try {
      await onConfirmCancel(classItem.id, finalReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader className="space-y-1">
          <div className="size-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-1">
            <AlertCircle className="size-5" />
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
            Cancel Class with {classItem.teacher.name}?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Booking Ref: <span className="font-mono text-slate-700">{classItem.bookingRef}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>{classItem.subject}</span>
              <span>PKR {classItem.feePKR.toLocaleString()}</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Scheduled for <strong>{classItem.date}</strong> at {classItem.startTime} ({classItem.durationMinutes} mins)
            </p>
          </div>

          {/* Reason Selection using Shadcn Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Please select a cancellation reason:
            </label>
            <Select
              value={selectedReason}
              onValueChange={(val) => setSelectedReason(val)}
            >
              <SelectTrigger className="w-full h-10 rounded-xl text-xs font-medium bg-white">
                <SelectValue placeholder="Select cancellation reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === "Other reason" && (
            <div>
              <Textarea
                rows={2}
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Specify your reason..."
                className="text-xs rounded-xl"
              />
            </div>
          )}

          {/* ZuhDemy Escrow Guarantee Box */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[11px] block">100% Escrow Refund Guarantee</span>
              <p className="text-[11px] text-emerald-700 leading-relaxed font-normal">
                Because this session is cancelled at least 4 hours in advance, <strong>PKR {classItem.feePKR.toLocaleString()}</strong> will be immediately refunded to your student wallet balance.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl text-xs font-semibold"
            >
              Keep Session
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
