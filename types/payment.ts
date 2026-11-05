/**
 * ZuhDemy Student Payments & Financial Transactions Data Models
 * Defines typed contracts for payments, receipts, refunds, and filters.
 */

export type PaymentStatus =
  | "successful"
  | "pending"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type PaymentMethodType =
  | "card"
  | "jazzcash"
  | "easypaisa"
  | "bank_transfer"
  | "wallet";

export interface PaymentMethod {
  type: PaymentMethodType;
  label: string; // e.g. "Visa •••• 4242", "JazzCash 0300••••123"
  last4?: string;
  provider?: string;
}

export interface RefundDetails {
  refundId: string;
  amountPKR: number;
  refundedAt: string;
  reason: string;
  refundMethod: string;
}

export interface PaymentTransaction {
  id: string; // e.g. "TXN-2026-8401"
  bookingRef: string; // e.g. "ZUH-2026-9041"
  classId?: string;
  classTitle: string;
  subject: string;
  teacher: {
    id: string;
    name: string;
    avatarUrl?: string;
    headline?: string;
  };
  student: {
    name: string;
    email: string;
  };
  date: string; // "YYYY-MM-DD"
  time: string; // "04:30 PM"
  
  // Amounts in PKR
  amountPKR: number;       // Gross transaction total
  baseFeePKR: number;      // Base tutor fee
  platformFeePKR: number;  // ZuhDemy 5% service fee
  discountPKR: number;     // Promotional discount
  netAmountPKR: number;    // Gross minus refund amount
  currency: "PKR";

  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  receiptNumber: string;   // e.g. "RCPT-98421"

  refund?: RefundDetails;
  failureReason?: string;
  notes?: string;
}

export interface PaymentFilterState {
  search: string;
  status: "all" | PaymentStatus;
  dateRange: "all" | "this_week" | "this_month" | "last_month" | "this_year";
  paymentMethod: "all" | PaymentMethodType;
  sortBy: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
}

export interface PaymentSummaryStats {
  totalSpentPKR: number;
  transactionCount: number;
  pendingAmountPKR: number;
  pendingCount: number;
  refundedAmountPKR: number;
  refundedCount: number;
}
