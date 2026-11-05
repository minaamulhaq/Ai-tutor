"use client";

import React, { useRef, useState } from "react";
import {
  ShieldCheck,
  Camera,
  ExternalLink,
  Pencil,
  AlertCircle,
  Loader2,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Globe,
  Clock,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TeacherProfileData } from "./types";
import { calculateProfileCompletion } from "./profile-service";

interface ProfileOverviewCardProps {
  profile: TeacherProfileData;
  onPhotoUpload: (file: File) => Promise<void>;
  onPhotoRemove: () => void;
  onPreviewClick: () => void;
  onEditClick: () => void;
}

export function ProfileOverviewCard({
  profile,
  onPhotoUpload,
  onPhotoRemove,
  onPreviewClick,
  onEditClick,
}: ProfileOverviewCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isStrengthOpen, setIsStrengthOpen] = useState(false);

  const completion = calculateProfileCompletion(profile);
  const initials = `${(profile?.firstName || "A").charAt(0)}${(profile?.lastName || "W").charAt(0)}`.toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      await onPhotoUpload(file);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError("Failed to upload image. Please try again.");
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
      {/* 1. Main Header: Avatar + Details on Left, Only Edit & Preview Buttons on Right */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        {/* Left Section: Avatar + Name + Headline + Contact info & Time zone */}
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar with Camera upload & Remove photo options */}
          <div className="relative group shrink-0">
            <Avatar className="size-24 sm:size-28 ring-4 ring-slate-100 shadow-md bg-white">
              <AvatarImage
                src={profile.avatarUrl}
                alt={`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Teacher Profile"}
              />
              <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-2xl sm:text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Camera Overlay on Hover */}
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-2xs"
              aria-label="Upload profile photo"
            >
              {isUploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Camera className="size-5" />
                  <span className="text-[10px] font-semibold mt-0.5">Change</span>
                </>
              )}
            </button>

            {/* Remove custom photo button */}
            {profile.avatarUrl && (
              <button
                type="button"
                onClick={onPhotoRemove}
                title="Remove photo"
                className="absolute bottom-0 right-0 size-7 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center shadow-md cursor-pointer transition-colors"
                aria-label="Remove profile photo"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name, Headline, Contact info & Time zone */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {profile?.firstName || "Alexander"} {profile?.lastName || "Wright"}
              </h2>
              {profile.isEmailVerified && (
                <Badge
                  variant="outline"
                  className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs gap-1 font-semibold py-0.5"
                >
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Verified Faculty
                </Badge>
              )}
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-700 leading-snug max-w-2xl">
              {profile.headline || "Online Academic Tutor & Instructor"}
            </p>

            {/* Contact info & Time zone action link */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-slate-400" />
                {profile.city}, {profile.country}
              </span>

              <span>•</span>

              <span className="flex items-center gap-1">
                <Clock className="size-3.5 text-slate-400" />
                {profile.timezone}
              </span>

              <span>•</span>

              <button
                type="button"
                onClick={onEditClick}
                className="inline-flex items-center gap-1 text-orange-600 font-semibold hover:text-orange-700 hover:underline cursor-pointer"
              >
                <Globe className="size-3.5" />
                <span>Contact info & Time zone</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Only Preview Public Profile & Edit Profile buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto pt-2 sm:pt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreviewClick}
            className="h-9 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-200 text-xs font-semibold gap-1.5 shadow-2xs cursor-pointer"
          >
            <ExternalLink className="size-3.5" />
            <span>Preview</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onEditClick}
            className="h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer"
          >
            <Pencil className="size-3.5" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertCircle className="size-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* 2. Dropdown / Accordion for Profile Strength */}
      <div className="pt-4 border-t border-slate-100">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 overflow-hidden transition-all">
          {/* Clickable Header for Dropdown */}
          <button
            type="button"
            onClick={() => setIsStrengthOpen((prev) => !prev)}
            className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
            aria-expanded={isStrengthOpen}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-lg bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0">
                <Sparkles className="size-3.5" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                <span>Profile Strength: </span>
                <span className="text-orange-600">
                  {completion.percentage === 100
                    ? "All-Star (100%)"
                    : completion.percentage >= 80
                    ? `Advanced (${completion.percentage}%)`
                    : `Intermediate (${completion.percentage}%)`}
                </span>
                <span className="text-slate-400 font-normal ml-2 hidden sm:inline">
                  • {completion.completedFields} of {completion.totalFields} fields completed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-500 font-medium sm:hidden">
                {completion.completedFields}/{completion.totalFields}
              </span>
              <div
                className={`size-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 transition-transform duration-200 ${
                  isStrengthOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDown className="size-3.5" />
              </div>
            </div>
          </button>

          {/* Collapsible Dropdown Content with Progress Bar */}
          {isStrengthOpen && (
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-200/60 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
                <span>Completion Status</span>
                <span className="font-bold text-slate-900">{completion.percentage}%</span>
              </div>

              {/* Progress Bar under that */}
              <Progress value={completion.percentage} className="h-2.5 rounded-full" />

              {completion.missingFields.length > 0 ? (
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  <span className="font-semibold text-slate-700">Suggested additions: </span>
                  {completion.missingFields.slice(0, 3).join(", ")}
                  {completion.missingFields.length > 3 &&
                    ` and ${completion.missingFields.length - 3} more`}.{" "}
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="text-orange-600 font-semibold hover:underline cursor-pointer"
                  >
                    Complete profile →
                  </button>
                </p>
              ) : (
                <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  Your faculty profile is fully optimized for student bookings and searches.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
