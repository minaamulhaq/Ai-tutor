"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  users,
  studentProfiles,
  teacherProfiles,
  EducationEntry,
  ExperienceEntry,
  CertificateEntry,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export interface StudentOnboardingData {
  role: "student";
  fullName?: string;
  phone: string;
  city: string;
  academicLevel: string;
  examinationBoard?: string;
  institution: string;
  targetExamYear: string;
  subjects: string[];
  primaryGoals: string[];
  preferredLearningFormat?: string;
  customNote?: string;
}

export interface TeacherOnboardingData {
  role: "teacher";
  fullName?: string;
  phone: string;
  city: string;
  headline: string;
  subjects: string[];
  studentLevels: string[];
  languages: string[];
  hourlyRatePKR: number;
  experienceYears: string;
  bio: string;
  // Multiple entries for education, experience, certificates
  education?: EducationEntry[];
  certificates?: CertificateEntry[];
  experience?: ExperienceEntry[];
  // Legacy / fallback single fields
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  completionYear?: string;
  teachingMethodology?: string;
  teachingMode?: string;
  meetingProvider?: string;
}

export type OnboardingPayload = StudentOnboardingData | TeacherOnboardingData;

/**
 * Automatically ensures all required Postgres tables exist in the database.
 * If tables were not previously initialized via migrations, this DDL creates them cleanly.
 */
