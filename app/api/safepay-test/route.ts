import { NextResponse } from "next/server";
import { createSafepayCheckoutSession } from "@/services/safepayPaymentService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await createSafepayCheckoutSession({
      amountPkr: 2500,
      orderId: `TEST-${Date.now()}`,
      bookingId: "test-booking-id",
      redirectUrl: "http://localhost:3000/student/classes",
      cancelUrl: "http://localhost:3000/student/find-teachers",
    });

    return NextResponse.json({
      safepayConfigured: Boolean(process.env.SAFEPAY_API_KEY),
      environment: process.env.SAFEPAY_ENV || "sandbox",
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || String(err),
        stack: err?.stack,
      },
      { status: 200 }
    );
  }
}
