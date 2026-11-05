"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Star,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Video,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { Teacher } from "@/types/teacher";

export interface TeacherProfileModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite?: (id: string) => void;
}

export function TeacherProfileModal({
  teacher,
  isOpen,
  onClose,
}: TeacherProfileModalProps) {
  if (!teacher) return null;

  const initials = `${(teacher.firstName || teacher.name.split(" ")[0] || "T").charAt(0)}${(
    teacher.lastName || teacher.name.split(" ")[1] || "T"
  ).charAt(0)}`.toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl gap-0 border-slate-200">
        {/* Banner with Status */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-none">
                Instructor Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified ZuhDemy 1-on-1 Online Instructor
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/10 rounded-lg size-8"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
          {/* Header Card */}
          <Card className="p-5 sm:p-6 rounded-2xl border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 ring-4 ring-orange-500/10 shadow-sm shrink-0">
                {teacher.avatarUrl && (
                  <AvatarImage
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {teacher.name}
                  </h2>
                  {teacher.isVerified && (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                      <ShieldCheck className="size-3.5 mr-1 text-emerald-600" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600">
                  {teacher.headline}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  {typeof teacher.rating === "number" && (
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Star className="size-3.5 fill-amber-500 text-amber-500" />
                      {teacher.rating.toFixed(1)} ({teacher.reviewCount || 0} Reviews)
                    </span>
                  )}
                  {teacher.city && (
                    <>
                      <span>•</span>
                      <span>
                        {teacher.city}, {teacher.country}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Price Badge */}
            <div className="w-full sm:w-auto p-4 rounded-xl bg-orange-50/90 border border-orange-200/80 text-center sm:text-right shrink-0">
              <div className="text-2xl font-black text-orange-600 tracking-tight">
                {teacher.currency} {teacher.hourlyRate.toLocaleString()}
                <span className="text-xs font-normal text-slate-500"> / hour</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                1-on-1 Session (60m)
              </p>
              <div className="mt-2 text-[10px] text-emerald-700 font-semibold bg-white border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                <Video className="size-3" />
                Live on Google Meet
              </div>
            </div>
          </Card>

          {/* About Biography */}
          <Card className="p-5 sm:p-6 rounded-2xl border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="size-4.5 text-orange-500" />
              About Me
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {teacher.bio || "No biography provided yet."}
            </p>
          </Card>

          {/* Subjects & Levels */}
          <Card className="p-5 sm:p-6 rounded-2xl border-slate-200 shadow-xs space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Subjects Taught
              </h4>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((sub) => (
                  <Badge
                    key={sub}
                    variant="secondary"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200/80"
                  >
                    {sub}
                  </Badge>
                ))}
              </div>
            </div>

            {teacher.targetStudentLevels && teacher.targetStudentLevels.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Target Student Levels
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.targetStudentLevels.map((lvl) => (
                    <Badge
                      key={lvl}
                      variant="outline"
                      className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200/60"
                    >
                      {lvl}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Education & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacher.education && teacher.education.length > 0 && (
              <Card className="p-5 rounded-2xl border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <GraduationCap className="size-4 text-orange-500" />
                  Education Credentials
                </h3>
                <div className="space-y-3 pt-1">
                  {teacher.education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-orange-400 pl-3 space-y-0.5">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {edu.degree}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {edu.institution}
                      </p>
                      {edu.completionYear && (
                        <span className="text-[11px] text-slate-400">
                          Class of {edu.completionYear}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {teacher.experience && teacher.experience.length > 0 && (
              <Card className="p-5 rounded-2xl border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Briefcase className="size-4 text-orange-500" />
                  Teaching Experience
                </h3>
                <div className="space-y-3 pt-1">
                  {teacher.experience.map((exp) => (
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
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <Button variant="link" asChild className="text-xs font-semibold text-orange-600 hover:text-orange-700 p-0">
            <Link href={`/student/teachers/${teacher.id}`}>
              <span>Open Dedicated Profile Page</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Link href={`/student/teachers/${teacher.id}`}>
                Book Class ({teacher.currency} {teacher.hourlyRate.toLocaleString()})
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
