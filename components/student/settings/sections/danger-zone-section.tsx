"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Download,
  Trash2,
  PauseCircle,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StudentSettingsState } from "../types";
import { downloadStudentDataJSON } from "../student-settings-service";

interface DangerZoneSectionProps {
  settings: StudentSettingsState;
}

export function DangerZoneSection({ settings }: DangerZoneSectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      downloadStudentDataJSON(settings);
      setIsExporting(false);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Export Student Data */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Download className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Export Learning Records & Data</h2>
            <p className="text-xs text-slate-500">
              Download a machine-readable JSON archive of your study milestones, enrolled subjects, and preferences.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">
              Download Profile & Settings Backup
            </span>
            <span className="text-xs text-slate-500">
              Includes full student preferences, notification choices, and curriculum subjects.
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="rounded-xl border-slate-200 text-slate-700 hover:text-slate-900 text-xs h-9 px-4 cursor-pointer self-start sm:self-center"
          >
            {isExporting ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Preparing Export...
              </>
            ) : exportDone ? (
              <>
                <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-600" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="size-3.5 mr-1.5" />
                Export JSON
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Account Deactivation & Deletion */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-rose-100">
          <div className="size-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-950">Danger Zone</h2>
            <p className="text-xs text-rose-700">
              Irreversible actions related to your student account lifecycle.
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Pause Account */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-100 bg-rose-50/30">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Temporarily Pause Account
              </span>
              <span className="text-xs text-slate-500">
                Hide your profile from tutors and pause email reminders until your next exam term.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeactivateModalOpen(true)}
              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs h-9 px-3.5 cursor-pointer self-start sm:self-center"
            >
              <PauseCircle className="size-3.5 mr-1.5" />
              Pause Account
            </Button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-rose-900 block">
                Permanently Delete Student Account
              </span>
              <span className="text-xs text-rose-700">
                Permanently delete all learning milestones, notes, chat transcripts, and enrolled subjects.
              </span>
            </div>
            <Button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-9 px-3.5 cursor-pointer self-start sm:self-center shadow-xs"
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Deactivate Dialog */}
      <Dialog
        open={isDeactivateModalOpen}
        onOpenChange={(open) => !open && setIsDeactivateModalOpen(false)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900">
              Pause Student Account?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Your profile and upcoming classes will be frozen. You can reactivate anytime simply by signing back in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeactivateModalOpen(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsDeactivateModalOpen(false);
                alert("Account paused. You can log in anytime to restore.");
              }}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 px-4"
            >
              Confirm Pause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => !open && setIsDeleteModalOpen(false)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-rose-700">
              Request Permanent Account Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              This action cannot be undone. All booked class records, chat messages, and learning notes will be permanently erased.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                alert("Account deletion request submitted to ZuhDemy Trust & Safety.");
              }}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs h-9 px-4"
            >
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
