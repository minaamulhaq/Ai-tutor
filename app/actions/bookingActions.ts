"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import { bookings, classSessions, users, teacherProfiles, teacherGoogleAccounts } from "@/db/schema";
import { eq, and, sql, desc, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureBookingSystemSchema } from "@/lib/db/init";
import {
  getTeacherAvailabilityForDate,
  assertNoBookingConflict,
  format24To12Hour,
} from "@/services/bookingAvailabilityService";
import {
  createGoogleCalendarAndMeetEvent,
  deleteGoogleCalendarEventForBooking,
  disconnectTeacherGoogleAccount,
} from "@/lib/google/calendar";
import { createNotification } from "@/services/notificationService";
import {
  recordVerifiedStudentPayment,
  recordRefundTransaction,
} from "@/services/financialAccountingService";
import {
  createSafepayCheckoutSession,
  triggerSafepayEscrowRefund,
} from "@/services/safepayPaymentService";

/**
 * Generates an alphanumeric booking reference: e.g. "ZUH-BK-8921"
 */
function generateReference(): string {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `ZUH-BK-${randNum}`;
}

/**
 * 1. Submit a Booking Request (Student)
 * Requires teacher approval before confirmation.
 */
export async function submitBookingRequestAction(data: {
  teacherId: string;
  subject: string;
  topicTitle?: string;
  topicDescription?: string;
  startIso: string;
  endIso: string;
}) {
  await ensureBookingSystemSchema();

  // 1. Authenticate student
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { success: false, error: "Please log in to book a tutoring session." };
  }

  const studentId = authData.user.id;

  if (studentId === data.teacherId) {
    return { success: false, error: "You cannot book a session with yourself." };
  }

  const startDate = new Date(data.startIso);
  const endDate = new Date(data.endIso);

  if (startDate.getTime() <= Date.now()) {
    return { success: false, error: "Cannot book a time slot in the past." };
  }

  // 2. Derive pricing from teacher profile in database (Never trust client pricing)
  const [teacherProfile] = await db
    .select({
      hourlyRatePkr: teacherProfiles.hourlyRatePkr,
      teachingLanguages: teacherProfiles.teachingLanguages,
    })
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, data.teacherId))
    .limit(1);

  const pricePkr = teacherProfile?.hourlyRatePkr || 2500;

  // 3. Concurrency double-booking protection check
  const conflictCheck = await assertNoBookingConflict(data.teacherId, startDate, endDate);
  if (conflictCheck.hasConflict) {
    return {
      success: false,
      error: conflictCheck.message || "This time slot is no longer available.",
    };
  }

  // 4. Create booking with status 'pending'
  const bookingRef = generateReference();
  const topicTitle = data.topicTitle?.trim() || `${data.subject} 1-on-1 Class`;
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (60 * 1000)) || 60;

  try {
    const [newBooking] = await db
      .insert(bookings)
      .values({
        studentId,
        teacherId: data.teacherId,
        subject: data.subject,
        topicTitle,
        topicDescription: data.topicDescription || "1-on-1 tutoring session on ZuhDemy.",
        bookingReference: bookingRef,
        startTime: startDate,
        endTime: endDate,
        durationMinutes,
        hourlyRate: pricePkr,
        totalAmount: pricePkr,
        pricePkr,
        status: "pending",
        paymentStatus: "paid", // held in platform escrow
      })
      .returning();

    // 5. Initialize class_sessions record
    await db.insert(classSessions).values({
      bookingId: newBooking.id,
      meetingProvider: "Google Meet",
      conferenceStatus: "pending",
      calendarStatus: "pending",
      teacherNotes: data.topicDescription || "",
    });

    // 5b. Record verified student payment in double-entry accounting ledger & allocate held funds
    try {
      await recordVerifiedStudentPayment({
        bookingId: newBooking.id,
        paymentId: `PAY-${bookingRef}`,
        grossAmountPkr: pricePkr,
        providerFeePkr: Math.round(pricePkr * 0.029), // Standard provider processing fee
        studentId,
        teacherId: data.teacherId,
        idempotencyKey: `PAY-INIT-${newBooking.id}`,
      });
    } catch (finErr) {
      console.warn("Notice: Financial allocation recording:", finErr);
    }

    // 6. Fetch student and teacher names for notifications
    const [student] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, studentId))
      .limit(1);

    const [teacher] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, data.teacherId))
      .limit(1);

    const studentName = student?.fullName || "Student";
    const teacherName = teacher?.fullName || "Instructor";

    const dateFormatted = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const timeFormatted = `${startDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Karachi",
    })} PKT`;

    // 7. Create in-app notifications
    // To Teacher: New booking request received
    await createNotification({
      userId: data.teacherId,
      title: "New Booking Request Received",
      message: `${studentName} requested a 1-on-1 ${data.subject} class on ${dateFormatted} at ${timeFormatted}. Please approve or reject the request.`,
      type: "booking_requested",
      relatedBookingId: newBooking.id,
    });

    // To Student: Booking request pending confirmation
    await createNotification({
      userId: studentId,
      title: "Booking Request Submitted",
      message: `Your request for ${data.subject} with ${teacherName} on ${dateFormatted} at ${timeFormatted} is pending teacher approval.`,
      type: "booking_requested",
      relatedBookingId: newBooking.id,
    });

    revalidatePath("/student/classes");
    revalidatePath("/teacher/classes");

    return {
      success: true,
      bookingId: newBooking.id,
      bookingReference: bookingRef,
    };
  } catch (err: any) {
    console.error("submitBookingRequestAction error:", err);
    return {
      success: false,
      error: err?.message || "Failed to submit booking request. Please try again.",
    };
  }
}

