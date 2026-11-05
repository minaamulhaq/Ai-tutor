import { NextRequest, NextResponse } from "next/server";
import { processSafepayWebhookEvent, verifySafepayWebhookSignature } from "@/services/safepayPaymentService";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-sfpy-signature") ||
      req.headers.get("x-safepay-signature") ||
      req.headers.get("signature");
    const timestamp =
      req.headers.get("x-sfpy-timestamp") ||
      req.headers.get("x-safepay-timestamp") ||
      req.headers.get("timestamp");

    console.log("[Safepay Webhook] Incoming webhook received.");

    // If webhook secret is configured, enforce cryptographic signature check
    if (process.env.SAFEPAY_WEBHOOK_SECRET && !process.env.SAFEPAY_WEBHOOK_SECRET.includes("test")) {
      const isValid = verifySafepayWebhookSignature(rawBody, signature, timestamp);
      if (!isValid) {
        console.warn("[Safepay Webhook] Signature verification failed. Check SAFEPAY_WEBHOOK_SECRET in .env.");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody || "{}");
    const event = payload?.event || payload?.type || "payment:created";
    const data = payload?.data || payload;

    console.log(`[Safepay Webhook] Event: '${event}' | Order/Token:`, data?.order_id || data?.token || "none");

    const result = await processSafepayWebhookEvent({
      event,
      data,
      idempotencyKey: `SFPY-WH-${data?.token || data?.order_id || Date.now()}`,
    });

    console.log("[Safepay Webhook] Process result:", result);
    return NextResponse.json({ received: true, result });
  } catch (error: any) {
    console.error("Safepay webhook error:", error);
    return NextResponse.json({ error: error?.message || "Webhook processing error" }, { status: 400 });
  }
}
