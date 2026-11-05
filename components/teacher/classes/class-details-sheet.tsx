"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  DollarSign,
  FileText,
  History,
  User,
  AlertCircle,
  Save,
  RotateCcw,
  BookOpen,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClassSession, formatPKR, getRequestedTopicsList } from "./types";

interface ClassDetailsSheetProps {
  session: ClassSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveNotes: (sessionId: string, newNotes: string) => void;
  onShowToast: (message: string, type?: "success" | "error" | "info") => void;
  onJoinMeeting?: (url: string) => void;
}

export function ClassDetailsSheet({
  session,
  open,
  onOpenChange,
  onSaveNotes,
  onShowToast,
  onJoinMeeting,
}: ClassDetailsSheetProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    if (session) {
      setNotes(session.teacherNotes || "");
      setIsEditingNotes(false);
    }
  }, [session]);

  if (!session) return null;

  const handleCopyLink = () => {
    if (session.meetingUrl) {
      navigator.clipboard.writeText(session.meetingUrl);
      setCopiedLink(true);
      onShowToast("Meeting link copied to clipboard!", "success");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSaveNotes = () => {
    // ============================================================================
    // [BACKEND API INTEGRATION POINT: PERSIST NOTES & CURRICULUM]
    // When connecting to your real Supabase or Next.js API route:
    //
    // try {
    //   const response = await fetch(`/api/teacher/classes/${session.id}/notes`, {
    //     method: "PATCH",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ teacherNotes: notes }),
    //   });
    //   const data = await response.json();
    // } catch (error) {
    //   console.error("API Error saving notes:", error);
    // }
    // ============================================================================

    onSaveNotes(session.id, notes);
    setIsEditingNotes(false);
    onShowToast("Class notes saved and updated in state successfully.", "success");
  };

  const handleResetNotes = () => {
    setNotes(session.teacherNotes || "");
    setIsEditingNotes(false);
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const format12HourTime = (timeStr: string) => {
    if (!timeStr) return "";
    const trimmed = String(timeStr).trim();
    if (/AM|PM/i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.includes("T")) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Karachi",
        }).format(d);
      }
    }
    try {
      const parts = trimmed.split(":");
      let h = parseInt(parts[0], 10);
      let m = parseInt(parts[1] || "0", 10);
      if (isNaN(h)) h = 0;
      if (isNaN(m)) m = 0;
      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      const minStr = m < 10 ? `0${m}` : `${m}`;
      return `${hour12}:${minStr} ${period}`;
    } catch {
      return timeStr;
    }
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending Request
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const requestedTopics = getRequestedTopicsList(session.studentRequestedTopics);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl w-full max-h-[88vh] flex flex-col p-0 overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200">
        {/* Header Section (Centered popup header) */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-200 bg-slate-50/70 text-left">
          <div className="flex items-center justify-between gap-3 pr-8">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 font-semibold text-xs">
                {session.subject}
              </Badge>
              {getStatusBadge()}
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              Ref: {session.bookingReference}
            </span>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 mt-2 text-left leading-snug">
            {session.topicTitle} — {session.sessionType === "one-to-one" ? "1-on-1 Tutoring" : "Group Class"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 text-left">
            Scheduled for {formatDate(session.date)} at {format12HourTime(session.startTime)} – {format12HourTime(session.endTime)} ({session.durationMinutes} minutes)
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body inside Center Modal */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Section A: Session Overview */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Calendar className="size-4 text-orange-500" />
              <span>Session Overview</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Date</span>
                <span className="font-semibold text-slate-800">{formatDate(session.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Time</span>
                <span className="font-semibold text-slate-800">
                  {format12HourTime(session.startTime)} – {format12HourTime(session.endTime)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Duration</span>
                <span className="font-semibold text-slate-800">{session.durationMinutes} Minutes</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Session Type</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {session.sessionType === "one-to-one" ? "1-on-1 Private" : "Group Class"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Timezone</span>
                <span className="font-semibold text-slate-800">Local (UTC+05:00)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status</span>
                <span className="font-semibold capitalize text-slate-800">{session.status}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Info (If Cancelled) */}
          {(session.status === "cancelled" || session.cancellationReason) && (
            <div className="rounded-xl border border-rose-200 p-4 bg-rose-50/70 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                <AlertCircle className="size-4 text-rose-600" />
                <span>Class Cancellation Details</span>
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                <strong>Reason:</strong> {session.cancellationReason || "Cancelled by instructor or student schedule conflict."}
              </p>
              {session.cancelledAt && (
                <p className="text-[11px] text-rose-600">
                  Cancelled on: {session.cancelledAt}
                </p>
              )}
            </div>
          )}

          {/* Section B: Student Details */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <User className="size-4 text-orange-500" />
                <span>Student Details</span>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onShowToast(`Direct messaging with ${session.student.name} will open in Messages tab.`, "info")}
                className="h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1.5 cursor-pointer"
              >
                <MessageSquare className="size-3.5" />
                Message Student
              </Button>
            </div>

            <div className="flex items-start gap-3.5 pt-1">
              <div className="size-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                {session.student.avatarUrl ? (
                  <img
                    src={session.student.avatarUrl}
                    alt={session.student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-orange-600 bg-orange-50 text-sm">
                    {session.student.initials}
                  </div>
                )}
              </div>

              <div className="space-y-1 flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm">
                  {session.student.name}
                </h4>
                <p className="text-xs text-slate-500">
                  {session.student.email} · {session.student.gradeLevel}
                </p>

                {session.student.targetGoals && (
                  <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5">Academic Goals:</span>
                    <span className="text-slate-600">{session.student.targetGoals}</span>
                  </div>
                )}

                {session.student.learningPreferences && (
                  <div className="mt-1 text-xs bg-orange-50/50 p-2.5 rounded-lg border border-orange-100 text-orange-950">
                    <span className="font-semibold text-orange-900 block mb-0.5">Learning Preferences:</span>
                    <span className="text-orange-800">{session.student.learningPreferences}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section C: Online Classroom / Meeting Link */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Video className="size-4 text-orange-500" />
              <span>Online Classroom Link</span>
            </div>

            {session.meetingUrl ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                    <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-mono text-slate-700 truncate">
                      {session.meetingUrl}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyLink}
                    className="h-7 text-xs font-medium shrink-0 gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>
                </div>

                {session.status === "confirmed" && (
                  <Button
                    onClick={() => {
                      if (onJoinMeeting && session.meetingUrl) {
                        onJoinMeeting(session.meetingUrl);
                      } else if (session.meetingUrl) {
                        window.open(session.meetingUrl, "_blank");
                      }
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-2 shadow-2xs cursor-pointer h-10"
                  >
                    <Video className="size-4" />
                    Join Google Meet Classroom
                    <ExternalLink className="size-3.5 ml-1 opacity-80" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-800 flex items-start gap-2.5">
                <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Meeting Link Not Yet Generated</span>
                  <p className="text-amber-700 leading-relaxed">
                    Meeting credentials will be automatically generated via Google Meet once the booking request is accepted.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section D: Financial & Payout Overview */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <DollarSign className="size-4 text-orange-500" />
                <span>Financial & Payout Overview</span>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                {session.paymentStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <span className="text-[11px] text-slate-500 block">Student Price</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5">{formatPKR(session.price)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
                <span className="text-[11px] text-slate-500 block">Platform Fee (15%)</span>
                <span className="text-sm font-semibold text-slate-600 mt-0.5">-{formatPKR(session.platformFee)}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100 flex flex-col justify-center">
                <span className="text-[11px] text-emerald-700 block font-medium">Your Net Payout</span>
                <span className="text-sm font-bold text-emerald-700 mt-0.5">{formatPKR(session.teacherEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Section E: Private Class Notes & Topic Details */}
          <div className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-white shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <FileText className="size-4 text-orange-500" />
                <span>Private Class Notes & Topic Details</span>
              </div>
              <span className="text-[11px] text-slate-400 italic">Teacher & Session Context</span>
            </div>

            {/* Sub-block 1: What exactly the student wants to read & learn (Topic Details from State JSON) */}
            <div className="rounded-xl bg-orange-50/40 border border-orange-200/80 p-3.5 sm:p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-orange-600 shrink-0" />
                  <span className="text-xs font-bold text-orange-950 uppercase tracking-wide">
                    What Student Wants To Read & Learn
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white text-orange-700 border-orange-200 font-semibold">
                  {session.subject}
                </Badge>
              </div>

              {/* Main Topic Name */}
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-slate-900">
                  {session.topicTitle}
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {session.topicDescription}
                </p>
              </div>

              {/* Specific Subtopics / Chapters Requested by Student from State */}
              {requestedTopics.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <ListChecks className="size-3.5 text-orange-500" />
                    <span>Requested Chapters & Specific Focus Points:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {requestedTopics.map((topicItem, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-orange-100/90 shadow-2xs text-xs text-slate-700"
                      >
                        <CheckCircle2 className="size-3.5 text-orange-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{topicItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Target Goal Note from State */}
              {session.student.targetGoals && (
                <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-orange-100 flex items-center gap-2">
                  <span className="font-semibold text-slate-700 shrink-0">Student Goal:</span>
                  <span className="truncate">{session.student.targetGoals}</span>
                </div>
              )}
            </div>

            {/* Sub-block 2: Teacher's Private Class Notes (Editable & Persisted in State) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Teacher Private Lesson Notes
                </span>
                <span className="text-[10px] text-slate-400">Only visible to you</span>
              </div>

              <Textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setIsEditingNotes(true);
                }}
                placeholder="Log homework assignments, topics covered, student comprehension, or follow-up drills..."
                className="text-xs min-h-[95px] resize-y bg-slate-50/50 focus:bg-white"
              />

              {/* ============================================================================ */}
              {/* [BACKEND API INTEGRATION POINT - UPDATE CLASS NOTES]                         */}
              {/* When connected to real backend, handleSaveNotes executes:                   */}
              {/* POST/PATCH /api/teacher/classes/${session.id}/notes with { teacherNotes: notes } */}
              {/* ============================================================================ */}

              {isEditingNotes && (
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetNotes}
                    className="h-8 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="size-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    className="h-8 text-xs bg-orange-500 hover:bg-orange-600 text-white font-medium cursor-pointer"
                  >
                    <Save className="size-3 mr-1" />
                    Save Notes
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Section F: Activity History Timeline */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <History className="size-4 text-orange-500" />
              <span>Activity History</span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {session.activityTimeline.map((item) => (
                <div key={item.id} className="relative text-xs">
                  <span className="absolute -left-6 top-1 size-2 rounded-full bg-orange-500 ring-4 ring-white" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{item.event}</span>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs font-semibold px-4 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
