"use client";

import React, { useState } from "react";
import { GraduationCap, Plus, Edit2, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TeacherProfileData, EducationEntry, ProfileFormErrors } from "./types";

interface EducationCardProps {
  profile: TeacherProfileData;
  errors: ProfileFormErrors;
  onChange: (updates: Partial<TeacherProfileData>) => void;
}

export function EducationCard({
  profile,
  errors,
  onChange,
}: EducationCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationEntry | null>(null);
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [completionYear, setCompletionYear] = useState("");

  const openAdd = () => {
    setEditingItem(null);
    setDegree("");
    setInstitution("");
    setFieldOfStudy("");
    setCompletionYear("");
    setModalOpen(true);
  };

  const openEdit = (item: EducationEntry) => {
    setEditingItem(item);
    setDegree(item.degree);
    setInstitution(item.institution);
    setFieldOfStudy(item.fieldOfStudy || "");
    setCompletionYear(item.completionYear || "");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!degree.trim() || !institution.trim()) return;

    if (editingItem) {
      onChange({
        education: profile.education.map((e) =>
          e.id === editingItem.id
            ? {
                ...e,
                degree: degree.trim(),
                institution: institution.trim(),
                fieldOfStudy: fieldOfStudy.trim(),
                completionYear: completionYear.trim(),
              }
            : e
        ),
      });
    } else {
      const newEntry: EducationEntry = {
        id: `edu-${Date.now()}`,
        degree: degree.trim(),
        institution: institution.trim(),
        fieldOfStudy: fieldOfStudy.trim(),
        completionYear: completionYear.trim() || new Date().getFullYear().toString(),
      };
      onChange({ education: [...profile.education, newEntry] });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onChange({ education: profile.education.filter((e) => e.id !== id) });
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Dropdown / Collapsible Header */}
      <div className="p-6 sm:p-7 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-3.5 min-w-0 text-left cursor-pointer group flex-1 select-none"
          aria-expanded={isOpen}
        >
          <div className="size-9 sm:size-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
            <GraduationCap className="size-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                Education & Degrees
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {profile.education.length} {profile.education.length === 1 ? "degree" : "degrees"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Verified university degrees and academic qualifications.
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openAdd}
            className="h-8 px-3 rounded-xl border-slate-200 text-xs font-semibold gap-1.5 text-slate-700 hover:text-orange-600 hover:border-orange-200 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add</span>
          </Button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`size-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-all cursor-pointer ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-label="Toggle section"
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-6 pb-7 sm:px-8 sm:pb-8 pt-0 space-y-4 border-t border-slate-100 animate-in fade-in-50 duration-150">
          <div className="pt-6">
            {profile.education.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2.5">
                <GraduationCap className="size-7 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No education credentials added yet.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openAdd}
                  className="text-xs h-7.5 px-3 rounded-lg"
                >
                  Add First Degree
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/90 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {edu.degree}
                        </h4>
                        {edu.completionYear && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            • {edu.completionYear}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate">
                        {edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => openEdit(edu)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        aria-label="Edit degree"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(edu.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        aria-label="Delete degree"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {errors.education && (
            <p className="text-[11px] font-medium text-rose-600 pt-1">{errors.education}</p>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingItem ? "Edit Academic Degree" : "Add Academic Degree"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Add your university qualification or academic degree.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Degree / Qualification *</Label>
              <Input
                placeholder="e.g. Ph.D. in Computer Science"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Institution / University *</Label>
              <Input
                placeholder="e.g. Stanford University"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Field of Study</Label>
                <Input
                  placeholder="e.g. AI & Robotics"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Graduation Year</Label>
                <Input
                  placeholder="e.g. 2020"
                  value={completionYear}
                  onChange={(e) => setCompletionYear(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!degree.trim() || !institution.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
            >
              Save Degree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