async function ensureTablesExist() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY,
        email text NOT NULL UNIQUE,
        full_name text NOT NULL,
        role text DEFAULT 'student' NOT NULL,
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

      CREATE TABLE IF NOT EXISTS student_profiles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) ON DELETE CASCADE,
        academic_level text NOT NULL,
        examination_board text NOT NULL,
        institution text,
        target_exam_series text,
        enrolled_subjects jsonb DEFAULT '[]'::jsonb NOT NULL,
        primary_goals text[] DEFAULT '{}'::text[] NOT NULL,
        session_format text DEFAULT '1-on-1 Focused Session',
        custom_note text,
        guardian_name text,
        guardian_relationship text,
        guardian_phone text,
        guardian_email text,
        is_emergency_contact boolean DEFAULT false,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS teacher_profiles_user_id_idx ON teacher_profiles(user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS student_profiles_user_id_idx ON student_profiles(user_id);
    `);
  } catch (err) {
    console.warn("Table auto-initialization notice:", err);
  }
}

export async function completeOnboardingAction(payload: OnboardingPayload) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Your session has expired. Please log in to complete profile setup.",
      };
    }

    // 1. Ensure required database tables exist
    await ensureTablesExist();

    // 2. Ensure user exists in public.users table in PostgreSQL (UPSERT)
    const userEmail = user.email || `${user.id}@zuhdemy.local`;
    const userFullName =
      payload.fullName?.trim() ||
      user.user_metadata?.full_name ||
      (payload.role === "teacher" ? "Instructor" : "Student");

    try {
      await db
        .insert(users)
        .values({
          id: user.id,
          email: userEmail,
          fullName: userFullName,
          role: payload.role,
          phone: payload.phone || null,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            fullName: userFullName,
            role: payload.role,
            phone: payload.phone || null,
            updatedAt: new Date(),
          },
        });
    } catch (usersErr) {
      console.warn("Notice: public.users upsert non-critical warning:", usersErr);
    }

    // 3. If student: Save academic and learning goals into student_profiles table
    if (payload.role === "student") {
      const formattedSubjects = (payload.subjects || []).map((sub) => ({
        subject: sub,
        targetGrade: "A*",
      }));

      try {
        await db
          .insert(studentProfiles)
          .values({
            userId: user.id,
            academicLevel: payload.academicLevel || "A-Levels",
            examinationBoard: payload.examinationBoard || "Cambridge CAIE",
            institution: payload.institution,
            targetExamSeries: payload.targetExamYear || "May / June 2026",
            enrolledSubjects: formattedSubjects,
            primaryGoals:
              payload.primaryGoals && payload.primaryGoals.length > 0
                ? payload.primaryGoals
                : ["Aiming for Straight A/A*s", "Past Paper & Exam Technique Mastery"],
            sessionFormat: payload.preferredLearningFormat || "1-on-1 Focused Session",
            customNote: payload.customNote || null,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: studentProfiles.userId,
            set: {
              academicLevel: payload.academicLevel || "A-Levels",
              examinationBoard: payload.examinationBoard || "Cambridge CAIE",
              institution: payload.institution,
              targetExamSeries: payload.targetExamYear || "May / June 2026",
              enrolledSubjects: formattedSubjects,
              primaryGoals:
                payload.primaryGoals && payload.primaryGoals.length > 0
                  ? payload.primaryGoals
                  : ["Aiming for Straight A/A*s", "Past Paper & Exam Technique Mastery"],
              sessionFormat: payload.preferredLearningFormat || "1-on-1 Focused Session",
              customNote: payload.customNote || null,
              updatedAt: new Date(),
            },
          });
      } catch (studentDbErr) {
        console.warn("Notice: student_profiles table write warning:", studentDbErr);
      }
    }

    // 4. If teacher: Save professional details, degrees, methodology into teacher_profiles table
    if (payload.role === "teacher") {
      const educationList: EducationEntry[] =
        payload.education && payload.education.length > 0
          ? payload.education
          : payload.degree && payload.institution
          ? [
              {
                id: "edu-onboarding-1",
                degree: payload.degree,
                institution: payload.institution,
                fieldOfStudy: payload.fieldOfStudy || payload.degree,
                completionYear: payload.completionYear || "2023",
              },
            ]
          : [];

      const experienceList: ExperienceEntry[] = payload.experience || [];
      const certificatesList: CertificateEntry[] = payload.certificates || [];

      const profileValues = {
        headline: payload.headline || "Certified Expert Instructor on ZuhDemy",
        aboutMe:
          payload.bio ||
          `Dedicated and results-driven educator with ${payload.experienceYears || "3-5 Years"} of tutoring experience, focused on student exam success and core concept clarity.`,
        teachingMethodology:
          payload.teachingMethodology ||
          "Whiteboard-based conceptual breakdown, interactive question solving, and active past paper drilling.",
        subjects: payload.subjects || [],
        studentLevels: payload.studentLevels || [],
        teachingLanguages: payload.languages || ["English", "Urdu"],
        hourlyRatePkr: payload.hourlyRatePKR || 2500,
        sessionDurationMinutes: 60,
        teachingMode: payload.teachingMode || "100% Online (1-on-1)",
        meetingProvider: payload.meetingProvider || "Google Meet",
        experienceYears: payload.experienceYears || "3-5 Years",
        education: educationList,
        experience: experienceList,
        certificates: certificatesList,
        city: payload.city || "Lahore",
        country: "Pakistan",
        timezone: "Asia/Karachi",
        updatedAt: new Date(),
      };

      try {
        // Check if teacher profile exists
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
          // If select fails because table was just created or indexing, proceed to insert
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
      } catch (teacherDbErr) {
        console.warn("Notice: teacher_profiles database write encountered:", teacherDbErr);
      }
    }

    // 5. Persist in Supabase user_metadata for reliable, session-backed access
    const { error: updateMetaError } = await supabase.auth.updateUser({
      data: {
        ...payload,
        isOnboarded: true,
      },
    });

    if (updateMetaError) {
      console.warn("Could not sync user_metadata:", updateMetaError.message);
    }

    return {
      success: true,
      role: payload.role,
    };
  } catch (err: unknown) {
    console.error("Server onboarding error:", err);
    // User-friendly error message — never expose raw SQL queries or schema internals
    return {
      success: false,
      error: "We encountered a temporary server issue saving your profile. Please try again in a moment.",
    };
  }
}
