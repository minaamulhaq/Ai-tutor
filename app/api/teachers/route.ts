import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchPublicTeachersAction } from "@/app/actions/teacher";
import { TeacherFilterState, TeacherSortOption, DayOfWeek } from "@/types/teacher";

const searchParamsSchema = z.object({
  search: z.string().optional().default(""),
  subject: z.string().optional(),
  subjects: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  languages: z.string().optional(),
  days: z.string().optional(),
  date: z.string().optional(),
  sort: z.enum(["relevance", "price-asc", "price-desc", "rating-desc", "reviews-desc"]).optional().default("relevance"),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().optional().default(12),
});

/**
 * GET /api/teachers
 * Public discovery endpoint with multi-facet filtering, search, sorting, and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parseResult = searchParamsSchema.safeParse(
      Object.fromEntries(url.searchParams.entries())
    );

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const q = parseResult.data;

    // Parse subjects comma-separated or single
    const subjectsList: string[] = [];
    if (q.subjects) {
      q.subjects.split(",").forEach((s) => s.trim() && subjectsList.push(s.trim()));
    } else if (q.subject) {
      subjectsList.push(q.subject.trim());
    }

    // Parse languages
    const languagesList: string[] = [];
    if (q.languages) {
      q.languages.split(",").forEach((l) => l.trim() && languagesList.push(l.trim()));
    }

    // Parse available days
    const daysList: DayOfWeek[] = [];
    if (q.days) {
      q.days.split(",").forEach((d) => d.trim() && daysList.push(d.trim() as DayOfWeek));
    }

    const filters: TeacherFilterState = {
      search: q.search || "",
      subjects: subjectsList,
      studentLevels: [],
      minPrice: q.minPrice,
      maxPrice: q.maxPrice,
      minRating: q.minRating,
      teachingLanguages: languagesList,
      availableDays: daysList,
      availabilityDate: q.date,
      scheduleType: "all",
    };

    const result = await searchPublicTeachersAction(
      filters,
      q.sort as TeacherSortOption,
      { page: q.page, pageSize: q.pageSize }
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Error in GET /api/teachers:", error);
    return NextResponse.json(
      { error: "Internal server error fetching teachers" },
      { status: 500 }
    );
  }
}
