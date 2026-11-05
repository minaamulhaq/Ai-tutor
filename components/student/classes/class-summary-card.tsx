"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar, CheckCircle2, XCircle, ArrowUpRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassSummaryCardProps {
  type: "total" | "upcoming" | "completed" | "cancelled";
  count: number;
  subtext?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function ClassSummaryCard({
  type,
  count,
  subtext,
  isActive,
  onClick,
}: ClassSummaryCardProps) {
  const configs = {
    total: {
      title: "Total Classes",
      icon: BookOpen,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      activeRing: "ring-2 ring-blue-500 border-blue-300 bg-blue-50/20",
      defaultSubtext: "All-time bookings",
    },
    upcoming: {
      title: "Upcoming Sessions",
      icon: Calendar,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      activeRing: "ring-2 ring-orange-500 border-orange-300 bg-orange-50/20",
      defaultSubtext: "Confirmed & ready",
    },

    completed: {
      title: "Completed Classes",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      activeRing: "ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50/20",
      defaultSubtext: "100% Attendance rate",
    },
    cancelled: {
      title: "Cancelled Sessions",
      icon: XCircle,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      activeRing: "ring-2 ring-rose-500 border-rose-300 bg-rose-50/20",
      defaultSubtext: "Refunds processed",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl border bg-white shadow-xs transition-all cursor-pointer relative overflow-hidden group hover:shadow-md",
        isActive ? config.activeRing : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {config.title}
        </span>
        <div
          className={cn(
            "size-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
            config.bgColor,
            config.iconColor
          )}
        >
          <Icon className="size-4.5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {count}
        </div>
        <div className="text-xs font-semibold text-slate-500 flex items-center gap-0.5 group-hover:text-slate-900 transition-colors">
          <span>{subtext || config.defaultSubtext}</span>
          <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Ambient subtle bottom color stripe */}
      <div
        className={cn(
          "absolute bottom-0 inset-x-0 h-1 transition-opacity",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          type === "upcoming" && "bg-orange-500",
          type === "completed" && "bg-emerald-500",
          type === "cancelled" && "bg-rose-500"
        )}
      />
    </Card>
  );
}
