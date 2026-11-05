"use client";

import React, { useState } from "react";
import {
  BookOpen,
  X,
  Languages,
  Check,
  ChevronDown,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  TeacherProfileData,
  ProfileFormErrors,
} from "./types";
import {
  AVAILABLE_SUBJECTS,
  AVAILABLE_LANGUAGES,
} from "./profile-service";

interface ProfessionalDetailsCardProps {
  profile: TeacherProfileData;
  errors: ProfileFormErrors;
  onChange: (updates: Partial<TeacherProfileData>) => void;
}

export function ProfessionalDetailsCard({
  profile,
  errors,
  onChange,
}: ProfessionalDetailsCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedSubjectToAdd, setSelectedSubjectToAdd] = useState("");

  // ============================================================================
  // SUBJECT CHIPS HANDLERS
  // ============================================================================
  const handleAddSubject = (subject: string) => {
    if (!subject || profile.subjects.includes(subject)) return;
    onChange({ subjects: [...profile.subjects, subject] });
    setSelectedSubjectToAdd("");
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    onChange({
      subjects: profile.subjects.filter((s) => s !== subjectToRemove),
    });
  };

  // ============================================================================
  // TEACHING LANGUAGES TOGGLE
  // ============================================================================
  const handleToggleLanguage = (lang: string) => {
    if (profile.teachingLanguages.includes(lang)) {
      if (profile.teachingLanguages.length === 1) return; // keep at least 1
      onChange({
        teachingLanguages: profile.teachingLanguages.filter((l) => l !== lang),
      });
    } else {
      onChange({
        teachingLanguages: [...profile.teachingLanguages, lang],
      });
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Dropdown / Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-6 sm:p-7 flex items-center justify-between gap-4 text-left hover:bg-slate-50/60 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="size-9 sm:size-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
            <BookOpen className="size-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Professional Details
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {profile.subjects.length} subjects • {profile.teachingLanguages.length} languages
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              About me biography, subjects taught, and instructional languages.
            </p>
          </div>
        </div>

        <div
          className={`size-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="size-4" />
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-7 sm:px-8 sm:pb-8 pt-0 space-y-7 border-t border-slate-100 animate-in fade-in-50 duration-150">
          {/* 1. About Me (Biography) */}
          <div className="space-y-2 pt-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="aboutMe" className="text-xs font-bold text-slate-800">
                About Me (Biography) <span className="text-orange-500">*</span>
              </Label>
              <span className="text-[11px] text-slate-400 font-medium">
                {profile.aboutMe.length}/1500 chars
              </span>
            </div>
            <Textarea
              id="aboutMe"
              rows={5}
              maxLength={1500}
              value={profile.aboutMe}
              onChange={(e) => onChange({ aboutMe: e.target.value })}
              placeholder="Introduce yourself, describe your teaching background, and explain how you help students achieve their learning goals."
              className={`resize-y min-h-[120px] text-xs sm:text-sm leading-relaxed ${
                errors.aboutMe ? "border-rose-400 focus-visible:border-rose-500" : ""
              }`}
            />
            {errors.aboutMe ? (
              <p className="text-[11px] font-medium text-rose-600">{errors.aboutMe}</p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Preserves line breaks. Highlight your pedagogy, academic background, and why students enjoy learning with you.
              </p>
            )}
          </div>

          {/* 2. Subjects Taught */}
          <div className="space-y-3.5 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-slate-800">
                  Subjects Taught <span className="text-orange-500">*</span>
                </Label>
                <p className="text-[11px] text-slate-400">
                  Select all academic subjects and topics you tutor on ZuhDemy.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {profile.subjects.length} selected
              </span>
            </div>

            {/* Selected Subject Chips */}
            <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 min-h-[52px] items-center">
              {profile.subjects.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  No subjects selected. Add from the catalog below.
                </span>
              ) : (
                profile.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs group"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(sub)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      aria-label={`Remove subject ${sub}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
            {errors.subjects && (
              <p className="text-[11px] font-medium text-rose-600">{errors.subjects}</p>
            )}

            {/* Add from Catalog Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectToAdd}
                onChange={(e) => {
                  if (e.target.value) handleAddSubject(e.target.value);
                }}
                className="flex-1 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 shadow-2xs focus-visible:outline-none focus-visible:border-orange-500 cursor-pointer"
              >
                <option value="">-- Add a subject from ZuhDemy catalog --</option>
                {AVAILABLE_SUBJECTS.filter((s) => !profile.subjects.includes(s)).map(
                  (subj) => (
                    <option key={subj} value={subj}>
                      + {subj}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* 3. Teaching Languages */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div>
              <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Languages className="size-4 text-orange-500" />
                Teaching Languages <span className="text-orange-500">*</span>
              </Label>
              <p className="text-[11px] text-slate-400">
                Select all languages in which you are comfortable conducting lessons.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = profile.teachingLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleToggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected && <Check className="size-3" />}
                    <span>{lang}</span>
                  </button>
                );
              })}
            </div>
            {errors.teachingLanguages && (
              <p className="text-[11px] font-medium text-rose-600">
                {errors.teachingLanguages}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
