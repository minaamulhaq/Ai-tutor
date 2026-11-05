"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Transaction,
  TransactionFiltersState,
  formatPKR,
} from "./types";

interface TransactionsTableProps {
  transactions: Transaction[];
}

const initialFilters: TransactionFiltersState = {
  searchQuery: "",
  type: "all",
  status: "all",
  dateRange: "all",
};

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [filters, setFilters] = useState<TransactionFiltersState>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter transactions based on search, type, and status
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // 1. Search Query
      if (filters.searchQuery.trim() !== "") {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesRef = txn.referenceId.toLowerCase().includes(query);
        const matchesStudent = txn.studentName?.toLowerCase().includes(query);
        const matchesTopic = txn.topicTitle?.toLowerCase().includes(query);
        const matchesDesc = txn.description.toLowerCase().includes(query);
        if (!matchesRef && !matchesStudent && !matchesTopic && !matchesDesc) {
          return false;
        }
      }

      // 2. Type Filter
      if (filters.type !== "all") {
        if (txn.type !== filters.type) return false;
      }

      // 3. Status Filter
      if (filters.status !== "all") {
        if (txn.status !== filters.status) return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Reset pagination when filter changes
  const handleFilterChange = (updates: Partial<TransactionFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            In Escrow
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            Processing
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Refunded
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        );
    }
  };

  const getTypeBadge = (type: Transaction["type"]) => {
    switch (type) {
      case "class_earnings":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
            <TrendingUp className="size-3.5 text-emerald-600" />
            <span>Class Earnings</span>
          </span>
        );
      case "payout":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
            <ArrowUpRight className="size-3.5 text-orange-600" />
            <span>Payout Withdrawal</span>
          </span>
        );
      case "escrow_hold":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
            <Clock className="size-3.5 text-amber-600" />
            <span>Escrow Hold</span>
          </span>
        );
      case "refund":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
            <RotateCcw className="size-3.5 text-rose-600" />
            <span>Refund</span>
          </span>
        );
    }
  };

  const isFiltered =
    filters.searchQuery.trim() !== "" ||
    filters.type !== "all" ||
    filters.status !== "all";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-5 sm:p-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900">
            Transaction & Settlement History
          </h3>
          <p className="text-xs text-slate-500">
            Complete audit trail of class earnings, platform fees, and payout disbursements.
          </p>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {filteredTransactions.length} Total records
        </span>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by reference ID, student, or topic..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
            className="pl-9 h-10 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl"
          />
        </div>

        {/* Transaction Type Filter */}
        <div className="w-full sm:w-44 shrink-0">
          <Select
            value={filters.type}
            onValueChange={(val) => handleFilterChange({ type: val })}
          >
            <SelectTrigger className="h-10 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="class_earnings">Class Earnings</SelectItem>
              <SelectItem value="payout">Payout Withdrawal</SelectItem>
              <SelectItem value="escrow_hold">Escrow Hold</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-40 shrink-0">
          <Select
            value={filters.status}
            onValueChange={(val) => handleFilterChange({ status: val })}
          >
            <SelectTrigger className="h-10 text-xs sm:text-sm bg-slate-50/50 border-slate-200 focus:bg-white rounded-xl w-full">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">In Escrow</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Action */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className="h-10 px-3 text-xs sm:text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl shrink-0 gap-1.5 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block rounded-xl border border-slate-200/90 overflow-hidden relative">
        <Table>
          <TableHeader className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-2xs">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[110px]">Date</TableHead>
              <TableHead className="w-[120px]">Reference</TableHead>
              <TableHead>Description / Student</TableHead>
              <TableHead className="w-[140px]">Type</TableHead>
              <TableHead className="text-right w-[110px]">Gross</TableHead>
              <TableHead className="text-right w-[110px]">Platform (15%)</TableHead>
              <TableHead className="text-right w-[130px]">Net Payout</TableHead>
              <TableHead className="text-center w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  No transactions match your search or filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((txn) => (
                <TableRow key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                  <TableCell className="font-medium text-slate-600 text-xs">
                    {txn.date}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-800 font-semibold">
                    {txn.referenceId}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {txn.studentName ? txn.studentName : txn.description}
                      </div>
                      {txn.topicTitle && (
                        <div className="text-xs text-slate-500 truncate max-w-xs">
                          {txn.subject && !txn.topicTitle.toLowerCase().includes(txn.subject.toLowerCase())
                            ? `${txn.topicTitle} · ${txn.subject}`
                            : txn.topicTitle}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(txn.type)}</TableCell>
                  <TableCell className="text-right font-medium text-slate-600 text-xs">
                    {txn.type === "payout" ? "—" : formatPKR(txn.grossAmount)}
                  </TableCell>
                  <TableCell className="text-right text-slate-500 text-xs">
                    {txn.platformFee > 0 ? `-${formatPKR(txn.platformFee)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-bold text-xs sm:text-sm">
                    {txn.type === "payout" ? (
                      <span className="text-orange-600">-{formatPKR(txn.netAmount)}</span>
                    ) : txn.type === "refund" ? (
                      <span className="text-slate-400">PKR 0</span>
                    ) : txn.type === "escrow_hold" ? (
                      <span className="text-amber-700 font-semibold">+{formatPKR(txn.netAmount)}</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">+{formatPKR(txn.netAmount)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(txn.status)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card / List Layout (Visible on small screens) */}
      <div className="md:hidden space-y-3">
        {paginatedTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
            No transactions match your search or filter criteria.
          </div>
        ) : (
          paginatedTransactions.map((txn) => (
            <div
              key={txn.id}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {txn.referenceId}
                </span>
                {getStatusBadge(txn.status)}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {txn.studentName ? txn.studentName : txn.description}
                </h4>
                {txn.topicTitle && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {txn.subject && !txn.topicTitle.toLowerCase().includes(txn.subject.toLowerCase())
                      ? `${txn.topicTitle} · ${txn.subject}`
                      : txn.topicTitle}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>{txn.date}</span>
                {getTypeBadge(txn.type)}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">Net Amount:</span>
                <span className="font-bold text-sm">
                  {txn.type === "payout" ? (
                    <span className="text-orange-600">-{formatPKR(txn.netAmount)}</span>
                  ) : txn.type === "refund" ? (
                    <span className="text-slate-400">PKR 0</span>
                  ) : txn.type === "escrow_hold" ? (
                    <span className="text-amber-700 font-semibold">+{formatPKR(txn.netAmount)}</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">+{formatPKR(txn.netAmount)}</span>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Page <span className="font-semibold text-slate-900">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700 cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5 mr-1" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 rounded-lg border-slate-200 text-slate-700 cursor-pointer disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
