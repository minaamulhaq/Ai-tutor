"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Calendar, CheckCircle2, XCircle, Search, Compass, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClassStatus } from "@/types/class";

interface ClassEmptyStateProps {
  statusTab: ClassStatus;
  isFiltered: boolean;
  onResetFilters?: () => void;
}

export function ClassEmptyState({
  statusTab,
  isFiltered,
  onResetFilters,
}: ClassEmptyStateProps) {
  if (isFiltered) {
    return (
      <Card className="p-10 rounded-2xl border-slate-200 bg-white text-center space-y-4 max-w-md mx-auto my-8 shadow-xs">
        <div className="size-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto ring-8 ring-orange-50/50">
          <Search className="size-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">No Matching Classes Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            No sessions match your search query or active filters. Try adjusting the date range or subject.
          </p>
        </div>
        {onResetFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="rounded-xl text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            <span>Reset All Filters</span>
          </Button>
        )}
      </Card>
    );
  }

  const emptyConfigs = {
    upcoming: {
      icon: Calendar,
      title: "No Upcoming Classes Scheduled",
      description: "You don't have any confirmed 1-on-1 sessions lined up right now. Explore top-rated tutors and book your next class!",
      actionText: "Browse Top Tutors",
      actionHref: "/student/find-teachers",
    },
    completed: {
      icon: CheckCircle2,
      title: "No Completed Classes Yet",
      description: "Once you complete 1-on-1 sessions with your instructors, your session history, downloadable notes, and reviews will appear here.",
      actionText: "Find a Tutor",
      actionHref: "/student/find-teachers",
    },
    cancelled: {
      icon: XCircle,
      title: "No Cancelled Classes",
      description: "You have not cancelled any sessions. All your active and scheduled classes are in good standing.",
      actionText: "Book New Class",
      actionHref: "/student/find-teachers",
    },
  };

  const config = emptyConfigs[statusTab];
  const Icon = config.icon;

  return (
    <Card className="p-12 rounded-2xl border-slate-200 bg-white text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
      <div className="size-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto ring-8 ring-orange-50/50">
        <Icon className="size-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900">{config.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {config.description}
        </p>
      </div>
      <div className="pt-2">
        <Button asChild className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs h-10 px-6 shadow-md shadow-orange-500/20 cursor-pointer">
          <Link href={config.actionHref}>
            <Compass className="size-4 mr-2" />
            <span>{config.actionText}</span>
          </Link>
        </Button>
      </div>
    </Card>
  );
}
