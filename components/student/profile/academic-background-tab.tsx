"use client";

import React, { useState } from "react";
import {
  School,
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  Target,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Pencil,
  Check,
  GraduationCap,
  Calendar,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  StudentProfileData,
  EnrolledSubjectItem,
  StudentProfileErrors,
} from "./types";
import {
  AVAILABLE_SUBJECTS,
  GRADE_OPTIONS,
} from "./student-profile-service";

import { EditAcademicModal } from "./edit-academic-modal";

interface AcademicBackgroundTabProps {
  profile: StudentProfileData;
  errors: StudentProfileErrors;
  onUpdateField: <K extends keyof StudentProfileData>(
    field: K,
    value: StudentProfileData[K]
  ) => void;
  onUpdateMultiple?: (updates: Partial<StudentProfileData>) => void;
  onSaveProfile?: () => void;
  isSaving?: boolean;
  hasChanges?: boolean;
}

export function AcademicBackgroundTab({
  profile,
  errors,
  onUpdateField,
  onUpdateMultiple,
  onSaveProfile,
  isSaving = false,
  hasChanges = false,
}: AcademicBackgroundTabProps) {
  // State for Edit Modal for School & Board
  const [isEditAcademicModalOpen, setIsEditAcademicModalOpen] = useState(false);

  // Add Subject Form State
  const [inputMode, setInputMode] = useState<"catalog" | "custom">("catalog");
  const [catalogSubject, setCatalogSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [currentGradeInput, setCurrentGradeInput] = useState("B");
  const [targetGradeInput, setTargetGradeInput] = useState("A*");

  // Feedback States
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccessMsg, setAddSuccessMsg] = useState<string | null>(null);

  // List of already added subject names for fast lookup
  const enrolledSubjectNames = profile.subjects.map((s) =>
    s.subject.trim().toLowerCase()
  );

  const handleAddSubject = () => {
    setAddError(null);
    setAddSuccessMsg(null);

    const subjectName =
      inputMode === "custom" ? customSubject.trim() : catalogSubject.trim();

    if (!subjectName) {
      setAddError(
        inputMode === "custom"
          ? "Please enter a subject name."
          : "Please select a subject from the list."
      );
      return;
    }

    // Check duplicate
    if (enrolledSubjectNames.includes(subjectName.toLowerCase())) {
      setAddError(`"${subjectName}" is already in your enrolled subjects.`);
      return;
    }

    const newSubject: EnrolledSubjectItem = {
      id: `subj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      subject: subjectName,
      currentGrade: currentGradeInput,
      targetGrade: targetGradeInput,
    };

    onUpdateField("subjects", [...profile.subjects, newSubject]);

    // Reset inputs & show success
    setCatalogSubject("");
    setCustomSubject("");
    setCurrentGradeInput("B");
    setTargetGradeInput("A*");
    setAddSuccessMsg(`Added "${subjectName}" to your subjects.`);
    setTimeout(() => setAddSuccessMsg(null), 3500);
  };

  const handleRemoveSubject = (id: string, name: string) => {
    onUpdateField(
      "subjects",
      profile.subjects.filter((s) => s.id !== id)
    );
    setAddSuccessMsg(`Removed "${name}".`);
    setTimeout(() => setAddSuccessMsg(null), 3000);
  };

  const handleUpdateSubjectGrade = (
    id: string,
    gradeType: "currentGrade" | "targetGrade",
    newGrade: string
  ) => {
    onUpdateField(
      "subjects",
      profile.subjects.map((s) =>
        s.id === id ? { ...s, [gradeType]: newGrade } : s
      )
    );
  };

  const handleSaveAcademicDetails = (updates: Partial<StudentProfileData>) => {
    if (onUpdateMultiple) {
      onUpdateMultiple(updates);
    } else {
      (Object.keys(updates) as (keyof StudentProfileData)[]).forEach((key) => {
        onUpdateField(key, updates[key] as any);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. School & Examination Board Info Card (Pure View Mode with Edit Modal) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <School className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                School & Examination Board
              </h2>
              <p className="text-xs text-slate-500">
                Helps match you with tutors experienced in your exact syllabus and paper format.
              </p>
            </div>
          </div>

          {/* Right Side: Edit Button with Pencil Icon */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditAcademicModalOpen(true)}
            className="rounded-xl border-slate-200 text-slate-700 hover:text-orange-600 hover:bg-orange-50/70 h-9 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs transition-all shrink-0 self-start sm:self-center"
            title="Edit School and Examination Board"
          >
            <Pencil className="size-3.5 text-orange-600" />
            <span>Edit</span>
          </Button>
        </div>

        {/* Profile Read-Only View: Clean, structured 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Academic Level */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50/90 transition-colors flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-orange-100/80 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide text-[11px]">
                Current Academic Level
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {profile.academicLevel || "Not specified"}
                </span>
                <Badge
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200/70 text-2xs font-semibold px-2 py-0.5 rounded-md"
                >
                  Active Level
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Current grade and curriculum phase</p>
            </div>
          </div>

          {/* Examination Board */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50/90 transition-colors flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Award className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide text-[11px]">
                Examination Board / Syllabus
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {profile.examinationBoard || "Not specified"}
                </span>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200/70 text-2xs font-semibold px-2 py-0.5 rounded-md"
                >
                  Curriculum
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Standard assessment syllabus</p>
            </div>
          </div>

          {/* Current School / College */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50/90 transition-colors flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <School className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide text-[11px]">
                Current School / College
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 block truncate">
                {profile.institution || "Not specified"}
              </span>
              <p className="text-xs text-slate-400">Enrolled educational institution</p>
            </div>
          </div>

          {/* Target Exam Series */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50/90 transition-colors flex items-start gap-3.5">
            <div className="size-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Calendar className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide text-[11px]">
                Target Exam Series / Session
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {profile.targetExamSeries || "Not specified"}
                </span>
                {profile.targetExamSeries && (
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200/70 text-2xs font-semibold px-2 py-0.5 rounded-md"
                  >
                    Exam Session
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">Scheduled examination period</p>
            </div>
          </div>
        </div>

        {/* Modal for Editing School & Board Details */}
        <EditAcademicModal
          isOpen={isEditAcademicModalOpen}
          onClose={() => setIsEditAcademicModalOpen(false)}
          profile={profile}
          onSave={handleSaveAcademicDetails}
        />
      </div>

      {/* 2. Enrolled Subjects & Grade Goals Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Enrolled Subjects & Target Grades
              </h2>
              <p className="text-xs text-slate-500">
                Track your current standing and target grades for each subject you are studying.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            {hasChanges && onSaveProfile && (
              <Button
                type="button"
                size="sm"
                disabled={isSaving}
                onClick={onSaveProfile}
                className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold h-8 px-3.5 gap-1.5 cursor-pointer shadow-xs animate-in fade-in zoom-in-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Save Subjects</span>
                  </>
                )}
              </Button>
            )}
            <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs font-bold w-fit">
              {profile.subjects.length} Subjects Active
            </Badge>
          </div>
        </div>

        {/* Success Alert */}
        {addSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>{addSuccessMsg}</span>
          </div>
        )}

        {/* Existing Subjects List */}
        {profile.subjects.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-2">
            <BookOpen className="size-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No subjects added yet</p>
            <p className="text-xs text-slate-500">
              Add your current academic subjects below so instructors can prepare tailored materials.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.subjects.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {item.subject[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {item.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>Board: {profile.examinationBoard}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-orange-700 font-medium inline-flex items-center gap-1">
                        <span>Goal: {item.currentGrade || "B"}</span>
                        <ArrowRight className="size-3 text-slate-400" />
                        <span className="font-bold">{item.targetGrade || "A*"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  {/* Current Grade */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xs font-semibold text-slate-400 uppercase">
                      Current:
                    </span>
                    <Select
                      value={item.currentGrade || "B"}
                      onValueChange={(val) =>
                        handleUpdateSubjectGrade(item.id, "currentGrade", val)
                      }
                    >
                      <SelectTrigger className="h-8 w-20 text-xs font-bold rounded-lg border-slate-200 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g} className="text-xs font-bold">
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Grade */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xs font-semibold text-slate-400 uppercase">
                      Target:
                    </span>
                    <Select
                      value={item.targetGrade || "A*"}
                      onValueChange={(val) =>
                        handleUpdateSubjectGrade(item.id, "targetGrade", val)
                      }
                    >
                      <SelectTrigger className="h-8 w-20 text-xs font-bold rounded-lg border-orange-200 bg-orange-50/80 text-orange-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g} className="text-xs font-bold">
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSubject(item.id, item.subject)}
                    className="size-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title={`Remove ${item.subject}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Add Another Subject Section (Accurate, Intuitive & Validated) */}
        <div className="pt-5 border-t border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Add Another Subject
              </Label>
              <p className="text-xs text-slate-500">
                Choose from standard syllabus subjects or type a custom course.
              </p>
            </div>

            {/* Mode Selector Toggle: Catalog vs Custom */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setInputMode("catalog");
                  setAddError(null);
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  inputMode === "catalog"
                    ? "bg-white text-orange-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Choose from Catalog
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode("custom");
                  setAddError(null);
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  inputMode === "custom"
                    ? "bg-white text-orange-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                + Custom Subject
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {addError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span>{addError}</span>
            </div>
          )}

          {/* Form Controls Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              {/* Subject Input / Selection */}
              <div className="sm:col-span-5 space-y-1.5">
                <span className="text-2xs text-slate-600 font-semibold block">
                  {inputMode === "catalog"
                    ? "Select Subject"
                    : "Enter Custom Subject Name"}
                </span>

                {inputMode === "catalog" ? (
                  <Select
                    value={catalogSubject}
                    onValueChange={(val) => {
                      setCatalogSubject(val);
                      setAddError(null);
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 bg-white h-10 text-xs">
                      <SelectValue placeholder="Choose a syllabus subject..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {AVAILABLE_SUBJECTS.map((s) => {
                        const isAlreadyAdded = enrolledSubjectNames.includes(
                          s.toLowerCase()
                        );
                        return (
                          <SelectItem
                            key={s}
                            value={s}
                            disabled={isAlreadyAdded}
                            className={`text-xs ${
                              isAlreadyAdded ? "opacity-50 text-slate-400" : ""
                            }`}
                          >
                            {s} {isAlreadyAdded ? "(Already enrolled)" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={customSubject}
                    onChange={(e) => {
                      setCustomSubject(e.target.value);
                      setAddError(null);
                    }}
                    placeholder="e.g. A-Level Law, Sociology, Further Math"
                    className="rounded-xl border-slate-200 bg-white h-10 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubject();
                      }
                    }}
                  />
                )}
              </div>

              {/* Current Grade */}
              <div className="sm:col-span-2 space-y-1.5">
                <span className="text-2xs text-slate-600 font-semibold block">
                  Current Grade
                </span>
                <Select
                  value={currentGradeInput}
                  onValueChange={(val) => setCurrentGradeInput(val)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white h-10 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g} className="text-xs font-bold">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Grade */}
              <div className="sm:col-span-2 space-y-1.5">
                <span className="text-2xs text-slate-600 font-semibold block">
                  Target Grade
                </span>
                <Select
                  value={targetGradeInput}
                  onValueChange={(val) => setTargetGradeInput(val)}
                >
                  <SelectTrigger className="rounded-xl border-orange-200 bg-orange-50 text-orange-800 h-10 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g} className="text-xs font-bold">
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Button */}
              <div className="sm:col-span-3">
                <Button
                  type="button"
                  onClick={handleAddSubject}
                  className="w-full h-10 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  <Plus className="size-4 mr-1.5" />
                  Add to Enrolled Subjects
                </Button>
              </div>
            </div>

            <p className="text-2xs text-slate-500 pt-1">
              * Tutors will see your target grades and structure lessons specifically to help you reach them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
