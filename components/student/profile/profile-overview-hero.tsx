"use client";

import React, { useRef, useState } from "react";
import {
  Camera,
  MapPin,
  Calendar,
  GraduationCap,
  Sparkles,
  Edit3,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  School,
  Loader2,
  Trash2,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  StudentProfileData,
  StudentProfileCompletionResult,
} from "./types";
import { apiUploadStudentAvatar } from "./student-profile-service";

interface ProfileOverviewHeroProps {
  profile: StudentProfileData;
  completion: StudentProfileCompletionResult;
  onOpenEditModal: () => void;
  onAvatarUpdated: (newAvatarUrl: string) => void;
  onResetToDefault: () => void;
  isSaving?: boolean;
}

export function ProfileOverviewHero({
  profile,
  completion,
  onOpenEditModal,
  onAvatarUpdated,
  onResetToDefault,
  isSaving = false,
}: ProfileOverviewHeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showCompletionDetails, setShowCompletionDetails] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const newUrl = await apiUploadStudentAvatar(file);
      onAvatarUpdated(newUrl);
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    onAvatarUpdated("");
  };

  const getInitials = (name?: string): string => {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(profile.fullName);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
      {/* 1. Header: Avatar + Details on Left, Edit & Reset Action Buttons on Right (NO BG PICTURE) */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left: Avatar + Details */}
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar with Camera upload & Remove photo options */}
          <div className="relative group shrink-0 self-center sm:self-start">
            <Avatar className="size-24 sm:size-28 ring-4 ring-slate-100 shadow-md bg-white">
              <AvatarImage
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="object-cover"
              />
              <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-2xl sm:text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Camera Overlay on Hover */}
            <button
              type="button"
              disabled={isUploadingPhoto}
              onClick={handlePhotoClick}
              className="absolute inset-0 rounded-full bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-2xs"
              aria-label="Upload profile photo"
            >
              {isUploadingPhoto ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <Camera className="size-5 mb-0.5" />
                  <span className="text-[10px] font-semibold">Change</span>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {profile.avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                title="Remove photo"
                className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 shadow-xs transition-colors cursor-pointer"
              >
                <Trash2 className="size-3" />
              </button>
            )}
          </div>

          {/* Student Core Details */}
          <div className="space-y-2 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {profile.fullName}
              </h1>
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded-full"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                Active Student
              </Badge>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium"
              >
                Ref: {profile.accountReference}
              </Badge>
            </div>

            <p className="text-sm font-medium text-slate-600">
              {profile.tagline || `${profile.academicLevel} • ${profile.examinationBoard}`}
            </p>

            {profile.bio && (
              <p className="text-xs text-slate-500 max-w-2xl line-clamp-2 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Meta details badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 pt-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-orange-500" />
                <strong className="text-slate-700">{profile.academicLevel}</strong>
                <span className="text-slate-400">({profile.examinationBoard})</span>
              </span>

              {profile.institution && (
                <span className="inline-flex items-center gap-1.5">
                  <School className="size-3.5 text-slate-400" />
                  <span>{profile.institution}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-slate-400" />
                <span>
                  {profile.city}, {profile.country}
                </span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-slate-400" />
                <span>{profile.timezone}</span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5 text-slate-400" />
                <span className="text-slate-600">{profile.email}</span>
              </span>

              {profile.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-400" />
                  <span className="text-slate-600">{profile.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center justify-center sm:justify-end gap-2.5 shrink-0 self-center lg:self-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetToDefault}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer h-9 px-3.5"
            title="Reset profile data to demo defaults"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset
          </Button>

          <Button
            type="button"
            onClick={onOpenEditModal}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs font-semibold cursor-pointer h-9 px-4 text-xs"
          >
            <Edit3 className="size-3.5 mr-1.5" />
            Edit Personal Info
          </Button>
        </div>
      </div>

      {/* 2. Profile Strength / Completeness Bar (No background picture, clean border) */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Profile Completeness
            </span>
            <button
              type="button"
              onClick={() => setShowCompletionDetails(!showCompletionDetails)}
              className="text-xs text-orange-600 hover:text-orange-700 font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>{completion.percentage}% Completed</span>
              <HelpCircle className="size-3" />
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {completion.completedCount} of {completion.totalCount} sections verified
          </span>
        </div>

        <Progress
          value={completion.percentage}
          className="h-2 rounded-full bg-slate-100"
        />

        {/* Collapsible Missing Checklist */}
        {showCompletionDetails && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              {completion.percentage === 100 ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span>Your student profile is 100% complete!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="size-4 text-amber-500" />
                  <span>Complete these items to strengthen your student profile:</span>
                </>
              )}
            </div>

            {completion.missingItems.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 pl-1">
                {completion.missingItems.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-slate-700">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
