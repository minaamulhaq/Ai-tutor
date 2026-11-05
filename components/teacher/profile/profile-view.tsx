"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TeacherProfileData,
  ProfileFormErrors,
} from "./types";
import {
  apiFetchTeacherProfile,
  apiUpdateTeacherProfile,
  apiUploadProfilePhoto,
} from "./profile-service";
import { ProfileOverviewCard } from "./profile-overview-card";
import { ProfessionalDetailsCard } from "./professional-details-card";
import { TeachingPreferencesCard } from "./teaching-preferences-card";
import { ExperienceCard } from "./experience-card";
import { EducationCard } from "./education-card";
import { CertificatesCard } from "./certificates-card";
import { AccountInfoCard } from "./account-info-card";
import { EditPersonalInfoModal } from "./edit-personal-info-modal";
import { PublicProfilePreviewModal } from "./public-profile-preview-modal";
import { ProfileSkeleton } from "./profile-skeleton";

export function TeacherProfileView() {
  const [initialData, setInitialData] = useState<TeacherProfileData | null>(null);
  const [formData, setFormData] = useState<TeacherProfileData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditPersonalInfoOpen, setIsEditPersonalInfoOpen] = useState(false);

  // Load initial profile data
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await apiFetchTeacherProfile();
      setInitialData(data);
      setFormData(data);
    } catch (err: unknown) {
      console.error("Failed to load profile:", err);
      setLoadError("Unable to retrieve teacher profile. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle field updates & automatic persistence
  const handleFormChange = async (updates: Partial<TeacherProfileData>) => {
    if (!formData) return;
    const merged = { ...formData, ...updates };
    setFormData(merged);
    setInitialData(merged);

    // Clear field-level error when user edits
    if (Object.keys(updates).length > 0) {
      const fieldKey = Object.keys(updates)[0];
      setErrors((prev) => {
        if (!prev[fieldKey]) return prev;
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      });
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await apiUpdateTeacherProfile(merged);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Profile auto-save error:", err);
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Photo upload handler
  const handlePhotoUpload = async (file: File) => {
    const res = await apiUploadProfilePhoto(file);
    handleFormChange({ avatarUrl: res.url });
  };

  // Photo remove handler
  const handlePhotoRemove = () => {
    handleFormChange({ avatarUrl: "" });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Global Success / Saving / Error Banners */}
      {isSaving && (
        <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200 text-orange-900 text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <Loader2 className="size-4 text-orange-600 animate-spin" />
          <span>Saving updates...</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>Profile updated successfully! Changes are live across ZuhDemy.</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-rose-700 hover:text-rose-950 font-bold ml-2 cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <ProfileSkeleton />
      ) : loadError ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="size-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-bold text-base text-slate-900">Unable to load profile</h3>
            <p className="text-xs text-slate-500">{loadError}</p>
          </div>
          <Button
            type="button"
            onClick={loadProfile}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 px-4 cursor-pointer"
          >
            Try Again
          </Button>
        </div>
      ) : formData ? (
        <div className="space-y-6">
          {/* Top Hero Section: LinkedIn-style Profile Header Card */}
          <ProfileOverviewCard
            profile={formData}
            onPhotoUpload={handlePhotoUpload}
            onPhotoRemove={handlePhotoRemove}
            onPreviewClick={() => setIsPreviewOpen(true)}
            onEditClick={() => setIsEditPersonalInfoOpen(true)}
          />

          {/* 1. Professional Details Card (About Me, Subjects, Languages) */}
          <ProfessionalDetailsCard
            profile={formData}
            errors={errors}
            onChange={handleFormChange}
          />

          {/* 2. Teaching Preferences Card (Student Levels, Duration, Delivery, Rate, Schedule, Meet) */}
          <TeachingPreferencesCard
            profile={formData}
            onChange={handleFormChange}
          />

          {/* 3. Teaching & Professional Experience Card */}
          <ExperienceCard
            profile={formData}
            onChange={handleFormChange}
          />

          {/* 4. Education & Academic Degrees Card */}
          <EducationCard
            profile={formData}
            errors={errors}
            onChange={handleFormChange}
          />

          {/* 5. Licenses & Certifications Card */}
          <CertificatesCard
            profile={formData}
            onChange={handleFormChange}
          />

          {/* 6. Account & Security Settings Card */}
          <AccountInfoCard profile={formData} />

          {/* Edit Personal Information Popup Modal */}
          <EditPersonalInfoModal
            isOpen={isEditPersonalInfoOpen}
            onClose={() => setIsEditPersonalInfoOpen(false)}
            profile={formData}
            onSave={handleFormChange}
          />

          {/* Public Profile Preview Modal */}
          <PublicProfilePreviewModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            profile={formData}
          />
        </div>
      ) : null}
    </div>
  );
}
