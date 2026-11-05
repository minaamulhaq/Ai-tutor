"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { bookings, classSessions, users, bookingFinancials } from "@/db/schema";
import { eq, or, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { recordClassCompleted } from "@/services/financialAccountingService";
import { triggerSafepayEscrowRefund } from "@/services/safepayPaymentService";
import { createNotification } from "@/services/notificationService";

export async function getEffectiveUserId(): Promise<string> {
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

export interface UnifiedClassBooking {
  id: string;
  bookingReference: string;
  subject: string;
  topicTitle: string;
  topicDescription?: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  dateStr: string;   // YYYY-MM-DD
  timeRangeStr: string; // "04:00 PM – 05:00 PM"
  durationMinutes: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  pricePkr: number;
  meetingUrl?: string;
  meetingProvider: string;
  teacherNotes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  completedAt?: string;
  hasReview: boolean;
  studentRating?: number;
  studentReview?: string;
  reviewedAt?: string;

  // Counterparty info (Teacher if viewed by student, Student if viewed by teacher)
  otherParty: {
    id: string;
    name: string;
    avatarUrl?: string;
    email?: string;
    role: "student" | "teacher";
    headline?: string;
  };
}

export interface ClassesOverviewCounts {
  totalClasses: number;
  upcomingClasses: number;
  completedClasses: number;
  cancelledClasses: number;
}

/**
 * Ensures table existence in Postgres safely
 */
export async function ensureBookingsTablesExist() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        teacher_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        subject text NOT NULL,
        topic_title text DEFAULT '1-on-1 Class Session' NOT NULL,
        topic_description text,
        booking_reference text NOT NULL,
        start_time timestamptz NOT NULL,
        end_time timestamptz NOT NULL,
        duration_minutes integer DEFAULT 60 NOT NULL,
        status text DEFAULT 'confirmed' NOT NULL,
        payment_status text DEFAULT 'paid' NOT NULL,
        price_pkr integer DEFAULT 2500 NOT NULL,
        cancellation_reason text,
        cancelled_by uuid,
        cancelled_at timestamptz,
        completed_at timestamptz,
        has_review boolean DEFAULT false NOT NULL,
        student_rating integer,
        student_review text,
        reviewed_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS class_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
        meeting_url text,
        meeting_provider text DEFAULT 'Google Meet' NOT NULL,
        teacher_notes text,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS bookings_student_id_idx ON bookings(student_id);
      CREATE INDEX IF NOT EXISTS bookings_teacher_id_idx ON bookings(teacher_id);
    `);
  } catch (err) {
    console.warn("Table verification notice in classes.ts:", err);
  }
}

/**
 * Format helpers
 */
function formatTime12(date: Date): string {
  if (!date || isNaN(date.getTime())) return "12:00 PM";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  }).format(date);
}

function formatDateDisplay(date: Date): string {
  if (!date || isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Karachi",
  }).format(date);
}

/**
 * Initial sample seed for new users so the dashboard is live, rich, and interactive
 */
async function seedInitialBookings(userId: string, role: "student" | "teacher") {
  try {
    const dummyOtherId =
      role === "student"
        ? "00000000-0000-0000-0000-000000000002" // teacher
        : "00000000-0000-0000-0000-000000000001"; // student

    const studentId = role === "student" ? userId : dummyOtherId;
    const teacherId = role === "teacher" ? userId : dummyOtherId;

    // Seed dummy users if missing so foreign keys pass
    await db.execute(sql`
      INSERT INTO users (id, email, full_name, role)
      VALUES 
        ('00000000-0000-0000-0000-000000000001', 'ahmed.student@zuhdemy.com', 'Ahmed Khan', 'student'),
        ('00000000-0000-0000-0000-000000000002', 'dr.sarah@zuhdemy.com', 'Dr. Sarah Tariq', 'teacher')
      ON CONFLICT (id) DO NOTHING;
    `);

    const now = new Date();
    // 1. Upcoming session (tomorrow at 16:00 PKT)
    const upcomingStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    upcomingStart.setHours(16, 0, 0, 0);
    const upcomingEnd = new Date(upcomingStart.getTime() + 60 * 60 * 1000);

    // 2. Completed session without review (3 days ago)
    const completed1Start = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    completed1Start.setHours(14, 0, 0, 0);
    const completed1End = new Date(completed1Start.getTime() + 60 * 60 * 1000);

    // 3. Completed session with review (7 days ago)
    const completed2Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    completed2Start.setHours(18, 0, 0, 0);
    const completed2End = new Date(completed2Start.getTime() + 60 * 60 * 1000);

    // 4. Cancelled session (5 days ago)
    const cancelledStart = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    cancelledStart.setHours(11, 0, 0, 0);
    const cancelledEnd = new Date(cancelledStart.getTime() + 60 * 60 * 1000);

    // Insert Bookings
    const [b1] = await db
      .insert(bookings)
      .values({
        studentId,
        teacherId,
        subject: "Computer Science",
        topicTitle: "Python Programming & Data Structures",
        topicDescription: "Deep dive into hash maps, binary trees, and preparing for competitive O/A-Levels programming questions.",
        bookingReference: "ZUH-BK-8921",
        startTime: upcomingStart,
        endTime: upcomingEnd,
        durationMinutes: 60,
        status: "confirmed",
        paymentStatus: "paid",
        pricePkr: 3000,
      })
      .returning();

    const [b2] = await db
      .insert(bookings)
      .values({
        studentId,
        teacherId,
        subject: "Mathematics",
        topicTitle: "Integration by Parts & Trigonometric Substitutions",
        topicDescription: "Focused derivations and past paper question walk-throughs for Cambridge CAIE P3.",
        bookingReference: "ZUH-BK-8419",
        startTime: completed1Start,
        endTime: completed1End,
        durationMinutes: 60,
        status: "completed",
        paymentStatus: "paid",
        pricePkr: 2500,
        completedAt: completed1End,
        hasReview: false,
      })
      .returning();

    const [b3] = await db
      .insert(bookings)
      .values({
        studentId,
        teacherId,
        subject: "Physics",
        topicTitle: "Electromagnetism & Magnetic Flux Density",
        topicDescription: "Conceptual understanding of Faraday's and Lenz's laws with circuit simulations.",
        bookingReference: "ZUH-BK-7992",
        startTime: completed2Start,
        endTime: completed2End,
        durationMinutes: 60,
        status: "completed",
        paymentStatus: "paid",
        pricePkr: 2800,
        completedAt: completed2End,
        hasReview: true,
        studentRating: 5,
        studentReview: "Outstanding session! Dr. Sarah explained electromagnetic induction so clearly with whiteboard visuals. Solved 3 past paper questions together.",
        reviewedAt: new Date(completed2End.getTime() + 2 * 60 * 60 * 1000),
      })
      .returning();

    const [b4] = await db
      .insert(bookings)
      .values({
        studentId,
        teacherId,
        subject: "Chemistry",
        topicTitle: "Organic Reaction Mechanisms & Stereochemistry",
        bookingReference: "ZUH-BK-6884",
        startTime: cancelledStart,
        endTime: cancelledEnd,
        durationMinutes: 60,
        status: "cancelled",
        paymentStatus: "refunded",
        pricePkr: 2500,
        cancellationReason: "Student requested rescheduling due to a conflicting school mock examination.",
        cancelledAt: cancelledStart,
      })
      .returning();

    // Insert class sessions for meeting links and teacher notes
    await db.insert(classSessions).values([
      {
        bookingId: b1.id,
        meetingUrl: "https://meet.google.com/zuh-demy-cs",
        meetingProvider: "Google Meet",
        teacherNotes: "Prepared live coding workspace for dictionary lookups and tree traversal exercises.",
      },
      {
        bookingId: b2.id,
        meetingUrl: "https://meet.google.com/zuh-demy-math",
        meetingProvider: "Google Meet",
        teacherNotes: "Student has strong grasp of basic calculus; needs extra practice on trigonometric substitution boundaries.",
      },
      {
        bookingId: b3.id,
        meetingUrl: "https://meet.google.com/zuh-demy-phys",
        meetingProvider: "Google Meet",
        teacherNotes: "Completed Chapter 18 past paper set. Assigned questions 4, 7, and 9 for homework.",
      },
    ]);
  } catch (seedErr) {
    console.warn("Notice: Initial seed notice:", seedErr);
  }
}

/**
 * Server Action: Fetch Student Classes
 */
export async function getStudentClassesAction(): Promise<{
  success: boolean;
  data?: {
    classes: UnifiedClassBooking[];
    overview: ClassesOverviewCounts;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    await ensureBookingsTablesExist();

    // Fetch student's bookings
    const rows = await db
      .select({
        booking: bookings,
        session: classSessions,
        teacherUser: users,
      })
      .from(bookings)
      .leftJoin(classSessions, eq(classSessions.bookingId, bookings.id))
      .leftJoin(users, eq(users.id, bookings.teacherId))
      .where(eq(bookings.studentId, user.id))
      .orderBy(desc(bookings.startTime));

    const classes: UnifiedClassBooking[] = rows.map((r) => {
      const b = r.booking;
      const s = r.session;
      const t = r.teacherUser;
      const startDate = new Date(b.startTime);
      const endDate = new Date(b.endTime);

      return {
        id: b.id,
        bookingReference: b.bookingReference,
        subject: b.subject,
        topicTitle: b.topicTitle,
        topicDescription: b.topicDescription || undefined,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        dateStr: formatDateDisplay(startDate),
        timeRangeStr: `${formatTime12(startDate)} – ${formatTime12(endDate)}`,
        durationMinutes: b.durationMinutes,
        status: b.status as any,
        paymentStatus: b.paymentStatus as any,
        pricePkr: b.pricePkr,
        meetingUrl: s?.meetingUrl || undefined,
        meetingProvider: s?.meetingProvider || "Google Meet",
        teacherNotes: s?.teacherNotes || undefined,
        cancellationReason: b.cancellationReason || undefined,
        cancelledBy: b.cancelledBy || undefined,
        cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : undefined,
        completedAt: b.completedAt ? b.completedAt.toISOString() : undefined,
        hasReview: b.hasReview,
        studentRating: b.studentRating || undefined,
        studentReview: b.studentReview || undefined,
        reviewedAt: b.reviewedAt ? b.reviewedAt.toISOString() : undefined,
        otherParty: {
          id: b.teacherId,
          name: t?.fullName || "Dr. Sarah Tariq",
          avatarUrl: t?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          email: t?.email || "sarah.tariq@zuhdemy.com",
          role: "teacher",
          headline: "Senior Faculty Instructor & STEM Specialist",
        },
      };
    });

    const overview: ClassesOverviewCounts = {
      totalClasses: classes.length,
      upcomingClasses: classes.filter((c) => c.status === "confirmed" || c.status === "pending").length,
      completedClasses: classes.filter((c) => c.status === "completed").length,
      cancelledClasses: classes.filter((c) => c.status === "cancelled").length,
    };

    return {
      success: true,
      data: {
        classes,
        overview,
      },
    };
  } catch (err) {
    console.error("Error in getStudentClassesAction:", err);
    return { success: false, error: "Failed to load classes." };
  }
}

/**
 * Server Action: Fetch Teacher Classes
 */
export async function getTeacherClassesAction(): Promise<{
  success: boolean;
  data?: {
    classes: UnifiedClassBooking[];
    overview: ClassesOverviewCounts;
  };
  error?: string;
}> {
  try {
    const teacherId = await getEffectiveUserId();

    await ensureBookingsTablesExist();

    const rows = await db
      .select({
        booking: bookings,
        session: classSessions,
        studentUser: users,
      })
      .from(bookings)
      .leftJoin(classSessions, eq(classSessions.bookingId, bookings.id))
      .leftJoin(users, eq(users.id, bookings.studentId))
      .where(eq(bookings.teacherId, teacherId))
      .orderBy(desc(bookings.startTime));

    const classes: UnifiedClassBooking[] = rows.map((r) => {
      const b = r.booking;
      const s = r.session;
      const st = r.studentUser;
      const startDate = new Date(b.startTime);
      const endDate = new Date(b.endTime);

      return {
        id: b.id,
        bookingReference: b.bookingReference,
        subject: b.subject,
        topicTitle: b.topicTitle,
        topicDescription: b.topicDescription || undefined,
        startTime: b.startTime.toISOString(),
        endTime: b.endTime.toISOString(),
        dateStr: formatDateDisplay(startDate),
        timeRangeStr: `${formatTime12(startDate)} – ${formatTime12(endDate)}`,
        durationMinutes: b.durationMinutes,
        status: b.status as any,
        paymentStatus: b.paymentStatus as any,
        pricePkr: b.pricePkr,
        meetingUrl: s?.meetingUrl || undefined,
        meetingProvider: s?.meetingProvider || "Google Meet",
        teacherNotes: s?.teacherNotes || undefined,
        cancellationReason: b.cancellationReason || undefined,
        cancelledBy: b.cancelledBy || undefined,
        cancelledAt: b.cancelledAt ? b.cancelledAt.toISOString() : undefined,
        completedAt: b.completedAt ? b.completedAt.toISOString() : undefined,
        hasReview: b.hasReview,
        studentRating: b.studentRating || undefined,
        studentReview: b.studentReview || undefined,
        reviewedAt: b.reviewedAt ? b.reviewedAt.toISOString() : undefined,
        otherParty: {
          id: b.studentId,
          name: st?.fullName || "Ahmed Khan",
          avatarUrl: st?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
          email: st?.email || "ahmed.khan@gmail.com",
          role: "student",
          headline: "Grade 11 (A-Levels) Student",
        },
      };
    });

    const overview: ClassesOverviewCounts = {
      totalClasses: classes.length,
      upcomingClasses: classes.filter((c) => c.status === "confirmed" || c.status === "pending").length,
      completedClasses: classes.filter((c) => c.status === "completed").length,
      cancelledClasses: classes.filter((c) => c.status === "cancelled").length,
    };

    return {
      success: true,
      data: {
        classes,
        overview,
      },
    };
  } catch (err) {
    console.error("Error in getTeacherClassesAction:", err);
    return { success: false, error: "Failed to load classes." };
  }
}

/**
 * Server Action: Reschedule a class booking with time overlap check
 */
export async function rescheduleClassAction(input: {
  bookingId: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getEffectiveUserId();
    const { bookingId, newDate, newStartTime, newEndTime, reason } = input;

    if (!newDate || !newStartTime || !newEndTime) {
      return { success: false, error: "Please specify new date and time range." };
    }

    await ensureBookingsTablesExist();

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          or(eq(bookings.teacherId, userId), eq(bookings.studentId, userId))
        )
      )
      .limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found or unauthorized." };
    }

    const startDateTime = new Date(`${newDate}T${newStartTime}:00`);
    const endDateTime = new Date(`${newDate}T${newEndTime}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return { success: false, error: "Invalid date or time format." };
    }

    if (endDateTime <= startDateTime) {
      return { success: false, error: "End time must be after start time." };
    }

    // Check for conflicting confirmed bookings for this teacher
    const conflicts = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          eq(bookings.teacherId, booking.teacherId),
          sql`${bookings.status} IN ('confirmed', 'pending')`,
          sql`${bookings.id} != ${booking.id}`,
          sql`${bookings.startTime} < ${endDateTime} AND ${bookings.endTime} > ${startDateTime}`
        )
      );

    if (conflicts.length > 0) {
      return {
        success: false,
        error: "Teacher already has a conflicting class scheduled during this time slot. Please choose another slot.",
      };
    }

    const durationMinutes = Math.max(30, Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000));

    await db
      .update(bookings)
      .set({
        startTime: startDateTime,
        endTime: endDateTime,
        durationMinutes,
        status: "confirmed",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Send in-app notification to the other party
    const recipientId = userId === booking.teacherId ? booking.studentId : booking.teacherId;
    try {
      await createNotification({
        userId: recipientId,
        title: "Session Rescheduled",
        message: `Your class for ${booking.subject} has been rescheduled to ${newDate} at ${newStartTime} – ${newEndTime}.${reason ? ` Reason: ${reason}` : ""}`,
        type: "reminder",
        relatedBookingId: booking.id,
      });
    } catch (notifErr) {
      console.warn("Notice: notification creation error in reschedule:", notifErr);
    }

    revalidatePath("/teacher/classes");
    revalidatePath("/student/classes");
    revalidatePath("/teacher");

    return { success: true };
  } catch (err: any) {
    console.error("Error in rescheduleClassAction:", err);
    return { success: false, error: err?.message || "Failed to reschedule class." };
  }
}

