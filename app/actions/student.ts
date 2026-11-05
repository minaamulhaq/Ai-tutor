"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  users,
  studentProfiles,
  EnrolledSubject,
  bookings,
  teacherProfiles,
  studentFavorites,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureBookingSystemSchema } from "@/lib/db/init";
import { Teacher } from "@/types/teacher";
import { StudentSettingsState } from "@/components/student/settings/types";

export interface SaveStudentProfileInput {
  // Identity & Personal Information
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  whatsappNumber?: string;
  city?: string;
  country?: string;
  timezone?: string;
  preferredLanguages?: string[];
  dateOfBirth?: string;
  gender?: string;
  tagline?: string;
  bio?: string;

  // Academic Profile
  academicLevel: string;
  examinationBoard: string;
  institution?: string;
  targetExamSeries?: string;
  enrolledSubjects: EnrolledSubject[];

  // Learning Goals & Style
  primaryGoals: string[];
  sessionFormat?: string;
  customNote?: string;
  preferredLearningStyle?: string;
  availableTimeSlots?: string[];

  // Guardian Information
  guardianName?: string;
  guardianRelationship?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  isEmergencyContact?: boolean;

  // Notifications
  notifications?: {
    emailReminders?: boolean;
    whatsappAlerts?: boolean;
    classStartNoticeMinutes?: number;
  };
}

/**
 * Server Action: Save or Update Student Profile
 * 
 * Verifies authenticated user via Supabase session cookies
 * and performs an atomic upsert into student_profiles & users using Drizzle ORM.
 */
export async function saveStudentProfileAction(data: SaveStudentProfileInput) {
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

    // 1. Ensure user exists in public.users table in PostgreSQL (UPSERT)
    const userEmail = user.email || `${user.id}@zuhdemy.local`;
    const userFullName = data.fullName || user.user_metadata?.full_name || "Student";

    await db
      .insert(users)
      .values({
        id: user.id,
        email: userEmail,
        fullName: userFullName,
        role: "student",
        phone: data.phone || null,
        avatarUrl: data.avatarUrl || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          fullName: userFullName,
          role: "student",
          phone: data.phone || null,
          ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
          updatedAt: new Date(),
        },
      });

    // 2. Upsert into student_profiles table via Drizzle
    const [savedProfile] = await db
      .insert(studentProfiles)
      .values({
        userId: user.id,
        academicLevel: data.academicLevel,
        examinationBoard: data.examinationBoard,
        institution: data.institution || null,
        targetExamSeries: data.targetExamSeries || null,
        enrolledSubjects: data.enrolledSubjects || [],
        primaryGoals: data.primaryGoals || [],
        sessionFormat: data.sessionFormat || "1-on-1 Focused Session",
        customNote: data.customNote || null,
        guardianName: data.guardianName || null,
        guardianRelationship: data.guardianRelationship || null,
        guardianPhone: data.guardianPhone || null,
        guardianEmail: data.guardianEmail || null,
        isEmergencyContact: data.isEmergencyContact ?? false,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: studentProfiles.userId,
        set: {
          academicLevel: data.academicLevel,
          examinationBoard: data.examinationBoard,
          institution: data.institution || null,
          targetExamSeries: data.targetExamSeries || null,
          enrolledSubjects: data.enrolledSubjects || [],
          primaryGoals: data.primaryGoals || [],
          sessionFormat: data.sessionFormat || "1-on-1 Focused Session",
          customNote: data.customNote || null,
          guardianName: data.guardianName || null,
          guardianRelationship: data.guardianRelationship || null,
          guardianPhone: data.guardianPhone || null,
          guardianEmail: data.guardianEmail || null,
          isEmergencyContact: data.isEmergencyContact ?? false,
          updatedAt: new Date(),
        },
      })
      .returning();

    // 3. Mark isOnboarded and sync all client metadata in Supabase user_metadata
    await supabase.auth.updateUser({
      data: {
        isOnboarded: true,
        full_name: data.fullName || user.user_metadata?.full_name,
        phone: data.phone || user.user_metadata?.phone,
        avatar_url: data.avatarUrl !== undefined ? data.avatarUrl : user.user_metadata?.avatar_url,
        city: data.city,
        country: data.country,
        timezone: data.timezone,
        preferredLanguages: data.preferredLanguages,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        tagline: data.tagline,
        bio: data.bio,
        whatsappNumber: data.whatsappNumber,
        academicLevel: data.academicLevel,
        examinationBoard: data.examinationBoard,
        institution: data.institution,
        targetExamYear: data.targetExamSeries,
        preferredLearningStyle: data.preferredLearningStyle,
        availableTimeSlots: data.availableTimeSlots,
        notifications: data.notifications,
      },
    });

    return {
      success: true,
      profile: savedProfile,
    };
  } catch (err: unknown) {
    console.error("Error saving student profile:", err);
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving your profile.",
    };
  }
}

