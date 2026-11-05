import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { disconnectTeacherGoogleAccount } from "@/lib/google/calendar";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.getUser();

  if (error || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectTeacherGoogleAccount(authData.user.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  return POST(request);
}
