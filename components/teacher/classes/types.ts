export type ClassStatus = "confirmed" | "pending" | "completed" | "cancelled" | "rejected";

export type SessionType = "one-to-one" | "group";

export interface Student {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  email: string;
  gradeLevel: string;
  targetGoals: string;
  learningPreferences?: string;
}

export interface ActivityEvent {
  id: string;
  event: string;
  timestamp: string;
  description: string;
}

export interface ClassSession {
  id: string;
  bookingReference: string;
  student: Student;
  subject: string;
  topicTitle: string;
  topicDescription: string; // What exactly the student wants to read and study
  studentRequestedTopics: string[] | string; // Specific chapters, syllabus topics, or exercises requested by student
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  sessionType: SessionType;
  status: ClassStatus;
  meetingProvider: "google-meet" | "zoom";
  meetingUrl?: string;
  conferenceStatus?: "pending" | "ready" | "failed" | "not_connected";
  price: number;
  teacherEarnings: number;
  platformFee: number;
  paymentStatus: "paid" | "authorized" | "pending" | "refunded";
  teacherNotes: string;
  cancellationReason?: string;
  cancelledAt?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  completedAt?: string;
  activityTimeline: ActivityEvent[];
}

export interface ClassFiltersState {
  searchQuery: string;
  status: string; // "all" | ClassStatus
  subject: string; // "all" | string
  sessionType: string; // "all" | SessionType
  selectedDate?: Date;
}

export const USD_TO_PKR_RATE = 280;

export function formatPKR(usdAmount: number): string {
  const pkr = Math.round(usdAmount * USD_TO_PKR_RATE);
  return `PKR ${pkr.toLocaleString("en-PK")}`;
}

export function formatDualCurrency(usdAmount: number): string {
  return `$${usdAmount.toFixed(2)} (${formatPKR(usdAmount)})`;
}

/**
 * Normalizes studentRequestedTopics into an array of clean strings.
 */
export function getRequestedTopicsList(topics?: string[] | string): string[] {
  if (!topics) return [];
  if (Array.isArray(topics)) return topics;
  return topics
    .split("\n")
    .map((t) => t.replace(/^[•\-\*]\s*/, "").trim())
    .filter(Boolean);
}
