"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  ShieldCheck,
  Star,
  ExternalLink,
  RotateCcw,
  AlertCircle,
  FileText,
  XCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { StudentClass } from "@/types/class";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ClassCardProps {
  classItem: StudentClass;
  onViewDetails: (item: StudentClass) => void;
  onCancel?: (item: StudentClass) => void;
  onReschedule?: (item: StudentClass) => void;
  onLeaveReview?: (item: StudentClass) => void;
  onBookAgain?: (item: StudentClass) => void;
}

export function ClassCard({
  classItem,
  onViewDetails,
  onCancel,
  onReschedule,
  onLeaveReview,
  onBookAgain,
}: ClassCardProps) {
  const { teacher, status } = classItem;

  const initials = teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Status Badge Configuration
  const statusBadges = {
    upcoming: {
      label: "Confirmed Session",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
      accentBorder: "border-l-4 border-l-orange-500",
    },
    pending: {
      label: "Pending Approval",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500",
      accentBorder: "border-l-4 border-l-amber-400",
    },
    completed: {
      label: "Completed",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
      accentBorder: "border-l-4 border-l-emerald-500",
    },
    cancelled: {
      label: "Cancelled",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
      accentBorder: "border-l-4 border-l-rose-400",
    },
    rejected: {
      label: "Declined by Teacher",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
      accentBorder: "border-l-4 border-l-rose-400",
    },
  };

  const currentBadge = statusBadges[status] || statusBadges.upcoming;

  return (
    <Card
      className={cn(
        "rounded-2xl border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4 relative overflow-hidden group",
        currentBadge.accentBorder
      )}
    >
      {/* Top Header: Teacher Avatar + Name + Booking Ref + Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <Link href={`/student/teachers/${teacher.id}`} className="shrink-0 group/avatar">
            <Avatar className="size-12 rounded-xl ring-2 ring-slate-100 group-hover/avatar:ring-orange-400 transition-all">
              <AvatarImage src={teacher.avatarUrl} alt={teacher.name} className="object-cover" />
              <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Link
                href={`/student/teachers/${teacher.id}`}
                className="font-bold text-sm sm:text-base text-slate-900 hover:text-orange-600 transition-colors"
              >
                {teacher.name}
              </Link>
              <div
                title="Verified Instructor"
                className="size-4.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center"
              >
                <ShieldCheck className="size-3" />
              </div>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">{teacher.headline}</p>
          </div>
        </div>

        {/* Status Badge & Booking Ref */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/80">
            {classItem.bookingRef}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1.5", currentBadge.badgeClass)}
          >
            <span className={cn("size-1.5 rounded-full", status === "upcoming" ? "animate-pulse" : "", currentBadge.dotClass)} />
            <span>{currentBadge.label}</span>
          </Badge>
        </div>
      </div>

      {/* Middle Body: Class Topic, Subject Tag, Date/Time, Platform, Fee */}
      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white text-slate-700 font-bold text-[11px] border border-slate-200 shadow-2xs">
                {classItem.subject}
              </Badge>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">{classItem.packageType}</span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              {classItem.topicTitle}
            </h3>
          </div>

          {/* Fee in PKR */}
          <div className="text-right shrink-0">
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight block">
              PKR {classItem.feePKR.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 inline-block">
              {classItem.paymentStatus}
            </span>
          </div>
        </div>

        {/* Schedule & Meeting Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs pt-1 border-t border-slate-200/60">
          {/* Date */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-slate-200/60 text-slate-700">
            <div className="size-6 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Calendar className="size-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Session Date</p>
              <p className="font-semibold text-slate-800">{classItem.date}</p>
            </div>
          </div>

          {/* Time & Duration */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-slate-200/60 text-slate-700">
            <div className="size-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="size-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Time & Duration</p>
              <p className="font-semibold text-slate-800">
                {classItem.startTime} - {classItem.endTime} ({classItem.durationMinutes}m)
              </p>
            </div>
          </div>

          {/* Meeting Platform */}
          <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 border border-slate-200/60 text-slate-700">
            <div className="size-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Video className="size-3.5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Classroom</p>
              <p className="font-semibold text-slate-800">1-on-1 via {classItem.meetingPlatform}</p>
            </div>
          </div>
        </div>

        {/* Cancellation Notice Banner (If Cancelled) */}
        {status === "cancelled" && classItem.cancellationReason && (
          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-800 space-y-1">
            <div className="flex items-center justify-between font-bold flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <XCircle className="size-4 text-rose-600 shrink-0" />
                Cancelled by {classItem.cancelledBy === "student" ? "You (Student)" : "Instructor"}
              </span>
              <span className="text-[11px] font-bold text-rose-700 bg-white/80 px-2 py-0.5 rounded border border-rose-200">
                {classItem.refundStatus || "Refund Issued to Wallet"}
              </span>
            </div>
            <p className="text-xs text-rose-700 font-normal pl-5.5">
              Reason: &quot;{classItem.cancellationReason}&quot;
            </p>
          </div>
        )}

        {/* Rejection Notice Banner (If Declined by Teacher) */}
        {status === "rejected" && (
          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-800 space-y-1">
            <div className="flex items-center justify-between font-bold flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <XCircle className="size-4 text-rose-600 shrink-0" />
                Declined by Teacher
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Full Escrow Refund Released
              </span>
            </div>
            <p className="text-xs text-rose-700 font-normal pl-5.5">
              Reason: {classItem.rejectionReason || "Teacher is unavailable during this time slot."}
            </p>
          </div>
        )}

        {/* Pending Approval Notice Banner */}
        {status === "pending" && (
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="size-3.5 text-amber-600 shrink-0" />
              <span>Awaiting Teacher Approval</span>
            </div>
            <p className="text-[11px] text-amber-700 pl-5">
              Your request is waiting for {teacher.name.split(" ")[0]} to review. Once approved, Google Calendar event and Google Meet link will be generated automatically.
            </p>
          </div>
        )}

        {/* Student Review Callout (If Completed and NOT Reviewed Yet) */}
        {status === "completed" && !classItem.hasReview && onLeaveReview && (
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="size-3.5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">How was your session with {teacher.name}?</p>
                <p className="text-[11px] text-slate-500">Leave a review to help your tutor and guide other students.</p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => onLeaveReview(classItem)}
              className="h-8 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
            >
              <Star className="size-3 mr-1 fill-white text-white" />
              <span>Write Review</span>
            </Button>
          </div>
        )}

        {/* Student Review Preview (If Completed and Reviewed) */}
        {status === "completed" && classItem.hasReview && classItem.studentRating && (
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: classItem.studentRating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="font-bold text-slate-900">Your Review:</span>
              <span className="text-amber-900 font-normal italic line-clamp-1">
                &quot;{classItem.studentReview}&quot;
              </span>
            </div>
            <span className="text-[11px] font-medium text-amber-800">Reviewed on {classItem.reviewedAt}</span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Contextual Action Buttons */}
      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(classItem)}
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <FileText className="size-3.5 mr-1 text-slate-400" />
          <span>View Details</span>
        </Button>

        {/* TAB SPECIFIC ACTIONS */}
        <div className="flex items-center gap-2">
          {/* UPCOMING ACTIONS */}
          {status === "upcoming" && (
            <>
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(classItem)}
                  className="h-9 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  Cancel Session
                </Button>
              )}

              {onReschedule && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onReschedule(classItem)}
                  className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Reschedule
                </Button>
              )}

              {/* Join Class (Permitted only by meeting access rules) */}
              {classItem.canJoinNow ? (
                <Button
                  type="button"
                  size="sm"
                  asChild
                  className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <a
                    href={classItem.meetingUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5"
                  >
                    <span className="relative flex size-2 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-white"></span>
                    </span>
                    <Video className="size-3.5" />
                    <span>Join Class Now</span>
                  </a>
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled
                  title="Link opens 15 minutes before session start"
                  className="h-9 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 font-semibold text-xs cursor-not-allowed"
                >
                  <Lock className="size-3 mr-1 text-slate-400" />
                  <span>Join Opens 15m Prior</span>
                </Button>
              )}
            </>
          )}

          {/* PENDING APPROVAL ACTIONS */}
          {status === "pending" && (
            <>
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(classItem)}
                  className="h-9 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                >
                  Cancel Request
                </Button>
              )}
            </>
          )}

          {/* COMPLETED ACTIONS */}
          {status === "completed" && (
            <Button
              type="button"
              size="sm"
              asChild
              className="h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Link href={`/student/teachers/${teacher.id}`}>
                <RotateCcw className="size-3 mr-1" />
                <span>Book Again</span>
              </Link>
            </Button>
          )}

          {/* CANCELLED & REJECTED ACTIONS */}
          {(status === "cancelled" || status === "rejected") && (
            <Button
              type="button"
              size="sm"
              asChild
              className="h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Link href={`/student/teachers/${teacher.id}`}>
                <RotateCcw className="size-3 mr-1" />
                <span>Book Another Slot</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
