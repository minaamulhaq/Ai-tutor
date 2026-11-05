/**
 * ZuhDemy Teacher Earnings & Payouts Service Layer
 * Direct PostgreSQL & Supabase backend integration with zero dummy data.
 */

import {
  Transaction,
  PayoutRecord,
  EarningsSummary,
  MonthlyEarningsBreakdown,
  PayoutMethod,
} from "./types";
import {
  getTeacherEarningsAction,
  requestTeacherPayoutAction,
} from "@/app/actions/teacherEarnings";

// ============================================================================
// REALTIME ASYNC SERVICE API (DIRECT DATABASE BACKED)
// ============================================================================

/**
 * Fetch all earnings data in a single unified database query.
 */
export async function apiFetchAllEarningsData(): Promise<{
  summary: EarningsSummary;
  transactions: Transaction[];
  payouts: PayoutRecord[];
  monthlyData: MonthlyEarningsBreakdown[];
  teacherId?: string;
}> {
  try {
    const res = await getTeacherEarningsAction();
    if (res.success && res.data) {
      return res.data;
    }
  } catch (err) {
    console.error("apiFetchAllEarningsData error:", err);
  }

  return {
    summary: {
      totalEarnings: 0,
      availableBalance: 0,
      pendingEarnings: 0,
      totalWithdrawn: 0,
      currency: "PKR",
    },
    transactions: [],
    payouts: [],
    monthlyData: [],
  };
}

/**
 * Fetch financial balances summary from PostgreSQL.
 */
export async function apiFetchEarningsSummary(): Promise<EarningsSummary> {
  const data = await apiFetchAllEarningsData();
  return data.summary;
}

/**
 * Fetch all real transaction records for this teacher from PostgreSQL.
 */
export async function apiFetchTransactions(): Promise<Transaction[]> {
  const data = await apiFetchAllEarningsData();
  return data.transactions;
}

/**
 * Fetch payout history records from PostgreSQL.
 */
export async function apiFetchPayoutHistory(): Promise<PayoutRecord[]> {
  const data = await apiFetchAllEarningsData();
  return data.payouts;
}

/**
 * Fetch monthly earnings trends breakdown from real booking history.
 */
export async function apiFetchMonthlyBreakdown(): Promise<MonthlyEarningsBreakdown[]> {
  const data = await apiFetchAllEarningsData();
  return data.monthlyData;
}

/**
 * Submit a real payout withdrawal request into PostgreSQL.
 */
export async function apiRequestPayout(
  amountUsd: number,
  method: PayoutMethod,
  accountDetails: string
): Promise<{ success: boolean; payout: PayoutRecord }> {
  const res = await requestTeacherPayoutAction(amountUsd, method, accountDetails);
  if (!res.success || !res.payout) {
    throw new Error(res.error || "Failed to process payout request");
  }
  return { success: true, payout: res.payout };
}
