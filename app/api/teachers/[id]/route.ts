import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPublicTeacherByIdAction } from "@/app/actions/teacher";

const paramsSchema = z.object({
  id: z.string().min(1),
});

/**
 * GET /api/teachers/[id]
 * Public teacher detail endpoint returning sanitized teacher credentials and bio.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await context.params;
    const parseResult = paramsSchema.safeParse(rawParams);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid teacher ID", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { id } = parseResult.data;
    const teacher = await getPublicTeacherByIdAction(id);

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found or inactive" },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/teachers/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error fetching teacher profile" },
      { status: 500 }
    );
  }
}
