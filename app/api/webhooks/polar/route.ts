import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      status: "decommissioned",
      message: "Polar gateway has been decommissioned. ZuhDemy uses Safepay gateway at /api/webhooks/safepay",
    },
    { status: 410 }
  );
}

