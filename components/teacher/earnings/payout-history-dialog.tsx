"use client";

import React from "react";
import {
  History,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PayoutRecord, formatPKR } from "./types";

interface PayoutHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payouts: PayoutRecord[];
}

export function PayoutHistoryDialog({
  open,
  onOpenChange,
  payouts,
}: PayoutHistoryDialogProps) {
  const getStatusBadge = (status: PayoutRecord["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3 text-emerald-600" />
            Settled
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="size-3 text-blue-600 animate-spin" />
            Processing
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="size-3 text-amber-600" />
            Queued
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="size-3 text-rose-600" />
            Failed
          </span>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl w-full bg-white rounded-2xl p-0 overflow-hidden shadow-2xl border border-slate-200">
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-200 bg-slate-50/70 text-left">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
              <History className="size-4" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900">
              Payout Disbursement History
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Complete record of your withdrawals transferred to bank and mobile accounts.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {payouts.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200">
              <History className="size-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Payouts Yet</h4>
              <p className="text-xs text-slate-500">
                You haven&apos;t submitted any withdrawal requests yet.
              </p>
            </div>
          ) : (
            payouts.map((payout) => (
              <div
                key={payout.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {payout.referenceId}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-semibold text-slate-600 bg-slate-50">
                      {payout.methodLabel}
                    </Badge>
                  </div>
                  {getStatusBadge(payout.status)}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Destination: <strong className="text-slate-800 font-mono">{payout.accountDetails}</strong></span>
                  <span className="font-bold text-sm text-slate-900">
                    {formatPKR(payout.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                  <span>Requested: {payout.requestedAt}</span>
                  {payout.processedAt && (
                    <span className="text-emerald-700 font-medium">
                      Settled: {payout.processedAt}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
