"use client";

import React from "react";
import Link from "next/link";
import { CreditCard, Receipt, ArrowRight, ShieldCheck, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSettingsState } from "../types";

interface BillingSectionProps {
  settings: StudentSettingsState;
  onChange: <K extends keyof StudentSettingsState>(
    key: K,
    value: StudentSettingsState[K]
  ) => void;
}

export function BillingSection({ settings, onChange }: BillingSectionProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="size-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <CreditCard className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Payment & Invoicing Preferences</h2>
            <p className="text-xs text-slate-500">
              Set default payment gateways and manage receipt delivery preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
          {/* Preferred Currency */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Display Currency</Label>
            <Select
              value={settings.preferredCurrency}
              onValueChange={(val: "PKR" | "USD") => onChange("preferredCurrency", val)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PKR" className="text-xs font-semibold">
                  PKR - Pakistani Rupee (₨)
                </SelectItem>
                <SelectItem value="USD" className="text-xs font-semibold">
                  USD - United States Dollar ($)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Preferred Checkout Method
            </Label>
            <Select
              value={settings.defaultPaymentMethod}
              onValueChange={(
                val: "JazzCash" | "EasyPaisa" | "Credit / Debit Card"
              ) => onChange("defaultPaymentMethod", val)}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-10 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JazzCash" className="text-xs">JazzCash Mobile Wallet</SelectItem>
                <SelectItem value="EasyPaisa" className="text-xs">EasyPaisa Mobile Wallet</SelectItem>
                <SelectItem value="Credit / Debit Card" className="text-xs">
                  Visa / Mastercard Debit & Credit Cards
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Billing Receipt Email */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Receipt & Invoice Recipient Email
            </Label>
            <Input
              type="email"
              value={settings.billingEmail}
              onChange={(e) => onChange("billingEmail", e.target.value)}
              className="rounded-xl border-slate-200 h-10 text-xs"
              placeholder="billing@example.com"
            />
            <p className="text-2xs text-slate-400">
              Invoices and payment receipts will be automatically sent to this address after class completion.
            </p>
          </div>
        </div>

        {/* Quick link to Payment History */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Looking for your past session invoices?
              </span>
              <span className="text-2xs text-slate-500">
                View all downloaded receipts, wallet balance, and transaction history.
              </span>
            </div>
          </div>
          <Link
            href="/student/payments"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2"
          >
            <span>Payments History</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
