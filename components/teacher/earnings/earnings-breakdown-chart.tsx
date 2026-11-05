"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Percent,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  MonthlyEarningsBreakdown,
  formatPKR,
} from "./types";
import { ClassSession } from "@/components/teacher/classes/types";

interface EarningsBreakdownChartProps {
  monthlyData: MonthlyEarningsBreakdown[];
  completedSessions?: ClassSession[];
}

export function EarningsBreakdownChart({
  monthlyData,
  completedSessions,
}: EarningsBreakdownChartProps) {
  // Find highest earnings month or latest month to default to
  const initialMonth = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return "";
    // Default to latest month with earnings if any, else last month
    const withEarnings = [...monthlyData].reverse().find((m) => m.net > 0);
    return withEarnings?.month || monthlyData[monthlyData.length - 1]?.month || "";
  }, [monthlyData]);

  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);

  useEffect(() => {
    if (initialMonth && (!selectedMonth || !monthlyData.some((m) => m.month === selectedMonth))) {
      setSelectedMonth(initialMonth);
    }
  }, [initialMonth, monthlyData, selectedMonth]);

  // Find maximum net value to scale bar heights proportionally
  const maxNet = useMemo(() => {
    const values = monthlyData.map((d) => d.net);
    return Math.max(...values, 1);
  }, [monthlyData]);

  const activeMonthData =
    monthlyData.find((d) => d.month === selectedMonth) ||
    monthlyData[monthlyData.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4.5 text-orange-500" />
            <h3 className="font-bold text-base text-slate-900">
              Monthly Earnings Trends & Performance
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Net income after platform commission (15%) across billing cycles.
          </p>
        </div>

        {activeMonthData && (
          <Badge
            variant="secondary"
            className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-3 py-1 font-semibold self-start sm:self-auto"
          >
            {activeMonthData.month}: {formatPKR(activeMonthData.net)}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive CSS Bar Chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 sm:h-52 w-full flex items-end justify-between gap-3 sm:gap-6 pt-8 pb-2 px-2 border-b border-slate-100">
            {monthlyData.map((item) => {
              const hasEarnings = item.net > 0;
              const heightPercent = hasEarnings
                ? Math.max(Math.round((item.net / maxNet) * 100), 24)
                : 0;
              const isSelected = item.month === selectedMonth;

              return (
                <div
                  key={item.month}
                  onClick={() => setSelectedMonth(item.month)}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                >
                  {/* Tooltip on hover or when selected with earnings */}
                  {hasEarnings ? (
                    <div
                      className={`mb-2 text-[11px] font-bold transition-all px-2 py-0.5 rounded-lg shadow-2xs whitespace-nowrap ${
                        isSelected
                          ? "bg-slate-900 text-white opacity-100 scale-105"
                          : "bg-slate-100 text-slate-700 opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      {formatPKR(item.net)}
                    </div>
                  ) : (
                    <div
                      className={`mb-2 text-[10px] transition-all px-1.5 py-0.5 rounded whitespace-nowrap text-slate-400 ${
                        isSelected
                          ? "opacity-60 text-slate-400"
                          : "opacity-0 group-hover:opacity-60"
                      }`}
                    >
                      PKR 0
                    </div>
                  )}

                  {/* Bar Track & Fill */}
                  <div className="w-full max-w-[48px] bg-slate-50 rounded-t-xl overflow-hidden flex flex-col justify-end h-full border border-slate-100/80">
                    {hasEarnings ? (
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-t from-orange-600 to-orange-400 shadow-md shadow-orange-500/25"
                            : "bg-orange-200/90 hover:bg-orange-300"
                        }`}
                      />
                    ) : (
                      <div className="w-full h-1 bg-slate-200 rounded-full mx-auto" />
                    )}
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-xs mt-2 font-medium transition-colors ${
                      isSelected
                        ? "text-orange-600 font-bold"
                        : "text-slate-500 group-hover:text-slate-900"
                    }`}
                  >
                    {item.shortMonth}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-orange-500" />
              Net Income (85% payout)
            </span>
            <span className="text-[11px] text-slate-400">
              Click any month bar to inspect breakdown
            </span>
          </div>
        </div>

        {/* Right Column: Active Month Financial Summary */}
        {activeMonthData && (
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {activeMonthData.month} Summary
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeMonthData.classCount} completed {activeMonthData.classCount === 1 ? "class" : "classes"}
                </span>
              </div>

              {activeMonthData.classCount > 0 ? (
                <div className="space-y-2 text-xs">
                  {/* Gross Booking Volume */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-slate-500 font-medium">Gross Bookings</span>
                    <span className="font-bold text-slate-900">
                      {formatPKR(activeMonthData.gross)}
                    </span>
                  </div>

                  {/* ZuhDemy Platform Commission (15%) */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      Platform Fee (15%)
                    </span>
                    <span className="font-semibold text-slate-600">
                      -{formatPKR(activeMonthData.platformFee)}
                    </span>
                  </div>

                  {/* Net Teacher Earnings */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 shadow-2xs">
                    <span className="text-emerald-800 font-bold">Your Net Payout</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      {formatPKR(activeMonthData.net)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white border border-slate-100 text-center space-y-1.5 shadow-2xs">
                  <p className="text-xs font-semibold text-slate-700">
                    No completed classes in {activeMonthData.month}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Earnings for scheduled sessions in this month will settle here once classes conclude.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-200/60 pt-3">
              Payments are automatically credited to your available balance upon class conclusion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
