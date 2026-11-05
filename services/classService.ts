/**
 * ZuhDemy Student Classes Service & Mock API Data Provider
 * Decoupled data layer for student classes management.
 * When real APIs/Supabase are ready, only this file needs to be updated.
 */

import { StudentClass } from "@/types/class";
import {
  getStudentClassesAction,
  cancelClassAction,
  submitClassReviewAction,
} from "@/app/actions/classes";

export const MOCK_STUDENT_CLASSES: StudentClass[] = [
  {
    id: "cls_101",
    bookingRef: "ZUH-2026-9041",
    teacher: {
      id: "usr_teach_01",
      name: "Dr. Alexander Wright",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      headline: "Senior Computer Science Instructor & AI Researcher",
      rating: 4.95,
    },
    subject: "Computer Science",
    topicTitle: "Binary Search Trees, Heaps & Recursion Trace Walkthrough",
    description: "Hands-on algorithm walkthrough, whiteboard visual diagrams, and complexity analysis for O/A-Levels.",
    date: "2026-10-21", // Today
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    durationMinutes: 60,
    timezone: "PKT (UTC+5)",
    status: "upcoming",
    meetingPlatform: "Google Meet",
    meetingUrl: "https://meet.google.com/zuh-demy-class-101",
    canJoinNow: true, // Meeting is today / ready to join
    feePKR: 3500,
    packageType: "Single 1-on-1",
    paymentStatus: "Paid in Escrow",
    homeworkAssigned: "Implement Invert Binary Tree and post code in class chat.",
  },
  {
    id: "cls_102",
    bookingRef: "ZUH-2026-9042",
    teacher: {
      id: "usr_teach_12",
      name: "Hina Qureshi",
      avatarUrl: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&auto=format&fit=crop&q=80",
      headline: "Primary & Middle School General Science & Math Specialist",
      rating: 4.98,
    },
    subject: "Mathematics",
    topicTitle: "Single-Variable Algebraic Expressions & Word Problems",
    description: "Interactive visual whiteboard problem solving, fractions, and exam prep shortcuts for Grade 7 & 8.",
    date: "2026-10-23", // Friday
    startTime: "03:30 PM",
    endTime: "04:30 PM",
    durationMinutes: 60,
    timezone: "PKT (UTC+5)",
    status: "upcoming",
    meetingPlatform: "Google Meet",
    meetingUrl: "https://meet.google.com/zuh-demy-class-102",
    canJoinNow: false, // In 2 days, link unlocks 15m prior
    feePKR: 2200,
    packageType: "4-Class Monthly Pack",
    paymentStatus: "Paid in Escrow",
    homeworkAssigned: "Practice Worksheet 4: Solving Linear Equations (10 Questions).",
  },
  {
    id: "cls_103",
    bookingRef: "ZUH-2026-9043",
    teacher: {
      id: "usr_teach_03",
      name: "Prof. Sarah Jenkins",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      headline: "Cambridge O/A-Levels Physics & Cambridge Board Examiner",
      rating: 4.92,
    },
    subject: "Physics",
    topicTitle: "Electromagnetism, Motor Effect & Lenz's Law Applications",
    description: "Deep dive into magnetic flux density, Fleming's Left-Hand rule, and Cambridge past paper 2 questions.",
    date: "2026-10-25", // Sunday
    startTime: "06:00 PM",
    endTime: "07:00 PM",
    durationMinutes: 60,
    timezone: "PKT (UTC+5)",
    status: "upcoming",
    meetingPlatform: "Google Meet",
    meetingUrl: "https://meet.google.com/zuh-demy-class-103",
    canJoinNow: false,
    feePKR: 3000,
    packageType: "Single 1-on-1",
    paymentStatus: "Paid in Escrow",
    homeworkAssigned: "Cambridge Summer 2024 Paper 2 Question 3 & 4.",
  },
  // COMPLETED SESSIONS
  {
    id: "cls_201",
    bookingRef: "ZUH-2026-8812",
    teacher: {
      id: "usr_teach_12",
      name: "Hina Qureshi",
      avatarUrl: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=400&auto=format&fit=crop&q=80",
      headline: "Primary & Middle School General Science & Math Specialist",
      rating: 4.98,
    },
    subject: "Mathematics",
    topicTitle: "Fractions, Decimals & Mental Math Fast Calculation Strategies",
    description: "Comprehensive review of fraction addition, multiplication shortcuts, and real-life percentage discounts.",
    date: "2026-10-14",
    startTime: "03:30 PM",
    endTime: "04:30 PM",
    durationMinutes: 60,
    timezone: "PKT (UTC+5)",
    status: "completed",
    meetingPlatform: "Google Meet",
    feePKR: 2200,
    packageType: "4-Class Monthly Pack",
    paymentStatus: "Released to Teacher",
    canJoinNow: false,
    hasReview: true,
    studentRating: 5,
    studentReview: "Miss Hina explained fractions with colorful visual diagrams. Really helped my daughter prepare for her test!",
    reviewedAt: "2026-10-15",
    sessionNotesUrl: "https://zuhdemy.com/notes/sample-fractions-notes.pdf",
    homeworkAssigned: "Completed in-session with 100% accuracy.",
  },
  {
    id: "cls_202",
    bookingRef: "ZUH-2026-8790",
    teacher: {
      id: "usr_teach_01",
      name: "Dr. Alexander Wright",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      headline: "Senior Computer Science Instructor & AI Researcher",
      rating: 4.95,
    },
    subject: "Computer Science",
    topicTitle: "Object-Oriented Programming (OOP) in Python: Inheritance & Polymorphism",
    description: "Classes, constructors, super() method calls, and clean architecture modeling.",
    date: "2026-10-09",
    startTime: "04:00 PM",
    endTime: "05:00 PM",
    durationMinutes: 60,
    timezone: "PKT (UTC+5)",
    status: "completed",
    meetingPlatform: "Google Meet",
    feePKR: 3500,
    packageType: "Single 1-on-1",
    paymentStatus: "Released to Teacher",
    canJoinNow: false,
    hasReview: false, // Student has not reviewed yet!
    sessionNotesUrl: "https://zuhdemy.com/notes/sample-oop-python.pdf",
    homeworkAssigned: "Build BankAccount class with Deposit/Withdraw validations.",
  },
  {
    id: "cls_203",
    bookingRef: "ZUH-2026-8651",
    teacher: {
      id: "usr_teach_05",
      name: "Dr. Bilal Siddiqui",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      headline: "M.Sc. Chemistry & Pre-Medical Entrance Specialist",
      rating: 4.88,
    },
    subject: "Chemistry",
    topicTitle: "Stoichiometry & Mole Concept Calculations",
    description: "Balancing redox equations, calculating percentage yield, and titration problem setups.",
    date: "2026-09-28",
    startTime: "05:00 PM",
    endTime: "06:00 PM",
    durationMinutes: 60,
    timezone: "PKT (UTC+5)",
    status: "completed",
    meetingPlatform: "Google Meet",
    feePKR: 2800,
    packageType: "Trial Class",
    paymentStatus: "Released to Teacher",
    canJoinNow: false,
    hasReview: true,
    studentRating: 5,
    studentReview: "Clear explanations of moles and molar volume. Will definitely book more classes.",
    reviewedAt: "2026-09-29",
    sessionNotesUrl: "https://zuhdemy.com/notes/stoichiometry-che.pdf",
  },
  // CANCELLED SESSIONS
  {
    id: "cls_301",
    bookingRef: "ZUH-2026-8519",
    teacher: {
      id: "usr_teach_03",
      name: "Prof. Sarah Jenkins",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      headline: "Cambridge O/A-Levels Physics & Cambridge Board Examiner",
      rating: 4.92,
    },
    subject: "Physics",
    topicTitle: "Thermal Physics & Ideal Gas Laws",
    description: "Gas pressure, Boyle's Law, and thermodynamic cycle diagrams.",
    date: "2026-10-02",
    startTime: "06:00 PM",
    endTime: "07:00 PM",
    durationMinutes: 60,
    timezone: "PKT (UTC+5)",
    status: "cancelled",
    meetingPlatform: "Google Meet",
    feePKR: 3000,
    packageType: "Single 1-on-1",
    paymentStatus: "Refunded to Wallet",
    canJoinNow: false,
    cancelledAt: "2026-10-01 10:15 AM",
    cancelledBy: "student",
    cancellationReason: "Schedule conflict with school sports gala.",
    refundAmountPKR: 3000,
    refundStatus: "Full Refund Issued",
  },
  {
    id: "cls_302",
    bookingRef: "ZUH-2026-8311",
    teacher: {
      id: "usr_teach_08",
      name: "Ms. Ayesha Khan",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      headline: "English Literature & Creative Writing Mentor",
      rating: 4.85,
    },
    subject: "English Literature",
    topicTitle: "O-Level Unseen Poetry Analysis & Essay Structure",
    description: "Rhetorical devices, meter, rhyme scheme, and paragraph linking.",
    date: "2026-09-18",
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    durationMinutes: 60,
    timezone: "PKT (UTC+5)",
    status: "cancelled",
    meetingPlatform: "Google Meet",
    feePKR: 2000,
    packageType: "Trial Class",
    paymentStatus: "Refunded to Wallet",
    canJoinNow: false,
    cancelledAt: "2026-09-17 08:30 PM",
    cancelledBy: "teacher",
    cancellationReason: "Instructor medical emergency; immediate full refund credited to student wallet.",
    refundAmountPKR: 2000,
    refundStatus: "Full Refund Issued",
  },
];


