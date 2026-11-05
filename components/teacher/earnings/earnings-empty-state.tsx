"use client";

import React from "react";
import { Coins, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EarningsEmptyStateProps {
  type: "no-earnings" | "error";
  onRetry?: () => void;
}

export function EarningsEmptyState({ type, onRetry }: EarningsEmptyStateProps) {
  if (type === "no-earnings") {
    return (
      <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 max-w-lg mx-auto my-8">
        <div className="size-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-2xs">
          <Coins className="size-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">No earnings recorded yet</h3>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Earnings from your classes will automatically appear here once sessions are marked completed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center bg-white rounded-2xl border border-rose-200 shadow-2xs space-y-4 max-w-md mx-auto my-8">
      <div className="size-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
        <AlertTriangle className="size-6" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Unable to load financial records
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
          An error occurred while fetching your balances and transactions. Please try again.
        </p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm h-9 gap-2 cursor-pointer shadow-2xs"
        >
          <RotateCcw className="size-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  );
}
