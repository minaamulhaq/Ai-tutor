"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  Heart,
  Clock,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Video,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Teacher } from "@/types/teacher";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TeacherCardProps {
  teacher: Teacher;
  viewMode?: "grid" | "list";
  onToggleFavorite?: (id: string) => void;
  onViewQuickProfile?: (teacher: Teacher) => void;
  className?: string;
}

export function TeacherCard({
  teacher,
  viewMode = "grid",
  onToggleFavorite,
  onViewQuickProfile,
  className,
}: TeacherCardProps) {
  const initials = `${(teacher.firstName || teacher.name.split(" ")[0] || "T").charAt(0)}${(
    teacher.lastName || teacher.name.split(" ")[1] || "T"
  ).charAt(0)}`.toUpperCase();

  const primaryEducation =
    teacher.education && teacher.education.length > 0
      ? teacher.education[0]
      : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(teacher.id);
    }
  };

  // ==========================================================================
  // LIST VIEW LAYOUT (Horizontal Detailed Card)
  // ==========================================================================
  if (viewMode === "list") {
    return (
      <Card
        className={cn(
          "group relative flex flex-col lg:flex-row justify-between overflow-hidden rounded-2xl border-slate-200/90 bg-white transition-all duration-200 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/5",
          className
        )}
      >
        <CardContent className="p-5 sm:p-6 flex-1 flex flex-col sm:flex-row gap-5 items-start">
          {/* Avatar Column */}
          <div className="relative shrink-0">
            <Avatar className="size-20 ring-2 ring-slate-100 shadow-2xs group-hover:ring-orange-200 transition-all">
              {teacher.avatarUrl && (
                <AvatarImage
                  src={teacher.avatarUrl}
                  alt={teacher.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            {teacher.isVerified && (
              <span
                title="Verified Tutor"
                className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs"
              >
                <ShieldCheck className="size-3 stroke-[2.5]" />
              </span>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/student/teachers/${teacher.id}`}
                    className="font-bold text-lg text-slate-900 hover:text-orange-600 transition-colors tracking-tight"
                  >
                    {teacher.name}
                  </Link>

                  {teacher.highlightBadge && (
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200/80 text-[10px] font-bold">
                      <Sparkles className="size-2.5 mr-1 text-orange-500" />
                      {teacher.highlightBadge}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                  {teacher.headline}
                </p>
              </div>

              {/* Rating & Classes Count */}
              <div className="flex items-center gap-2 text-xs shrink-0">
                {typeof teacher.rating === "number" && teacher.rating > 0 ? (
                  <div className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-lg">
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    <span>{teacher.rating.toFixed(1)}</span>
                    {typeof teacher.reviewCount === "number" && (
                      <span className="text-[11px] font-normal text-amber-600">
                        ({teacher.reviewCount})
                      </span>
                    )}
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-[11px] font-medium text-slate-500 bg-slate-100">
                    New Instructor
                  </Badge>
                )}

                {teacher.totalClassesTaught && (
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    • {teacher.totalClassesTaught} classes
                  </span>
                )}
              </div>
            </div>

            {/* Biography excerpt */}
            {teacher.bio && (
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {teacher.bio}
              </p>
            )}

            {/* Subjects & Credentials Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {teacher.subjects.map((subject) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200/60"
                >
                  {subject}
                </Badge>
              ))}

              {primaryEducation && (
                <span className="text-xs text-slate-500 flex items-center gap-1.5 ml-1">
                  <GraduationCap className="size-3.5 text-orange-500 shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {primaryEducation.degree}
                  </span>
                </span>
              )}
            </div>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              {teacher.responseSpeed && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                  <Zap className="size-3 text-amber-500" />
                  {teacher.responseSpeed}
                </span>
              )}
              {teacher.nextAvailableSlot && (
                <span className="inline-flex items-center gap-1 text-[11px] text-orange-800 font-semibold bg-orange-50/80 px-2 py-0.5 rounded-md border border-orange-200/60">
                  <Clock className="size-3 text-orange-600" />
                  Next: {teacher.nextAvailableSlot}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <Video className="size-3 text-emerald-600" />
                Live on Google Meet
              </span>
            </div>
          </div>
        </CardContent>

        {/* List View Right Side Action Panel */}
        <div className="p-5 sm:p-6 lg:border-l border-t lg:border-t-0 border-slate-100 flex lg:flex-col justify-between items-center lg:items-end gap-4 min-w-[210px] bg-slate-50/40">
          <div className="flex items-center gap-2 lg:flex-col lg:items-end">
            <div className="text-xl font-black text-slate-900 tracking-tight leading-none">
              {teacher.currency} {teacher.hourlyRate.toLocaleString()}
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              per 60-min session
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              aria-label={
                teacher.isFavorite
                  ? `Remove ${teacher.name} from favorites`
                  : `Add ${teacher.name} to favorites`
              }
              className={cn(
                "size-9 rounded-xl transition-all cursor-pointer",
                teacher.isFavorite
                  ? "bg-rose-50 text-rose-500 hover:bg-rose-100 ring-1 ring-rose-200"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              )}
            >
              <Heart
                className={cn(
                  "size-4.5 transition-transform",
                  teacher.isFavorite ? "fill-rose-500 scale-110" : "scale-100"
                )}
              />
            </Button>

            {onViewQuickProfile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onViewQuickProfile(teacher)}
                className="rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer h-9 px-3.5"
              >
                Quick View
              </Button>
            )}

            <Button
              asChild
              className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs hover:shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer h-9 px-4"
            >
              <Link href={`/student/teachers/${teacher.id}`}>
                <span>View Profile</span>
                <ArrowRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // ==========================================================================
  // GRID VIEW LAYOUT (Precisely Aligned Equal-Height Card)
  // ==========================================================================
  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between h-full overflow-hidden rounded-2xl border-slate-200/90 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6 space-y-3.5 flex-1 flex flex-col">
        {/* Top Header: Avatar, Name, Headline & Favorite Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            {/* Teacher Avatar with fallback */}
            <div className="relative shrink-0">
              <Avatar className="size-14 ring-2 ring-slate-100 shadow-2xs group-hover:ring-orange-200 transition-all">
                {teacher.avatarUrl && (
                  <AvatarImage
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {teacher.isVerified && (
                <span
                  title="Verified Tutor"
                  className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-2xs"
                >
                  <ShieldCheck className="size-3 stroke-[2.5]" />
                </span>
              )}
            </div>

            {/* Display Name & Headline */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/student/teachers/${teacher.id}`}
                  className="font-bold text-base text-slate-900 hover:text-orange-600 transition-colors truncate tracking-tight"
                  title={teacher.name}
                >
                  {teacher.name}
                </Link>
                {teacher.highlightBadge && (
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200/80 text-[10px] font-bold px-1.5 py-0">
                    {teacher.highlightBadge}
                  </Badge>
                )}
              </div>

              {/* Exact 2-line height clamp so all cards in the grid align evenly */}
              <p
                className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-snug min-h-[2rem]"
                title={teacher.headline}
              >
                {teacher.headline}
              </p>
            </div>
          </div>

          {/* Accessible Favorite Icon Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            aria-label={
              teacher.isFavorite
                ? `Remove ${teacher.name} from favorites`
                : `Add ${teacher.name} to favorites`
            }
            className={cn(
              "shrink-0 size-8.5 rounded-xl transition-all cursor-pointer -mr-1 -mt-1",
              teacher.isFavorite
                ? "bg-rose-50 text-rose-500 hover:bg-rose-100 ring-1 ring-rose-200"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            )}
          >
            <Heart
              className={cn(
                "size-4 transition-transform",
                teacher.isFavorite ? "fill-rose-500 scale-110" : "scale-100"
              )}
            />
          </Button>
        </div>

        {/* Rating and Social Proof (Even height) */}
        <div className="flex items-center gap-2 text-xs flex-wrap min-h-[1.5rem]">
          {typeof teacher.rating === "number" && teacher.rating > 0 ? (
            <div className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
              <Star className="size-3.5 fill-amber-500 text-amber-500" />
              <span>{teacher.rating.toFixed(1)}</span>
              {typeof teacher.reviewCount === "number" && (
                <span className="text-[11px] font-normal text-amber-600">
                  ({teacher.reviewCount})
                </span>
              )}
            </div>
          ) : (
            <Badge variant="secondary" className="text-[11px] font-medium text-slate-500 bg-slate-100">
              New Instructor
            </Badge>
          )}

          {teacher.totalClassesTaught && teacher.totalClassesTaught > 0 && (
            <span className="text-[11px] text-slate-500">
              • {teacher.totalClassesTaught} classes
            </span>
          )}

          {teacher.city && (
            <span className="text-[11px] text-slate-400 truncate">
              • {teacher.city}
            </span>
          )}
        </div>

        {/* Main Teaching Subjects (Even height) */}
        <div className="min-h-[1.75rem] flex items-center">
          <div className="flex flex-wrap gap-1.5">
            {teacher.subjects.slice(0, 3).map((subject) => (
              <Badge
                key={subject}
                variant="secondary"
                className="text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60 hover:bg-slate-200 transition-colors"
              >
                {subject}
              </Badge>
            ))}
            {teacher.subjects.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold text-slate-500 bg-slate-50 border-slate-200"
              >
                +{teacher.subjects.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Education & Student Levels Summary */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs mt-auto">
          {primaryEducation ? (
            <div className="flex items-center gap-1.5 text-slate-600 truncate h-5">
              <GraduationCap className="size-3.5 text-orange-500 shrink-0" />
              <span className="truncate">
                <strong className="font-semibold text-slate-800">
                  {primaryEducation.degree}
                </strong>
                {" • "}
                {primaryEducation.institution}
              </span>
            </div>
          ) : (
            <div className="h-5" />
          )}

          {teacher.targetStudentLevels && teacher.targetStudentLevels.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-500 truncate text-[11px] h-4">
              <Sparkles className="size-3 text-amber-500 shrink-0" />
              <span className="truncate">
                Levels: {teacher.targetStudentLevels.slice(0, 2).join(", ")}
                {teacher.targetStudentLevels.length > 2 && "..."}
              </span>
            </div>
          )}
        </div>

        {/* Next Available Slot Indicator (Consistent height) */}
        <div className="min-h-[2rem] flex items-center pt-1">
          {teacher.nextAvailableSlot ? (
            <div className="w-full p-1.5 px-2.5 rounded-xl bg-orange-50/70 border border-orange-100 flex items-center justify-between text-xs text-orange-900">
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="size-3.5 text-orange-600 shrink-0" />
                <span className="font-semibold text-[11px] truncate">
                  Next: {teacher.nextAvailableSlot}
                </span>
              </div>
              <span className="text-[10px] text-orange-700 font-bold uppercase tracking-wider shrink-0 bg-white px-1.5 py-0.5 rounded border border-orange-200">
                1-on-1
              </span>
            </div>
          ) : (
            <div className="w-full p-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="size-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px]">Flexible Schedule</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Card Footer: Aligned Price and View Profile Button */}
      <CardFooter className="p-5 sm:p-6 pt-0 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
        <div className="flex flex-col">
          <div className="text-lg font-black text-slate-900 tracking-tight leading-none">
            {teacher.currency} {teacher.hourlyRate.toLocaleString()}
          </div>
          <span className="text-[10px] font-medium text-slate-400 mt-0.5">
            per {teacher.sessionDurationMinutes || 60}-min class
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onViewQuickProfile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onViewQuickProfile(teacher)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer h-8.5 px-2.5"
            >
              Quick View
            </Button>
          )}

          <Button
            asChild
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs hover:shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer h-8.5 px-3.5"
          >
            <Link href={`/student/teachers/${teacher.id}`}>
              <span>View Profile</span>
              <ArrowRight className="size-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
