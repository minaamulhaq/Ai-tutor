import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  CreditCard,
  Building,
  Smartphone,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PaymentTransaction,
  PaymentMethodType,
  PaymentFilterState,
  PaymentStatus,
} from "@/types/payment";
import { TransactionStatusBadge } from "./transaction-status-badge";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: PaymentTransaction[];
  onViewDetails: (transaction: PaymentTransaction) => void;
  onDownloadReceipt: (transaction: PaymentTransaction) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sortBy?: PaymentFilterState["sortBy"];
  onSortChange?: (sort: PaymentFilterState["sortBy"]) => void;
  statusFilter?: "all" | PaymentStatus;
  onStatusChange?: (status: "all" | PaymentStatus) => void;
}

export function TransactionList({
  transactions,
  onViewDetails,
  onDownloadReceipt,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  sortBy = "date-desc",
  onSortChange,
  statusFilter = "all",
  onStatusChange,
}: TransactionListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Copy transaction ID handler
  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Helper for Payment Method Icons
  const renderMethodIcon = (type?: PaymentMethodType) => {
    switch (type) {
      case "card":
        return <CreditCard className="size-3.5 text-blue-600 shrink-0" />;
      case "jazzcash":
      case "easypaisa":
        return <Smartphone className="size-3.5 text-emerald-600 shrink-0" />;
      case "bank_transfer":
        return <Building className="size-3.5 text-slate-600 shrink-0" />;
      case "wallet":
        return <Wallet className="size-3.5 text-orange-600 shrink-0" />;
      default:
        return <CreditCard className="size-3.5 text-slate-400 shrink-0" />;
    }
  };

  // Toggle Date sorting
  const handleToggleDateSort = () => {
    if (!onSortChange) return;
    onSortChange(sortBy === "date-desc" ? "date-asc" : "date-desc");
  };

  // Toggle Amount sorting
  const handleToggleAmountSort = () => {
    if (!onSortChange) return;
    onSortChange(sortBy === "amount-desc" ? "amount-asc" : "amount-desc");
  };

  return (
    <div className="space-y-3">
      {/* Quick Status Tabs for Rapid Interaction */}
      {onStatusChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "all" as const, label: "All Transactions" },
            { id: "successful" as const, label: "Successful" },
            { id: "pending" as const, label: "Pending" },
            { id: "refunded" as const, label: "Refunded" },
            { id: "partially_refunded" as const, label: "Partial Refunds" },
            { id: "failed" as const, label: "Failed" },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                )}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 1. Desktop / Tablet Responsive Table View: table-fixed with zero horizontal scroll */}
      <Card className="hidden md:block rounded-2xl border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table
          className="w-full table-fixed text-left text-xs"
          containerClassName="overflow-x-clip w-full"
        >
          <TableHeader className="bg-slate-50/90">
            <TableRow className="border-b border-slate-200 hover:bg-transparent">
              {/* 1. Transaction & Booking (18%) */}
              <TableHead className="w-[18%] py-3.5 px-3.5 font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Transaction & Booking
              </TableHead>

              {/* 2. Class & Instructor (28%) */}
              <TableHead className="w-[28%] py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Class & Instructor
              </TableHead>

              {/* 3. Date & Time (15%) - Sortable */}
              <TableHead className="w-[15%] py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={handleToggleDateSort}
                  className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors cursor-pointer group/sort"
                  title="Sort by date"
                >
                  <span>Date & Time</span>
                  {sortBy === "date-desc" ? (
                    <ArrowDown className="size-3.5 text-orange-600 shrink-0" />
                  ) : sortBy === "date-asc" ? (
                    <ArrowUp className="size-3.5 text-orange-600 shrink-0" />
                  ) : (
                    <ArrowUpDown className="size-3.5 text-slate-400 group-hover/sort:text-orange-600 shrink-0" />
                  )}
                </button>
              </TableHead>

              {/* 4. Method (14%) */}
              <TableHead className="w-[14%] py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Method
              </TableHead>

              {/* 5. Amount (12%) - Sortable */}
              <TableHead className="w-[12%] py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={handleToggleAmountSort}
                  className="inline-flex items-center gap-1.5 hover:text-orange-600 transition-colors cursor-pointer group/sort"
                  title="Sort by amount"
                >
                  <span>Amount</span>
                  {sortBy === "amount-desc" ? (
                    <ArrowDown className="size-3.5 text-orange-600 shrink-0" />
                  ) : sortBy === "amount-asc" ? (
                    <ArrowUp className="size-3.5 text-orange-600 shrink-0" />
                  ) : (
                    <ArrowUpDown className="size-3.5 text-slate-400 group-hover/sort:text-orange-600 shrink-0" />
                  )}
                </button>
              </TableHead>

              {/* 6. Status & Actions (13%) */}
              <TableHead className="w-[13%] py-3.5 px-3.5 text-right font-bold uppercase tracking-wider text-[11px] text-slate-500">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-100 font-medium">
            {transactions.map((txn) => {
              const teacherInitials = txn.teacher.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const isCopied = copiedId === txn.id;

              return (
                <TableRow
                  key={txn.id}
                  onClick={() => onViewDetails(txn)}
                  className="hover:bg-orange-50/40 transition-colors group cursor-pointer border-l-4 border-l-transparent hover:border-l-orange-500"
                >
                  {/* 1. Transaction ID & Booking Ref */}
                  <TableCell className="py-3.5 px-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors">
                          {txn.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, txn.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 transition-all rounded hover:bg-slate-200/60 cursor-pointer"
                          title="Copy Transaction ID"
                          aria-label="Copy Transaction ID"
                        >
                          {isCopied ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        Ref: {txn.bookingRef}
                      </span>
                    </div>
                  </TableCell>

                  {/* 2. Class & Instructor */}
                  <TableCell className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-8 rounded-xl ring-1 ring-slate-200 shrink-0">
                        <AvatarImage
                          src={txn.teacher.avatarUrl}
                          alt={txn.teacher.name}
                        />
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-[10px]">
                          {teacherInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p
                          className="font-bold text-xs text-slate-900 truncate group-hover:text-orange-600 transition-colors"
                          title={txn.classTitle}
                        >
                          {txn.classTitle}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                          <span className="truncate">{txn.teacher.name}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600 shrink-0">
                            {txn.subject}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* 3. Date & Time */}
                  <TableCell className="py-3.5 px-3">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-800 block text-xs">
                        {txn.date}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {txn.time}
                      </span>
                    </div>
                  </TableCell>

                  {/* 4. Method */}
                  <TableCell className="py-3.5 px-3">
                    {txn.paymentMethod ? (
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        {renderMethodIcon(txn.paymentMethod.type)}
                        <span className="truncate text-xs">
                          {txn.paymentMethod.label}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">—</span>
                    )}
                  </TableCell>

                  {/* 5. Amount */}
                  <TableCell className="py-3.5 px-3">
                    <div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 block tracking-tight">
                        PKR {txn.amountPKR.toLocaleString()}
                      </span>
                      {txn.refund && txn.refund.amountPKR > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 block">
                          -PKR {txn.refund.amountPKR.toLocaleString()} ref.
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* 6. Status & Quick Actions */}
                  <TableCell className="py-3.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <TransactionStatusBadge status={txn.status} size="sm" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadReceipt(txn);
                        }}
                        className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        title="Download Receipt"
                        aria-label="Download Receipt"
                      >
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* 2. Mobile Responsive Card List (shown on smaller screens) */}
      <div className="block md:hidden space-y-3">
        {transactions.map((txn) => {
          const teacherInitials = txn.teacher.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <Card
              key={txn.id}
              className="p-4 rounded-2xl border-slate-200 bg-white shadow-xs space-y-3"
            >
              {/* Header: ID + Status */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-xs text-slate-900 block">
                    {txn.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Ref: {txn.bookingRef}
                  </span>
                </div>
                <TransactionStatusBadge status={txn.status} size="sm" />
              </div>

              {/* Class & Teacher Details */}
              <div className="flex items-start gap-3">
                <Avatar className="size-10 rounded-xl ring-1 ring-slate-200 shrink-0">
                  <AvatarImage src={txn.teacher.avatarUrl} alt={txn.teacher.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                    {teacherInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 space-y-0.5 flex-1">
                  <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                    {txn.classTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>{txn.teacher.name}</span>
                    <span>•</span>
                    <Badge variant="secondary" className="text-[10px] font-bold px-1 py-0 bg-slate-100">
                      {txn.subject}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Financial & Method Row */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Amount Paid
                  </span>
                  <span className="font-black text-sm text-slate-900">
                    PKR {txn.amountPKR.toLocaleString()}
                  </span>
                  {txn.refund && txn.refund.amountPKR > 0 && (
                    <span className="text-[10px] font-bold text-rose-600 block">
                      -PKR {txn.refund.amountPKR.toLocaleString()} refunded
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {txn.date}
                  </span>
                  <div className="flex items-center gap-1 justify-end text-slate-600 text-[11px] font-medium">
                    {renderMethodIcon(txn.paymentMethod?.type)}
                    <span className="truncate max-w-[120px]">
                      {txn.paymentMethod?.label || "Direct"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(txn)}
                  className="flex-1 h-9 rounded-xl border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  <Eye className="size-3.5 mr-1 text-slate-400" />
                  <span>View Details</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadReceipt(txn)}
                  className="flex-1 h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 text-xs font-semibold cursor-pointer"
                >
                  <Download className="size-3.5 mr-1" />
                  <span>Receipt</span>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 3. Pagination Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 font-medium">
          Showing <strong className="text-slate-900 font-bold">{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
          <strong className="text-slate-900 font-bold">{endIndex}</strong> of{" "}
          <strong className="text-slate-900 font-bold">{totalItems}</strong> transactions
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Items Per Page Selector using Shadcn Select */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="hidden sm:inline">Per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="h-8 w-18 rounded-lg border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                <SelectValue placeholder={String(pageSize)} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-md text-xs min-w-18">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Page Switcher Buttons */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 disabled:opacity-40 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <span className="px-2 text-xs font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 disabled:opacity-40 cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
