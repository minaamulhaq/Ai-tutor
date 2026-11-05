"use client";

import React from "react";
import { User, Mail, Phone, MapPin, Globe, Clock, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherProfileData, ProfileFormErrors } from "./types";
import { AVAILABLE_LANGUAGES, AVAILABLE_TIMEZONES } from "./profile-service";

interface PersonalInfoCardProps {
  profile: TeacherProfileData;
  errors: ProfileFormErrors;
  onChange: (updates: Partial<TeacherProfileData>) => void;
}

export function PersonalInfoCard({
  profile,
  errors,
  onChange,
}: PersonalInfoCardProps) {
  return (
    <div
      id="personal-info-section"
      className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6 scroll-mt-20"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
          <User className="size-4.5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            Personal Information
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Your basic contact details and regional preferences. Private details are never exposed to students.
          </p>
        </div>
      </div>

      {/* Form Fields: Two Column Grid with Precise Baseline Alignment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Row 1, Col 1: First Name */}
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700 block">
            First Name <span className="text-orange-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="firstName"
              type="text"
              value={profile.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              placeholder="e.g. Alexander"
              className={`pl-9 ${errors.firstName ? "border-rose-400 focus-visible:border-rose-500" : ""}`}
            />
          </div>
          {errors.firstName && (
            <p className="text-[11px] font-medium text-rose-600">{errors.firstName}</p>
          )}
        </div>

        {/* Row 1, Col 2: Last Name */}
        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700 block">
            Last Name <span className="text-orange-500">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="lastName"
              type="text"
              value={profile.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="e.g. Wright"
              className={`pl-9 ${errors.lastName ? "border-rose-400 focus-visible:border-rose-500" : ""}`}
            />
          </div>
          {errors.lastName && (
            <p className="text-[11px] font-medium text-rose-600">{errors.lastName}</p>
          )}
        </div>

        {/* Row 2, Col 1: Email Address (Secured) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between h-4">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
              Email Address
            </Label>
            {profile.isEmailVerified && (
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="size-3" />
                Verified
              </span>
            )}
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              disabled
              value={profile.email}
              className="pl-9 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-slate-400 h-4 truncate">
            Managed via authentication security. Contact faculty admin to update.
          </p>
        </div>

        {/* Row 2, Col 2: Phone Number */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between h-4">
            <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
              Phone Number <span className="text-orange-500">*</span>
            </Label>
            <span className="text-[10px] text-slate-400 font-medium">SMS Alerts</span>
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="phone"
              type="tel"
              value={profile.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="+92 300 1234567"
              className={`pl-9 ${errors.phone ? "border-rose-400 focus-visible:border-rose-500" : ""}`}
            />
          </div>
          {errors.phone ? (
            <p className="text-[11px] font-medium text-rose-600 h-4">{errors.phone}</p>
          ) : (
            <p className="text-[10px] text-slate-400 h-4 truncate">
              Used for urgent SMS session reminders only.
            </p>
          )}
        </div>

        {/* Row 3, Col 1: City */}
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs font-semibold text-slate-700 block">
            City <span className="text-orange-500">*</span>
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="city"
              type="text"
              value={profile.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="e.g. Lahore"
              className={`pl-9 ${errors.city ? "border-rose-400" : ""}`}
            />
          </div>
          {errors.city && (
            <p className="text-[11px] font-medium text-rose-600">{errors.city}</p>
          )}
        </div>

        {/* Row 3, Col 2: Country */}
        <div className="space-y-1.5">
          <Label htmlFor="country" className="text-xs font-semibold text-slate-700 block">
            Country <span className="text-orange-500">*</span>
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              id="country"
              type="text"
              value={profile.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="e.g. Pakistan"
              className={`pl-9 ${errors.country ? "border-rose-400" : ""}`}
            />
          </div>
          {errors.country && (
            <p className="text-[11px] font-medium text-rose-600">{errors.country}</p>
          )}
        </div>

        {/* Row 4, Col 1: Preferred Language */}
        <div className="space-y-1.5">
          <Label htmlFor="preferredLanguage" className="text-xs font-semibold text-slate-700 block">
            Preferred Language
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <select
              id="preferredLanguage"
              value={profile.preferredLanguage}
              onChange={(e) => onChange({ preferredLanguage: e.target.value })}
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 shadow-2xs focus-visible:outline-none focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500"
            >
              {AVAILABLE_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-slate-400 h-4 truncate">
            Primary language for platform notifications.
          </p>
        </div>

        {/* Row 4, Col 2: Time Zone */}
        <div className="space-y-1.5">
          <Label htmlFor="timezone" className="text-xs font-semibold text-slate-700 block">
            Time Zone <span className="text-orange-500">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <select
              id="timezone"
              value={profile.timezone}
              onChange={(e) => onChange({ timezone: e.target.value })}
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 shadow-2xs focus-visible:outline-none focus-visible:border-orange-500 focus-visible:ring-1 focus-visible:ring-orange-500"
            >
              {AVAILABLE_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-slate-400 h-4 truncate">
            All your class bookings and availability sync to this time zone.
          </p>
        </div>
      </div>
    </div>
  );
}
