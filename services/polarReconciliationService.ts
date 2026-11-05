/**
 * DEPRECATED: Polar.sh provider has been decommissioned.
 * All functions delegate to the new Safepay Payment Service (@/services/safepayPaymentService).
 */
import {
  syncSafepayProviderSettlement,
  processSafepayWebhookEvent,
} from "./safepayPaymentService";

export interface ProviderReconciliationResult {
  provider: "safepay" | "polar";
  isConnected: boolean;
  providerAvailableBalancePkr: number | null;
  internalClearingBalancePkr: number;
  discrepancyPkr: number;
  status: "matched" | "discrepancy" | "unconfigured" | "pending";
  lastSyncedAt: Date | null;
  message: string;
}

export async function syncPolarProviderSettlement(): Promise<ProviderReconciliationResult> {
  const result = await syncSafepayProviderSettlement();
  return result as ProviderReconciliationResult;
}

export async function processPolarWebhookEvent(payload: {
  event: string;
  data: any;
  idempotencyKey?: string;
}) {
  return processSafepayWebhookEvent(payload);
}