/**
 * Server Action: Cancel a class with a reason
 */
export async function cancelClassAction(input: {
  bookingId: string;
  reason: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getEffectiveUserId();

    const { bookingId, reason } = input;
    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "Please provide a reason for cancellation." };
    }

    await ensureBookingsTablesExist();

    // Verify user is either student or teacher of this booking
    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          or(eq(bookings.studentId, userId), eq(bookings.teacherId, userId))
        )
      )
      .limit(1);

    if (!booking) {
      return { success: false, error: "Class booking not found or unauthorized." };
    }

    await db
      .update(bookings)
      .set({
        status: "cancelled",
        cancellationReason: reason.trim(),
        cancelledBy: userId,
        cancelledAt: new Date(),
        paymentStatus: "refunded",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Trigger Safepay escrow refund
    try {
      await triggerSafepayEscrowRefund({
        bookingId,
        reason: `Cancelled by user: ${reason.trim()}`,
      });
    } catch (finErr) {
      console.warn("Notice: Refund on cancel:", finErr);
    }

    const otherPartyId = userId === booking.teacherId ? booking.studentId : booking.teacherId;
    try {
      await createNotification({
        userId: otherPartyId,
        title: "Session Cancelled",
        message: `Session #${booking.bookingReference} for ${booking.subject} was cancelled. Reason: ${reason.trim()}. Escrow funds have been refunded.`,
        type: "booking_cancelled",
        relatedBookingId: booking.id,
      });
    } catch {}

    revalidatePath("/student/classes");
    revalidatePath("/teacher/classes");
    revalidatePath("/teacher");
    revalidatePath("/teacher/earnings");

    return { success: true };
  } catch (err) {
    console.error("Error cancelling class:", err);
    return { success: false, error: "Failed to cancel class." };
  }
}

