"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  CalendarCheck2,
  CalendarX,
  FileText,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ClassSession, formatPKR } from "./types";

interface ClassCardProps {
  session: ClassSession;
  onViewDetails: (session: ClassSession) => void;
  onAccept?: (session: ClassSession) => void;
  onDecline?: (session: ClassSession) => void;
  onReschedule?: (session: ClassSession) => void;
  onCancel?: (session: ClassSession) => void;
  onMarkCompleted?: (session: ClassSession) => void;
  onOpenNotes?: (session: ClassSession) => void;
}

export function ClassCard({
  session,
  onViewDetails,
  onAccept,
  onDecline,
  onReschedule,
  onCancel,
  onMarkCompleted,
  onOpenNotes,
}: ClassCardProps) {
  // Format Date: e.g. "Monday, 12 October"
  const formatFullDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch {
      return dateStr;
    }
  };

  // Format 24h to 12h: e.g. "16:00" -> "4:00 PM", safely handles "9:00 AM", ISO strings, etc.
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
            Pending
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-5 md:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 group">
      {/* Left Block: Student Portrait Photo + Middle Class Details */}
      <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0 w-full">
        {/* Student Portrait Photo (matching reference image) */}
        <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 shadow-2xs">
          {session.student.avatarUrl ? (
            <img
              src={session.student.avatarUrl}
              alt={session.student.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-orange-600 bg-orange-50 text-xl">
              {session.student.initials}
            </div>
          )}
        </div>

        {/* Center Details Block */}
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Title: Topic — Session Type */}
          <h3
            onClick={() => onViewDetails(session)}
            className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer leading-snug"
          >
            {session.topicTitle} — {session.sessionType === "one-to-one" ? "1-on-1" : "Group"}
          </h3>

          {/* Student Name */}
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Student: <span className="text-slate-800 font-semibold">{session.student.name}</span>
          </p>

          {/* Date with Calendar Icon */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium pt-0.5">
            <Calendar className="size-4 text-orange-500 shrink-0" />
            <span>{formatFullDate(session.date)}</span>
          </div>

          {/* Time with Clock Icon */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
            <Clock className="size-4 text-slate-400 shrink-0" />
            <span>
              {format12HourTime(session.startTime)} – {format12HourTime(session.endTime)}
            </span>
          </div>

          {/* Duration & Class Type Info */}
          <p className="text-xs text-slate-400 font-normal">
            {session.durationMinutes} minutes · Online class
          </p>

          {/* Cancelled Reason Alert if applicable */}
          {session.status === "cancelled" && session.cancellationReason && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 pt-1">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>Reason: {session.cancellationReason}</span>
            </div>
          )}

          {/* Action Buttons Row (Pill Buttons matching reference style) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-3">
            {/* Confirmed Actions */}
            {session.status === "confirmed" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(session)}
                  className="h-9 px-4.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border-slate-300 cursor-pointer shadow-2xs"
                >
                  View Details
                </Button>

                {session.meetingUrl ? (
                  <Button
                    size="sm"
                    onClick={() => window.open(session.meetingUrl, "_blank")}
                    className="h-9 px-5 rounded-full text-xs sm:text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Video className="size-3.5" />
                    Join Class
                    <ExternalLink className="size-3 ml-0.5 opacity-80" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled
                    variant="secondary"
                    className="h-9 px-4 rounded-full text-xs text-slate-400 cursor-not-allowed"
                  >
                    Link Pending
                  </Button>
                )}
              </>
            )}

            {/* Pending Actions */}
            {session.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAccept?.(session)}
                  className="h-9 px-5 rounded-full text-xs sm:text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-2xs cursor-pointer"
                >
                  Accept Request
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecline?.(session)}
                  className="h-9 px-4.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 border-slate-300 hover:border-rose-200 cursor-pointer shadow-2xs"
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDetails(session)}
                  className="h-9 px-3 rounded-full text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Details
                </Button>
              </>
            )}

            {/* Completed Actions */}
            {session.status === "completed" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(session)}
                  className="h-9 px-4.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 border-slate-300 cursor-pointer shadow-2xs"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onOpenNotes?.(session)}
                  className="h-9 px-4 rounded-full text-xs text-orange-600 hover:bg-orange-50 gap-1.5 font-semibold cursor-pointer"
                >
                  <FileText className="size-3.5" />
                  Class Notes
                </Button>
              </>
            )}

            {/* Cancelled Actions */}
            {session.status === "cancelled" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDetails(session)}
                className="h-9 px-4.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 border-slate-300 cursor-pointer shadow-2xs"
              >
                View Details
              </Button>
            )}

            {/* More Actions Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="size-9 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors">
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-xl rounded-xl p-1">
                <DropdownMenuItem
                  onClick={() => onViewDetails(session)}
                  className="cursor-pointer text-xs font-medium py-2"
                >
                  <ChevronRight className="size-3.5 mr-2 text-slate-400" />
                  View Full Details
                </DropdownMenuItem>

                {session.status === "confirmed" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onMarkCompleted?.(session)}
                      className="cursor-pointer text-xs font-medium py-2 text-emerald-700 hover:bg-emerald-50"
                    >
                      <CheckCircle2 className="size-3.5 mr-2 text-emerald-600" />
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onReschedule?.(session)}
                      className="cursor-pointer text-xs font-medium py-2"
                    >
                      <CalendarCheck2 className="size-3.5 mr-2 text-slate-500" />
                      Reschedule Class
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onCancel?.(session)}
                      className="cursor-pointer text-xs font-medium py-2 text-rose-600 hover:bg-rose-50"
                    >
                      <CalendarX className="size-3.5 mr-2 text-rose-500" />
                      Cancel Session
                    </DropdownMenuItem>
                  </>
                )}

                {session.status === "pending" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onAccept?.(session)}
                      className="cursor-pointer text-xs font-medium py-2 text-orange-600 hover:bg-orange-50"
                    >
                      <CheckCircle2 className="size-3.5 mr-2 text-orange-500" />
                      Accept Request
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDecline?.(session)}
                      className="cursor-pointer text-xs font-medium py-2 text-rose-600 hover:bg-rose-50"
                    >
                      <CalendarX className="size-3.5 mr-2 text-rose-500" />
                      Decline Request
                    </DropdownMenuItem>
                  </>
                )}

                {session.status === "completed" && (
                  <DropdownMenuItem
                    onClick={() => onOpenNotes?.(session)}
                    className="cursor-pointer text-xs font-medium py-2"
                  >
                    <FileText className="size-3.5 mr-2 text-slate-500" />
                    Edit Class Notes
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Right Block: Status Pill Badge & Net Earnings */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* Status Pill Badge matching reference position */}
        <div>{getStatusBadge()}</div>

        {/* Pricing / Net Payout in PKR */}
        <div className="text-right space-y-0.5">
          <span className="text-xs sm:text-sm font-bold text-slate-900 block">
            {formatPKR(session.price)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Earns {formatPKR(session.teacherEarnings)}
          </span>
        </div>
      </div>
    </div>
  );
}
