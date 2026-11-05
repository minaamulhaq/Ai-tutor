/**
 * ZuhDemy Student Payments Service Layer
 * Authoritative client/server service for financial transactions, receipts, and refund records.
 * Direct PostgreSQL & Supabase integration with zero dummy data.
 */

import {
  PaymentTransaction,
  PaymentFilterState,
  PaymentSummaryStats,
} from "@/types/payment";
import {
  getStudentPaymentsAction,
  getStudentPaymentByIdAction,
} from "@/app/actions/studentPayments";

// ============================================================================
// CALCULATION RULES & HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates summary statistics dynamically from real transaction state.
 * Rules:
 * - Total Spent: sum of successful amount + partially_refunded net amounts
 * - Transactions: total count of all records
 * - Pending Payments: sum of pending amounts
 * - Refunded Amount: sum of all refunded & partial refund amounts
 */
export function calculatePaymentSummaries(
  transactions: PaymentTransaction[]
): PaymentSummaryStats {
  let totalSpentPKR = 0;
  let pendingAmountPKR = 0;
  let pendingCount = 0;
  let refundedAmountPKR = 0;
  let refundedCount = 0;

  transactions.forEach((txn) => {
    // 1. Total Spent (successful + net of partially refunded)
    if (txn.status === "successful") {
      totalSpentPKR += txn.amountPKR;
    } else if (txn.status === "partially_refunded") {
      totalSpentPKR += txn.netAmountPKR;
    }

    // 2. Pending
    if (txn.status === "pending") {
      pendingAmountPKR += txn.amountPKR;
      pendingCount += 1;
    }

    // 3. Refunds
    if (txn.refund && txn.refund.amountPKR > 0) {
      refundedAmountPKR += txn.refund.amountPKR;
      refundedCount += 1;
    }
  });

  return {
    totalSpentPKR,
    transactionCount: transactions.length,
    pendingAmountPKR,
    pendingCount,
    refundedAmountPKR,
    refundedCount,
  };
}

/**
 * Filters and sorts transaction records based on active user filters.
 */
export function filterAndSortPayments(
  transactions: PaymentTransaction[],
  filters: PaymentFilterState
): PaymentTransaction[] {
  let result = [...transactions];

  // 1. Search Query (matches transaction ID, booking ref, class title, teacher name, or receipt)
  if (filters.search.trim() !== "") {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (txn) =>
        txn.id.toLowerCase().includes(q) ||
        txn.bookingRef.toLowerCase().includes(q) ||
        txn.classTitle.toLowerCase().includes(q) ||
        txn.teacher.name.toLowerCase().includes(q) ||
        txn.subject.toLowerCase().includes(q) ||
        txn.receiptNumber.toLowerCase().includes(q)
    );
  }

  // 2. Status Filter
  if (filters.status !== "all") {
    result = result.filter((txn) => txn.status === filters.status);
  }

  // 3. Payment Method Filter
  if (filters.paymentMethod !== "all") {
    result = result.filter(
      (txn) => txn.paymentMethod?.type === filters.paymentMethod
    );
  }

  // 4. Date Range Filter
  if (filters.dateRange !== "all") {
    const today = new Date();
    result = result.filter((txn) => {
      const txnDate = new Date(txn.date);
      const diffTime = today.getTime() - txnDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.dateRange) {
        case "this_week":
          return diffDays >= 0 && diffDays <= 7;
        case "this_month":
          return (
            txnDate.getMonth() === today.getMonth() &&
            txnDate.getFullYear() === today.getFullYear()
          );
        case "last_month":
          const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
          const lastMonthYear =
            today.getMonth() === 0
              ? today.getFullYear() - 1
              : today.getFullYear();
          return (
            txnDate.getMonth() === lastMonth &&
            txnDate.getFullYear() === lastMonthYear
          );
        case "this_year":
          return txnDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    });
  }

  // 5. Sorting
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "amount-desc":
        return b.amountPKR - a.amountPKR;
      case "amount-asc":
        return a.amountPKR - b.amountPKR;
      default:
        return 0;
    }
  });

  return result;
}

// ============================================================================
// REALTIME ASYNC SERVICE API (DIRECT DATABASE BACKED)
// ============================================================================

/**
 * Loads the authenticated student's payment transactions directly from PostgreSQL.
 * Returns empty array if no transactions exist. Zero dummy data.
 */
export async function fetchStudentPayments(): Promise<{
  transactions: PaymentTransaction[];
  studentId?: string;
}> {
  try {
    const res = await getStudentPaymentsAction();
    if (res.success && res.data) {
      return { transactions: res.data, studentId: res.studentId };
    }
    if (res.error) {
      console.warn("fetchStudentPayments notice:", res.error);
    }
  } catch (err) {
    console.error("fetchStudentPayments error:", err);
  }
  return { transactions: [] };
}

/**
 * Loads a single transaction by ID or booking reference from the database.
 */
export async function fetchPaymentById(
  id: string
): Promise<PaymentTransaction | null> {
  try {
    const res = await getStudentPaymentByIdAction(id);
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.error(`fetchPaymentById error for ${id}:`, err);
  }
  return null;
}
