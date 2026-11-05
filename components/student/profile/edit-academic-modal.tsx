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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentProfileData } from "./types";
import {
  AVAILABLE_ACADEMIC_LEVELS,
  AVAILABLE_CURRICULUMS,
} from "./student-profile-service";
import { School, GraduationCap, Award, Calendar, Check } from "lucide-react";

interface EditAcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfileData;
  onSave: (updated: Partial<StudentProfileData>) => void;
}

export function EditAcademicModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditAcademicModalProps) {
  const [formData, setFormData] = useState({
    academicLevel: profile?.academicLevel || "",
    examinationBoard: profile?.examinationBoard || "",
    institution: profile?.institution || "",
    targetExamSeries: profile?.targetExamSeries || "",
  });

  const [formErrors, setFormErrors] = useState<{
    academicLevel?: string;
    examinationBoard?: string;
  }>({});

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        academicLevel: profile.academicLevel || "",
        examinationBoard: profile.examinationBoard || "",
        institution: profile.institution || "",
        targetExamSeries: profile.targetExamSeries || "",
      });
      setFormErrors({});
    }
  }, [isOpen, profile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof formErrors = {};
    if (!formData.academicLevel) {
      errors.academicLevel = "Please select your academic level.";
    }
    if (!formData.examinationBoard) {
      errors.examinationBoard = "Please select your examination board.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSave({
      academicLevel: formData.academicLevel,
      examinationBoard: formData.examinationBoard,
      institution: formData.institution,
      targetExamSeries: formData.targetExamSeries,
    });
    onClose();
  };

  const isDirty =
    formData.academicLevel !== (profile?.academicLevel || "") ||
    formData.examinationBoard !== (profile?.examinationBoard || "") ||
    formData.institution !== (profile?.institution || "") ||
    formData.targetExamSeries !== (profile?.targetExamSeries || "");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-7">
        <DialogHeader className="space-y-1 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <School className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Edit School & Examination Board
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Update your academic level, curriculum syllabus, school, and exam session.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Academic Level */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-orange-600" />
              <span>Current Academic Level</span>
              <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.academicLevel}
              onValueChange={(val) => handleChange("academicLevel", val)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-10 text-xs bg-white">
                <SelectValue placeholder="Select Academic Level" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ACADEMIC_LEVELS.map((level) => (
                  <SelectItem key={level} value={level} className="text-xs">
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.academicLevel && (
              <p className="text-xs text-rose-500 font-medium">
                {formErrors.academicLevel}
              </p>
            )}
          </div>

          {/* Examination Board */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Award className="size-3.5 text-blue-600" />
              <span>Examination Board / Syllabus</span>
              <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={formData.examinationBoard}
              onValueChange={(val) => handleChange("examinationBoard", val)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-10 text-xs bg-white">
                <SelectValue placeholder="Select Examination Board" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_CURRICULUMS.map((curr) => (
                  <SelectItem key={curr} value={curr} className="text-xs">
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.examinationBoard && (
              <p className="text-xs text-rose-500 font-medium">
                {formErrors.examinationBoard}
              </p>
            )}
          </div>

          {/* Current School / College Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <School className="size-3.5 text-emerald-600" />
              <span>School / College Name</span>
            </Label>
            <Input
              value={formData.institution}
              onChange={(e) => handleChange("institution", e.target.value)}
              placeholder="e.g. Beaconhouse, LGS, Roots, KGS, Cedar College"
              className="rounded-xl border-slate-200 h-10 text-xs bg-white"
            />
            <p className="text-2xs text-slate-400">
              The educational institute you are currently attending.
            </p>
          </div>

          {/* Target Exam Series */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-purple-600" />
              <span>Target Exam Series / Session</span>
            </Label>
            <Input
              value={formData.targetExamSeries}
              onChange={(e) => handleChange("targetExamSeries", e.target.value)}
              placeholder="e.g. May / June 2026 or Oct / Nov 2025"
              className="rounded-xl border-slate-200 h-10 text-xs bg-white"
            />
            <p className="text-2xs text-slate-400">
              The exam series session you are preparing to sit for.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl text-xs text-slate-600 hover:text-slate-900 h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isDirty}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-9 px-5 gap-1.5 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="size-3.5" />
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
