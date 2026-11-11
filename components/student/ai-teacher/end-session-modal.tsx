"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PhoneOff,
  Sparkles,
  CheckCircle2,
  FileDown,
  Clock,
  BookOpen,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LESSON_META } from "./mock-lesson-data";

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conceptsCompleted: number;
  totalConcepts: number;
}

export function EndSessionModal({
  isOpen,
  onClose,
  conceptsCompleted,
  totalConcepts,
}: EndSessionModalProps) {
  const router = useRouter();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadNotes = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleConfirmExit = () => {
    router.push("/student");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-white space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="size-11 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
            <PhoneOff className="size-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">End AI Tutor Session?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to exit your private 1-on-1 tutoring session with {LESSON_META.tutorName}?
            </p>
          </div>
        </div>

        {/* Session Progress Recap Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Lesson Topic:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[200px]">
              {LESSON_META.topic}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Concepts Explored:</span>
            <span className="font-bold text-orange-400">
              {conceptsCompleted} of {totalConcepts} Steps
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Status:</span>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              Progress Auto-Saved
            </Badge>
          </div>
        </div>

        {/* Download Whiteboard Notes CTA */}
        <button
          onClick={handleDownloadNotes}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <FileDown className="size-4 text-orange-400" />
          <span>
            {downloadSuccess ? "✓ Lesson PDF Saved to Downloads!" : "Export Whiteboard & Notes (PDF)"}
          </span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Stay in Session
          </Button>

          <Button
            size="sm"
            onClick={handleConfirmExit}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-1.5 shadow-sm"
          >
            <PhoneOff className="size-3.5" />
            <span>End & Return to Dashboard</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

