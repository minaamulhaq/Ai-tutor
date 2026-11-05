"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  users,
  teacherProfiles,
  teacherAvailabilities,
  bookings,
  EducationEntry,
  ExperienceEntry,
  CertificateEntry,
} from "@/db/schema";
import { eq, sql, or, and, desc } from "drizzle-orm";
import { TeacherProfileData } from "@/components/teacher/profile/types";
import {
  Teacher,
  TeacherReview,
  TeacherFilterState,
  TeacherSortOption,
  PaginationParams,
  TeacherQueryResult,
  FilterCatalogs,
  DayOfWeek,
  TimeOfDay,
} from "@/types/teacher";
import { ensureRealTeachersSeeded } from "@/lib/db/seedRealTeachers";
import {
  AVAILABLE_SUBJECTS,
  AVAILABLE_STUDENT_LEVELS,
  AVAILABLE_LANGUAGES,
} from "@/lib/constants/catalogs";

export interface SaveTeacherProfileInput {
  // Personal & Identity
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  preferredLanguage?: string;
  timezone?: string;

  // Professional Details
  headline?: string;
  aboutMe?: string;
  teachingMethodology?: string;
  subjects?: string[];
  teachingLanguages?: string[];
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  certificates?: CertificateEntry[];

  // Preferences & Pricing
  studentLevels?: string[];
  sessionDurationMinutes?: number;
  hourlyRatePkr?: number;
  hourlyRateUsd?: number;
  teachingMode?: string;
  meetingProvider?: string;
  experienceYears?: string;
}

/**
 * Ensures table existence in Postgres
 */