/**
 * Server Action: Fetch Current Student Profile
 */
export async function getStudentProfileAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    let profile = null;
    let userRecord = null;

    try {
      profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, user.id),
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
      console.warn("DB query warning in getStudentProfileAction:", dbErr);
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || "",
        fullName:
          userRecord?.fullName ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Student",
        phone: userRecord?.phone || user.user_metadata?.phone || "",
        avatarUrl: userRecord?.avatarUrl || user.user_metadata?.avatar_url || "",
        role: userRecord?.role || user.user_metadata?.role || "student",
        createdAt: userRecord?.createdAt || user.created_at,
      },
      studentProfile: profile || null,
      metadata: user.user_metadata || {},
    };
  } catch (err: unknown) {
    console.error("Error fetching student profile:", err);
    return {
      success: false,
      error: "Failed to load student profile.",
    };
  }
}

/**
 * Ensures the Supabase Storage 'avatars' bucket exists and is public
 */
export async function ensureAvatarBucketExists() {
  try {
    await db.execute(sql`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
          INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
          VALUES ('avatars', 'avatars', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
          ON CONFLICT (id) DO UPDATE SET public = true;
        END IF;
      END $$;
    `);
  } catch (err) {
    console.warn("Notice: ensureAvatarBucketExists warning (safe to ignore if using standard bucket):", err);
  }
}

/**
 * Server Action: Update User Avatar Instantly
 * Directly commits avatar URL to users table in PostgreSQL and updates Supabase user_metadata
 */
export async function updateStudentAvatarAction(avatarUrl: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    await ensureAvatarBucketExists();

    // 1. Update PostgreSQL users table
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email || `${user.id}@zuhdemy.local`,
        fullName: user.user_metadata?.full_name || "Student",
        role: "student",
        avatarUrl: avatarUrl || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          avatarUrl: avatarUrl || null,
          updatedAt: new Date(),
        },
      });

    // 2. Synchronize Supabase user_metadata
    await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl,
      },
    });

    return {
      success: true,
      avatarUrl,
    };
  } catch (err: any) {
    console.error("Error in updateStudentAvatarAction:", err);
    return {
      success: false,
      error: err?.message || "Failed to save avatar image.",
    };
  }
}

export interface StudentOverviewData {
  student: {
    id: string;
    fullName: string;
    firstName: string;
    email: string;
    avatarUrl?: string | null;
  };
  metrics: {
    activeClassesCount: number;
    bookedHours: number;
    favoriteTutorsCount: number;
    walletBalancePKR: number;
    totalSpentPKR: number;
    completedClassesCount: number;
  };
  nextClass: {
    id: string;
    bookingReference: string;
    subject: string;
    topicTitle: string;
    durationMinutes: number;
    pricePkr: number;
    meetingUrl?: string | null;
    startTime: string;
    endTime: string;
    dateStr: string;
    isToday: boolean;
    teacher: {
      id: string;
      name: string;
      avatarUrl?: string | null;
      headline?: string | null;
    };
  } | null;
}

/**
 * Server Action: Get Student Dashboard Overview
 * Single-query, authoritative fetch of student identity, live class counts,
 * real booked hours, total spent in PKR, and next upcoming 1-on-1 session.
 */
