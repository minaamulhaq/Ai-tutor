"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  GraduationCap,
  Briefcase,
  Languages,
  ShieldCheck,
  Star,
  Video,
  Sparkles,
} from "lucide-react";
import { TeacherProfileData } from "./types";

interface PublicProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfileData;
}

export function PublicProfilePreviewModal({
  isOpen,
  onClose,
  profile,
}: PublicProfilePreviewModalProps) {
  const initials = `${(profile?.firstName || "A").charAt(0)}${(profile?.lastName || "W").charAt(0)}`.toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl gap-0 border-slate-200">
        {/* Banner with Preview Badge */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-none">
                Public Student Preview
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                This is how prospective students and parents view your profile.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-orange-400 border-orange-500/30 bg-orange-500/10">
            Student View
          </Badge>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-8 space-y-8 bg-slate-50/50">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 ring-4 ring-orange-500/10 shadow-sm shrink-0">
                <AvatarImage src={profile.avatarUrl} alt={`${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Teacher Profile"} />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {profile?.firstName || "Alexander"} {profile?.lastName || "Wright"}
                  </h2>
                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      Verified Tutor
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600">
                  {profile.headline || "Online Academic Tutor"}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    4.9 (38 Reviews)
                  </span>
                  <span>•</span>
                  <span>{profile.city}, {profile.country}</span>
                </div>
              </div>
            </div>

            {/* Pricing Badge for Student Booking */}
            <div className="w-full sm:w-auto p-4 rounded-xl bg-orange-50/80 border border-orange-200/80 text-center sm:text-right shrink-0">
              <div className="text-2xl font-black text-orange-600 tracking-tight">
                PKR {(profile.hourlyRatePkr || 3500).toLocaleString()}
                <span className="text-xs font-normal text-slate-500"> / hour</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                1-on-1 Private Session (60m)
              </p>
              <div className="mt-2 text-[10px] text-emerald-700 font-semibold bg-white border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <Video className="size-3" />
                Live on Google Meet
              </div>
            </div>
          </div>

          {/* About Me Section */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="size-4.5 text-orange-500" />
              About Me
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {profile.aboutMe || "No biography provided yet."}
            </p>
          </div>

          {/* Subjects & Levels */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Subjects Taught
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.subjects.map((sub) => (
                <span
                  key={sub}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80"
                >
                  {sub}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Target Student Levels
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.studentLevels.map((lvl) => (
                  <span
                    key={lvl}
                    className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200/60"
                  >
                    {lvl}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Education & Experience Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Education */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <GraduationCap className="size-4.5 text-orange-500" />
                Education & Degrees
              </h3>
              <div className="space-y-3 pt-1">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-orange-400 pl-3 space-y-0.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {edu.degree}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {edu.institution} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""}
                    </p>
                    {edu.completionYear && (
                      <span className="text-[11px] text-slate-400">
                        Class of {edu.completionYear}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Briefcase className="size-4.5 text-orange-500" />
                Teaching Experience
              </h3>
              <div className="space-y-3 pt-1">
                {profile.experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-slate-300 pl-3 space-y-0.5">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      {exp.role}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {exp.institution}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {exp.duration}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Languages & Methodology */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Languages className="size-3.5 text-orange-500" />
                Languages Spoken
              </h4>
              <div className="flex gap-2">
                {profile.teachingLanguages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>

            {profile.teachingMethodology && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Teaching Methodology
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {profile.teachingMethodology}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end">
          <Button
            onClick={onClose}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs px-5 h-9"
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
