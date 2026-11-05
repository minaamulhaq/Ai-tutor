"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  MessageSquare,
  Sparkles,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StudentProfileData,
  StudentProfileErrors,
} from "./types";
import {
  AVAILABLE_TIMEZONES,
  AVAILABLE_LANGUAGES,
} from "./student-profile-service";

interface PersonalInfoTabProps {
  profile: StudentProfileData;
  errors: StudentProfileErrors;
  onUpdateField: <K extends keyof StudentProfileData>(
    field: K,
    value: StudentProfileData[K]
  ) => void;
}

export function PersonalInfoTab({
  profile,
  errors,
  onUpdateField,
}: PersonalInfoTabProps) {
  const toggleLanguage = (lang: string) => {
    const current = profile.preferredLanguages || [];
    const exists = current.includes(lang);
    if (exists) {
      if (current.length > 1) {
        onUpdateField(
          "preferredLanguages",
          current.filter((l) => l !== lang)
        );
      }
    } else {
      onUpdateField("preferredLanguages", [...current, lang]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Identity Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <User className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">
              Basic identification details visible to your confirmed instructors and platform staff.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) => onUpdateField("fullName", e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500 font-medium">{errors.fullName}</p>
            )}
          </div>

          {/* Tagline / Headline */}
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="tagline" className="text-xs font-semibold text-slate-700">
              Headline / Student Tagline
            </Label>
            <Input
              id="tagline"
              value={profile.tagline}
              onChange={(e) => onUpdateField("tagline", e.target.value)}
              placeholder="e.g. High School Senior & Aspiring Software Engineer"
              className="rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
            />
          </div>

          {/* Bio / About Me */}
          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-xs font-semibold text-slate-700">
                Short Bio / Introduction
              </Label>
              <span className="text-2xs text-slate-400">
                {profile.bio?.length || 0} / 500 characters
              </span>
            </div>
            <Textarea
              id="bio"
              rows={3}
              value={profile.bio}
              onChange={(e) => onUpdateField("bio", e.target.value)}
              placeholder="Tell tutors about your background, subjects you love, and where you're heading..."
              className="rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm resize-none"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-xs font-semibold text-slate-700">
              Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={profile.dateOfBirth || ""}
              onChange={(e) => onUpdateField("dateOfBirth", e.target.value)}
              className="rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-xs font-semibold text-slate-700">
              Gender
            </Label>
            <Select
              value={profile.gender || "Female"}
              onValueChange={(val) => onUpdateField("gender", val)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-11 text-sm">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact & Regional Info Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Phone className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Contact & Timezone</h2>
            <p className="text-xs text-slate-500">
              Used for lesson notifications, Google Meet invitations, and class reminders.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => onUpdateField("email", e.target.value)}
                placeholder="name@example.com"
                className="pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
              Contact Phone Number
            </Label>
            <div className="relative">
              <Phone className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => onUpdateField("phone", e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-xs font-semibold text-slate-700">
              WhatsApp Number (for instant class reminders)
            </Label>
            <div className="relative">
              <MessageSquare className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="whatsapp"
                value={profile.whatsappNumber}
                onChange={(e) => onUpdateField("whatsappNumber", e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-xs font-semibold text-slate-700">
              Primary Timezone
            </Label>
            <Select
              value={profile.timezone}
              onValueChange={(val) => onUpdateField("timezone", val)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-11 text-sm">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-xs font-semibold text-slate-700">
              City
            </Label>
            <div className="relative">
              <MapPin className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => onUpdateField("city", e.target.value)}
                placeholder="e.g. Lahore, Karachi, Islamabad"
                className="pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-xs font-semibold text-slate-700">
              Country
            </Label>
            <div className="relative">
              <Globe className="size-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <Input
                id="country"
                value={profile.country}
                onChange={(e) => onUpdateField("country", e.target.value)}
                placeholder="e.g. Pakistan, UAE, UK"
                className="pl-10 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-sm h-11"
              />
            </div>
          </div>
        </div>

        {/* Preferred Languages Multi-select */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5">
          <Label className="text-xs font-semibold text-slate-700 block">
            Languages You Feel Comfortable Learning In
          </Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((lang) => {
              const isSelected = profile.preferredLanguages?.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
