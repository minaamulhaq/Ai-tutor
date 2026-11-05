import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTeacherAvailabilityForDate } from "@/services/bookingAvailabilityService";

const querySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" }),
});

/**
 * GET /api/teachers/[id]/availability?date=YYYY-MM-DD
 * Returns real calculated bookable slots for the teacher on the given date,
 * filtered against recurring availability windows and existing bookings.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rawParams = await context.params;
    const url = new URL(request.url);

    const teacherId = rawParams.id;
    const dateQuery = url.searchParams.get("date") || "";

    const parseResult = querySchema.safeParse({ date: dateQuery });
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid date format. Expected ?date=YYYY-MM-DD",
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { date } = parseResult.data;
    const availabilityData = await getTeacherAvailabilityForDate(teacherId, date);

    return NextResponse.json(availabilityData, {
      headers: {
        "Cache-Control": "no-store, max-age=0", // Real-time slot availability should never be stale
      },
    });
  } catch (error) {
    console.error("Error in GET /api/teachers/[id]/availability:", error);
    return NextResponse.json(
      { error: "Failed to calculate teacher availability" },
      { status: 500 }
    );
  }
}
