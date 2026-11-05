"use client";

import React from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSettingsState } from "../types";

interface NotificationsSectionProps {
  settings: StudentSettingsState;
  onChange: <K extends keyof StudentSettingsState>(
    key: K,
    value: StudentSettingsState[K]
  ) => void;
}

export function NotificationsSection({
  settings,
  onChange,
}: NotificationsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Bell className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Notification & Class Alert Preferences
            </h2>
            <p className="text-xs text-slate-500">
              Control where and when you receive updates about class schedules and messages.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* WhatsApp Alerts */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                WhatsApp 1-Click Meeting Join Reminders
              </span>
              <span className="text-xs text-slate-500">
                Receive direct meeting link alerts via WhatsApp to {settings.whatsappNumber || "your registered number"}
              </span>
            </div>
            <Switch
              checked={settings.whatsappClassAlerts}
              onCheckedChange={(val) => onChange("whatsappClassAlerts", val)}
            />
          </div>

          {/* Email Lesson Reminders */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Email Lesson Reminders & Calendar Invites
              </span>
              <span className="text-xs text-slate-500">
                Sync lesson events and receive email reminders to {settings.email}
              </span>
            </div>
            <Switch
              checked={settings.emailLessonReminders}
              onCheckedChange={(val) => onChange("emailLessonReminders", val)}
            />
          </div>

          {/* Tutor Messages Alerts */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Instant Chat & Homework Alerts
              </span>
              <span className="text-xs text-slate-500">
                Get notified whenever a tutor sends homework notes, study guides, or direct messages.
              </span>
            </div>
            <Switch
              checked={settings.whatsappTutorMessages}
              onCheckedChange={(val) => onChange("whatsappTutorMessages", val)}
            />
          </div>

          {/* Weekly Learning Digest */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Weekly Study Progress Digest
              </span>
              <span className="text-xs text-slate-500">
                Receive a weekly Sunday email summarizing hours studied, streak status, and homework feedback.
              </span>
            </div>
            <Switch
              checked={settings.emailWeeklyDigest}
              onCheckedChange={(val) => onChange("emailWeeklyDigest", val)}
            />
          </div>

          {/* Promotional Tips */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Exam Preparation Tips & Platform Updates
              </span>
              <span className="text-xs text-slate-500">
                Occasional emails with study hack guides, exam countdown tips, and new subject offerings.
              </span>
            </div>
            <Switch
              checked={settings.promotionalAnnouncements}
              onCheckedChange={(val) => onChange("promotionalAnnouncements", val)}
            />
          </div>

          {/* Reminder Notice Time Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Class Reminder Alert Timing
              </span>
              <span className="text-xs text-slate-500">
                How far in advance would you like to receive your pre-session reminder
              </span>
            </div>
            <Select
              value={String(settings.reminderNoticeMinutes)}
              onValueChange={(val) => onChange("reminderNoticeMinutes", Number(val))}
            >
              <SelectTrigger className="w-40 rounded-xl border-slate-200 h-9 text-xs font-semibold bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