/**
 * 2. Approve Booking Request (Teacher)
 * Validates teacher identity, atomically confirms booking, and triggers
 * automated Google Calendar event & Google Meet link creation.
 */
export async function approveBookingRequestAction(bookingId: string) {
  await ensureBookingSystemSchema();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const teacherId = authData?.user?.id || "00000000-0000-0000-0000-000000000002";

  // 1. Fetch booking and verify ownership
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return { success: false, error: "Booking record not found." };
  }

  if (booking.teacherId !== teacherId) {
    return { success: false, error: "You are not authorized to approve this booking request." };
  }

  if (booking.status === "confirmed") {
    return { success: true, message: "Booking is already confirmed." };
  }

  if (booking.status !== "pending") {
    return { success: false, error: `Cannot approve a booking with status '${booking.status}'.` };
  }

  // Strict Payment Guard: Do not allow teacher to approve or generate meeting link without verified payment
  if (booking.paymentStatus !== "paid") {
    return {
      success: false,
      error: "Cannot confirm session: payment has not been authorized or received into escrow. No Google Meet link can be generated for unpaid sessions.",
    };
  }

  // 2. Re-check for conflicting confirmed bookings (Atomic concurrency guard)
  const conflictCheck = await assertNoBookingConflict(
    teacherId,
    booking.startTime,
    booking.endTime,
    booking.id
  );

  if (conflictCheck.hasConflict) {
    return {
      success: false,
      error: conflictCheck.message || "Cannot approve: another confirmed booking conflicts with this slot.",
    };
  }

  // 3. Atomically update status to confirmed
  await db
    .update(bookings)
    .set({
      status: "confirmed",
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));

  // 4. Trigger automated Google Calendar event & Google Meet creation
  const googleResult = await createGoogleCalendarAndMeetEvent(bookingId);

  // 5. Fetch party names for notifications
  const [student] = await db
    .select({ fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.id, booking.studentId))
    .limit(1);

  const [teacher] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, teacherId))
    .limit(1);

  const studentName = student?.fullName || "Student";
  const teacherName = teacher?.fullName || "Instructor";

  const dateFormatted = new Date(booking.startTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // 6. Notify student
  await createNotification({
    userId: booking.studentId,
    title: "Booking Approved! Class Confirmed",
    message: `${teacherName} approved your ${booking.subject} class for ${dateFormatted}. ${
      googleResult.meetingUrl
        ? "Your Google Meet link is ready in My Classes."
        : "Meeting details will be updated shortly."
    }`,
    type: "booking_approved",
    relatedBookingId: booking.id,
  });

  // 7. Notify teacher
  await createNotification({
    userId: teacherId,
    title: "Class Confirmed",
    message: `You confirmed the booking with ${studentName} for ${booking.subject} on ${dateFormatted}. ${
      googleResult.meetingUrl ? "Google Calendar invite and Meet link created." : ""
    }`,
    type: "booking_approved",
    relatedBookingId: booking.id,
  });

  revalidatePath("/teacher/classes");
  revalidatePath("/student/classes");

  return {
    success: true,
    meetingUrl: googleResult.meetingUrl,
    conferenceStatus: googleResult.conferenceStatus,
    calendarStatus: googleResult.calendarStatus,
    googleError: googleResult.error,
  };
}

