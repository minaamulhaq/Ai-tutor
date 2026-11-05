"use client";

import React from "react";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EarningsSummary, formatPKR } from "./types";

interface EarningsSummaryCardsProps {
  summary: EarningsSummary;
  onRequestPayout: () => void;
}

export function EarningsSummaryCards({
  summary,
  onRequestPayout,
}: EarningsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Lifetime Earnings */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3 relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Earnings
          </span>
          <div className="size-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <TrendingUp className="size-4.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatPKR(summary.totalEarnings)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lifetime net earned from completed classes
          </p>
        </div>
      </div>

      {/* 2. Available Balance (With Primary Withdrawal Action) */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-orange-500/15 space-y-3 relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-orange-100 uppercase tracking-wider">
            Available Balance
          </span>
          <div className="size-9 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur-xs">
            <Wallet className="size-4.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight">
            {formatPKR(summary.availableBalance)}
          </div>
          <p className="text-xs text-orange-100/90 mt-1">
            Eligible for immediate withdrawal
          </p>
        </div>

        <div className="pt-1">
          <Button
            size="sm"
            onClick={onRequestPayout}
            disabled={summary.availableBalance <= 0}
            className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold text-xs h-8.5 rounded-xl gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpRight className="size-3.5" />
            <span>Request Payout</span>
          </Button>
        </div>
      </div>

      {/* 3. Pending Earnings (Escrow for confirmed upcoming classes) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3 relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pending Earnings
          </span>
          <div className="size-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <Clock className="size-4.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatPKR(summary.pendingEarnings)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Held in escrow for upcoming confirmed classes
          </p>
        </div>
      </div>

      {/* 4. Total Withdrawn */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3 relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Withdrawn
          </span>
          <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <CheckCircle2 className="size-4.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatPKR(summary.totalWithdrawn)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Successfully settled to your accounts
          </p>
        </div>
      </div>
    </div>
  );
}
