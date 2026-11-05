"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  Receipt,
  Download,
  Calendar,
  Clock,
  CreditCard,
  Building,
  RotateCcw,
  ShieldCheck,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PaymentTransaction } from "@/types/payment";
import { TransactionStatusBadge } from "./transaction-status-badge";

interface TransactionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
  onDownloadReceipt: (txn: PaymentTransaction) => void;
}

export function TransactionDetailsDialog({
  isOpen,
  onClose,
  transaction,
  onDownloadReceipt,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const teacherInitials = transaction.teacher.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-slate-200">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {transaction.id}
              </span>
              <TransactionStatusBadge status={transaction.status} size="sm" />
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Receipt: {transaction.receiptNumber}
            </span>
          </div>

          <DialogTitle className="text-lg font-extrabold text-slate-900 tracking-tight pt-1">
            Transaction Details
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Complete billing breakdown and escrow payment record for this session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* 1. Class & Teacher Summary Box */}
          <Card className="p-3.5 rounded-xl border-slate-200 bg-slate-50/70 space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Booked Class
            </span>
            <div className="flex items-start gap-3">
              <Avatar className="size-11 rounded-xl ring-2 ring-white shrink-0">
                <AvatarImage src={transaction.teacher.avatarUrl} alt={transaction.teacher.name} />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                  {teacherInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1 flex-1">
                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {transaction.classTitle}
                </h4>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-semibold text-slate-700">{transaction.teacher.name}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0 bg-white border border-slate-200">
                    {transaction.subject}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-slate-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-orange-500" />
                <span>Date: {transaction.date}</span>
              </span>
              <span className="font-mono text-slate-500 font-medium">
                Booking Ref: {transaction.bookingRef}
              </span>
            </div>
          </Card>

          {/* 2. Itemized Financial Breakdown */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Itemized Payment Breakdown
            </span>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>1-on-1 Lesson Base Fee</span>
                <span className="font-semibold text-slate-900">
                  PKR {transaction.baseFeePKR.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-1">
                  <span>ZuhDemy Service & Escrow Protection (5%)</span>
                </span>
                <span className="font-semibold text-slate-900">
                  PKR {transaction.platformFeePKR.toLocaleString()}
                </span>
              </div>

              {transaction.discountPKR > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span>Promotional Voucher Discount</span>
                  <span className="font-bold">
                    -PKR {transaction.discountPKR.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-extrabold text-sm text-slate-900">
                <span>Total Amount Charged</span>
                <span className="text-orange-600">
                  PKR {transaction.amountPKR.toLocaleString()}
                </span>
              </div>

              {/* If refund exists */}
              {transaction.refund && transaction.refund.amountPKR > 0 && (
                <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center font-bold text-rose-600">
                  <span>Refund Deducted</span>
                  <span>-PKR {transaction.refund.amountPKR.toLocaleString()}</span>
                </div>
              )}

              {transaction.refund && (
                <div className="pt-1 flex justify-between items-center font-black text-slate-900">
                  <span>Net Charged to Student</span>
                  <span>PKR {transaction.netAmountPKR.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Refund Details (If Applicable) */}
          {transaction.refund && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="size-3.5 text-rose-600" />
                  Refund Details ({transaction.refund.refundId})
                </span>
                <span className="text-[11px] font-extrabold text-rose-700 bg-white/80 px-2 py-0.5 rounded border border-rose-200">
                  PKR {transaction.refund.amountPKR.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-rose-700">
                <strong>Reason:</strong> {transaction.refund.reason}
              </p>
              <div className="flex justify-between items-center text-[10px] text-rose-600 pt-1 border-t border-rose-200/60">
                <span>Refunded on: {transaction.refund.refundedAt}</span>
                <span>Destination: {transaction.refund.refundMethod}</span>
              </div>
            </div>
          )}

          {/* 4. Failure Reason (If Applicable) */}
          {transaction.status === "failed" && transaction.failureReason && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="size-4 text-rose-600" />
                <span>Payment Failed</span>
              </div>
              <p className="text-xs text-rose-700">
                {transaction.failureReason}
              </p>
            </div>
          )}

          {/* 5. Payment Method & Security Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Payment Method
              </span>
              <p className="font-semibold text-slate-800">
                {transaction.paymentMethod?.label || "Direct Settlement"}
              </p>
              <p className="text-[10px] text-slate-500">
                Provider: {transaction.paymentMethod?.provider || "ZuhDemy Escrow"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                ZuhDemy Buyer Protection
              </span>
              <p className="font-semibold text-slate-800 flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                Escrow Guarantee
              </p>
              <p className="text-[10px] text-slate-500">
                Tutor receives funds only after full session completion.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={() => onDownloadReceipt(transaction)}
            className="h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Download Receipt</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
