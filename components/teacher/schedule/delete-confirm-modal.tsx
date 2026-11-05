"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Time Slot?",
  description = "Are you sure you want to remove this available time slot? This change will remain pending until you save your weekly availability.",
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="size-4.5" />
            </div>
            <DialogTitle className="text-slate-900">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500 pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed my-1">
          <strong>Notice:</strong> Existing confirmed classes booked by students are protected and will not be canceled by editing availability.
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Delete Slot
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