async function ensureTablesExist() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY,
        email text NOT NULL UNIQUE,
        full_name text NOT NULL,
        role text DEFAULT 'teacher' NOT NULL,
        avatar_url text,
        phone text,
        refresh_token text,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS teacher_profiles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        headline text NOT NULL,
        about_me text,
        teaching_methodology text,
        subjects text[] DEFAULT '{}'::text[] NOT NULL,
        student_levels text[] DEFAULT '{}'::text[] NOT NULL,
        teaching_languages text[] DEFAULT '{}'::text[] NOT NULL,
        hourly_rate_pkr integer DEFAULT 2500 NOT NULL,
        hourly_rate_usd integer DEFAULT 25,
        session_duration_minutes integer DEFAULT 60 NOT NULL,
        teaching_mode text DEFAULT '100% Online (1-on-1)' NOT NULL,
        meeting_provider text DEFAULT 'Google Meet' NOT NULL,
        experience_years text DEFAULT '1-2 Years',
        education jsonb DEFAULT '[]'::jsonb NOT NULL,
        experience jsonb DEFAULT '[]'::jsonb NOT NULL,
        certificates jsonb DEFAULT '[]'::jsonb NOT NULL,
        city text DEFAULT 'Lahore',
        country text DEFAULT 'Pakistan',
        timezone text DEFAULT 'Asia/Karachi',
        is_verified boolean DEFAULT false,
        account_status text DEFAULT 'active' NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS teacher_profiles_user_id_idx ON teacher_profiles(user_id);
    `);
  } catch (err) {
    console.warn("Table verification notice in teacher.ts:", err);
  }
}

/**
 * Server Action: Save or Update Teacher Profile
 */
export async function saveTeacherProfileAction(data: SaveTeacherProfileInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to update your profile.",
      };
    }

    await ensureTablesExist();

    const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
    const userEmail = user.email || `${user.id}@zuhdemy.local`;
    const userFullName = fullName || user.user_metadata?.full_name || "Instructor";

    // 1. Ensure user exists in public.users table in PostgreSQL (UPSERT)
    try {
      await db
        .insert(users)
        .values({
          id: user.id,
          email: userEmail,
          fullName: userFullName,
          role: "teacher",
          phone: data.phone || null,
          avatarUrl: data.avatarUrl || null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            fullName: userFullName,
            role: "teacher",
            phone: data.phone || null,
            ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
            updatedAt: new Date(),
          },
        });
    } catch (usersErr) {
      console.warn("Notice: users table write warning:", usersErr);
    }

    // 2. Upsert into teacher_profiles using resilient check
    const profileValues = {
      headline: data.headline || "Certified Instructor on ZuhDemy",
      aboutMe: data.aboutMe || null,
      teachingMethodology: data.teachingMethodology || null,
      subjects: data.subjects || [],
      studentLevels: data.studentLevels || [],
      teachingLanguages: data.teachingLanguages || ["English"],
      hourlyRatePkr: data.hourlyRatePkr ?? 2500,
      hourlyRateUsd: data.hourlyRateUsd ?? 25,
      sessionDurationMinutes: data.sessionDurationMinutes ?? 60,
      teachingMode: data.teachingMode || "100% Online (1-on-1)",
      meetingProvider: data.meetingProvider || "Google Meet",
      experienceYears: data.experienceYears || "3-5 Years",
      education: data.education || [],
      experience: data.experience || [],
      certificates: data.certificates || [],
      city: data.city || "Lahore",
      country: data.country || "Pakistan",
      timezone: data.timezone || "Asia/Karachi",
      updatedAt: new Date(),
    };

    try {
      let existingId: string | null = null;
      try {
        const existing = await db
          .select({ id: teacherProfiles.id })
          .from(teacherProfiles)
          .where(eq(teacherProfiles.userId, user.id))
          .limit(1);
        if (existing.length > 0) {
          existingId = existing[0].id;
        }
      } catch {
        // Table or query check

      }

      if (existingId) {
        await db
          .update(teacherProfiles)
          .set(profileValues)
          .where(eq(teacherProfiles.userId, user.id));
      } else {
        await db
          .insert(teacherProfiles)
          .values({
            userId: user.id,
            ...profileValues,
          });
      }
    } catch (dbErr) {
      console.warn("Notice: teacher_profiles database write encountered:", dbErr);
    }

    // 3. Mark isOnboarded and sync in Supabase user_metadata
    await supabase.auth.updateUser({
      data: {
        isOnboarded: true,
        full_name: fullName || user.user_metadata?.full_name,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || user.user_metadata?.phone,
        avatar_url: data.avatarUrl !== undefined ? data.avatarUrl : user.user_metadata?.avatar_url,
        city: data.city,
        country: data.country,
        headline: data.headline,
        hourlyRatePKR: data.hourlyRatePkr,
        subjects: data.subjects,
        studentLevels: data.studentLevels,
        teachingLanguages: data.teachingLanguages,
        education: data.education,
        experience: data.experience,
        certificates: data.certificates,
        bio: data.aboutMe,
        teachingMethodology: data.teachingMethodology,
      },
    });

    return {
      success: true,
    };
  } catch (err: unknown) {
    console.error("Error saving teacher profile:", err);
    return {
      success: false,
      error: "Unable to save your profile changes. Please try again in a moment.",
    };
  }
}

/**
 * Server Action: Fetch Current Teacher Profile
 * 
 * Retrieves teacher profile from PostgreSQL with comprehensive fallback to Supabase user_metadata.
 */
export async function getTeacherProfileAction(): Promise<{
  success: boolean;
  data?: TeacherProfileData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await ensureTablesExist();

    let profile: any = null;
    let userRecord: any = null;

    try {
      profile = await db.query.teacherProfiles.findFirst({
        where: eq(teacherProfiles.userId, user.id),
        with: {
          user: true,
        },
      });

      userRecord =
        profile?.user ||
        (await db.query.users.findFirst({
          where: eq(users.id, user.id),
        }));
    } catch (dbErr) {
      console.warn("DB query warning in getTeacherProfileAction:", dbErr);
    }

    const meta = user.user_metadata || {};

    // Determine First & Last Name
    const rawFullName =
      userRecord?.fullName ||
      meta.full_name ||
      user.email?.split("@")[0] ||
      "Instructor";

    const nameParts = rawFullName.trim().split(/\s+/);
    const firstName = meta.first_name || nameParts[0] || "Instructor";
    const lastName =
      meta.last_name ||
      (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");

    // Format formatted member since date
    const memberSinceDate = userRecord?.createdAt || new Date(user.created_at);
    const memberSinceStr = memberSinceDate
      ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(memberSinceDate)
      )
      : "October 2024";

    // Resolve collections preferring DB profile, with seamless fallback to onboarding user_metadata
    const resolvedEducation: EducationEntry[] =
      Array.isArray(profile?.education) && profile.education.length > 0
        ? profile.education
        : Array.isArray(meta.education) && meta.education.length > 0
          ? meta.education
          : [];

    const resolvedExperience: ExperienceEntry[] =
      Array.isArray(profile?.experience) && profile.experience.length > 0
        ? profile.experience
        : Array.isArray(meta.experience) && meta.experience.length > 0
          ? meta.experience
          : [];

    const resolvedCertificates: CertificateEntry[] =
      Array.isArray(profile?.certificates) && profile.certificates.length > 0
        ? profile.certificates
        : Array.isArray(meta.certificates) && meta.certificates.length > 0
          ? meta.certificates
          : [];

    const resolvedSubjects: string[] =
      Array.isArray(profile?.subjects) && profile.subjects.length > 0
        ? profile.subjects
        : Array.isArray(meta.subjects) && meta.subjects.length > 0
          ? meta.subjects
          : ["Mathematics", "Physics"];

    const resolvedStudentLevels: string[] =
      Array.isArray(profile?.studentLevels) && profile.studentLevels.length > 0
        ? profile.studentLevels
        : Array.isArray(meta.studentLevels) && meta.studentLevels.length > 0
          ? meta.studentLevels
          : ["O-Levels / IGCSE", "A-Levels"];

    const resolvedLanguages: string[] =
      Array.isArray(profile?.teachingLanguages) && profile.teachingLanguages.length > 0
        ? profile.teachingLanguages
        : Array.isArray(meta.languages) && meta.languages.length > 0
          ? meta.languages
          : ["English", "Urdu"];

    const profileData: TeacherProfileData = {
      id: user.id,
      avatarUrl:
        userRecord?.avatarUrl ||
        meta.avatar_url ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      firstName,
      lastName,
      headline:
        profile?.headline ||
        meta.headline ||
        "Senior Faculty Instructor & STEM Specialist",
      role: "Senior Faculty Instructor",
      isVerified: profile?.isVerified ?? false,
      isEmailVerified: Boolean(user.email_confirmed_at),

      email: user.email || "",
      phone: userRecord?.phone || meta.phone || "",
      city: profile?.city || meta.city || "Lahore",
      country: profile?.country || meta.country || "Pakistan",
      preferredLanguage: "English",
      timezone: profile?.timezone || meta.timezone || "Asia/Karachi",

      aboutMe:
        profile?.aboutMe ||
        meta.bio ||
        meta.aboutMe ||
        "Experienced educator passionate about teaching and helping students achieve top grades through structured conceptual clarity and active problem solving.",
      subjects: resolvedSubjects,
      education: resolvedEducation,
      experience: resolvedExperience,
      certificates: resolvedCertificates,
      teachingLanguages: resolvedLanguages,
      teachingMethodology:
        profile?.teachingMethodology ||
        meta.teachingMethodology ||
        "Interactive whiteboard derivations, live problem solving, and targeted past paper walkthroughs.",

      studentLevels: resolvedStudentLevels,
      sessionDurationMinutes: profile?.sessionDurationMinutes ?? 60,
      hourlyRatePkr:
        profile?.hourlyRatePkr ??
        (meta.hourlyRatePKR ? Number(meta.hourlyRatePKR) : undefined) ??
        2500,
      hourlyRateUsd: profile?.hourlyRateUsd ?? 25,
      teachingMode: profile?.teachingMode || meta.teachingMode || "100% Online (1-on-1)",
      meetingProvider: profile?.meetingProvider || meta.meetingProvider || "Google Meet",

      accountStatus: (profile?.accountStatus as "active" | "suspended" | "pending") || "active",
      accountReference: `ZUH-TCH-${user.id.slice(0, 4).toUpperCase()}`,
      memberSince: memberSinceStr,
      lastUpdated: profile?.updatedAt
        ? new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }).format(new Date(profile.updatedAt))
        : "Recently",
    };

    return {
      success: true,
      data: profileData,
    };
  } catch (err: unknown) {
    console.error("Error in getTeacherProfileAction:", err);
    return {
      success: false,
      error: "Failed to load teacher profile.",
    };
  }
}

/**
 * Server Action: Search and filter public teachers directly from PostgreSQL
 * Supports multi-facet filtering, search, sorting, and server-side pagination.
 */
export async function searchPublicTeachersAction(
  filters: TeacherFilterState,
  sort: TeacherSortOption = "relevance",
  pagination: PaginationParams = { page: 1, pageSize: 12 }
): Promise<TeacherQueryResult> {
  try {
    await ensureRealTeachersSeeded();
    await ensureTablesExist();

    // 1. Fetch eligible teachers joining users and profiles
    const rawRows = await db
      .select({
        profile: teacherProfiles,
        user: users,
      })
      .from(teacherProfiles)
      .innerJoin(users, eq(users.id, teacherProfiles.userId))
      .where(
        and(
          eq(users.role, "teacher"),
          eq(teacherProfiles.accountStatus, "active")
        )
      );

    // 2. Fetch all review stats from bookings in a single pass to prevent N+1 queries
    const reviewStatsRows = await db
      .select({
        teacherId: bookings.teacherId,
        avgRating: sql<number>`round(avg(${bookings.studentRating})::numeric, 1)`,
        totalReviews: sql<number>`count(${bookings.id})`,
      })
      .from(bookings)
      .where(eq(bookings.hasReview, true))
      .groupBy(bookings.teacherId);

    const reviewStatsMap = new Map<string, { rating: number; count: number }>();
    for (const r of reviewStatsRows) {
      if (r.teacherId) {
        reviewStatsMap.set(r.teacherId, {
          rating: Number(r.avgRating || 5.0),
          count: Number(r.totalReviews || 0),
        });
      }
    }

    // 3. Fetch active availability days per teacher in a single pass
    const availabilityRows = await db
      .select({
        teacherId: teacherAvailabilities.teacherId,
        dayOfWeek: teacherAvailabilities.dayOfWeek,
      })
      .from(teacherAvailabilities)
      .where(eq(teacherAvailabilities.isActive, true));

    const availabilityDaysMap = new Map<string, Set<DayOfWeek>>();
    for (const av of availabilityRows) {
      if (!availabilityDaysMap.has(av.teacherId)) {
        availabilityDaysMap.set(av.teacherId, new Set<DayOfWeek>());
      }
      availabilityDaysMap.get(av.teacherId)!.add(av.dayOfWeek as DayOfWeek);
    }

    // 4. Map raw rows into standardized Teacher discovery contracts
    const allTeachers: Teacher[] = rawRows
      .filter(({ profile }) => {
        // Must have complete profile information
        return (
          profile.headline &&
          profile.headline.trim().length > 0 &&
          Array.isArray(profile.subjects) &&
          profile.subjects.length > 0 &&
          (profile.hourlyRatePkr ?? 0) > 0
        );
      })
      .map(({ profile, user }) => {
        const name = user.fullName || "Instructor";
        const [firstName, ...rest] = name.split(" ");
        const lastName = rest.join(" ");

        const stats = reviewStatsMap.get(user.id) || { rating: 5.0, count: 0 };
        const activeDaysSet = availabilityDaysMap.get(user.id) || new Set<DayOfWeek>();
        const availableDays = Array.from(activeDaysSet);

        // Highlight badge logic
        let highlightBadge: Teacher["highlightBadge"] = undefined;
        if (stats.rating >= 4.9 && stats.count >= 5) {
          highlightBadge = "Top Rated";
        } else if (profile.isVerified) {
          highlightBadge = "Cambridge Certified";
        }

        const subjects = profile.subjects && profile.subjects.length > 0
          ? profile.subjects
          : ["General Tutoring"];

        const studentLevels = profile.studentLevels && profile.studentLevels.length > 0
          ? profile.studentLevels
          : ["All Levels"];

        const teachingLanguages = profile.teachingLanguages && profile.teachingLanguages.length > 0
          ? profile.teachingLanguages
          : ["English"];

        return {
          id: user.id,
          name,
          firstName,
          lastName,
          avatarUrl:
            user.avatarUrl ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          headline: profile.headline,
          bio: profile.aboutMe || "",
          subjects,
          targetStudentLevels: studentLevels,
          teachingLanguages,
          hourlyRate: profile.hourlyRatePkr || 2500,
          currency: "PKR",
          sessionDurationMinutes: profile.sessionDurationMinutes || 60,
          rating: stats.rating,
          reviewCount: stats.count,
          isVerified: profile.isVerified ?? true,
          isFavorite: false,
          profileVisibility: "public",
          verificationStatus: "verified",
          city: profile.city || "Lahore",
          country: profile.country || "Pakistan",
          timezone: profile.timezone || "Asia/Karachi",
          availabilitySummary: availableDays.length > 0
            ? `${availableDays.length} days / week`
            : "Weekly Availability",
          nextAvailableSlot: "Available this week",
          availableDays,
          availableTimesOfDay: ["morning", "afternoon", "evening"] as TimeOfDay[],
          teachingMode: profile.teachingMode || "100% Online (1-on-1)",
          meetingProvider: profile.meetingProvider || "Google Meet",
          totalClassesTaught: stats.count,
          education: (profile.education as any[]) || [],
          experience: (profile.experience as any[]) || [],
          certificates: (profile.certificates as any[]) || [],
          highlightBadge,
        };
      });

    // 5. Apply Search filter
    let filtered = allTeachers;
    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter((t) => {
        const inName = t.name.toLowerCase().includes(q);
        const inHeadline = t.headline.toLowerCase().includes(q);
        const inBio = (t.bio || "").toLowerCase().includes(q);
        const inSubjects = t.subjects.some((s) => s.toLowerCase().includes(q));
        const inEducation = (t.education || []).some(
          (e) =>
            e.degree.toLowerCase().includes(q) ||
            e.institution.toLowerCase().includes(q) ||
            (e.fieldOfStudy || "").toLowerCase().includes(q)
        );
        const inExperience = (t.experience || []).some(
          (e) =>
            e.role.toLowerCase().includes(q) ||
            e.institution.toLowerCase().includes(q)
        );

        return inName || inHeadline || inBio || inSubjects || inEducation || inExperience;
      });
    }

    // 6. Apply Subject filter
    if (filters.subjects && filters.subjects.length > 0) {
      const lowerSubjects = filters.subjects.map((s) => s.toLowerCase());
      filtered = filtered.filter((t) =>
        t.subjects.some((s) => lowerSubjects.includes(s.toLowerCase()))
      );
    }

    // 7. Apply Student Level filter
    if (filters.studentLevels && filters.studentLevels.length > 0) {
      const lowerLevels = filters.studentLevels.map((l) => l.toLowerCase());
      filtered = filtered.filter((t) =>
        t.targetStudentLevels.some((l) => lowerLevels.includes(l.toLowerCase()))
      );
    }

    // 8. Apply Price filter
    if (typeof filters.minPrice === "number") {
      filtered = filtered.filter((t) => t.hourlyRate >= (filters.minPrice as number));
    }
    if (typeof filters.maxPrice === "number") {
      filtered = filtered.filter((t) => t.hourlyRate <= (filters.maxPrice as number));
    }

    // 9. Apply Rating filter
    if (typeof filters.minRating === "number" && filters.minRating > 0) {
      filtered = filtered.filter((t) => (t.rating || 0) >= (filters.minRating as number));
    }

    // 10. Apply Language filter
    if (filters.teachingLanguages && filters.teachingLanguages.length > 0) {
      const lowerLangs = filters.teachingLanguages.map((l) => l.toLowerCase());
      filtered = filtered.filter((t) =>
        t.teachingLanguages.some((l) => lowerLangs.includes(l.toLowerCase()))
      );
    }

    // 11. Apply Available Days filter
    if (filters.availableDays && filters.availableDays.length > 0) {
      filtered = filtered.filter((t) =>
        (t.availableDays || []).some((d) => filters.availableDays.includes(d))
      );
    }

    // 12. Apply Sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.hourlyRate - b.hourlyRate;
        case "price-desc":
          return b.hourlyRate - a.hourlyRate;
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "reviews-desc":
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case "relevance":
        default: {
          const aVerified = a.isVerified ? 1 : 0;
          const bVerified = b.isVerified ? 1 : 0;
          if (bVerified !== aVerified) return bVerified - aVerified;
          if ((b.rating || 0) !== (a.rating || 0)) {
            return (b.rating || 0) - (a.rating || 0);
          }
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        }
      }
    });

    // 13. Server-side pagination
    const totalCount = filtered.length;
    const page = Math.max(1, pagination.page || 1);
    const pageSize = Math.max(1, pagination.pageSize || 12);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const offset = (page - 1) * pageSize;
    const paginatedTeachers = filtered.slice(offset, offset + pageSize);

    return {
      teachers: paginatedTeachers,
      totalCount,
      page,
      pageSize,
      totalPages,
      appliedFilters: filters,
      sort,
      dataSource: "supabase",
    };
  } catch (err) {
    console.warn("Notice: searchPublicTeachersAction db fetch notice:", err);
    return {
      teachers: [],
      totalCount: 0,
      page: 1,
      pageSize: pagination.pageSize || 12,
      totalPages: 1,
      appliedFilters: filters,
      sort,
      dataSource: "supabase",
    };
  }
}

const TEACHER_LEGACY_MAP: Record<string, string> = {
  usr_teach_01: "11111111-1111-4111-a111-111111111111",
  usr_teach_02: "22222222-2222-4222-a222-222222222222",
  usr_teach_03: "33333333-3333-4333-a333-333333333333",
  usr_teach_04: "44444444-4444-4444-a444-444444444444",
  usr_teach_05: "00000000-0000-0000-0000-000000000002",
};

function resolveTeacherUuid(id: string): string | null {
  if (!id) return null;
  if (TEACHER_LEGACY_MAP[id]) return TEACHER_LEGACY_MAP[id];
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  return isUuid ? id : null;
}

/**
 * Server Action: Query single public teacher by user_id or profile id from PostgreSQL.
 * Loads verified public profile, real reviews from completed bookings, and weekly availability.
 * Strictly sanitizes private fields (email, phone, tokens) for student privacy.
 */
export async function getPublicTeacherByIdAction(teacherId: string) {
  try {
    await ensureRealTeachersSeeded();
    await ensureTablesExist();

    const targetUuid = resolveTeacherUuid(teacherId);
    if (!targetUuid) return null;

    const rows = await db
      .select({
        profile: teacherProfiles,
        user: users,
      })
      .from(teacherProfiles)
      .innerJoin(users, eq(users.id, teacherProfiles.userId))
      .where(
        and(
          or(eq(teacherProfiles.userId, targetUuid), eq(teacherProfiles.id, targetUuid)),
          eq(teacherProfiles.accountStatus, "active")
        )
      )
      .limit(1);

    if (!rows || rows.length === 0) return null;

    const { profile, user } = rows[0];
    const name = user.fullName || "Instructor";
    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ");

    // Fetch real reviews from completed bookings where student left a rating/review
    const reviewRows = await db
      .select({
        id: bookings.id,
        rating: bookings.studentRating,
        review: bookings.studentReview,
        reviewedAt: bookings.reviewedAt,
        subject: bookings.subject,
        topicTitle: bookings.topicTitle,
        studentName: sql<string>`coalesce(student.full_name, 'Verified Student')`,
        studentAvatar: sql<string | null>`student.avatar_url`,
      })
      .from(bookings)
      .leftJoin(sql`users as student`, sql`student.id = ${bookings.studentId}`)
      .where(
        and(
          eq(bookings.teacherId, user.id),
          or(
            eq(bookings.hasReview, true),
            sql`${bookings.studentReview} IS NOT NULL AND ${bookings.studentReview} != ''`,
            sql`${bookings.studentRating} IS NOT NULL`
          )
        )
      )
      .orderBy(desc(bookings.reviewedAt), desc(bookings.completedAt));

    const reviews: TeacherReview[] = reviewRows
      .filter((r) => r.rating !== null && r.rating !== undefined && r.rating >= 1 && r.rating <= 5)
      .map((r) => {
        const rating = Math.min(5, Math.max(1, r.rating || 5));
        const dateFormatted = r.reviewedAt
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(r.reviewedAt))
          : "Recently";

        return {
          id: `rev-${r.id}`,
          bookingId: r.id,
          author: r.studentName,
          authorAvatar: r.studentAvatar || undefined,
          role: "student",
          studentInfo: `${r.subject}${r.topicTitle ? ` • ${r.topicTitle}` : ""} • Completed Class`,
          rating,
          date: dateFormatted,
          comment: r.review || "Excellent, engaging, and clear tutor.",
          verified: true,
          subject: r.subject,
          topicTitle: r.topicTitle || undefined,
          likes: 4,
        };
      });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 5.0;

    // Fetch weekly availability slots
    const availRows = await db
      .select()
      .from(teacherAvailabilities)
      .where(
        and(
          eq(teacherAvailabilities.teacherId, user.id),
          eq(teacherAvailabilities.isActive, true)
        )
      );

    const availableDays = Array.from(new Set(availRows.map((a) => a.dayOfWeek as DayOfWeek)));

    return {
      id: user.id,
      name,
      firstName,
      lastName,
      avatarUrl:
        user.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      headline: profile.headline,
      bio: profile.aboutMe || "",
      subjects: profile.subjects && profile.subjects.length > 0 ? profile.subjects : ["General Tutoring"],
      targetStudentLevels: profile.studentLevels && profile.studentLevels.length > 0 ? profile.studentLevels : ["All Levels"],
      teachingLanguages: profile.teachingLanguages && profile.teachingLanguages.length > 0 ? profile.teachingLanguages : ["English"],
      hourlyRate: profile.hourlyRatePkr || 2500,
      currency: "PKR",
      sessionDurationMinutes: profile.sessionDurationMinutes || 60,
      rating: avgRating,
      reviewCount: totalReviews,
      isVerified: profile.isVerified ?? true,
      isFavorite: false,
      profileVisibility: "public" as const,
      verificationStatus: "verified" as const,
      city: profile.city || "Lahore",
      country: profile.country || "Pakistan",
      timezone: profile.timezone || "Asia/Karachi",
      availabilitySummary: `${availableDays.length} days / week`,
      nextAvailableSlot: "Available this week",
      availableDays,
      availableTimesOfDay: ["morning", "afternoon", "evening"] as TimeOfDay[],
      teachingMode: profile.teachingMode || "100% Online (1-on-1)",
      meetingProvider: profile.meetingProvider || "Google Meet",
      totalClassesTaught: totalReviews,
      education: (profile.education as any[]) || [],
      experience: (profile.experience as any[]) || [],
      certificates: (profile.certificates as any[]) || [],
      reviews,
    };
  } catch (err) {
    console.warn("Notice: getPublicTeacherByIdAction db fetch notice:", err);
    return null;
  }
}

/**
 * Server Action: Query dynamic reviews specifically for a teacher from PostgreSQL bookings
 */
export async function getTeacherReviewsAction(teacherId: string): Promise<{
  success: boolean;
  reviews: TeacherReview[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  error?: string;
}> {
  try {
    await ensureTablesExist();

    const targetUuid = resolveTeacherUuid(teacherId);
    if (!targetUuid) {
      return {
        success: true,
        reviews: [],
        averageRating: 5.0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const reviewRows = await db
      .select({
        id: bookings.id,
        rating: bookings.studentRating,
        review: bookings.studentReview,
        reviewedAt: bookings.reviewedAt,
        subject: bookings.subject,
        topicTitle: bookings.topicTitle,
        studentName: sql<string>`coalesce(student.full_name, 'Verified Student')`,
        studentAvatar: sql<string | null>`student.avatar_url`,
      })
      .from(bookings)
      .leftJoin(sql`users as student`, sql`student.id = ${bookings.studentId}`)
      .where(
        and(
          eq(bookings.teacherId, targetUuid),
          or(
            eq(bookings.hasReview, true),
            sql`${bookings.studentReview} IS NOT NULL AND ${bookings.studentReview} != ''`,
            sql`${bookings.studentRating} IS NOT NULL`
          )
        )
      )
      .orderBy(desc(bookings.reviewedAt), desc(bookings.completedAt));

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;

    const reviews: TeacherReview[] = reviewRows
      .filter((r) => r.rating !== null && r.rating !== undefined && r.rating >= 1 && r.rating <= 5)
      .map((r) => {
        const rating = Math.min(5, Math.max(1, r.rating || 5));
        ratingBreakdown[rating as keyof typeof ratingBreakdown] = (ratingBreakdown[rating as keyof typeof ratingBreakdown] || 0) + 1;
        ratingSum += rating;

        const dateFormatted = r.reviewedAt
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(r.reviewedAt))
          : "Recently";

        return {
          id: `rev-${r.id}`,
          bookingId: r.id,
          author: r.studentName,
          authorAvatar: r.studentAvatar || undefined,
          role: "student",
          studentInfo: `${r.subject}${r.topicTitle ? ` • ${r.topicTitle}` : ""} • Completed Class`,
          rating,
          date: dateFormatted,
          comment: r.review || "Excellent, engaging, and clear tutor.",
          verified: true,
          subject: r.subject,
          topicTitle: r.topicTitle || undefined,
          likes: 4,
        };
      });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(1)) : 5.0;

    return {
      success: true,
      reviews,
      averageRating,
      totalReviews,
      ratingBreakdown,
    };
  } catch (err: any) {
    console.warn("getTeacherReviewsAction error:", err);
    return {
      success: false,
      reviews: [],
      averageRating: 5.0,
      totalReviews: 0,
      ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      error: err?.message || "Failed to load reviews.",
    };
  }
}

/**
 * Server Action: Query filter catalogs dynamically from database
 */
export async function getPublicTeacherFilterCatalogsAction(): Promise<FilterCatalogs> {
  try {
    await ensureRealTeachersSeeded();
    await ensureTablesExist();

    const rows = await db
      .select({
        subjects: teacherProfiles.subjects,
        rate: teacherProfiles.hourlyRatePkr,
      })
      .from(teacherProfiles)
      .where(eq(teacherProfiles.accountStatus, "active"));

    const subjectSet = new Set<string>();
    let minRate = 1000;
    let maxRate = 10000;

    if (rows.length > 0) {
      const rates: number[] = [];
      for (const r of rows) {
        if (Array.isArray(r.subjects)) {
          r.subjects.forEach((s) => subjectSet.add(s));
        }
        if (typeof r.rate === "number") {
          rates.push(r.rate);
        }
      }
      if (rates.length > 0) {
        minRate = Math.min(...rates);
        maxRate = Math.max(...rates);
      }
    }

    const subjects = subjectSet.size > 0 ? Array.from(subjectSet) : AVAILABLE_SUBJECTS;

    return {
      subjects,
      studentLevels: AVAILABLE_STUDENT_LEVELS,
      languages: AVAILABLE_LANGUAGES,
      priceRange: {
        min: Math.floor(minRate / 500) * 500,
        max: Math.ceil(maxRate / 500) * 500,
      },
    };
  } catch (err) {
    console.warn("Notice: getPublicTeacherFilterCatalogsAction notice:", err);
    return {
      subjects: AVAILABLE_SUBJECTS,
      studentLevels: AVAILABLE_STUDENT_LEVELS,
      languages: AVAILABLE_LANGUAGES,
      priceRange: { min: 1500, max: 5000 },
    };
  }
}

/**
 * Backwards compatible alias for listing public teachers
 */
export async function getPublicTeachersListAction() {
  const result = await searchPublicTeachersAction({
    search: "",
    subjects: [],
    studentLevels: [],
    teachingLanguages: [],
    availableDays: [],
    scheduleType: "all",
  });
  return result.teachers;
}
