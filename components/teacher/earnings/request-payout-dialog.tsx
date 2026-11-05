"use client";

import React, { useState } from "react";
import {
  Wallet,
  Building,
  Smartphone,
  Globe,
  Zap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PayoutMethod,
  PayoutRecord,
  USD_TO_PKR_RATE,
  formatPKR,
} from "./types";
import { apiRequestPayout } from "./earnings-service";

interface RequestPayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalanceUsd: number;
  onPayoutSuccess: (payout: PayoutRecord) => void;
}

export function RequestPayoutDialog({
  open,
  onOpenChange,
  availableBalanceUsd,
  onPayoutSuccess,
}: RequestPayoutDialogProps) {
  const availableBalancePkr = Math.round(availableBalanceUsd * USD_TO_PKR_RATE);
  const minWithdrawalPkr = 2800; // $10 approx

  const [step, setStep] = useState<"form" | "confirm">("form");
  const [amountPkr, setAmountPkr] = useState<string>("");
  const [method, setMethod] = useState<PayoutMethod>("bank_transfer");
  const [accountDetails, setAccountDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amountPkr) || 0;
  const numericAmountUsd = numericAmount / USD_TO_PKR_RATE;

  const handleQuickPercent = (percent: number) => {
    const val = Math.round((availableBalancePkr * percent) / 100);
    setAmountPkr(val.toString());
    setError(null);
  };

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numericAmount <= 0) {
      setError("Please enter a valid payout amount.");
      return;
    }

    if (numericAmount < minWithdrawalPkr) {
      setError(`Minimum withdrawal amount is PKR ${minWithdrawalPkr.toLocaleString("en-PK")}.`);
      return;
    }

    if (numericAmount > availableBalancePkr) {
      setError(`Amount exceeds your available balance of PKR ${availableBalancePkr.toLocaleString("en-PK")}.`);
      return;
    }

    if (!accountDetails.trim()) {
      setError("Please provide your account or recipient details.");
      return;
    }

    setStep("confirm");
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Backend API Integration point
      const res = await apiRequestPayout(
        numericAmountUsd,
        method,
        accountDetails.trim()
      );

      onPayoutSuccess(res.payout);
      // Reset form
      setAmountPkr("");
      setAccountDetails("");
      setStep("form");
      onOpenChange(false);
    } catch (err: any) {
      console.error("Payout error:", err);
      setError(err?.message || "Failed to submit payout request. Please try again.");
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const methodOptions: {
    id: PayoutMethod;
    name: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    placeholder: string;
  }[] = [
    {
      id: "bank_transfer",
      name: "Bank Transfer (IBAN)",
      desc: "Direct 1Link RTGS clearing to Pakistani bank accounts (1-2 business days)",
      icon: Building,
      placeholder: "Bank Name, Account Title & 24-digit IBAN (e.g. PK36MEZN...)",
    },
    {
      id: "raast",
      name: "Raast Instant Settlement",
      desc: "State Bank of Pakistan instant digital transfer (24/7 real-time)",
      icon: Zap,
      placeholder: "Registered Raast ID (Mobile Number / IBAN)",
    },
    {
      id: "jazzcash",
      name: "JazzCash Mobile Wallet",
      desc: "Direct wallet credit (same-day settlement)",
      icon: Smartphone,
      placeholder: "JazzCash Mobile Account Number (03XX-XXXXXXX) & Title",
    },
    {
      id: "payoneer",
      name: "Payoneer Global Account",
      desc: "International USD/EUR payout clearing for cross-border teachers",
      icon: Globe,
      placeholder: "Registered Payoneer Account Email",
    },
  ];

  const currentMethodConfig = methodOptions.find((m) => m.id === method)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full bg-white rounded-2xl p-0 overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-slate-200 bg-slate-50/70 text-left">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
              <Wallet className="size-4" />
            </div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900">
              {step === "form" ? "Request Payout Withdrawal" : "Confirm Payout Details"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            {step === "form"
              ? "Withdraw eligible class earnings to your verified payout account."
              : "Review and verify your withdrawal request before clearing."}
          </DialogDescription>
        </DialogHeader>

        {/* Form Step */}
        {step === "form" ? (
          <form onSubmit={handleProceedToConfirm} className="p-5 sm:p-6 space-y-5">
            {/* Balance Overview Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                  Available for Withdrawal
                </span>
                <div className="text-xl sm:text-2xl font-bold">
                  {formatPKR(availableBalanceUsd)}
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                <span>Min: PKR {minWithdrawalPkr.toLocaleString("en-PK")}</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-700">
                  Withdrawal Amount (PKR)
                </Label>
                <div className="flex items-center gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => handleQuickPercent(pct)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-700 transition-colors cursor-pointer"
                    >
                      {pct === 100 ? "Max" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  PKR
                </span>
                <Input
                  type="number"
                  min={minWithdrawalPkr}
                  max={availableBalancePkr}
                  value={amountPkr}
                  onChange={(e) => {
                    setAmountPkr(e.target.value);
                    setError(null);
                  }}
                  placeholder={`Min ${minWithdrawalPkr.toLocaleString("en-PK")}`}
                  className="pl-13 h-10 text-sm font-semibold bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
                />
              </div>
            </div>

            {/* Payout Method Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Select Payout Channel
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {methodOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = method === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setMethod(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-orange-50/70 border-orange-500 ring-2 ring-orange-500/10"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`size-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-orange-500 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 block truncate">
                          {opt.name}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recipient Account Details */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Recipient Account Information
              </Label>
              <Input
                type="text"
                value={accountDetails}
                onChange={(e) => {
                  setAccountDetails(e.target.value);
                  setError(null);
                }}
                placeholder={currentMethodConfig.placeholder}
                className="h-10 text-xs sm:text-sm bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
              />
              <span className="text-[10px] text-slate-400 block">
                Ensure details match your verified CNIC or tax entity name.
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs text-slate-600 hover:text-slate-900 h-9 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={numericAmount <= 0 || !accountDetails.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs h-9 px-5 rounded-xl gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Continue to Review</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Confirmation Step */
          <div className="p-5 sm:p-6 space-y-5">
            <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-orange-200/60">
                <span className="text-orange-900 font-medium">Payout Channel:</span>
                <span className="font-bold text-slate-900">{currentMethodConfig.name}</span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-orange-200/60">
                <span className="text-orange-900 font-medium">Destination:</span>
                <span className="font-mono text-slate-900 truncate max-w-[200px]">
                  {accountDetails}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-orange-200/60">
                <span className="text-orange-900 font-medium">Processing Fee:</span>
                <span className="font-bold text-emerald-700">Free (ZuhDemy Covered)</span>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-orange-950 font-bold">Total Disbursed:</span>
                <span className="font-bold text-lg text-slate-950">
                  PKR {numericAmount.toLocaleString("en-PK")}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                By confirming, funds will be locked for automated clearing. Payouts are irreversible once processed.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter className="pt-2 flex items-center justify-between sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setStep("form")}
                className="text-xs h-9 rounded-xl border-slate-200 text-slate-700 cursor-pointer"
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs h-9 px-5 rounded-xl gap-1.5 shadow-2xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Clearing Payout...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Confirm & Submit</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
