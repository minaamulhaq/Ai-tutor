"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  Receipt,
  Clock,
  RotateCcw,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SummaryCardType =
  | "total_spent"
  | "transactions"
  | "pending"
  | "refunded";

interface PaymentSummaryCardProps {
  type: SummaryCardType;
  title: string;
  value: string | number;
  subtext: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function PaymentSummaryCard({
  type,
  title,
  value,
  subtext,
  isActive = false,
  onClick,
}: PaymentSummaryCardProps) {
  const configs = {
    total_spent: {
      icon: Wallet,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      accentBorder: "border-orange-500",
      activeRing: "ring-2 ring-orange-500 border-orange-300 bg-orange-50/20",
    },
    transactions: {
      icon: Receipt,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      accentBorder: "border-blue-500",
      activeRing: "ring-2 ring-blue-500 border-blue-300 bg-blue-50/20",
    },
    pending: {
      icon: Clock,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      accentBorder: "border-amber-500",
      activeRing: "ring-2 ring-amber-500 border-amber-300 bg-amber-50/20",
    },
    refunded: {
      icon: RotateCcw,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      accentBorder: "border-rose-500",
      activeRing: "ring-2 ring-rose-500 border-rose-300 bg-rose-50/20",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 sm:p-5 rounded-2xl border bg-white shadow-xs transition-all cursor-pointer relative overflow-hidden group hover:shadow-md",
        isActive ? config.activeRing : "border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {title}
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

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
          {value}
        </div>
        <div className="text-xs font-semibold text-slate-500 flex items-center gap-0.5 group-hover:text-slate-900 transition-colors shrink-0">
          <span>{subtext}</span>
          <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Ambient bottom color stripe */}
      <div
        className={cn(
          "absolute bottom-0 inset-x-0 h-1 transition-opacity",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          config.accentBorder.replace("border-", "bg-")
        )}
      />
    </Card>
  );
}
