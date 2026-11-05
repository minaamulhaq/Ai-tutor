/**
 * ZuhDemy Student Classes Data Models
 * Defines typed contracts for student bookings, classes, statuses, and filtering.
 */

export type ClassStatus = "upcoming" | "pending" | "completed" | "cancelled" | "rejected";

export type MeetingPlatform = "Google Meet" | "Zoom" | "Microsoft Teams";

export interface TeacherSummary {
  id: string;
  name: string;
  avatarUrl: string;
  headline: string;
  rating: number;
}

export interface StudentClass {
  id: string;
  bookingRef: string;
  teacher: TeacherSummary;
  subject: string;
  topicTitle: string;
  description?: string;
  
  // Date & Time
  date: string; // ISO format "2026-10-21" or display format
  startTime: string; // e.g. "04:00 PM"
  endTime: string; // e.g. "05:00 PM"
  durationMinutes: number;
  timezone: string; // e.g. "PKT (UTC+5)"
  
  // Status & Meeting
  status: ClassStatus;
  meetingPlatform: MeetingPlatform;
  meetingUrl?: string;
  conferenceStatus?: "pending" | "ready" | "failed" | "not_connected";
  canJoinNow: boolean; // Computed by meeting-access rules
  
  // Financial
  feePKR: number;
  packageType: "Single 1-on-1" | "Trial Class" | "4-Class Monthly Pack" | "8-Class Mastery Pack";
  paymentStatus: "Paid in Escrow" | "Released to Teacher" | "Refunded to Wallet" | "Refund Pending";
  
  // Cancellation details (if status === 'cancelled')
  cancelledAt?: string;
  cancelledBy?: "student" | "teacher" | "system";
  cancellationReason?: string;
  refundAmountPKR?: number;
  refundStatus?: "Full Refund Issued" | "Partial Refund Issued" | "Non-refundable";

  // Rejection details (if status === 'rejected')
  rejectionReason?: string;
  rejectedAt?: string;
  
  // Review details (if status === 'completed')
  hasReview?: boolean;
  studentRating?: number;
  studentReview?: string;
  reviewedAt?: string;

  // Session Notes & Deliverables
  teacherNotes?: string;
  sessionNotesUrl?: string;
  homeworkAssigned?: string;
}

export interface ClassFilterState {
  searchQuery: string;
  dateRange: "all" | "today" | "this-week" | "this-month" | "past-3-months";
  subject: string;
  sortBy: "date-asc" | "date-desc" | "fee-high" | "fee-low";
}

export interface ClassSummaryStats {
  upcomingCount: number;
  completedCount: number;
  cancelledCount: number;
  totalHoursLearned: number;
}
