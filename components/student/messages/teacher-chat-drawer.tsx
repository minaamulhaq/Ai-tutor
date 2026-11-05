"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  ShieldCheck,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  Lock,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/types/message";

interface TeacherChatDrawerProps {
  conversation: Conversation;
  onClose: () => void;
}

export function TeacherChatDrawer({
  conversation,
  onClose,
}: TeacherChatDrawerProps) {
  const initials = conversation.teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
          Instructor Details
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close details"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-5 space-y-5 flex-1">
        {/* Profile Card */}
        <div className="text-center space-y-2">
          <Avatar className="size-20 mx-auto rounded-2xl ring-4 ring-slate-100">
            <AvatarImage src={conversation.teacherAvatarUrl} alt={conversation.teacherName} />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1.5">
              <h4 className="font-bold text-base text-slate-900">
                {conversation.teacherName}
              </h4>
              {conversation.isVerified && (
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 px-2">
              {conversation.teacherHeadline}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[11px] font-bold">
              {conversation.teacherSubject}
            </Badge>
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border border-orange-200/60 text-[11px] font-bold">
              PKR {conversation.teacherHourlyRate.toLocaleString()}/hr
            </Badge>
          </div>
        </div>

        {/* Upcoming Session Widget if exists */}
        {conversation.upcomingClass ? (
          <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900">
              <Calendar className="size-3.5 text-orange-600" />
              <span>Upcoming Confirmed Session</span>
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {conversation.upcomingClass.topic}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <Clock className="size-3 text-orange-500" />
              <span>{conversation.upcomingClass.date} • {conversation.upcomingClass.time}</span>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs font-bold border-orange-300 text-orange-800 hover:bg-orange-100 mt-1"
            >
              <Link href="/student/classes">View in Schedule</Link>
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-700">No active sessions booked</p>
            <p className="text-[11px] text-slate-500">
              Ready to learn? Lock in your next 1-on-1 slot with {conversation.teacherName.split(" ")[0]}.
            </p>
            <Button
              asChild
              size="sm"
              className="w-full h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
            >
              <Link href={`/student/teachers/${conversation.teacherId}`}>
                Book a Session
              </Link>
            </Button>
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <Button
            asChild
            variant="outline"
            className="w-full h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 justify-between"
          >
            <Link href={`/student/teachers/${conversation.teacherId}`}>
              <span>View Full Profile</span>
              <ExternalLink className="size-3.5 text-slate-400" />
            </Link>
          </Button>
        </div>

        {/* Safety Note */}
        <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700 flex items-center gap-1">
            <Lock className="size-3 text-emerald-600" />
            Student Protection Policy
          </p>
          <p>
            Keep all bookings and payments inside ZuhDemy to qualify for session guarantees and free tutor rescheduling.
          </p>
        </div>
      </div>
    </div>
  );
}