/**
 * 3. Reject Booking Request (Teacher)
 * Releases the slot and records optional rejection reason.
 */
export async function rejectBookingRequestAction(bookingId: string, reason?: string) {
  await ensureBookingSystemSchema();

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const teacherId = authData?.user?.id || "00000000-0000-0000-0000-000000000002";

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return { success: false, error: "Booking record not found." };
  }

  if (booking.teacherId !== teacherId) {
    return { success: false, error: "You are not authorized to reject this booking request." };
  }

  const finalReason = reason?.trim() || "Instructor was unavailable at the requested time.";

  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancellationReason: finalReason,
      cancelledAt: new Date(),
      rejectionReason: finalReason,
      rejectedAt: new Date(),
      paymentStatus: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));

  // Trigger Safepay escrow refund and record double-entry ledger reversal
  try {
    await triggerSafepayEscrowRefund({
      bookingId,
      reason: `Declined by instructor: ${finalReason}`,
    });
  } catch (finErr) {
    console.warn("Notice: Refund recording on reject:", finErr);
  }

  const [teacher] = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, teacherId))
    .limit(1);

  const teacherName = teacher?.fullName || "Instructor";

  // Notify student
  await createNotification({
    userId: booking.studentId,
    title: "Booking Request Declined",
    message: `${teacherName} was unable to accept your booking for ${booking.subject}. Reason: "${finalReason}". Any held funds have been refunded.`,
    type: "booking_rejected",
    relatedBookingId: booking.id,
  });

  revalidatePath("/teacher/classes");
  revalidatePath("/student/classes");

  return { success: true };
}

/**
 * 4. Cancel a Booking (Student or Teacher)
 */
export async function cancelBookingAction(bookingId: string, reason?: string) {
  await ensureBookingSystemSchema();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { success: false, error: "Authentication required to cancel a booking." };
  }

  const userId = authData.user.id;

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!booking) {
    return { success: false, error: "Booking not found." };
  }

  if (booking.studentId !== userId && booking.teacherId !== userId) {
    return { success: false, error: "Unauthorized to cancel this booking." };
  }

  const isTeacher = booking.teacherId === userId;
  const finalReason = reason?.trim() || (isTeacher ? "Cancelled by instructor." : "Cancelled by student.");

  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancellationReason: finalReason,
      cancelledBy: userId,
      cancelledAt: new Date(),
      paymentStatus: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));

  // Record refund transaction in financial ledger
  try {
    await recordRefundTransaction({
      bookingId,
      reason: `Cancelled: ${finalReason}`,
    });
  } catch (finErr) {
    console.warn("Notice: Refund recording on cancel:", finErr);
  }

  // Remove event from Google Calendar if previously created
  await deleteGoogleCalendarEventForBooking(bookingId);

  // Notify counterparty
  const notifyUserId = isTeacher ? booking.studentId : booking.teacherId;
  await createNotification({
    userId: notifyUserId,
    title: "Session Cancelled",
    message: `Booking #${booking.bookingReference} for ${booking.subject} was cancelled. Reason: "${finalReason}".`,
    type: "booking_cancelled",
    relatedBookingId: booking.id,
  });

  revalidatePath("/student/classes");
  revalidatePath("/teacher/classes");

  return { success: true };
}

/**
 * 5. Retry Google Calendar & Meet link creation
 */
export async function retryGoogleMeetCreationAction(bookingId: string) {
  await ensureBookingSystemSchema();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { success: false, error: "Please log in." };
  }

  const result = await createGoogleCalendarAndMeetEvent(bookingId);
  revalidatePath("/teacher/classes");
  revalidatePath("/student/classes");

  return result;
}

/**
 * 6. Get Teacher Google Connection Status
 */
export async function getTeacherGoogleStatusAction() {
  await ensureBookingSystemSchema();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { isConnected: false };
  }

  const accounts = await db
    .select({
      googleEmail: teacherGoogleAccounts.googleEmail,
      connectedAt: teacherGoogleAccounts.connectedAt,
    })
    .from(teacherGoogleAccounts)
    .where(eq(teacherGoogleAccounts.teacherId, authData.user.id))
    .limit(1);

  if (!accounts || accounts.length === 0) {
    return { isConnected: false };
  }

  return {
    isConnected: true,
    googleEmail: accounts[0].googleEmail,
    connectedAt: accounts[0].connectedAt.toISOString(),
  };
}

/**
 * 7. Disconnect Teacher Google Account
 */
