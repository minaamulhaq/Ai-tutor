import { NextRequest, NextResponse } from "next/server";
import { markConversationAsReadAction } from "@/app/actions/messageActions";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await markConversationAsReadAction(id);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to mark as read" }, { status: 500 });
  }
}