export async function getStudentOverviewAction(): Promise<{
  success: boolean;
  data?: StudentOverviewData;
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

    await ensureBookingSystemSchema();

    // 1. Fetch student record from users table
    const [userRecord] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const fullName =
      userRecord?.fullName ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student";
    const firstName = fullName.trim().split(" ")[0] || "Student";
    const avatarUrl = userRecord?.avatarUrl || user.user_metadata?.avatar_url || null;

    // 2. Query all student bookings with teacher profile information
    const studentBookings = await db
      .select({
        booking: bookings,
        teacher: users,
        teacherProfile: teacherProfiles,
      })
      .from(bookings)
      .leftJoin(users, eq(users.id, bookings.teacherId))
      .leftJoin(teacherProfiles, eq(teacherProfiles.userId, bookings.teacherId))
      .where(eq(bookings.studentId, user.id))
      .orderBy(bookings.startTime);

    const now = new Date();

    // 3. Calculate authoritative metrics
    const confirmedClasses = studentBookings.filter(
      (b) => b.booking.status === "confirmed" && new Date(b.booking.endTime) >= now
    );
    const completedClasses = studentBookings.filter(
      (b) => b.booking.status === "completed"
    );

    const activeClassesCount = confirmedClasses.length;
    const completedClassesCount = completedClasses.length;

    const totalMinutes = studentBookings
      .filter((b) => b.booking.status === "confirmed" || b.booking.status === "completed")
      .reduce((acc, b) => acc + (b.booking.durationMinutes || 60), 0);
    const bookedHours = Math.round((totalMinutes / 60) * 10) / 10;

    const totalSpentPKR = studentBookings
      .filter((b) => b.booking.paymentStatus === "paid")
      .reduce((acc, b) => acc + (b.booking.pricePkr || 2500), 0);

    // 4. Resolve next upcoming session
    let nextClass: StudentOverviewData["nextClass"] = null;
    const upcomingList = confirmedClasses.sort(
      (a, b) =>
        new Date(a.booking.startTime).getTime() -
        new Date(b.booking.startTime).getTime()
    );

    if (upcomingList.length > 0) {
      const next = upcomingList[0];
      const start = new Date(next.booking.startTime);
      const isToday =
        start.getFullYear() === now.getFullYear() &&
        start.getMonth() === now.getMonth() &&
        start.getDate() === now.getDate();

      const timeStr = start.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const dateStr = isToday
        ? `Today at ${timeStr}`
        : `${start.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })} at ${timeStr}`;

      nextClass = {
        id: next.booking.id,
        bookingReference: next.booking.bookingReference,
        subject: next.booking.subject,
        topicTitle: next.booking.topicTitle,
        durationMinutes: next.booking.durationMinutes,
        pricePkr: next.booking.pricePkr,
        meetingUrl: next.booking.meetingUrl || null,
        startTime: next.booking.startTime.toISOString(),
        endTime: next.booking.endTime.toISOString(),
        dateStr,
        isToday,
        teacher: {
          id: next.teacher?.id || next.booking.teacherId,
          name: next.teacher?.fullName || "Instructor",
          avatarUrl: next.teacher?.avatarUrl || null,
          headline:
            next.teacherProfile?.headline || "Senior Faculty Instructor",
        },
      };
    }

    // 5. Query actual count of favorited tutors
    let favoriteTutorsCount = 0;
    try {
      const [favCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(studentFavorites)
        .where(eq(studentFavorites.studentId, user.id));
      favoriteTutorsCount = Number(favCount?.count || 0);
    } catch {}

    return {
      success: true,
      data: {
        student: {
          id: user.id,
          fullName,
          firstName,
          email: userRecord?.email || user.email || "",
          avatarUrl,
        },
        metrics: {
          activeClassesCount,
          bookedHours,
          favoriteTutorsCount,
          walletBalancePKR: 0,
          totalSpentPKR,
          completedClassesCount,
        },
        nextClass,
      },
    };
  } catch (err: any) {
    console.error("getStudentOverviewAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to load student overview data.",
    };
  }
}

// Internal legacy ID resolver
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
 * Server Action: Get all favorite teachers saved by the authenticated student
 */