export async function disconnectTeacherGoogleAction() {
  await ensureBookingSystemSchema();

  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { success: false, error: "Please log in." };
  }

  await disconnectTeacherGoogleAccount(authData.user.id);
  revalidatePath("/teacher/settings");

  return { success: true };
}

/**
 * 8. Query available slots for teacher on a given date (Asia/Karachi)
 */
export async function getTeacherSlotsForDateAction(teacherId: string, dateStr: string) {
  return getTeacherAvailabilityForDate(teacherId, dateStr);
}

/**
 * 9. Create Booking Payment Session (Pay First Flow)
 * Collects/authorizes student payment before sending
 * the confirmed paid request to the instructor.
 */
export interface CardPaymentInput {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  postalCode?: string;
}

export async function createBookingPaymentSessionAction(data: {
  teacherId: string;
  subject: string;
  topicTitle?: string;
  topicDescription?: string;
  startIso: string;
  endIso: string;
  paymentMethod?: "card";
  cardDetails?: CardPaymentInput;
}) {
  await ensureBookingSystemSchema();

  // 1. Authenticate student
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { success: false, error: "Please log in as a student to book and pay for a class." };
  }

  const studentId = authData.user.id;
  if (studentId === data.teacherId) {
    return { success: false, error: "You cannot book a session with yourself." };
  }

  const startDate = new Date(data.startIso);
  const endDate = new Date(data.endIso);

  if (startDate.getTime() <= Date.now()) {
    return { success: false, error: "Cannot book a time slot in the past." };
  }

  // 2. Derive pricing strictly from teacher profile in database (LOCKED: User cannot tamper with amount)
  const [teacherProfile] = await db
    .select({
      hourlyRatePkr: teacherProfiles.hourlyRatePkr,
    })
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, data.teacherId))
    .limit(1);

  const pricePkr = teacherProfile?.hourlyRatePkr || 2500;

  // 3. Concurrency double-booking protection check
  const conflictCheck = await assertNoBookingConflict(data.teacherId, startDate, endDate);
  if (conflictCheck.hasConflict) {
    return {
      success: false,
      error: conflictCheck.message || "This time slot is no longer available.",
    };
  }

  const bookingRef = generateReference();
  const topicTitle = data.topicTitle?.trim() || `${data.subject} 1-on-1 Class`;
  const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (60 * 1000)) || 60;

  // 4. Create booking with paymentStatus 'pending' (Awaiting real Safepay checkout)
  const [newBooking] = await db
    .insert(bookings)
    .values({
      studentId,
      teacherId: data.teacherId,
      subject: data.subject,
      topicTitle,
      topicDescription: data.topicDescription || "1-on-1 tutoring session on ZuhDemy.",
      bookingReference: bookingRef,
      startTime: startDate,
      endTime: endDate,
      durationMinutes,
      hourlyRate: pricePkr,
      totalAmount: pricePkr,
      pricePkr,
      status: "pending",
      paymentStatus: "pending", // Waiting for Safepay webhook confirmation
    })
    .returning();

  // 5. Initialize class session
  await db.insert(classSessions).values({
    bookingId: newBooking.id,
    meetingProvider: "Google Meet",
    conferenceStatus: "pending",
    calendarStatus: "pending",
    teacherNotes: data.topicDescription || "",
  });

  // 6. Generate official Safepay tracker session for real payment gateway
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const sfpy = await createSafepayCheckoutSession({
    amountPkr: pricePkr,
    orderId: bookingRef,
    bookingId: newBooking.id,
    redirectUrl: `${appUrl}/student/classes?booking_id=${newBooking.id}&paid=true`,
    cancelUrl: `${appUrl}/student/teachers/${data.teacherId}?booking_cancelled=true`,
  });

  if (!sfpy.success || !sfpy.checkoutUrl) {
    // Clean up pending booking if Safepay session creation failed
    await db.delete(bookings).where(eq(bookings.id, newBooking.id));
    return {
      success: false,
      error: sfpy.error || "Unable to initiate Safepay payment checkout. Please try again.",
    };
  }

  revalidatePath("/student/classes");
  revalidatePath("/teacher/classes");

  return {
    success: true,
    mode: "safepay",
    bookingId: newBooking.id,
    bookingReference: bookingRef,
    amountPaidPkr: pricePkr,
    trackerToken: sfpy.trackerToken,
    safepayCheckoutUrl: sfpy.checkoutUrl,
    env: process.env.SAFEPAY_ENV === "production" ? "production" : "sandbox",
  };
}



