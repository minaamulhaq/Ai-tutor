"use client";

import React from "react";
import {
  Target,
  CheckCircle2,
  Check,
  Loader2,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
  AVAILABLE_LEARNING_STYLES,
  STUDENT_GOAL_OPTIONS,
} from "./student-profile-service";

interface LearningGoalsTabProps {
  profile: StudentProfileData;
  errors: StudentProfileErrors;
  onUpdateField: <K extends keyof StudentProfileData>(
    field: K,
    value: StudentProfileData[K]
  ) => void;
  onSaveProfile?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function LearningGoalsTab({
  profile,
  errors,
  onUpdateField,
  onSaveProfile,
  isSaving = false,
  hasChanges = false,
}: LearningGoalsTabProps) {
  const toggleGoal = (goalLabel: string) => {
    const current = profile.primaryGoals || [];
    const exists = current.includes(goalLabel);
    if (exists) {
      if (current.length > 1) {
        onUpdateField(
          "primaryGoals",
          current.filter((g) => g !== goalLabel)
        );
      }
    } else {
      onUpdateField("primaryGoals", [...current, goalLabel]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Learning Goals & Study Preferences */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Target className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Primary Learning Goals & Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Select key goals and study modes so your tutors can construct tailored lessons and mock test schedules.
              </p>
            </div>
          </div>

          {hasChanges && onSaveProfile && (
            <Button
              type="button"
              size="sm"
              disabled={isSaving}
              onClick={onSaveProfile}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-4 gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-center disabled:opacity-50 animate-in fade-in zoom-in-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Goals</span>
                </>
              )}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Goal Chips Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                Key Academic Objectives (1-Click Selection) <span className="text-rose-500">*</span>
              </Label>
              <span className="text-2xs text-orange-600 font-semibold">
                {profile.primaryGoals?.length || 0} selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STUDENT_GOAL_OPTIONS.map((goal) => {
                const isSelected = profile.primaryGoals?.includes(goal.label);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.label)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? "border-orange-500 bg-orange-50/70 text-orange-950 shadow-2xs ring-1 ring-orange-500/20"
                        : "border-slate-200 bg-slate-50/60 hover:bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{goal.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="size-4 text-orange-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-2xs text-slate-500 leading-tight">
                      {goal.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Note Textarea */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <Label htmlFor="customNote" className="text-xs font-semibold text-slate-700">
                Additional Target Details / Notes (Optional)
              </Label>
              <span className="text-2xs text-slate-400">
                {profile.customNote?.length || 0} / 500
              </span>
            </div>
            <Textarea
              id="customNote"
              rows={3}
              value={profile.customNote || ""}
              onChange={(e) => onUpdateField("customNote", e.target.value)}
              placeholder="e.g. Aiming for top 5% in university entrance test (FAST / NUST) and need targeted practice on Paper 4 past papers."
              className="rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 text-xs resize-none"
            />
          </div>

          {/* Session Format & Learning Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            {/* Preferred Session Format */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Preferred Session Format
              </Label>
              <Select
                value={profile.sessionFormat}
                onValueChange={(val) => onUpdateField("sessionFormat", val)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-11 text-sm bg-white">
                  <SelectValue placeholder="Select session format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-on-1 Focused Session">
                    1-on-1 Focused Session (Recommended)
                  </SelectItem>
                  <SelectItem value="Small Group Study (2-4 students)">
                    Small Group Study (2-4 students)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Learning Style */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Preferred Learning Style
              </Label>
              <Select
                value={profile.preferredLearningStyle || "Past Paper & Problem Solving"}
                onValueChange={(val) => onUpdateField("preferredLearningStyle", val)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-11 text-sm bg-white">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_LEARNING_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Bottom Save Action - Only shown when changes happen */}
        {hasChanges && onSaveProfile && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end animate-in fade-in">
            <Button
              type="button"
              disabled={isSaving}
              onClick={onSaveProfile}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-10 px-5 gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Goals & Preferences</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