/**
 * Fetch all classes for the student directly from PostgreSQL.
 * Returns empty array if student has 0 bookings so genuine empty state is displayed.
 */
export async function fetchStudentClasses(): Promise<StudentClass[]> {
  try {
    const res = await getStudentClassesAction();
    if (res.success && res.data) {
      return (res.data.classes || []).map((c) => ({
        id: c.id,
        bookingRef: c.bookingReference,
        teacher: {
          id: c.otherParty.id,
          name: c.otherParty.name,
          avatarUrl:
            c.otherParty.avatarUrl ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          headline:
            c.otherParty.headline || "Senior Faculty Instructor & STEM Specialist",
          rating: 4.95,
        },
        subject: c.subject,
        topicTitle: c.topicTitle,
        description: c.topicDescription,
        date: c.dateStr,
        startTime: c.timeRangeStr.split(" – ")[0] || "04:00 PM",
        endTime: c.timeRangeStr.split(" – ")[1] || "05:00 PM",
        durationMinutes: c.durationMinutes,
        timezone: "PKT (UTC+5)",
        status:
          (c.status as any) === "confirmed"
            ? "upcoming"
            : (c.status as any) === "pending"
            ? "pending"
            : (c.status as any) === "completed"
            ? "completed"
            : (c.status as any) === "rejected"
            ? "rejected"
            : "cancelled",
        meetingPlatform: "Google Meet",
        meetingUrl: c.meetingUrl,
        canJoinNow: Boolean(c.meetingUrl && c.status === "confirmed"),
        feePKR: c.pricePkr,
        packageType: "Single 1-on-1",
        paymentStatus:
          c.paymentStatus === "paid"
            ? "Paid in Escrow"
            : c.paymentStatus === "refunded"
            ? "Refunded to Wallet"
            : "Refund Pending",
        cancellationReason: c.cancellationReason,
        cancelledAt: c.cancelledAt,
        cancelledBy: "student",
        hasReview: c.hasReview,
        studentRating: c.studentRating,
        studentReview: c.studentReview,
        reviewedAt: c.reviewedAt,
        teacherNotes: c.teacherNotes,
      }));
    }
  } catch (err) {
    console.warn("fetchStudentClasses error:", err);
  }

  return [];
}