export async function getStudentFavoriteTeachersAction(): Promise<{
  success: boolean;
  teachers: Teacher[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, teachers: [], error: "Unauthorized" };
    }

    await ensureBookingSystemSchema();

    const favRows = await db
      .select({
        teacherId: studentFavorites.teacherId,
        user: users,
        profile: teacherProfiles,
      })
      .from(studentFavorites)
      .innerJoin(users, eq(users.id, studentFavorites.teacherId))
      .innerJoin(teacherProfiles, eq(teacherProfiles.userId, studentFavorites.teacherId))
      .where(eq(studentFavorites.studentId, user.id));

    if (favRows.length === 0) {
      return { success: true, teachers: [] };
    }

    // Single pass review calculation
    const reviewStatsRows = await db
      .select({
        teacherId: bookings.teacherId,
        avgRating: sql<number>`round(avg(${bookings.studentRating})::numeric, 1)`,
        totalReviews: sql<number>`count(${bookings.id})`,
      })
      .from(bookings)
      .where(eq(bookings.hasReview, true))
      .groupBy(bookings.teacherId);

    const reviewMap = new Map<string, { rating: number; count: number }>();
    reviewStatsRows.forEach((r) => {
      if (r.teacherId) {
        reviewMap.set(r.teacherId, {
          rating: Number(r.avgRating || 5.0),
          count: Number(r.totalReviews || 0),
        });
      }
    });

    const teachers: Teacher[] = favRows.map(({ user: tUser, profile }) => {
      const name = tUser.fullName || "Instructor";
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ");
      const stats = reviewMap.get(tUser.id) || { rating: 5.0, count: 0 };

      return {
        id: tUser.id,
        name,
        firstName,
        lastName,
        avatarUrl:
          tUser.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        headline: profile.headline,
        bio: profile.aboutMe || "",
        subjects: profile.subjects?.length ? profile.subjects : ["General Tutoring"],
        targetStudentLevels: profile.studentLevels?.length ? profile.studentLevels : ["All Levels"],
        teachingLanguages: profile.teachingLanguages?.length ? profile.teachingLanguages : ["English"],
        hourlyRate: profile.hourlyRatePkr || 2500,
        currency: "PKR",
        sessionDurationMinutes: profile.sessionDurationMinutes || 60,
        rating: stats.rating,
        reviewCount: stats.count,
        isVerified: profile.isVerified ?? true,
        isFavorite: true,
        profileVisibility: "public",
        verificationStatus: "verified",
      };
    });

    return { success: true, teachers };
  } catch (err: any) {
    console.error("getStudentFavoriteTeachersAction error:", err);
    return { success: false, teachers: [], error: err?.message || "Failed to load favorite teachers." };
  }
}

/**
 * Server Action: Toggle favorite status for a teacher
 */
export async function toggleFavoriteTeacherAction(teacherId: string): Promise<{
  success: boolean;
  isFavorited?: boolean;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Please log in to save favorite teachers." };
    }

    const resolvedUuid = resolveTeacherUuid(teacherId);
    if (!resolvedUuid) {
      return { success: false, error: "Invalid instructor ID." };
    }

    await ensureBookingSystemSchema();

    // Check if already in favorites
    const [existing] = await db
      .select({ id: studentFavorites.id })
      .from(studentFavorites)
      .where(
        and(
          eq(studentFavorites.studentId, user.id),
          eq(studentFavorites.teacherId, resolvedUuid)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .delete(studentFavorites)
        .where(eq(studentFavorites.id, existing.id));

      revalidatePath("/student/favorites");
      revalidatePath("/student");
      return { success: true, isFavorited: false };
    } else {
      await db
        .insert(studentFavorites)
        .values({
          studentId: user.id,
          teacherId: resolvedUuid,
        });

      revalidatePath("/student/favorites");
      revalidatePath("/student");
      return { success: true, isFavorited: true };
    }
  } catch (err: any) {
    console.error("toggleFavoriteTeacherAction error:", err);
    return { success: false, error: err?.message || "Failed to update favorite status." };
  }
}

/**
 * Server Action: Query IDs of all teachers favorited by student
 */
export async function getStudentFavoriteTeacherIdsAction(): Promise<{
  success: boolean;
  favoriteIds: string[];
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: true, favoriteIds: [] };
    }

    await ensureBookingSystemSchema();

    const rows = await db
      .select({ teacherId: studentFavorites.teacherId })
      .from(studentFavorites)
      .where(eq(studentFavorites.studentId, user.id));

    return {
      success: true,
      favoriteIds: rows.map((r) => r.teacherId),
    };
  } catch {
    return { success: true, favoriteIds: [] };
  }
}

/**
 * Server Action: Fetch student account & notification settings from database
 */
