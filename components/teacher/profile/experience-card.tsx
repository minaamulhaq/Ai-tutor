"use client";

import React, { useState } from "react";
import { Briefcase, Plus, Edit2, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { TeacherProfileData, ExperienceEntry } from "./types";

interface ExperienceCardProps {
  profile: TeacherProfileData;
  onChange: (updates: Partial<TeacherProfileData>) => void;
}

export function ExperienceCard({ profile, onChange }: ExperienceCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceEntry | null>(null);
  const [role, setRole] = useState("");
  const [institution, setInstitution] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");

  const openAdd = () => {
    setEditingItem(null);
    setRole("");
    setInstitution("");
    setDuration("");
    setDescription("");
    setModalOpen(true);
  };

  const openEdit = (item: ExperienceEntry) => {
    setEditingItem(item);
    setRole(item.role);
    setInstitution(item.institution);
    setDuration(item.duration || "");
    setDescription(item.description || "");
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!role.trim() || !institution.trim()) return;

    if (editingItem) {
      onChange({
        experience: profile.experience.map((ex) =>
          ex.id === editingItem.id
            ? {
                ...ex,
                role: role.trim(),
                institution: institution.trim(),
                duration: duration.trim(),
                description: description.trim(),
              }
            : ex
        ),
      });
    } else {
      const newEntry: ExperienceEntry = {
        id: `exp-${Date.now()}`,
        role: role.trim(),
        institution: institution.trim(),
        duration: duration.trim() || "Present",
        description: description.trim(),
      };
      onChange({ experience: [...profile.experience, newEntry] });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    onChange({ experience: profile.experience.filter((ex) => ex.id !== id) });
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
            <Briefcase className="size-5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                Teaching & Professional Experience
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {profile.experience.length} {profile.experience.length === 1 ? "position" : "positions"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Classroom, tutoring, and academic appointments.
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
            {profile.experience.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2.5">
                <Briefcase className="size-7 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">No teaching experience added yet.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openAdd}
                  className="text-xs h-7.5 px-3 rounded-lg"
                >
                  Add First Experience
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-start justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/90 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {exp.role}
                        </h4>
                        {exp.duration && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            • {exp.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate">
                        {exp.institution}
                      </p>
                      {exp.description && (
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                          {exp.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => openEdit(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        aria-label="Edit experience"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        aria-label="Delete experience"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingItem ? "Edit Teaching Experience" : "Add Teaching Experience"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Detail your relevant instruction, tutoring, or academic roles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Position / Role *</Label>
              <Input
                placeholder="e.g. AP Calculus & Physics Tutor"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Organization / School *</Label>
              <Input
                placeholder="e.g. Menlo Park STEM Academy"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Duration / Dates</Label>
              <Input
                placeholder="e.g. 2021 - Present or Sep 2022 - Jun 2024"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Summary / Key Responsibilities</Label>
              <Textarea
                rows={3}
                placeholder="Describe the topics taught, curriculum design, student outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
              disabled={!role.trim() || !institution.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
            >
              Save Experience
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
