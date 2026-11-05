"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { StudentClass } from "@/types/class";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ClassDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: StudentClass | null;
}

export function ClassDetailsDialog({
  isOpen,
  onClose,
  classItem,
}: ClassDetailsDialogProps) {
  if (!classItem) return null;

  const initials = classItem.teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 rounded-2xl bg-white border-slate-200">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-[11px] font-mono text-slate-500 bg-slate-50 border-slate-200"
            >
              Ref: {classItem.bookingRef}
            </Badge>
            <span className="text-xs font-semibold capitalize text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
              {classItem.status} Class
            </span>
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 pt-1">
            {classItem.topicTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {classItem.subject} • {classItem.packageType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Teacher Profile Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 rounded-xl">
                <AvatarImage src={classItem.teacher.avatarUrl} alt={classItem.teacher.name} />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-bold text-slate-900 leading-snug">
                  {classItem.teacher.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {classItem.teacher.headline}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              asChild
              className="h-7 text-[11px] rounded-lg border-slate-200 font-semibold"
            >
              <Link href={`/student/teachers/${classItem.teacher.id}`}>
                <span>Profile</span>
                <ExternalLink className="size-3 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Schedule & Timing Info */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                Session Date
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Calendar className="size-3.5 text-orange-500" />
                <span>{classItem.date}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">
                Session Time
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Clock className="size-3.5 text-orange-500" />
                <span>{classItem.startTime} – {classItem.endTime} ({classItem.durationMinutes}m)</span>
              </div>
            </div>
          </div>

          {/* Description & Learning Goals */}
          {classItem.description && (
            <div className="space-y-1">
              <span className="font-bold text-slate-800 block">Class Overview:</span>
              <p className="text-slate-600 leading-relaxed font-normal bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                {classItem.description}
              </p>
            </div>
          )}

          {/* Meeting Room Link (If Applicable) */}
          {classItem.status === "upcoming" && (
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="size-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-emerald-900 block leading-tight">
                    {classItem.meetingPlatform} Room
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    {classItem.canJoinNow ? "Room is open now" : "Unlocks 15 minutes prior to class"}
                  </span>
                </div>
              </div>

              {classItem.canJoinNow && classItem.meetingUrl && (
                <Button
                  size="xs"
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                >
                  <a href={classItem.meetingUrl} target="_blank" rel="noopener noreferrer">
                    Join Now
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Cancellation Info & Reason (If Cancelled) */}
          {classItem.status === "cancelled" && (
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                <XCircle className="size-4 text-rose-600 shrink-0" />
                <span>Class Cancellation Details</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                <strong>Reason:</strong> {classItem.cancellationReason || "Cancelled by participant or faculty scheduling conflict."}
              </p>
              {classItem.cancelledAt && (
                <div className="text-[11px] text-rose-600">
                  Cancelled on: {new Date(classItem.cancelledAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* Teacher Class Notes (If Available) */}
          {classItem.teacherNotes && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <FileText className="size-3.5 text-orange-500" />
                Instructor Class Notes:
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {classItem.teacherNotes}
              </p>
            </div>
          )}

          {/* Homework / Deliverables (If Completed or Assigned) */}
          {classItem.homeworkAssigned && (
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-orange-500" />
                Assigned Homework / Practice:
              </span>
              <p className="text-[11px] text-slate-600">
                {classItem.homeworkAssigned}
              </p>
            </div>
          )}

          {/* Session Notes PDF (If Completed) */}
          {classItem.status === "completed" && classItem.sessionNotesUrl && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/60 border border-orange-200">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-orange-600" />
                <div>
                  <span className="font-bold text-orange-950 block">Session Whiteboard Notes</span>
                  <span className="text-[11px] text-orange-800">High-resolution PDF exported after lesson</span>
                </div>
              </div>
              <Button
                size="xs"
                variant="outline"
                asChild
                className="rounded-lg border-orange-300 text-orange-800 bg-white hover:bg-orange-100"
              >
                <a href={classItem.sessionNotesUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="size-3 mr-1" />
                  <span>Download</span>
                </a>
              </Button>
            </div>
          )}


          {/* Invoice & Escrow Guarantee */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Protected by ZuhDemy Escrow
            </span>
            <span className="font-bold text-slate-900 text-xs">
              Fee: PKR {classItem.feePKR.toLocaleString()} ({classItem.paymentStatus})
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
