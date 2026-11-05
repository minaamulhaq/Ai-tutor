import { NextRequest, NextResponse } from "next/server";
import { getMessagesAction, sendMessageAction } from "@/app/actions/messageActions";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "60");

    const result = await getMessagesAction(id, limit);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ messages: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { content, messageType, attachments, invitation } = body;

    const result = await sendMessageAction({
      conversationId: id,
      content: content || "",
      messageType,
      attachments,
      invitation,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: result.message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to send message" }, { status: 500 });
  }
}
