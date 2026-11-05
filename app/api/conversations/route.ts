import { NextRequest, NextResponse } from "next/server";
import { getConversationsAction, getOrCreateConversationAction } from "@/app/actions/messageActions";
import { ConversationFilter } from "@/types/message";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = (searchParams.get("filter") as ConversationFilter) || "all";
    const search = searchParams.get("search") || undefined;

    const result = await getConversationsAction(filter, search);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ conversations: result.data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { partnerId } = body;

    if (!partnerId) {
      return NextResponse.json({ error: "partnerId is required." }, { status: 400 });
    }

    const result = await getOrCreateConversationAction(partnerId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ conversation: result.conversation });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create conversation" }, { status: 500 });
  }
}