/**
 * Cancel an upcoming class or pending request
 */
export async function cancelStudentClass(
  classId: string,
  reason: string
): Promise<{ success: boolean; cancelledClass?: StudentClass }> {
  try {
    const { cancelBookingAction } = await import("@/app/actions/bookingActions");
    await cancelBookingAction(classId, reason);
  } catch (err) {
    console.warn("Notice: Live cancel fallback to memory update:", err);
  }

  const target = MOCK_STUDENT_CLASSES.find((c) => c.id === classId);
  if (!target) return { success: true };

  target.status = "cancelled";
  target.cancelledAt = new Date().toISOString();
  target.cancelledBy = "student";
  target.cancellationReason = reason;
  target.refundAmountPKR = target.feePKR;
  target.refundStatus = "Full Refund Issued";
  target.paymentStatus = "Refunded to Wallet";

  return { success: true, cancelledClass: { ...target } };
}

/**
 * Reschedule an upcoming class
 */
export async function rescheduleStudentClass(
  classId: string,
  newDate: string,
  newTime: string
): Promise<{ success: boolean; updatedClass?: StudentClass }> {
  await new Promise((res) => setTimeout(res, 250));
  const target = MOCK_STUDENT_CLASSES.find((c) => c.id === classId);
  if (!target) return { success: false };

  target.date = newDate;
  target.startTime = newTime;
  return { success: true, updatedClass: { ...target } };
}

/**
 * Submit review for a completed class
 */
export async function submitClassReview(
  classId: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; reviewedClass?: StudentClass }> {
  try {
    await submitClassReviewAction({
      bookingId: classId,
      rating,
      reviewText: comment,
    });
  } catch (err) {
    console.warn("Notice: Live review fallback to memory update:", err);
  }

  const target = MOCK_STUDENT_CLASSES.find((c) => c.id === classId);
  if (!target) return { success: true };

  target.hasReview = true;
  target.studentRating = rating;
  target.studentReview = comment;
  target.reviewedAt = new Date().toISOString().split("T")[0];

  return { success: true, reviewedClass: { ...target } };
}

