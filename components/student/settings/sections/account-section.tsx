"use client";

import React from "react";
import { User, Mail, Phone, Clock, Globe, ShieldCheck, HeartHandshake } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSettingsState } from "../types";
import { AVAILABLE_TIMEZONES } from "@/components/student/profile/student-profile-service";

interface AccountSectionProps {
  settings: StudentSettingsState;
  onChange: <K extends keyof StudentSettingsState>(
    key: K,
    value: StudentSettingsState[K]
  ) => void;
}

export function AccountSection({ settings, onChange }: AccountSectionProps) {
  return (
    <div className="space-y-6">
      {/* Account Profile Details */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <User className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Student Account Profile</h2>
            <p className="text-xs text-slate-500">
              Manage your display name, contact credentials, and regional settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">First Name</Label>
            <Input
              value={settings.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              className="rounded-xl border-slate-200 h-10 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Last Name</Label>
            <Input
              value={settings.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              className="rounded-xl border-slate-200 h-10 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">Account Email</Label>
              <span className="text-3xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="size-3" /> Verified
              </span>
            </div>
            <div className="relative">
              <Mail className="size-4 text-slate-400 absolute left-3 top-3" />
              <Input
                value={settings.email}
                onChange={(e) => onChange("email", e.target.value)}
                className="pl-9 rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Primary Phone</Label>
            <div className="relative">
              <Phone className="size-4 text-slate-400 absolute left-3 top-3" />
              <Input
                value={settings.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="pl-9 rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">WhatsApp Number</Label>
            <Input
              value={settings.whatsappNumber}
              onChange={(e) => onChange("whatsappNumber", e.target.value)}
              placeholder="+92 3XX XXXXXXX"
              className="rounded-xl border-slate-200 h-10 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Display Timezone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(val) => onChange("timezone", val)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value} className="text-xs">
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Parent Copy Toggle */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/90 bg-slate-50/70">
            <div className="flex items-start gap-3">
              <HeartHandshake className="size-5 text-orange-600 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 block">
                  Send Lesson Booking Receipts to Parent / Guardian
                </span>
                <span className="text-xs text-slate-500">
                  Automatically send class schedules, booking confirmations, and tutor updates to your guardian.
                </span>
              </div>
            </div>
            <Switch
              checked={settings.parentEmailNotificationCopy}
              onCheckedChange={(val) => onChange("parentEmailNotificationCopy", val)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
