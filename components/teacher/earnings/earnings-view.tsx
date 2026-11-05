"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  ArrowUpRight,
  History,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EarningsSummary,
  Transaction,
  PayoutRecord,
  MonthlyEarningsBreakdown,
  formatPKR,
} from "./types";
import {
  apiFetchAllEarningsData,
} from "./earnings-service";
import { EarningsSummaryCards } from "./earnings-summary-cards";
import { EarningsBreakdownChart } from "./earnings-breakdown-chart";
import { TransactionsTable } from "./transactions-table";
import { RequestPayoutDialog } from "./request-payout-dialog";
import { PayoutHistoryDialog } from "./payout-history-dialog";
import { EarningsSkeleton } from "./earnings-skeleton";
import { EarningsEmptyState } from "./earnings-empty-state";
import { createClient } from "@/utils/supabase/client";

export function TeacherEarningsView() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyEarningsBreakdown[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  // Dialog state
  const [isRequestPayoutOpen, setIsRequestPayoutOpen] = useState(false);
  const [isPayoutHistoryOpen, setIsPayoutHistoryOpen] = useState(false);

  // Toast banner state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setHasError(false);
    try {
      const data = await apiFetchAllEarningsData();
      setSummary(data.summary);
      setTransactions(data.transactions);
      setPayouts(data.payouts);
      setMonthlyData(data.monthlyData);
      if (data.teacherId) {
        setTeacherId(data.teacherId);
      }
    } catch (err) {
      console.error("Error loading real earnings data:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Realtime Supabase Channel for instant booking & payout updates
  useEffect(() => {
    if (!teacherId) return;

    let channel: any = null;
    try {
      const supabase = createClient();
      const channelName = `teacher-earnings-sync:${teacherId}`;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `teacher_id=eq.${teacherId}`,
          },
          () => {
            loadData(false);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "teacher_payouts",
            filter: `teacher_id=eq.${teacherId}`,
          },
          () => {
            loadData(false);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsRealtimeActive(true);
          }
        });
    } catch (err) {
      console.warn("Realtime subscription notice in TeacherEarningsView:", err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [teacherId, loadData]);

  const handlePayoutSuccess = (newPayout: PayoutRecord) => {
    // 1. Update payouts list
    setPayouts((prev) => [newPayout, ...prev]);

    // 2. Add as transaction
    const newTxn: Transaction = {
      id: `txn-${newPayout.id}`,
      referenceId: newPayout.referenceId,
      date: newPayout.requestedAt.split(",")[0],
      timestamp: newPayout.requestedAt,
      type: "payout",
      grossAmount: newPayout.amount,
      platformFee: 0,
      netAmount: newPayout.amount,
      status: "processing",
      payoutMethod: newPayout.methodLabel,
      description: `Payout withdrawal via ${newPayout.methodLabel} (${newPayout.accountDetails})`,
    };
    setTransactions((prev) => [newTxn, ...prev]);

    // 3. Update summary state
    if (summary) {
      setSummary({
        ...summary,
        availableBalance: Math.max(0, summary.availableBalance - newPayout.amount),
        totalWithdrawn: summary.totalWithdrawn + newPayout.amount,
      });
    }

    showToast(
      `Payout request #${newPayout.referenceId} for ${formatPKR(
        newPayout.amount
      )} submitted successfully! Clearing in progress.`,
      "success"
    );
  };

  if (isLoading) {
    return <EarningsSkeleton />;
  }

  if (hasError || !summary) {
    return <EarningsEmptyState type="error" onRetry={() => loadData(true)} />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification Alert Banner */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toastMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs font-semibold ml-3 hover:underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Earnings
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              PKR Currency
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Track your class revenue, escrow holds, commission fees, and withdrawal settlements.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadData(false)}
            disabled={isLoading || isRefreshing}
            className="rounded-xl border-slate-200 text-slate-700 hover:text-slate-900 text-xs sm:text-sm h-9.5 px-3.5 gap-1.5 shadow-2xs cursor-pointer"
            title="Refresh earnings"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin text-orange-500" : ""}`}
            />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsPayoutHistoryOpen(true)}
            className="rounded-xl border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm h-9.5 px-3.5 gap-2 cursor-pointer shadow-2xs"
          >
            <History className="size-4" />
            <span>Payout History ({payouts.length})</span>
          </Button>

          <Button
            onClick={() => setIsRequestPayoutOpen(true)}
            disabled={summary.availableBalance <= 0}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm h-9.5 px-4 gap-2 cursor-pointer shadow-2xs hover:shadow-orange-500/20 disabled:opacity-50"
          >
            <ArrowUpRight className="size-4" />
            <span>Withdraw Funds</span>
          </Button>
        </div>
      </div>

      {/* 1. Four Summary Cards */}
      <EarningsSummaryCards
        summary={summary}
        onRequestPayout={() => setIsRequestPayoutOpen(true)}
      />

      {/* 2. Monthly Earnings Breakdown & Trends Chart */}
      <EarningsBreakdownChart
        monthlyData={monthlyData}
      />

      {/* 3. Transaction History Table (Desktop Table + Mobile Cards) */}
      <TransactionsTable transactions={transactions} />

      {/* Request Payout Dialog */}
      <RequestPayoutDialog
        open={isRequestPayoutOpen}
        onOpenChange={setIsRequestPayoutOpen}
        availableBalanceUsd={summary.availableBalance}
        onPayoutSuccess={handlePayoutSuccess}
      />

      {/* Payout History Dialog */}
      <PayoutHistoryDialog
        open={isPayoutHistoryOpen}
        onOpenChange={setIsPayoutHistoryOpen}
        payouts={payouts}
      />
    </div>
  );
}
