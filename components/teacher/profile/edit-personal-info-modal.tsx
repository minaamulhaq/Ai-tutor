"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { TeacherProfileData, ProfileFormErrors } from "./types";
import { AVAILABLE_LANGUAGES, AVAILABLE_TIMEZONES } from "./profile-service";

interface EditPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfileData;
  onSave: (updates: Partial<TeacherProfileData>) => void;
}

export function EditPersonalInfoModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditPersonalInfoModalProps) {
  // Local modal form state initialized from profile
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    headline: profile?.headline || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    country: profile?.country || "",
    preferredLanguage: profile?.preferredLanguage || "English",
    timezone: profile?.timezone || "Asia/Karachi",
  });

  const [errors, setErrors] = useState<ProfileFormErrors>({});

  // Sync state whenever modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        headline: profile?.headline || "",
        phone: profile?.phone || "",
        city: profile?.city || "",
        country: profile?.country || "",
        preferredLanguage: profile?.preferredLanguage || "English",
        timezone: profile?.timezone || "Asia/Karachi",
      });
      setErrors({});
    }
  }, [isOpen, profile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ProfileFormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }
    if (!formData.headline.trim()) {
      newErrors.headline = "Professional headline is required.";
    } else if (formData.headline.trim().length < 10) {
      newErrors.headline = "Headline must be at least 10 characters.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required for SMS booking alerts.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      headline: formData.headline.trim(),
      phone: formData.phone.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      preferredLanguage: formData.preferredLanguage,
      timezone: formData.timezone,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl gap-0 border-slate-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
              <User className="size-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Edit Personal & Contact Information
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your basic identity, professional headline, and regional preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 bg-white">
          {/* Row 1: First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="modal-firstName" className="text-xs font-semibold text-slate-700">
                First Name <span className="text-orange-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="modal-firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="e.g. Alexander"
                  className={`pl-9 ${errors.firstName ? "border-rose-400" : ""}`}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] font-medium text-rose-600">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal-lastName" className="text-xs font-semibold text-slate-700">
                Last Name <span className="text-orange-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="modal-lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="e.g. Wright"
                  className={`pl-9 ${errors.lastName ? "border-rose-400" : ""}`}
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] font-medium text-rose-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Row 2: Professional Headline */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-headline" className="text-xs font-semibold text-slate-700">
                Professional Headline <span className="text-orange-500">*</span>
              </Label>
              <span className="text-[11px] text-slate-400">
                {formData.headline.length}/100 chars
              </span>
            </div>
            <Input
              id="modal-headline"
              maxLength={100}
              value={formData.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="e.g. Senior Computer Science Instructor & AI Researcher"
              className={errors.headline ? "border-rose-400" : ""}
            />
            {errors.headline ? (
              <p className="text-[11px] font-medium text-rose-600">{errors.headline}</p>
            ) : (
              <p className="text-[10px] text-slate-400">
                Displayed directly beneath your name on your profile header and search cards.
              </p>
            )}
          </div>

          {/* Row 3: Email (Secured) & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="modal-email" className="text-xs font-semibold text-slate-700">
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
                  id="modal-email"
                  disabled
                  value={profile.email}
                  className="pl-9 bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Secured login email. Contact faculty admin to update.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="modal-phone" className="text-xs font-semibold text-slate-700">
                  Phone Number <span className="text-orange-500">*</span>
                </Label>
                <span className="text-[10px] text-slate-400">SMS Alerts</span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="modal-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+92 300 1234567"
                  className={`pl-9 ${errors.phone ? "border-rose-400" : ""}`}
                />
              </div>
              {errors.phone ? (
                <p className="text-[11px] font-medium text-rose-600">{errors.phone}</p>
              ) : (
                <p className="text-[10px] text-slate-400 truncate">
                  Used for urgent SMS session reminders only.
                </p>
              )}
            </div>
          </div>

          {/* Row 4: City & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="modal-city" className="text-xs font-semibold text-slate-700">
                City <span className="text-orange-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="modal-city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="e.g. Lahore"
                  className={`pl-9 ${errors.city ? "border-rose-400" : ""}`}
                />
              </div>
              {errors.city && (
                <p className="text-[11px] font-medium text-rose-600">{errors.city}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal-country" className="text-xs font-semibold text-slate-700">
                Country <span className="text-orange-500">*</span>
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  id="modal-country"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="e.g. Pakistan"
                  className={`pl-9 ${errors.country ? "border-rose-400" : ""}`}
                />
              </div>
              {errors.country && (
                <p className="text-[11px] font-medium text-rose-600">{errors.country}</p>
              )}
            </div>
          </div>

          {/* Row 5: Preferred Language & Time Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="modal-language" className="text-xs font-semibold text-slate-700">
                Preferred Language
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <select
                  id="modal-language"
                  value={formData.preferredLanguage}
                  onChange={(e) => handleChange("preferredLanguage", e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 shadow-2xs focus-visible:outline-none focus-visible:border-orange-500"
                >
                  {AVAILABLE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Platform language for notifications and emails.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modal-timezone" className="text-xs font-semibold text-slate-700">
                Time Zone <span className="text-orange-500">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <select
                  id="modal-timezone"
                  value={formData.timezone}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 shadow-2xs focus-visible:outline-none focus-visible:border-orange-500"
                >
                  {AVAILABLE_TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                All booking slots and calendar sync to this timezone.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl border-slate-200 text-slate-700 text-xs h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 px-5 font-semibold cursor-pointer shadow-xs"
            >
              Update Information
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