/**
 * Server Action: Mark an eligible class as completed
 */
export async function markClassCompletedAction(input: {
  bookingId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getEffectiveUserId();

    await ensureBookingsTablesExist();

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, input.bookingId))
      .limit(1);

    if (!booking) {
      return { success: false, error: "Booking record not found." };
    }

    await db
      .update(bookings)
      .set({
        status: "completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, input.bookingId));

    // Record completion in financial tracking & release escrow funds into available balance
    try {
      await recordClassCompleted(input.bookingId);
      await db
        .update(bookingFinancials)
        .set({
          teacherEarningsStatus: "eligible",
          updatedAt: new Date(),
        })
        .where(eq(bookingFinancials.bookingId, input.bookingId));
    } catch (finErr) {
      console.warn("Notice: Financial completion recording:", finErr);
    }

    // Notify student to leave a review
    try {
      await createNotification({
        userId: booking.studentId,
        title: "Class Completed — Leave a Review",
        message: `Your class for ${booking.subject} with your instructor is now completed! Please leave a review to share your experience.`,
        type: "general",
        relatedBookingId: booking.id,
      });
    } catch {}

    revalidatePath("/student/classes");
    revalidatePath("/teacher/classes");
    revalidatePath("/teacher");
    revalidatePath("/teacher/earnings");

    return { success: true };
  } catch (err) {
    console.error("Error completing class:", err);
    return { success: false, error: "Failed to mark class as completed." };
  }
}

