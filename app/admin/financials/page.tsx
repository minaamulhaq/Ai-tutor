"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Lock,
  RotateCcw,
  Receipt,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Scale,
  RefreshCw,
  HelpCircle,
  FileText,
  User,
  Check,
  X,
  Plus,
  ChevronLeft,
  Banknote,
} from "lucide-react";
import {
  getFinancialOverviewAction,
  getPaymentsListAction,
  getHeldFundsListAction,
  getPlatformRevenueAction,
  getTransactionsLedgerAction,
  getRefundsAndDisputesAction,
  resolveDisputeActionServer,
  processRefundActionServer,
  triggerReconciliationActionServer,
  seedRealisticFinancialsAction,
  getTeacherPayoutsListAction,
  updateTeacherPayoutStatusActionServer,
} from "@/app/actions/financialActions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function formatPkr(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("PKR", "Rs.");
}

export default function AdminFinancialsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFilter, setDateFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Data states
  const [overviewData, setOverviewData] = useState<any>(null);
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [paymentsPagination, setPaymentsPagination] = useState<any>({ page: 1, total: 0, totalPages: 1 });
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const [heldFundsData, setHeldFundsData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>(null);

  // Ledger state & filters
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [ledgerPagination, setLedgerPagination] = useState<any>({ page: 1, total: 0, totalPages: 1 });
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerAccountFilter, setLedgerAccountFilter] = useState("all");
  const [ledgerEventTypeFilter, setLedgerEventTypeFilter] = useState("all");

  const [disputesData, setDisputesData] = useState<any[]>([]);
  const [refundsData, setRefundsData] = useState<any[]>([]);

  // Teacher Payouts state
  const [payoutsData, setPayoutsData] = useState<any[]>([]);
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("all");
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const [payoutActionStatus, setPayoutActionStatus] = useState<"completed" | "failed">("completed");
  const [payoutAdminNote, setPayoutAdminNote] = useState("");

  // Dialog states
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [disputeResolutionType, setDisputeResolutionType] = useState<"teacher" | "refund">("teacher");
  const [disputeNotes, setDisputeNotes] = useState("");

  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<string>("");

  const [selectedLedgerItem, setSelectedLedgerItem] = useState<any | null>(null);

  // Dedicated data loaders
  const loadPaymentsOnly = (page = paymentsPage, search = paymentSearch, status = paymentStatusFilter) => {
    startTransition(async () => {
      try {
        const payRes = await getPaymentsListAction({ page, limit: 15, search, status });
        if (payRes.success) {
          setPaymentsData(payRes.data.payments);
          setPaymentsPagination(payRes.data.pagination);
        }
      } catch (err) {
        console.error("Error loading payments:", err);
      }
    });
  };

  const loadLedgerOnly = (page = ledgerPage, accountCode = ledgerAccountFilter, eventType = ledgerEventTypeFilter) => {
    startTransition(async () => {
      try {
        const ledRes = await getTransactionsLedgerAction({ page, limit: 25, accountCode, eventType });
        if (ledRes.success) {
          setLedgerData(ledRes.data.entries);
          setLedgerPagination(ledRes.data.pagination);
        }
      } catch (err) {
        console.error("Error loading ledger:", err);
      }
    });
  };

  const loadPayoutsOnly = (status = payoutStatusFilter) => {
    startTransition(async () => {
      try {
        const pRes = await getTeacherPayoutsListAction({ status });
        if (pRes.success) {
          setPayoutsData(pRes.data);
        }
      } catch (err) {
        console.error("Error loading payouts:", err);
      }
    });
  };

  // Initial full load
  const loadAllData = () => {
    startTransition(async () => {
      try {
        const [ovRes, payRes, heldRes, revRes, ledRes, disRes, pRes] = await Promise.all([
          getFinancialOverviewAction(dateFilter),
          getPaymentsListAction({ page: paymentsPage, search: paymentSearch, status: paymentStatusFilter }),
          getHeldFundsListAction(),
          getPlatformRevenueAction(),
          getTransactionsLedgerAction({ page: ledgerPage, accountCode: ledgerAccountFilter, eventType: ledgerEventTypeFilter }),
          getRefundsAndDisputesAction(),
          getTeacherPayoutsListAction({ status: payoutStatusFilter }),
        ]);

        if (ovRes.success) setOverviewData(ovRes.data);
        if (payRes.success) {
          setPaymentsData(payRes.data.payments);
          setPaymentsPagination(payRes.data.pagination);
        }
        if (heldRes.success) setHeldFundsData(heldRes.data);
        if (revRes.success) setRevenueData(revRes.data);
        if (ledRes.success) {
          setLedgerData(ledRes.data.entries);
          setLedgerPagination(ledRes.data.pagination);
        }
        if (disRes.success) {
          setDisputesData(disRes.data.disputes);
          setRefundsData(disRes.data.refunds);
        }
        if (pRes.success) setPayoutsData(pRes.data);
      } catch (err: any) {
        console.error("Error loading financial data:", err);
      }
    });
  };

  useEffect(() => {
    loadAllData();
  }, [dateFilter]);

  // Reactive search and filter effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setPaymentsPage(1);
      loadPaymentsOnly(1, paymentSearch, paymentStatusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [paymentSearch, paymentStatusFilter]);

  useEffect(() => {
    setLedgerPage(1);
    loadLedgerOnly(1, ledgerAccountFilter, ledgerEventTypeFilter);
  }, [ledgerAccountFilter, ledgerEventTypeFilter]);

  useEffect(() => {
    loadPayoutsOnly(payoutStatusFilter);
  }, [payoutStatusFilter]);

  const handleUpdatePayout = () => {
    if (!selectedPayout) return;
    startTransition(async () => {
      const res = await updateTeacherPayoutStatusActionServer({
        payoutId: selectedPayout.id,
        status: payoutActionStatus,
        adminNote: payoutAdminNote || undefined,
      });
      if (res.success) {
        setStatusMessage(
          payoutActionStatus === "completed"
            ? `Payout ${selectedPayout.referenceId} approved & settled. Double-entry ledger entry posted.`
            : `Payout ${selectedPayout.referenceId} marked as declined.`
        );
        setSelectedPayout(null);
        setPayoutAdminNote("");
        loadAllData();
      } else {
        setStatusMessage(res.error || "Failed to update payout.");
      }
      setTimeout(() => setStatusMessage(null), 6000);
    });
  };

  // Actions
  const handleRunReconciliation = () => {
    startTransition(async () => {
      const res = await triggerReconciliationActionServer();
      setStatusMessage(res.message);
      loadAllData();
      setTimeout(() => setStatusMessage(null), 6000);
    });
  };

  const handleSeedFinancials = () => {
    startTransition(async () => {
      const res = await seedRealisticFinancialsAction();
      setStatusMessage(res.message);
      loadAllData();
      setTimeout(() => setStatusMessage(null), 6000);
    });
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    startTransition(async () => {
      await resolveDisputeActionServer({
        disputeId: selectedDispute.id,
        resolutionType: disputeResolutionType,
        resolutionNotes: disputeNotes || "Administrative resolution applied.",
      });
      setSelectedDispute(null);
      setDisputeNotes("");
      loadAllData();
      setStatusMessage("Dispute resolved and ledger reallocated successfully.");
      setTimeout(() => setStatusMessage(null), 5000);
    });
  };

  const handleProcessRefund = async () => {
    if (!selectedBookingForRefund) return;
    startTransition(async () => {
      await processRefundActionServer({
        bookingId: selectedBookingForRefund.bookingId,
        reason: refundReason || "Administrative refund issued.",
        refundAmountPkr: refundAmount ? parseFloat(refundAmount) : undefined,
      });
      setSelectedBookingForRefund(null);
      setRefundReason("");
      setRefundAmount("");
      loadAllData();
      setStatusMessage("Refund recorded and balanced reversal posted.");
      setTimeout(() => setStatusMessage(null), 5000);
    });
  };

  const m = overviewData?.metrics;
  const p = overviewData?.provider;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Financial Management &amp; Escrow Tracking
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Nominal Ledger
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Immutable double-entry accounting records, funds-held liabilities, revenue splits, and external Safepay reconciliation audit.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunReconciliation}
            disabled={isPending}
            className="h-9 px-3.5 rounded-xl border-slate-700 bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 text-xs font-semibold"
          >
            <RefreshCw className={cn("size-3.5 mr-1.5", isPending && "animate-spin")} />
            Reconcile &amp; Sync
          </Button>

          <Button
            size="sm"
            onClick={handleSeedFinancials}
            disabled={isPending}
            className="h-9 px-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md shadow-orange-600/20"
          >
            <Sparkles className="size-3.5 mr-1.5" />
            Seed Initial Records
          </Button>
        </div>
      </div>

      {/* Global Status Banner if present */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Date Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 pl-2">
          <Calendar className="size-3.5 text-orange-500" />
          <span>Accounting Period:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: "today", label: "Today" },
            { id: "7d", label: "Last 7 Days" },
            { id: "30d", label: "Last 30 Days" },
            { id: "month", label: "This Month" },
            { id: "all", label: "All Time" },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDateFilter(d.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                dateFilter === d.id
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto gap-1">
          <TabsTrigger value="overview" className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Payments
          </TabsTrigger>
          <TabsTrigger value="held" className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Held Funds
          </TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Platform Revenue
          </TabsTrigger>
          <TabsTrigger value="ledger" className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Transactions Ledger
          </TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white flex items-center justify-center gap-1.5">
            <span>Teacher Payouts</span>
            {payoutsData.filter((p) => p.status === "processing").length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {payoutsData.filter((p) => p.status === "processing").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="disputes" className="rounded-xl py-2.5 text-xs font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Refunds &amp; Disputes
          </TabsTrigger>
        </TabsList>

        {/* =========================================================================
            TAB A: FINANCIAL OVERVIEW
           ========================================================================= */}
        <TabsContent value="overview" className="space-y-6">
          {/* Top 4 Primary Core Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Collected */}
            <Card className="bg-slate-900/80 border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <CreditCard className="size-16 text-emerald-400" />
              </div>
              <CardContent className="p-5">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Total Collected
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {formatPkr(m?.totalCollectedPkr || 0)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-2">
                  <CheckCircle2 className="size-3.5" />
                  <span>{m?.successfulPaymentsCount || 0} successful student payments</span>
                </div>
              </CardContent>
            </Card>

            {/* 2. Provider Settlement Clearing */}
            <Card className="bg-slate-900/80 border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Scale className="size-16 text-blue-400" />
              </div>
              <CardContent className="p-5">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Provider Pending Settlement
                </span>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1">
                  {formatPkr(m?.providerPendingSettlementPkr || 0)}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Asset in clearing account (Safepay/Direct)
                </p>
              </CardContent>
            </Card>

            {/* 3. Held Teacher Earnings */}
            <Card className="bg-slate-900/80 border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lock className="size-16 text-amber-400" />
              </div>
              <CardContent className="p-5">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Held Teacher Earnings
                </span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                  {formatPkr(m?.heldTeacherEarningsPkr || 0)}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Liabilities held pending 24h completion
                </p>
              </CardContent>
            </Card>

            {/* 4. Net Platform Revenue */}
            <Card className="bg-slate-900/80 border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="size-16 text-orange-400" />
              </div>
              <CardContent className="p-5">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Net Platform Revenue
                </span>
                <div className="text-2xl sm:text-3xl font-black text-orange-500 mt-1">
                  {formatPkr(m?.netPlatformRevenuePkr || 0)}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Gross commissions minus provider fees
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary 7 Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* Eligible for Payout */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Eligible Earnings</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">
                {formatPkr(m?.eligibleTeacherEarningsPkr || 0)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">24h passed, no disputes</span>
            </div>

            {/* Disputed / Frozen */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Disputed / Frozen</span>
              <div className="text-lg font-bold text-rose-400 mt-1">
                {formatPkr(m?.disputedTeacherEarningsPkr || 0)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Frozen under review</span>
            </div>

            {/* Platform Commission Earned */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Gross Commission</span>
              <div className="text-lg font-bold text-white mt-1">
                {formatPkr(m?.platformCommissionPkr || 0)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">15% platform take</span>
            </div>

            {/* Provider Fees */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Provider Fees</span>
              <div className="text-lg font-bold text-slate-300 mt-1">
                {formatPkr(m?.providerFeesPkr || 0)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">Gateway expense</span>
            </div>

            {/* Total Refunds */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Refunds</span>
              <div className="text-lg font-bold text-rose-400 mt-1">
                {formatPkr(m?.refundsPkr || 0)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1">{m?.refundsCount || 0} refunds completed</span>
            </div>

            {/* External Provider Balance */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Safepay Gateway Balance</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase",
                    p?.isConnected ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                  )}
                >
                  {p?.isConnected ? "Live API" : "Internal Sync"}
                </span>
              </div>
              <div className="text-lg font-bold text-white mt-1">
                {p?.providerAvailableBalancePkr !== null && p?.providerAvailableBalancePkr !== undefined
                  ? formatPkr(p.providerAvailableBalancePkr)
                  : `${formatPkr(m?.providerPendingSettlementPkr || 0)} (Internal)`}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 truncate">
                Last synced: {p?.lastSyncedAt ? new Date(p.lastSyncedAt).toLocaleTimeString() : "Just now"}
              </span>
            </div>
          </div>

          {/* Legal / Escrow Clarification Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle className="size-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-amber-300 font-semibold">Accounting &amp; Funds-Held Policy Notice:</strong>
              <p className="text-slate-300 leading-relaxed">
                Money received from students is tracked as an internal liability (<strong>Funds Held / Teacher Payables</strong>) and is never counted as platform revenue. 
                Funds remain held during the active session and for <strong>24 hours post-class</strong> before transitioning to <strong>Eligible for Payout</strong>. 
                In compliance with financial regulations, funds are labeled as internal liabilities and are not legally escrowed unless contracted through a licensed escrow trust institution.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB B: PAYMENTS
           ========================================================================= */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search by student, teacher, or ref..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="pl-9 h-9 bg-slate-900 border-slate-800 text-xs text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partially_refunded">Partially Refunded</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Payment Ref</th>
                    <th className="py-3 px-4">Booking</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Teacher</th>
                    <th className="py-3 px-4 text-right">Gross Amount</th>
                    <th className="py-3 px-4 text-right">Teacher Share (85%)</th>
                    <th className="py-3 px-4 text-right">Commission (15%)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paymentsData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No payments recorded yet. Click &quot;Seed Initial Records&quot; to populate demo transactions.
                      </td>
                    </tr>
                  ) : (
                    paymentsData.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-200">{pay.paymentId}</td>
                        <td className="py-3 px-4 font-semibold text-orange-400">{pay.bookingReference}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{pay.studentName}</div>
                          <div className="text-[10px] text-slate-500">{pay.studentEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{pay.teacherName}</div>
                          <div className="text-[10px] text-slate-500">{pay.teacherEmail}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white">{formatPkr(pay.grossAmountPkr)}</td>
                        <td className="py-3 px-4 text-right text-emerald-400 font-medium">{formatPkr(pay.teacherNetAmountPkr)}</td>
                        <td className="py-3 px-4 text-right text-orange-400 font-medium">{formatPkr(pay.platformCommissionPkr)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold capitalize",
                              pay.paymentStatus === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : pay.paymentStatus === "refunded"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            )}
                          >
                            {pay.paymentStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(pay.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments Pagination Bar */}
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400">
            <div>
              Showing {paymentsData.length} of {paymentsPagination.total || 0} payment(s)
              {(paymentsPagination.totalPages || 1) > 1 && (
                <span className="ml-1 text-slate-500">
                  (Page {paymentsPage} of {paymentsPagination.totalPages})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prev = Math.max(1, paymentsPage - 1);
                  setPaymentsPage(prev);
                  loadPaymentsOnly(prev, paymentSearch, paymentStatusFilter);
                }}
                disabled={paymentsPage <= 1 || isPending}
                className="h-8 px-2.5 bg-slate-900 border-slate-800 text-xs text-slate-300 hover:text-white"
              >
                <ChevronLeft className="size-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = Math.min(paymentsPagination.totalPages || 1, paymentsPage + 1);
                  setPaymentsPage(next);
                  loadPaymentsOnly(next, paymentSearch, paymentStatusFilter);
                }}
                disabled={paymentsPage >= (paymentsPagination.totalPages || 1) || isPending}
                className="h-8 px-2.5 bg-slate-900 border-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Next
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB C: HELD FUNDS
           ========================================================================= */}
        <TabsContent value="held" className="space-y-4">
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Teacher</th>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-right">Gross Payment</th>
                    <th className="py-3 px-4 text-right">Held Net Earnings</th>
                    <th className="py-3 px-4 text-right">Commission (15%)</th>
                    <th className="py-3 px-4">Class Completed</th>
                    <th className="py-3 px-4">24h Dispute Deadline</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {heldFundsData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No funds currently held.
                      </td>
                    </tr>
                  ) : (
                    heldFundsData.map((item) => {
                      const isDeadlinePassed = item.disputeDeadline && new Date(item.disputeDeadline) <= new Date();

                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{item.teacherName}</div>
                            <div className="text-[10px] text-slate-500">{item.teacherEmail}</div>
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-orange-400">{item.bookingReference}</td>
                          <td className="py-3 px-4 font-medium text-slate-200">{item.subject}</td>
                          <td className="py-3 px-4 text-right font-medium text-white">{formatPkr(item.grossAmountPkr)}</td>
                          <td className="py-3 px-4 text-right font-bold text-amber-400">
                            {formatPkr(item.teacherNetAmountPkr)}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-400">
                            {formatPkr(item.platformCommissionPkr)}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-400">
                            {item.classCompletedAt ? new Date(item.classCompletedAt).toLocaleString() : "In Session / Pending"}
                          </td>
                          <td className="py-3 px-4 text-[11px]">
                            {item.disputeDeadline ? (
                              <span className={cn(isDeadlinePassed ? "text-emerald-400 font-medium" : "text-amber-400")}>
                                {new Date(item.disputeDeadline).toLocaleString()}
                                {isDeadlinePassed ? " (Passed)" : " (Active Window)"}
                              </span>
                            ) : (
                              <span className="text-slate-500">Not Completed</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider",
                                item.teacherEarningsStatus === "eligible"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : item.teacherEarningsStatus === "disputed"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              )}
                            >
                              {item.teacherEarningsStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedBookingForRefund(item)}
                              className="h-7 px-2.5 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            >
                              Refund
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB D: PLATFORM REVENUE
           ========================================================================= */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-5">
                <span className="text-xs font-semibold uppercase text-slate-400">Gross Platform Commissions</span>
                <div className="text-3xl font-black text-white mt-1">
                  {formatPkr(m?.platformCommissionPkr || 0)}
                </div>
                <p className="text-xs text-slate-500 mt-2">15% platform fee on all completed classes</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-5">
                <span className="text-xs font-semibold uppercase text-slate-400">Provider Processing Fees</span>
                <div className="text-3xl font-black text-slate-300 mt-1">
                  {formatPkr(m?.providerFeesPkr || 0)}
                </div>
                <p className="text-xs text-slate-500 mt-2">Card network and gateway interchange costs</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-5">
                <span className="text-xs font-semibold uppercase text-slate-400">Net Platform Revenue</span>
                <div className="text-3xl font-black text-orange-500 mt-1">
                  {formatPkr(m?.netPlatformRevenuePkr || 0)}
                </div>
                <p className="text-xs text-emerald-400 mt-2">Retained platform gross margin</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance Breakdown */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
            <div className="p-4 border-b border-slate-800 font-semibold text-sm text-white flex items-center justify-between">
              <span>Monthly Platform Performance History</span>
              <span className="text-xs text-slate-400 font-normal">Calculated from Nominal Accounts</span>
            </div>
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Accounting Month</th>
                  <th className="py-3 px-4 text-right">Class Count</th>
                  <th className="py-3 px-4 text-right">Gross Commissions</th>
                  <th className="py-3 px-4 text-right">Provider Fees</th>
                  <th className="py-3 px-4 text-right">Net Platform Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {revenueData?.monthlyBreakdown?.length > 0 ? (
                  revenueData.monthlyBreakdown.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">{row.month}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{row.bookingCount}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                        {formatPkr(row.grossCommissionPkr)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {formatPkr(row.providerFeesPkr)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-orange-400">
                        {formatPkr(row.netRevenuePkr)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No monthly breakdown data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB E: TRANSACTIONS LEDGER
           ========================================================================= */}
        <TabsContent value="ledger" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Immutable journal entries. Debits and credits guaranteed balanced at posting time.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">Account:</span>
              <select
                value={ledgerAccountFilter}
                onChange={(e) => setLedgerAccountFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Nominal Accounts</option>
                <option value="1010-PROVIDER-REC">1010 - Provider Clearing / Receivable (Asset)</option>
                <option value="2010-TEACHER-PAYABLE">2010 - Teacher Held Funds / Payable (Liability)</option>
                <option value="2020-DISPUTED-FUNDS">2020 - Disputed Teacher Earnings Frozen (Liability)</option>
                <option value="4010-COMMISSION-REV">4010 - Platform Commission (Revenue)</option>
                <option value="5010-PROVIDER-FEES">5010 - Provider Processing Fees (Expense)</option>
                <option value="5020-REFUND-EXPENSE">5020 - Refund / Chargeback Loss (Expense)</option>
              </select>

              <span className="text-xs text-slate-400 ml-1">Event:</span>
              <select
                value={ledgerEventTypeFilter}
                onChange={(e) => setLedgerEventTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Event Types</option>
                <option value="student_payment">Student Payment</option>
                <option value="teacher_earning_allocated">Teacher Earning Allocated</option>
                <option value="platform_commission">Platform Commission</option>
                <option value="provider_fee">Provider Fee</option>
                <option value="refund">Refund</option>
                <option value="dispute_hold">Dispute Hold</option>
                <option value="dispute_release">Dispute Release</option>
                <option value="adjustment">Adjustment / Payout Settlement</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-900/90 text-slate-400 font-sans font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Txn Reference</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Account Code &amp; Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Debit (PKR)</th>
                    <th className="py-3 px-4 text-right">Credit (PKR)</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ledgerData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                        No ledger entries found matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    ledgerData.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-orange-400">{entry.reference}</td>
                        <td className="py-2.5 px-4 font-sans capitalize text-slate-300">{entry.eventType?.replace(/_/g, " ")}</td>
                        <td className="py-2.5 px-4 font-sans">
                          <span className="font-mono text-xs text-slate-200">{entry.accountCode}</span>
                          <span className="text-[11px] text-slate-400 ml-2">({entry.accountName})</span>
                        </td>
                        <td className="py-2.5 px-4 font-sans">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold text-slate-400 border-slate-700">
                            {entry.accountType}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-emerald-400">
                          {entry.debitPkr > 0 ? formatPkr(entry.debitPkr) : "—"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-blue-400">
                          {entry.creditPkr > 0 ? formatPkr(entry.creditPkr) : "—"}
                        </td>
                        <td className="py-2.5 px-4 text-[11px] text-slate-400 font-sans">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ledger Pagination Bar */}
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400 font-sans">
            <div>
              Showing {ledgerData.length} of {ledgerPagination.total || 0} journal entries
              {(ledgerPagination.totalPages || 1) > 1 && (
                <span className="ml-1 text-slate-500">
                  (Page {ledgerPage} of {ledgerPagination.totalPages})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prev = Math.max(1, ledgerPage - 1);
                  setLedgerPage(prev);
                  loadLedgerOnly(prev, ledgerAccountFilter, ledgerEventTypeFilter);
                }}
                disabled={ledgerPage <= 1 || isPending}
                className="h-8 px-2.5 bg-slate-900 border-slate-800 text-xs text-slate-300 hover:text-white"
              >
                <ChevronLeft className="size-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = Math.min(ledgerPagination.totalPages || 1, ledgerPage + 1);
                  setLedgerPage(next);
                  loadLedgerOnly(next, ledgerAccountFilter, ledgerEventTypeFilter);
                }}
                disabled={ledgerPage >= (ledgerPagination.totalPages || 1) || isPending}
                className="h-8 px-2.5 bg-slate-900 border-slate-800 text-xs text-slate-300 hover:text-white"
              >
                Next
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB: TEACHER PAYOUTS
           ========================================================================= */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Banknote className="size-4 text-orange-500" />
                <span>Teacher Withdrawal &amp; Payout Requests</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review tutor payouts via Raast, JazzCash, or Direct Bank IBAN. Approvals automatically post balanced nominal ledger entries.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={payoutStatusFilter}
                onChange={(e) => setPayoutStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="all">All Payouts</option>
                <option value="processing">Pending / Processing</option>
                <option value="completed">Completed / Settled</option>
                <option value="failed">Declined / Failed</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Payout Ref</th>
                    <th className="py-3 px-4">Teacher</th>
                    <th className="py-3 px-4 text-right">Amount (PKR)</th>
                    <th className="py-3 px-4">Method &amp; Details</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Requested</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payoutsData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No teacher payout requests found matching filter.
                      </td>
                    </tr>
                  ) : (
                    payoutsData.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-orange-400">{po.referenceId}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{po.teacherName}</div>
                          <div className="text-[10px] text-slate-500">{po.teacherEmail}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400">
                          {formatPkr(po.amountPkr)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] font-semibold bg-slate-800 text-slate-200 border-slate-700">
                            {po.methodLabel}
                          </Badge>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">{po.accountDetails}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold capitalize",
                              po.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : po.status === "failed"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            )}
                          >
                            {po.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {new Date(po.requestedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate">
                          {po.note || "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {po.status === "processing" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedPayout(po);
                                  setPayoutActionStatus("completed");
                                  setPayoutAdminNote(`Settled via ${po.methodLabel}`);
                                }}
                                className="h-7 px-2.5 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayout(po);
                                  setPayoutActionStatus("failed");
                                  setPayoutAdminNote("");
                                }}
                                className="h-7 px-2.5 text-[11px] font-semibold border-rose-800/80 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60"
                              >
                                Decline
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* =========================================================================
            TAB F: REFUNDS & DISPUTES
           ========================================================================= */}
        <TabsContent value="disputes" className="space-y-8">
          {/* Active Disputes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertOctagon className="size-4 text-rose-500" />
                <span>Student Disputes &amp; Frozen Liabilities</span>
              </h3>
              <span className="text-xs text-slate-400">{disputesData.length} total dispute(s)</span>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Teacher</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4 text-right">Frozen Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {disputesData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500">
                        No active disputes found.
                      </td>
                    </tr>
                  ) : (
                    disputesData.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-orange-400">{d.bookingReference}</td>
                        <td className="py-3 px-4 font-medium text-white">{d.studentName}</td>
                        <td className="py-3 px-4 font-medium text-slate-300">{d.teacherName}</td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-400">{d.reason}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-400">{formatPkr(d.amountHeldPkr)}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold uppercase",
                              d.status === "open"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : d.status === "resolved"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800 text-slate-400"
                            )}
                          >
                            {d.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {d.status === "open" ? (
                            <Button
                              size="sm"
                              onClick={() => setSelectedDispute(d)}
                              className="h-7 px-3 text-[11px] font-semibold bg-orange-600 hover:bg-orange-500 text-white"
                            >
                              Resolve
                            </Button>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Refund Records Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="size-4 text-emerald-400" />
              <span>Completed Refund Records</span>
            </h3>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Booking Ref</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4 text-right">Refund Amount</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Completed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {refundsData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No refunds recorded.
                      </td>
                    </tr>
                  ) : (
                    refundsData.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-medium text-orange-400">{r.bookingReference}</td>
                        <td className="py-3 px-4 text-slate-300 font-medium">{r.subject}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-400">{formatPkr(r.amountPkr)}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-sm truncate">{r.reason}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          {r.completedAt ? new Date(r.completedAt).toLocaleString() : new Date(r.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* =========================================================================
          MODALS & DIALOGS
         ========================================================================= */}

      {/* 1. Resolve Dispute Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={(open) => !open && setSelectedDispute(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="size-5 text-orange-500" />
              <span>Resolve Dispute #{selectedDispute?.bookingReference}</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Determine the authoritative financial resolution. This action automatically balances nominal ledger accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div>Student: <strong className="text-white">{selectedDispute?.studentName}</strong></div>
              <div>Teacher: <strong className="text-white">{selectedDispute?.teacherName}</strong></div>
              <div>Frozen Amount: <strong className="text-rose-400">{formatPkr(selectedDispute?.amountHeldPkr || 0)}</strong></div>
              <div>Dispute Reason: <span className="text-slate-300 italic">&quot;{selectedDispute?.reason}&quot;</span></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Resolution Decision:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDisputeResolutionType("teacher")}
                  className={cn(
                    "p-3 rounded-xl border text-left text-xs transition-all",
                    disputeResolutionType === "teacher"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <div className="font-bold text-white mb-0.5">Award to Teacher</div>
                  <div className="text-[11px] text-slate-400">Unfreezes earnings into Eligible status.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDisputeResolutionType("refund")}
                  className={cn(
                    "p-3 rounded-xl border text-left text-xs transition-all",
                    disputeResolutionType === "refund"
                      ? "border-rose-500 bg-rose-500/10 text-rose-300 font-semibold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <div className="font-bold text-white mb-0.5">Full Student Refund</div>
                  <div className="text-[11px] text-slate-400">Reverses commission and refunds student.</div>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Resolution Audit Notes:</label>
              <Input
                placeholder="Explain the rationale for this decision..."
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDispute(null)}
              className="border-slate-800 text-slate-400 hover:bg-slate-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleResolveDispute}
              disabled={isPending}
              className="bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs"
            >
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Manual Refund Dialog */}
      <Dialog open={!!selectedBookingForRefund} onOpenChange={(open) => !open && setSelectedBookingForRefund(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="size-5 text-rose-500" />
              <span>Issue Refund for #{selectedBookingForRefund?.bookingReference}</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Issues a balanced accounting reversal transaction and records the refund.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div>Teacher: <strong className="text-white">{selectedBookingForRefund?.teacherName}</strong></div>
              <div>Subject: <strong className="text-white">{selectedBookingForRefund?.subject}</strong></div>
              <div>Gross Payment: <strong className="text-white">{formatPkr(selectedBookingForRefund?.grossAmountPkr || 0)}</strong></div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Refund Amount (PKR):</label>
              <Input
                placeholder={`Leave blank for full refund (${selectedBookingForRefund?.grossAmountPkr} PKR)`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                type="number"
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Refund Reason:</label>
              <Input
                placeholder="e.g. Student illness, class technical failure..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedBookingForRefund(null)}
              className="border-slate-800 text-slate-400 hover:bg-slate-800 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleProcessRefund}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
            >
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Teacher Payout Approval / Decline Dialog */}
      <Dialog open={!!selectedPayout} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Banknote className="size-5 text-orange-500" />
              <span>
                {payoutActionStatus === "completed" ? "Approve & Settle Payout" : "Decline Payout Request"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {payoutActionStatus === "completed"
                ? `Confirming this settlement posts a double-entry journal entry debiting Teacher Payables (2010) and crediting Provider Clearing (1010) by ${formatPkr(selectedPayout?.amountPkr || 0)}.`
                : "Reject this withdrawal request and notify the instructor with a clear explanation."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Teacher:</span>
                <span className="text-white font-semibold">{selectedPayout?.teacherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Withdrawal Amount:</span>
                <span className="text-emerald-400 font-bold">{formatPkr(selectedPayout?.amountPkr || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="text-slate-200">{selectedPayout?.methodLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="font-mono text-slate-300">{selectedPayout?.accountDetails}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {payoutActionStatus === "completed" ? "Settlement Reference / Note:" : "Decline Reason (Sent to Tutor):"}
              </label>
              <Input
                placeholder={
                  payoutActionStatus === "completed"
                    ? "e.g. Raast Stan 9841829 / Bank Ref"
                    : "e.g. Account number invalid or Raast ID not registered"
                }
                value={payoutAdminNote}
                onChange={(e) => setPayoutAdminNote(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPayout(null)}
              className="bg-slate-800 border-slate-700 text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdatePayout}
              disabled={isPending}
              className={cn(
                "text-xs font-semibold text-white",
                payoutActionStatus === "completed"
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-rose-600 hover:bg-rose-500"
              )}
            >
              {isPending
                ? "Processing..."
                : payoutActionStatus === "completed"
                ? "Confirm & Settle Ledger"
                : "Confirm Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
