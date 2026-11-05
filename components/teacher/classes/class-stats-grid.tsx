"use client";

import React from "react";
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  CalendarX,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ClassSession } from "./types";
import { cn } from "@/lib/utils";

interface ClassStatsGridProps {
  classes: ClassSession[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export function ClassStatsGrid({
  classes,
  activeTab,
  onSelectTab,
}: ClassStatsGridProps) {
  const upcomingCount = classes.filter((c) => c.status === "confirmed" || c.status === "pending").length;
  const completedCount = classes.filter((c) => c.status === "completed").length;
  const cancelledCount = classes.filter((c) => c.status === "cancelled").length;

  // Find next upcoming session
  const nextUpcoming = classes
    .filter((c) => c.status === "confirmed")
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`).getTime() - new Date(`${b.date}T${b.startTime}`).getTime())[0];

  const stats = [
    {
      id: "total",
      title: "Total Classes",
      count: classes.length,
      subtext: `${upcomingCount} upcoming • ${completedCount} finished`,
      icon: BookOpen,
      iconColor: "text-blue-600 bg-blue-50 ring-blue-200/50",
      activeBg: "ring-2 ring-blue-500 bg-blue-50/20",
      tabValue: "all",
    },
    {
      id: "upcoming",
      title: "Upcoming Classes",
      count: upcomingCount,
      subtext: nextUpcoming ? `Next: ${nextUpcoming.date} at ${nextUpcoming.startTime}` : "No upcoming sessions",
      icon: CalendarClock,
      iconColor: "text-orange-600 bg-orange-50 ring-orange-200/50",
      activeBg: "ring-2 ring-orange-500 bg-orange-50/20",
      tabValue: "upcoming",
    },
    {
      id: "completed",
      title: "Completed Classes",
      count: completedCount,
      subtext: "Successfully finished sessions",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 bg-emerald-50 ring-emerald-200/50",
      activeBg: "ring-2 ring-emerald-500 bg-emerald-50/20",
      tabValue: "completed",
    },
    {
      id: "cancelled",
      title: "Cancelled Classes",
      count: cancelledCount,
      subtext: "Refunded or called off",
      icon: CalendarX,
      iconColor: "text-rose-600 bg-rose-50 ring-rose-200/50",
      activeBg: "ring-2 ring-rose-500 bg-rose-50/20",
      tabValue: "cancelled",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isCurrentActive = activeTab === stat.tabValue;

        return (
          <Card
            key={stat.id}
            onClick={() => onSelectTab(stat.tabValue)}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-slate-200/80 relative overflow-hidden group select-none",
              isCurrentActive && stat.activeBg
            )}
          >
            {/* Top highlight bar on active */}
            {isCurrentActive && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
            )}

            <CardContent className="p-4 sm:p-5 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {stat.count}
                  </span>
                  {stat.badgeHighlight && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Action Needed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate max-w-[180px]">
                  {stat.subtext}
                </p>
              </div>

              <div
                className={cn(
                  "size-10 sm:size-11 rounded-xl flex items-center justify-center ring-1 transition-transform group-hover:scale-105 shrink-0",
                  stat.iconColor
                )}
              >
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