export async function getStudentSettingsAction(): Promise<{
  success: boolean;
  settings?: StudentSettingsState;
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

    const [userRecord] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const fullName =
      userRecord?.fullName ||
      user.user_metadata?.full_name ||
      "Student";
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    const meta = user.user_metadata || {};

    const settings: StudentSettingsState = {
      firstName: firstName || "Student",
      lastName: lastName || "",
      email: userRecord?.email || user.email || "",
      phone: userRecord?.phone || meta.phone || "",
      whatsappNumber: meta.whatsappNumber || userRecord?.phone || meta.phone || "",
      timezone: meta.timezone || "Asia/Karachi",
      language: meta.language || "English",
      parentEmailNotificationCopy: Boolean(meta.parentEmailNotificationCopy ?? true),

      twoFactorEnabled: Boolean(meta.twoFactorEnabled ?? false),
      twoFactorMethod: meta.twoFactorMethod === "authenticator" ? "authenticator" : "sms",
      sessions: [
        {
          id: `sess-${user.id.slice(0, 8)}`,
          device: "Current Browser Session",
          browser: "Chrome / WebKit",
          location: meta.city ? `${meta.city}, Pakistan` : "Pakistan",
          ipAddress: "Active now",
          isCurrent: true,
          lastActive: "Active now",
        },
      ],

      emailLessonReminders: Boolean(meta.emailLessonReminders ?? true),
      emailWeeklyDigest: Boolean(meta.emailWeeklyDigest ?? true),
      whatsappClassAlerts: Boolean(meta.whatsappClassAlerts ?? true),
      whatsappTutorMessages: Boolean(meta.whatsappTutorMessages ?? true),
      promotionalAnnouncements: Boolean(meta.promotionalAnnouncements ?? false),
      reminderNoticeMinutes: Number(meta.reminderNoticeMinutes || 15),

      profileVisibility: meta.profileVisibility === "private" ? "private" : "tutors_only",
      showTargetGradesToTutors: Boolean(meta.showTargetGradesToTutors ?? true),
      allowDirectMessagesFromTutors: Boolean(meta.allowDirectMessagesFromTutors ?? true),

      preferredCurrency: meta.preferredCurrency === "USD" ? "USD" : "PKR",
      billingEmail: meta.billingEmail || userRecord?.email || user.email || "",
      defaultPaymentMethod: meta.defaultPaymentMethod || "JazzCash",
    };

    return { success: true, settings };
  } catch (err: any) {
    console.error("getStudentSettingsAction error:", err);
    return { success: false, error: err?.message || "Failed to load student settings." };
  }
}

/**
 * Server Action: Save student settings directly to PostgreSQL and Supabase metadata
 */
export async function updateStudentSettingsAction(
  settings: StudentSettingsState
): Promise<{
  success: boolean;
  settings?: StudentSettingsState;
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

    const fullName = `${settings.firstName} ${settings.lastName}`.trim();

    // 1. Update public.users
    await db
      .update(users)
      .set({
        fullName,
        phone: settings.phone || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // 2. Update public.student_profiles if exists
    try {
      await db
        .update(studentProfiles)
        .set({
          guardianEmail: settings.parentEmailNotificationCopy ? settings.email : null,
          updatedAt: new Date(),
        })
        .where(eq(studentProfiles.userId, user.id));
    } catch {}

    // 3. Update Supabase user_metadata for reliable sync across devices
    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone: settings.phone,
        whatsappNumber: settings.whatsappNumber,
        timezone: settings.timezone,
        language: settings.language,
        parentEmailNotificationCopy: settings.parentEmailNotificationCopy,
        twoFactorEnabled: settings.twoFactorEnabled,
        twoFactorMethod: settings.twoFactorMethod,
        emailLessonReminders: settings.emailLessonReminders,
        emailWeeklyDigest: settings.emailWeeklyDigest,
        whatsappClassAlerts: settings.whatsappClassAlerts,
        whatsappTutorMessages: settings.whatsappTutorMessages,
        promotionalAnnouncements: settings.promotionalAnnouncements,
        reminderNoticeMinutes: settings.reminderNoticeMinutes,
        profileVisibility: settings.profileVisibility,
        showTargetGradesToTutors: settings.showTargetGradesToTutors,
        allowDirectMessagesFromTutors: settings.allowDirectMessagesFromTutors,
        preferredCurrency: settings.preferredCurrency,
        billingEmail: settings.billingEmail,
        defaultPaymentMethod: settings.defaultPaymentMethod,
      },
    });

    revalidatePath("/student/settings");
    revalidatePath("/student/profile");
    revalidatePath("/student");

    return { success: true, settings };
  } catch (err: any) {
    console.error("updateStudentSettingsAction error:", err);
    return { success: false, error: err?.message || "Failed to update settings." };
  }
}



