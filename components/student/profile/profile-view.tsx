"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  GraduationCap,
  Target,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  StudentProfileData,
  StudentProfileErrors,
} from "./types";
import {
  apiFetchStudentProfile,
  apiUpdateStudentProfile,
  apiResetStudentProfile,
  calculateStudentProfileCompletion,
} from "./student-profile-service";
import { updateStudentAvatarAction } from "@/app/actions/student";
import { StudentProfileSkeleton } from "./profile-skeleton";
import { ProfileOverviewHero } from "./profile-overview-hero";
import { LearningStatsCard } from "./learning-stats-card";
import { AcademicBackgroundTab } from "./academic-background-tab";
import { LearningGoalsTab } from "./learning-goals-tab";
import { GuardianContactTab } from "./guardian-contact-tab";
import { EditStudentModal } from "./edit-personal-modal";

export function StudentProfileView() {
  // Dynamic State for loaded student profile
  const [initialData, setInitialData] = useState<StudentProfileData | null>(null);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);

  // Status & Navigation States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<StudentProfileErrors>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("academic");

  // Load student profile dynamically
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetchStudentProfile();
      setInitialData(data);
      setProfile(data);
    } catch (err) {
      console.error("Failed to load student profile:", err);
      setSaveError("Failed to load profile. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Dirty Tracking: Check whether profile has unsaved modifications
  const isDirty = useMemo(() => {
    if (!initialData || !profile) return false;
    return JSON.stringify(initialData) !== JSON.stringify(profile);
  }, [initialData, profile]);

  // Warn before browser unload if user has pending edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Dynamically calculate completion whenever profile changes
  const completion = useMemo(() => {
    if (!profile) {
      return { percentage: 0, completedCount: 0, totalCount: 10, missingItems: [] };
    }
    return calculateStudentProfileCompletion(profile);
  }, [profile]);

  // Check if academic subjects have changed
  const isAcademicDirty = useMemo(() => {
    if (!initialData || !profile) return false;
    return (
      JSON.stringify(profile.subjects || []) !==
      JSON.stringify(initialData.subjects || [])
    );
  }, [profile, initialData]);

  // Check if goals & preferences have changed
  const isGoalsDirty = useMemo(() => {
    if (!initialData || !profile) return false;
    return (
      JSON.stringify(profile.primaryGoals || []) !==
        JSON.stringify(initialData.primaryGoals || []) ||
      (profile.customNote || "") !== (initialData.customNote || "") ||
      profile.sessionFormat !== initialData.sessionFormat ||
      profile.preferredLearningStyle !== initialData.preferredLearningStyle
    );
  }, [profile, initialData]);

  // Check if parent / guardian info has changed
  const isGuardianDirty = useMemo(() => {
    if (!initialData || !profile) return false;
    return (
      (profile.guardianName || "") !== (initialData.guardianName || "") ||
      (profile.guardianRelationship || "Father") !==
        (initialData.guardianRelationship || "Father") ||
      (profile.guardianPhone || "") !== (initialData.guardianPhone || "") ||
      (profile.guardianEmail || "") !== (initialData.guardianEmail || "") ||
      Boolean(profile.isEmergencyContact) !==
        Boolean(initialData.isEmergencyContact)
    );
  }, [profile, initialData]);

  // Dynamic state update handlers
  const handleUpdateField = useCallback(
    <K extends keyof StudentProfileData>(field: K, value: StudentProfileData[K]) => {
      setProfile((prev) => {
        if (!prev) return prev;
        return { ...prev, [field]: value };
      });

      // Clear field-specific error if present
      setErrors((prev) => {
        if (!prev[field as string]) return prev;
        const next = { ...prev };
        delete next[field as string];
        return next;
      });

      setSaveSuccess(false);
      setSaveError(null);
    },
    []
  );

  const handleUpdateMultipleAndSave = useCallback(
    async (updates: Partial<StudentProfileData>) => {
      if (!profile) return;
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      try {
        setIsSaving(true);
        setSaveError(null);
        const saved = await apiUpdateStudentProfile(updatedProfile);
        setProfile(saved);
        setInitialData(saved);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } catch (err) {
        console.error("Failed to save student profile:", err);
        setSaveError("Failed to save changes. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [profile]
  );

  const handleAvatarUpdated = useCallback(
    async (newAvatarUrl: string) => {
      // 1. Update state and cache immediately
      setProfile((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
      setInitialData((prev) => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));

      // 2. Broadcast custom event so StudentHeader and other header avatars update immediately
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("zuhdemy:avatar-updated", {
            detail: { avatarUrl: newAvatarUrl },
          })
        );
      }

      // 3. Immediately commit to PostgreSQL users table & Supabase auth metadata
      try {
        setIsSaving(true);
        setSaveError(null);
        const res = await updateStudentAvatarAction(newAvatarUrl);
        if (!res.success) {
          throw new Error(res.error || "Failed to save avatar image");
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err: any) {
        console.error("Failed to commit avatar change to database:", err);
        setSaveError("Avatar uploaded but failed to sync database. Please click Save Changes.");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  // Validate required fields
  const validateForm = (): boolean => {
    if (!profile) return false;
    const newErrors: StudentProfileErrors = {};

    if (!profile.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!profile.email?.trim()) newErrors.email = "Valid email is required";
    if (!profile.academicLevel) newErrors.academicLevel = "Academic level is required";
    if (!profile.examinationBoard) newErrors.examinationBoard = "Examination board is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save changes to persistence / state
  const handleSave = async () => {
    if (!profile) return;
    if (!validateForm()) {
      setSaveError("Please complete all required fields marked in red.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      const saved = await apiUpdateStudentProfile(profile);
      setProfile(saved);
      setInitialData(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to save student profile:", err);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Revert unsaved edits back to initialData
  const handleDiscardChanges = () => {
    if (initialData) {
      setProfile(initialData);
      setErrors({});
      setSaveError(null);
    }
  };

  // Reset to default demo data seed
  const handleResetToDefault = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Reset profile data back to the default demo values?")
    ) {
      return;
    }
    try {
      setIsLoading(true);
      const defaults = await apiResetStudentProfile();
      setInitialData(defaults);
      setProfile(defaults);
      setErrors({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error resetting profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !profile) {
    return <StudentProfileSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 relative">
      {/* Dynamic Save / Success Feedback Toast */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-2xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>Profile successfully updated! All changes have been saved to your student account.</span>
          </div>
          <Badge className="bg-emerald-600 text-white text-xs">Saved</Badge>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <AlertCircle className="size-5 text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Top Hero Overview Header (Clean White Card - NO BG IMAGE) */}
      <ProfileOverviewHero
        profile={profile}
        completion={completion}
        onOpenEditModal={() => setIsEditModalOpen(true)}
        onAvatarUpdated={handleAvatarUpdated}
        onResetToDefault={handleResetToDefault}
        isSaving={isSaving}
      />

      {/* Dynamic Learning Statistics Cards */}
      <LearningStatsCard stats={profile.stats} />

      {/* Distinct Non-Duplicative Tabs */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 overflow-x-auto">
            <TabsList className="bg-slate-100/90 p-1 rounded-xl">
              <TabsTrigger value="academic" className="gap-2">
                <GraduationCap className="size-4" />
                <span>Academics & Enrolled Subjects</span>
                <Badge
                  variant="outline"
                  className="size-5 p-0 flex items-center justify-center text-3xs font-bold rounded-full bg-orange-100 text-orange-800 border-none"
                >
                  {profile.subjects.length}
                </Badge>
              </TabsTrigger>

              <TabsTrigger value="goals" className="gap-2">
                <Target className="size-4" />
                <span>Learning Goals & Preferences</span>
              </TabsTrigger>

              <TabsTrigger value="guardian" className="gap-2">
                <HeartHandshake className="size-4" />
                <span>Parent / Guardian</span>
              </TabsTrigger>
            </TabsList>

            {/* Quick status indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium pr-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>Status: {profile.accountStatus.toUpperCase()}</span>
            </div>
          </div>

          {/* Tab 1: Academics & Enrolled Subjects */}
          <TabsContent value="academic">
            <AcademicBackgroundTab
              profile={profile}
              errors={errors}
              onUpdateField={handleUpdateField}
              onUpdateMultiple={handleUpdateMultipleAndSave}
              onSaveProfile={handleSave}
              isSaving={isSaving}
              hasChanges={isAcademicDirty}
            />
          </TabsContent>

          {/* Tab 2: Learning Goals & Study Preferences */}
          <TabsContent value="goals">
            <LearningGoalsTab
              profile={profile}
              errors={errors}
              onUpdateField={handleUpdateField}
              onSaveProfile={handleSave}
              isSaving={isSaving}
              hasChanges={isGoalsDirty}
            />
          </TabsContent>

          {/* Tab 3: Parent / Guardian Info */}
          <TabsContent value="guardian">
            <GuardianContactTab
              profile={profile}
              errors={errors}
              onUpdateField={handleUpdateField}
              onSaveProfile={handleSave}
              isSaving={isSaving}
              hasChanges={isGuardianDirty}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Unified Edit Personal Info Modal */}
      <EditStudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleUpdateMultipleAndSave}
      />
    </div>
  );
}
