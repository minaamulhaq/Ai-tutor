"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentProfileData } from "./types";
import {
  AVAILABLE_TIMEZONES,
  AVAILABLE_LANGUAGES,
} from "./student-profile-service";
import { UserCheck, MapPin, Globe, Clock, Phone, Mail } from "lucide-react";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfileData;
  onSave: (updated: Partial<StudentProfileData>) => void;
}

export function EditStudentModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || "",
    tagline: profile?.tagline || "",
    bio: profile?.bio || "",
    dateOfBirth: profile?.dateOfBirth || "",
    gender: profile?.gender || "Female",
    phone: profile?.phone || "",
    whatsappNumber: profile?.whatsappNumber || "",
    city: profile?.city || "",
    country: profile?.country || "",
    timezone: profile?.timezone || "Asia/Karachi",
    preferredLanguages: profile?.preferredLanguages || ["English", "Urdu"],
  });

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        fullName: profile.fullName || "",
        tagline: profile.tagline || "",
        bio: profile.bio || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "Female",
        phone: profile.phone || "",
        whatsappNumber: profile.whatsappNumber || "",
        city: profile.city || "",
        country: profile.country || "",
        timezone: profile.timezone || "Asia/Karachi",
        preferredLanguages: profile.preferredLanguages || ["English", "Urdu"],
      });
    }
  }, [isOpen, profile]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (lang: string) => {
    const current = formData.preferredLanguages || [];
    const exists = current.includes(lang);
    if (exists) {
      if (current.length > 1) {
        handleChange(
          "preferredLanguages",
          current.filter((l) => l !== lang)
        );
      }
    } else {
      handleChange("preferredLanguages", [...current, lang]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const isDirty =
    formData.fullName !== (profile?.fullName || "") ||
    formData.tagline !== (profile?.tagline || "") ||
    formData.bio !== (profile?.bio || "") ||
    formData.dateOfBirth !== (profile?.dateOfBirth || "") ||
    formData.gender !== (profile?.gender || "Female") ||
    formData.phone !== (profile?.phone || "") ||
    formData.whatsappNumber !== (profile?.whatsappNumber || "") ||
    formData.city !== (profile?.city || "") ||
    formData.country !== (profile?.country || "") ||
    formData.timezone !== (profile?.timezone || "Asia/Karachi") ||
    JSON.stringify(formData.preferredLanguages || []) !==
      JSON.stringify(profile?.preferredLanguages || ["English", "Urdu"]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-7">
        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <UserCheck className="size-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Edit Personal & Contact Information
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Update your personal details, contact numbers, and location settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Full Name <span className="text-orange-600">*</span>
            </Label>
            <Input
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="rounded-xl border-slate-200 h-10 text-xs"
              required
            />
          </div>

          {/* Student Tagline */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Headline / Student Tagline
            </Label>
            <Input
              value={formData.tagline}
              onChange={(e) => handleChange("tagline", e.target.value)}
              placeholder="e.g. High School Senior & Aspiring Software Engineer"
              className="rounded-xl border-slate-200 h-10 text-xs"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                Bio / About Me
              </Label>
              <span className="text-2xs text-slate-400">
                {formData.bio?.length || 0}/500
              </span>
            </div>
            <Textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Introduce yourself to prospective tutors..."
              className="rounded-xl border-slate-200 text-xs resize-none"
            />
          </div>

          {/* Contact Numbers Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Phone Number
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                WhatsApp Number (for class alerts)
              </Label>
              <Input
                value={formData.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(val) => handleChange("gender", val)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female" className="text-xs">Female</SelectItem>
                  <SelectItem value="Male" className="text-xs">Male</SelectItem>
                  <SelectItem value="Prefer not to say" className="text-xs">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">City</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Lahore"
                className="rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Country</Label>
              <Input
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder="Pakistan"
                className="rounded-xl border-slate-200 h-10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(val) => handleChange("timezone", val)}
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

          {/* Preferred Languages */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-slate-700 block">
              Preferred Learning Languages
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = formData.preferredLanguages?.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl border-slate-200 text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs h-9 px-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Details
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
