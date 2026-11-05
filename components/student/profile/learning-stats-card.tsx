import React from "react";
import { Clock, BookCheck, Users, Flame, Award } from "lucide-react";
import { StudentStats } from "./types";

interface LearningStatsCardProps {
  stats: StudentStats;
}

export function LearningStatsCard({ stats }: LearningStatsCardProps) {
  const safeStats = stats || {
    totalHoursLearned: 0,
    classesCompleted: 0,
    activeTutorsCount: 0,
    attendanceRate: 100,
    currentStreakDays: 1,
  };

  const statItems = [
    {
      label: "Total Hours Learned",
      value: `${safeStats.totalHoursLearned} hrs`,
      subtitle: "1-on-1 & Live Sessions",
      icon: Clock,
      iconColor: "text-orange-600 bg-orange-50",
    },
    {
      label: "Classes Completed",
      value: `${safeStats.classesCompleted}`,
      subtitle: `${safeStats.attendanceRate}% Attendance Rate`,
      icon: BookCheck,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Enrolled / Saved Tutors",
      value: `${safeStats.activeTutorsCount}`,
      subtitle: "Verified Instructors",
      icon: Users,
      iconColor: "text-blue-600 bg-blue-50",
    },
    {
      label: "Study Streak",
      value: `${safeStats.currentStreakDays} Days`,
      subtitle: "Consecutive Activity 🔥",
      icon: Flame,
      iconColor: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-orange-200 hover:shadow-sm transition-all flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {item.label}
              </span>
              <div
                className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconColor}`}
              >
                <Icon className="size-4.5" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900">
                {item.value}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                {item.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
