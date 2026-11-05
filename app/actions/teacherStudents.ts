"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  bookings,
  classSessions,
  users,
  studentProfiles,
  teacherStudentNotes,
} from "@/db/schema";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { ensureBookingsTablesExist } from "@/app/actions/classes";
import { StudentProfile, StudentLearningNote } from "@/components/teacher/students/types";
import { ClassSession } from "@/components/teacher/classes/types";

// Helper to format date strings YYYY-MM-DD
function formatDateStr(date: Date): string {
  try {
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Ensures required database tables exist in PostgreSQL
 */
export async function ensureTeacherStudentTablesExist() {
  try {
    await ensureBookingsTablesExist();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teacher_student_notes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        content text NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS teacher_student_notes_idx ON teacher_student_notes(teacher_id, student_id);
    `);
  } catch (err) {
    console.warn("Table verification notice in teacherStudents.ts:", err);
  }
}

/**
 * Resolves the authenticated teacher's user ID, falling back to default teacher if unauthenticated
 */
export async function getEffectiveTeacherId(): Promise<string> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id) {
      return user.id;
    }
  } catch {}
  return "00000000-0000-0000-0000-000000000002";
}

/**
 * Server Action: Load the authenticated teacher's student roster directly from database bookings.
 * Zero dummy data. Computes attended classes, upcoming sessions, and enrolled subjects.
 */
export async function getTeacherStudentsDirectoryAction(): Promise<{
  success: boolean;
  data: StudentProfile[];
  teacherId?: string;
  error?: string;
}> {
  try {
    await ensureTeacherStudentTablesExist();
    const teacherId = await getEffectiveTeacherId();

    // 1. Query database bookings for this teacher with student details and profiles
    const dbRows = await db
      .select({
        booking: bookings,
        session: classSessions,
        studentUser: users,
        studentProfile: studentProfiles,
      })
      .from(bookings)
      .leftJoin(classSessions, eq(classSessions.bookingId, bookings.id))
      .leftJoin(users, eq(users.id, bookings.studentId))
      .leftJoin(studentProfiles, eq(studentProfiles.userId, bookings.studentId))
      .where(eq(bookings.teacherId, teacherId))
      .orderBy(desc(bookings.startTime));

    const studentsMap = new Map<string, StudentProfile>();

    // 2. Aggregate student profiles from real database bookings
    for (const row of dbRows) {
      const b = row.booking;
      const st = row.studentUser;
      const sp = row.studentProfile;
      const studentId = b.studentId;

      if (!studentsMap.has(studentId)) {
        const fullName = st?.fullName || "Student Learner";
        const initials =
          fullName
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "ST";

        const academicLevel =
          sp?.academicLevel ||
          (sp?.examinationBoard ? `${sp.examinationBoard} Student` : "Enrolled Student");

        studentsMap.set(studentId, {
          id: studentId,
          name: fullName,
          email: st?.email || "student@zuhdemy.com",
          avatarUrl: st?.avatarUrl || undefined,
          initials,
          gradeLevel: academicLevel,
          status: "inactive",
          subjects: [],
          totalClassesCount: 0,
          completedClassesCount: 0,
          upcomingClassesCount: 0,
          enrolledSince: formatDateStr(new Date(b.createdAt)),
          targetGoals: sp?.primaryGoals?.length ? sp.primaryGoals.join(", ") : undefined,
          learningPreferences: sp?.sessionFormat || undefined,
        });
      }

      const profile = studentsMap.get(studentId)!;

      // Collect unique subjects
      if (b.subject && !profile.subjects.includes(b.subject)) {
        profile.subjects.push(b.subject);
      }

      profile.totalClassesCount += 1;
      const sessionDate = formatDateStr(new Date(b.startTime));

      // Attended / Completed Classes
      if (b.status === "completed") {
        profile.completedClassesCount += 1;
        if (!profile.lastClassDate || sessionDate > profile.lastClassDate) {
          profile.lastClassDate = sessionDate;
        }
      } else if (b.status === "confirmed" || b.status === "pending") {
        profile.upcomingClassesCount += 1;
        if (!profile.nextClassDate || sessionDate < profile.nextClassDate) {
          profile.nextClassDate = sessionDate;
        }
      }

      if (sessionDate && sessionDate < profile.enrolledSince) {
        profile.enrolledSince = sessionDate;
      }
    }

    // 3. Compute active status: active if upcoming/pending classes exist
    const directory = Array.from(studentsMap.values()).map((s) => ({
      ...s,
      status: s.upcomingClassesCount > 0 ? ("active" as const) : ("inactive" as const),
    }));

    // Sort: Students with attended classes first, then by total classes
    directory.sort((a, b) => {
      if (b.completedClassesCount !== a.completedClassesCount) {
        return b.completedClassesCount - a.completedClassesCount;
      }
      return b.totalClassesCount - a.totalClassesCount;
    });

    return { success: true, data: directory, teacherId };
  } catch (err: any) {
    console.error("Error in getTeacherStudentsDirectoryAction:", err);
    return { success: false, data: [], error: err?.message || "Failed to load students directory" };
  }
}

export const getTeacherStudentsAction = getTeacherStudentsDirectoryAction;

/**
 * Server Action: Fetch single student profile by ID with aggregate booking statistics
 */
export async function getTeacherStudentDetailAction(
  studentId: string
): Promise<{ success: boolean; data: StudentProfile | null; error?: string }> {
  try {
    await ensureTeacherStudentTablesExist();
    const teacherId = await getEffectiveTeacherId();

    // 1. Fetch student user and profile
    const [stUser] = await db.select().from(users).where(eq(users.id, studentId)).limit(1);

    const [stProfile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, studentId))
      .limit(1);

    // 2. Fetch all bookings between this teacher and this student
    const studentBookings = await db
      .select({
        booking: bookings,
        session: classSessions,
      })
      .from(bookings)
      .leftJoin(classSessions, eq(classSessions.bookingId, bookings.id))
      .where(and(eq(bookings.teacherId, teacherId), eq(bookings.studentId, studentId)))
      .orderBy(desc(bookings.startTime));

    if (!stUser && studentBookings.length === 0) {
      return { success: true, data: null };
    }

    const fullName = stUser?.fullName || "Student Learner";
    const initials =
      fullName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "ST";

    const subjects: string[] = [];
    let completedCount = 0;
    let upcomingCount = 0;
    let lastDate: string | undefined;
    let nextDate: string | undefined;
    let earliestDate = formatDateStr(new Date());

    for (const row of studentBookings) {
      const b = row.booking;
      if (b.subject && !subjects.includes(b.subject)) {
        subjects.push(b.subject);
      }
      const sDate = formatDateStr(new Date(b.startTime));
      if (b.status === "completed") {
        completedCount++;
        if (!lastDate || sDate > lastDate) lastDate = sDate;
      } else if (b.status === "confirmed" || b.status === "pending") {
        upcomingCount++;
        if (!nextDate || sDate < nextDate) nextDate = sDate;
      }
      if (sDate && sDate < earliestDate) {
        earliestDate = sDate;
      }
    }

    const profile: StudentProfile = {
      id: studentId,
      name: fullName,
      email: stUser?.email || "student@zuhdemy.com",
      avatarUrl: stUser?.avatarUrl || undefined,
      initials,
      gradeLevel:
        stProfile?.academicLevel ||
        (stProfile?.examinationBoard ? `${stProfile.examinationBoard} Student` : "Enrolled Student"),
      status: upcomingCount > 0 ? "active" : "inactive",
      subjects,
      totalClassesCount: studentBookings.length,
      completedClassesCount: completedCount,
      upcomingClassesCount: upcomingCount,
      lastClassDate: lastDate,
      nextClassDate: nextDate,
      enrolledSince: earliestDate,
      targetGoals: stProfile?.primaryGoals?.length ? stProfile.primaryGoals.join(", ") : undefined,
      learningPreferences: stProfile?.sessionFormat || undefined,
    };

    return { success: true, data: profile };
  } catch (err: any) {
    console.error("Error in getTeacherStudentDetailAction:", err);
    return { success: false, data: null, error: err?.message || "Failed to load student" };
  }
}

/**
 * Server Action: Fetch all real class sessions for a specific student with this teacher
 */
export async function getTeacherStudentClassesAction(
  studentId: string
): Promise<{ success: boolean; data: ClassSession[]; error?: string }> {
  try {
    await ensureTeacherStudentTablesExist();
    const teacherId = await getEffectiveTeacherId();

    const rows = await db
      .select({
        booking: bookings,
        session: classSessions,
        studentUser: users,
        studentProfile: studentProfiles,
      })
      .from(bookings)
      .leftJoin(classSessions, eq(classSessions.bookingId, bookings.id))
      .leftJoin(users, eq(users.id, bookings.studentId))
      .leftJoin(studentProfiles, eq(studentProfiles.userId, bookings.studentId))
      .where(and(eq(bookings.teacherId, teacherId), eq(bookings.studentId, studentId)))
      .orderBy(desc(bookings.startTime));

    const classes: ClassSession[] = rows.map((r) => {
      const b = r.booking;
      const s = r.session;
      const u = r.studentUser;
      const fullName = u?.fullName || "Student Learner";
      const initials =
        fullName
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase() || "ST";

      return {
        id: b.id,
        bookingReference: b.bookingReference,
        student: {
          id: b.studentId,
          name: fullName,
          email: u?.email || "",
          avatarUrl: u?.avatarUrl || undefined,
          initials,
          gradeLevel: r.studentProfile?.academicLevel || "Enrolled Student",
        },
        subject: b.subject,
        topicTitle: b.topicTitle,
        topicDescription: b.topicDescription || undefined,
        date: formatDateStr(new Date(b.startTime)),
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        durationMinutes: b.durationMinutes,
        price: b.pricePkr,
        status: b.status as any,
        meetingUrl: s?.meetingUrl || undefined,
        meetingProvider: (s?.meetingProvider || "Google Meet") as any,
        teacherNotes: s?.teacherNotes || undefined,
        cancellationReason: b.cancellationReason || undefined,
      };
    });

    return { success: true, data: classes };
  } catch (err: any) {
    console.error("Error in getTeacherStudentClassesAction:", err);
    return { success: false, data: [], error: err?.message || "Failed to load classes" };
  }
}

/**
 * Server Action: Fetch real persistent private learning notes for a student
 */
export async function getTeacherStudentNotesAction(
  studentId: string
): Promise<{ success: boolean; data: StudentLearningNote[]; error?: string }> {
  try {
    await ensureTeacherStudentTablesExist();
    const teacherId = await getEffectiveTeacherId();

    const notes = await db
      .select()
      .from(teacherStudentNotes)
      .where(
        and(
          eq(teacherStudentNotes.teacherId, teacherId),
          eq(teacherStudentNotes.studentId, studentId)
        )
      )
      .orderBy(desc(teacherStudentNotes.createdAt));

    const formatted: StudentLearningNote[] = notes.map((n) => ({
      id: n.id,
      studentId: n.studentId,
      teacherId: n.teacherId,
      content: n.content,
      createdAt: new Date(n.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : undefined,
    }));

    return { success: true, data: formatted };
  } catch (err: any) {
    console.error("Error in getTeacherStudentNotesAction:", err);
    return { success: false, data: [], error: err?.message || "Failed to load notes" };
  }
}

/**
 * Server Action: Add a new persistent private learning note for a student
 */
export async function addTeacherStudentNoteAction(
  studentId: string,
  content: string
): Promise<{ success: boolean; data: StudentLearningNote | null; error?: string }> {
  try {
    await ensureTeacherStudentTablesExist();
    const teacherId = await getEffectiveTeacherId();

    const [inserted] = await db
      .insert(teacherStudentNotes)
      .values({
        teacherId,
        studentId,
        content: content.trim(),
      })
      .returning();

    const formatted: StudentLearningNote = {
      id: inserted.id,
      studentId: inserted.studentId,
      teacherId: inserted.teacherId,
      content: inserted.content,
      createdAt: new Date(inserted.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    return { success: true, data: formatted };
  } catch (err: any) {
    console.error("Error in addTeacherStudentNoteAction:", err);
    return { success: false, data: null, error: err?.message || "Failed to save note" };
  }
}

/**
 * Server Action: Delete a persistent private learning note
 */
export async function deleteTeacherStudentNoteAction(
  noteId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureTeacherStudentTablesExist();
    const teacherId = await getEffectiveTeacherId();

    await db
      .delete(teacherStudentNotes)
      .where(
        and(
          eq(teacherStudentNotes.id, noteId),
          eq(teacherStudentNotes.teacherId, teacherId)
        )
      );

    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteTeacherStudentNoteAction:", err);
    return { success: false, error: err?.message || "Failed to delete note" };
  }
}
