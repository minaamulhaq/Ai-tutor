import { ClassSession, formatPKR, USD_TO_PKR_RATE } from "@/components/teacher/classes/types";

export type TransactionType =
  | "class_earnings"
  | "payout"
  | "refund"
  | "escrow_hold";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "processing"
  | "failed"
  | "refunded";

export interface Transaction {
  id: string;
  referenceId: string;
  date: string; // YYYY-MM-DD or display
  timestamp: string; // Oct 6, 2026, 05:02 PM
  type: TransactionType;
  bookingReference?: string;
  studentName?: string;
  studentAvatar?: string;
  topicTitle?: string;
  subject?: string;
  grossAmount: number; // in USD
  platformFee: number; // in USD (15%)
  netAmount: number; // in USD
  status: TransactionStatus;
  payoutMethod?: string;
  description: string;
}

export type PayoutMethod = "bank_transfer" | "raast" | "jazzcash" | "payoneer";

export interface PayoutRecord {
  id: string;
  referenceId: string;
  requestedAt: string;
  processedAt?: string;
  amount: number; // in USD
  method: PayoutMethod;
  methodLabel: string;
  accountDetails: string; // e.g. "Meezan Bank (•••• 8912)"
  status: "completed" | "processing" | "pending" | "failed";
  note?: string;
}

export interface EarningsSummary {
  totalEarnings: number; // USD
  availableBalance: number; // USD
  pendingEarnings: number; // USD (funds in escrow for confirmed upcoming sessions)
  totalWithdrawn: number; // USD
  currency: string;
}

export interface MonthlyEarningsBreakdown {
  month: string; // "Jul 2026", "Aug 2026", etc.
  shortMonth: string; // "Jul", "Aug", etc.
  gross: number;
  platformFee: number;
  net: number;
  classCount: number;
}

export interface TransactionFiltersState {
  searchQuery: string;
  type: string; // "all" | TransactionType
  status: string; // "all" | TransactionStatus
  dateRange: string; // "all" | "this_month" | "last_month" | "past_90_days"
}

export { formatPKR, USD_TO_PKR_RATE };
