"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  CheckCircle2,
  CalendarDays,
  CalendarX,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassSession, formatPKR } from "@/components/teacher/classes/types";

interface StudentClassesTabProps {
  classes: ClassSession[];
}

export function StudentClassesTab({ classes }: StudentClassesTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredClasses = useMemo(() => {
    if (statusFilter === "all") return classes;
    return classes.filter((c) => c.status === statusFilter);
  }, [classes, statusFilter]);

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  // Counts for pill buttons
  const counts = {
    all: classes.length,
    confirmed: classes.filter((c) => c.status === "confirmed").length,
    pending: classes.filter((c) => c.status === "pending").length,
    completed: classes.filter((c) => c.status === "completed").length,
    cancelled: classes.filter((c) => c.status === "cancelled").length,
  };

  return (
    <div className="space-y-5">
      {/* Status Filter Pill Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: "all", label: "All Sessions", count: counts.all },
          { key: "confirmed", label: "Confirmed", count: counts.confirmed },
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "completed", label: "Completed", count: counts.completed },
          { key: "cancelled", label: "Cancelled", count: counts.cancelled },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? "bg-orange-500 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Classes List */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-10 text-center space-y-2">
          <CalendarDays className="size-8 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">
            No classes found
          </h4>
          <p className="text-xs text-slate-500">
            No session records match the selected &quot;{statusFilter}&quot; status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredClasses.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="bg-orange-50 text-orange-700 border-orange-200 text-[11px] font-semibold"
                  >
                    {session.subject}
                  </Badge>
                  {getStatusBadge(session.status)}
                  <span className="text-[11px] font-mono text-slate-400">
                    #{session.bookingReference}
                  </span>
                </div>

                <h4 className="font-bold text-base text-slate-900 leading-snug">
                  {session.topicTitle}
                </h4>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 pt-0.5">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5 text-orange-500 shrink-0" />
                    <span>{formatDate(session.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="size-3.5 text-slate-400 shrink-0" />
                    <span>
                      {formatTime(session.startTime)} – {formatTime(session.endTime)} ({session.durationMinutes}m)
                    </span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    {formatPKR(session.price)}
                  </div>
                </div>

                {/* Cancelled reason if any */}
                {session.status === "cancelled" && session.cancellationReason && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 pt-1">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>Reason: {session.cancellationReason}</span>
                  </p>
                )}

                {/* Completed teacher note preview if any */}
                {session.status === "completed" && session.teacherNotes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-2xl mt-1">
                    <span className="font-semibold text-slate-700">Class Note: </span>
                    {session.teacherNotes}
                  </p>
                )}
              </div>

              {/* Right Action */}
              <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {session.status === "confirmed" && session.meetingUrl && (
                  <Button
                    size="sm"
                    onClick={() => window.open(session.meetingUrl, "_blank")}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs h-9 rounded-xl gap-1.5 shadow-2xs cursor-pointer w-full sm:w-auto"
                  >
                    <Video className="size-3.5" />
                    <span>Join Class</span>
                    <ExternalLink className="size-3 opacity-80" />
                  </Button>
                )}

                {session.status === "pending" && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    Awaiting Response
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
