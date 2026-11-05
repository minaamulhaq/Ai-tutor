"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  Home,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import {
  PaymentTransaction,
  PaymentFilterState,
} from "@/types/payment";
import {
  fetchStudentPayments,
  calculatePaymentSummaries,
  filterAndSortPayments,
} from "@/services/paymentService";
import { PaymentSummaryCard } from "@/components/student/payments/payment-summary-card";
import { TransactionFilters } from "@/components/student/payments/transaction-filters";
import { TransactionList } from "@/components/student/payments/transaction-list";
import { TransactionDetailsDialog } from "@/components/student/payments/transaction-details-dialog";
import { ReceiptModal } from "@/components/student/payments/receipt-modal";
import { PaymentEmptyState } from "@/components/student/payments/payment-empty-state";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";

export default function StudentPaymentsPage() {
  // 1. Primary State: transactions loaded from real database
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);

  // 2. Filters State
  const [filters, setFilters] = useState<PaymentFilterState>({
    search: "",
    status: "all",
    dateRange: "all",
    paymentMethod: "all",
    sortBy: "date-desc",
  });

  // 3. Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 4. Modal Dialog States
  const [detailsModalItem, setDetailsModalItem] =
    useState<PaymentTransaction | null>(null);
  const [receiptModalItem, setReceiptModalItem] =
    useState<PaymentTransaction | null>(null);

  // Load Transactions from service / server action
  const loadTransactions = useCallback(async (showFullLoader = true) => {
    if (showFullLoader) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setIsError(false);
    try {
      const res = await fetchStudentPayments();
      setTransactions(res.transactions);
      if (res.studentId) {
        setStudentId(res.studentId);
      }
    } catch (err) {
      console.error("Failed to load student payments", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTransactions(true);
  }, [loadTransactions]);

  // Realtime Supabase Channel for instant payment and booking updates
  useEffect(() => {
    if (!studentId) return;

    let channel: any = null;
    try {
      const supabase = createClient();
      const channelName = `student-payments-sync:${studentId}`;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `student_id=eq.${studentId}`,
          },
          () => {
            // Re-fetch transactions seamlessly in background
            loadTransactions(false);
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsRealtimeActive(true);
          }
        });
    } catch (err) {
      console.warn("Supabase Realtime notice in StudentPaymentsPage:", err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [studentId, loadTransactions]);

  // Derived Summary Statistics calculated dynamically from real transactions
  const summaries = useMemo(() => {
    return calculatePaymentSummaries(transactions);
  }, [transactions]);

  // Filter and Sort transactions based on user inputs
  const filteredTransactions = useMemo(() => {
    return filterAndSortPayments(transactions, filters);
  }, [transactions, filters]);

  // Paginated slice for current page
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (updated: Partial<PaymentFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      dateRange: "all",
      paymentMethod: "all",
      sortBy: "date-desc",
    });
    setCurrentPage(1);
  };

  const isFiltered =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.dateRange !== "all" ||
    filters.paymentMethod !== "all";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Breadcrumbs Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link
          href="/student"
          className="flex items-center gap-1 hover:text-slate-900 transition-colors"
        >
          <Home className="size-3.5 text-slate-400" />
          <span>Dashboard</span>
        </Link>
        <ChevronRight className="size-3 text-slate-400" />
        <span className="font-semibold text-slate-900">Payments & History</span>
      </nav>

      {/* 2. Page Heading & Subtitle + Realtime Sync Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Payments & History
            </h1>
            <span className="size-7 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <CreditCard className="size-4" />
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Track your class payments, escrow security statuses, and refund records.
          </p>
        </div>

        {/* Manual Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadTransactions(false)}
            disabled={isLoading || isRefreshing}
            className="rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 text-xs h-8.5 px-3 gap-1.5 shadow-2xs cursor-pointer"
            title="Refresh payment records"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin text-orange-500" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 3. Summary Cards: Total Spent, Transactions, Pending, and Refunded */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Spent */}
        <PaymentSummaryCard
          type="total_spent"
          title="Total Spent"
          value={`PKR ${summaries.totalSpentPKR.toLocaleString()}`}
          subtext="Net completed lessons"
          isActive={filters.status === "successful"}
          onClick={() =>
            handleFilterChange({
              status: filters.status === "successful" ? "all" : "successful",
            })
          }
        />

        {/* Transactions */}
        <PaymentSummaryCard
          type="transactions"
          title="Transactions"
          value={summaries.transactionCount}
          subtext="All-time records"
          isActive={filters.status === "all"}
          onClick={() => handleFilterChange({ status: "all" })}
        />

        {/* Pending Payments */}
        <PaymentSummaryCard
          type="pending"
          title="Pending Payments"
          value={`PKR ${summaries.pendingAmountPKR.toLocaleString()}`}
          subtext={`${summaries.pendingCount} in escrow`}
          isActive={filters.status === "pending"}
          onClick={() =>
            handleFilterChange({
              status: filters.status === "pending" ? "all" : "pending",
            })
          }
        />

        {/* Refunded Amount */}
        <PaymentSummaryCard
          type="refunded"
          title="Refunded Amount"
          value={`PKR ${summaries.refundedAmountPKR.toLocaleString()}`}
          subtext={`${summaries.refundedCount} returned to source`}
          isActive={filters.status === "refunded"}
          onClick={() =>
            handleFilterChange({
              status: filters.status === "refunded" ? "all" : "refunded",
            })
          }
        />
      </div>

      {/* 4. Filters Bar */}
      <TransactionFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalMatches={filteredTransactions.length}
      />

      {/* 5. Main Content: Loading, Error, Empty, or Transaction List */}
      {isLoading ? (
        /* Loading Skeletons */
        <div className="space-y-4">
          <Card className="p-6 rounded-2xl border-slate-200 bg-white space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </Card>
        </div>
      ) : isError ? (
        /* Error State with Retry */
        <Card className="max-w-md mx-auto p-8 rounded-2xl border-slate-200 bg-white text-center space-y-4 my-8">
          <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Unable to Load Payments
            </h3>
            <p className="text-xs text-slate-500">
              There was a connection issue loading your billing records.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => loadTransactions(true)}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            <span>Try Again</span>
          </Button>
        </Card>
      ) : filteredTransactions.length === 0 ? (
        /* Empty States */
        <PaymentEmptyState
          isFiltered={isFiltered && transactions.length > 0}
          onResetFilters={handleResetFilters}
        />
      ) : (
        /* Responsive Transaction Table / Mobile Cards & Pagination */
        <TransactionList
          transactions={paginatedTransactions}
          onViewDetails={(txn) => setDetailsModalItem(txn)}
          onDownloadReceipt={(txn) => setReceiptModalItem(txn)}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredTransactions.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          sortBy={filters.sortBy}
          onSortChange={(sort) => handleFilterChange({ sortBy: sort })}
          statusFilter={filters.status}
          onStatusChange={(status) => handleFilterChange({ status })}
        />
      )}

      {/* 6. Reusable Transaction Details Dialog */}
      <TransactionDetailsDialog
        isOpen={Boolean(detailsModalItem)}
        onClose={() => setDetailsModalItem(null)}
        transaction={detailsModalItem}
        onDownloadReceipt={(txn) => {
          setDetailsModalItem(null);
          setReceiptModalItem(txn);
        }}
      />

      {/* 7. Printable Receipt Dialog */}
      <ReceiptModal
        isOpen={Boolean(receiptModalItem)}
        onClose={() => setReceiptModalItem(null)}
        transaction={receiptModalItem}
      />
    </div>
  );
}