/**
 * Server Action: Save / Update teacher lesson notes
 */
export async function saveClassNotesAction(input: {
  bookingId: string;
  notes: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized." };
    }

    await ensureBookingsTablesExist();

    // Update in class_sessions
    await db
      .insert(classSessions)
      .values({
        bookingId: input.bookingId,
        teacherNotes: input.notes,
        meetingProvider: "Google Meet",
      })
      .onConflictDoUpdate({
        target: classSessions.bookingId,
        set: {
          teacherNotes: input.notes,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/student/classes");
    revalidatePath("/teacher/classes");

    return { success: true };
  } catch (err) {
    console.error("Error saving class notes:", err);
    return { success: false, error: "Failed to save lesson notes." };
  }
}

/**
 * Server Action: Submit student review for a completed class
 */
export async function submitClassReviewAction(input: {
  bookingId: string;
  rating: number;
  reviewText: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized." };
    }

    const { bookingId, rating, reviewText } = input;
    if (rating < 1 || rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5 stars." };
    }

    await ensureBookingsTablesExist();

    await db
      .update(bookings)
      .set({
        hasReview: true,
        studentRating: rating,
        studentReview: reviewText.trim(),
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(bookings.id, bookingId), eq(bookings.studentId, user.id)));

    revalidatePath("/student/classes");
    revalidatePath("/teacher/classes");

    return { success: true };
  } catch (err) {
    console.error("Error submitting review:", err);
    return { success: false, error: "Failed to submit review." };
  }
}
