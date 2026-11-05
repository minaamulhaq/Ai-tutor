"use client";

import React from "react";
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Calendar,
  CreditCard,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PaymentFilterState,
  PaymentStatus,
  PaymentMethodType,
} from "@/types/payment";

interface TransactionFiltersProps {
  filters: PaymentFilterState;
  onChange: (updated: Partial<PaymentFilterState>) => void;
  onReset: () => void;
  totalMatches: number;
}

export function TransactionFilters({
  filters,
  onChange,
  onReset,
  totalMatches,
}: TransactionFiltersProps) {
  const isFiltered =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.dateRange !== "all" ||
    filters.paymentMethod !== "all";

  return (
    <Card className="p-4 sm:p-5 rounded-2xl border-slate-200 bg-white shadow-xs space-y-3">
      {/* Search Input Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by class title, tutor name, transaction ID, or booking ref..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="pl-9.5 pr-8 h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs sm:text-sm focus-visible:bg-white focus-visible:ring-orange-500"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onChange({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(val) =>
              onChange({ status: val as "all" | PaymentStatus })
            }
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs font-semibold bg-white cursor-pointer w-full">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="successful">Successful</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="partially_refunded">
                Partially Refunded
              </SelectItem>
            </SelectContent>
          </Select>

          {/* 2. Date Range Filter */}
          <Select
            value={filters.dateRange}
            onValueChange={(val) =>
              onChange({
                dateRange: val as PaymentFilterState["dateRange"],
              })
            }
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs font-semibold bg-white cursor-pointer w-full">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg text-xs">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>

          {/* 3. Payment Method Filter */}
          <Select
            value={filters.paymentMethod}
            onValueChange={(val) =>
              onChange({
                paymentMethod: val as "all" | PaymentMethodType,
              })
            }
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs font-semibold bg-white cursor-pointer w-full">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg text-xs">
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Credit / Debit Card</SelectItem>
              <SelectItem value="jazzcash">JazzCash Mobile</SelectItem>
              <SelectItem value="easypaisa">Easypaisa Account</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer (1Link)</SelectItem>
              <SelectItem value="wallet">ZuhDemy Wallet</SelectItem>
            </SelectContent>
          </Select>

          {/* 4. Sort By Filter */}
          <Select
            value={filters.sortBy}
            onValueChange={(val) =>
              onChange({
                sortBy: val as PaymentFilterState["sortBy"],
              })
            }
          >
            <SelectTrigger className="h-10 rounded-xl border-slate-200 text-xs font-semibold bg-white cursor-pointer w-full">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg text-xs">
              <SelectItem value="date-desc">Date: Newest First</SelectItem>
              <SelectItem value="date-asc">Date: Oldest First</SelectItem>
              <SelectItem value="amount-desc">Amount: High to Low</SelectItem>
              <SelectItem value="amount-asc">Amount: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Status & Reset Action */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div>
          Showing <strong className="text-slate-900 font-bold">{totalMatches}</strong> matching{" "}
          {totalMatches === 1 ? "transaction" : "transactions"}
        </div>

        {isFiltered && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg cursor-pointer"
          >
            <RotateCcw className="size-3 mr-1" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
