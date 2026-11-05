/**
 * ZuhDemy Student-Teacher Messaging Data Models
 * Defines contracts for real-time conversations, message bubbles,
 * rich attachments, class session invites, and conversation filters.
 */

export type MessageSender = "student" | "teacher" | "system";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export type MessageType = "text" | "class_invitation" | "file" | "image" | "system";

export interface MessageAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  fileType: "pdf" | "image" | "doc" | "zip" | "other";
  url: string;
}

export interface ClassInvitationPayload {
  topicTitle: string;
  date: string;
  time: string;
  durationMinutes: number;
  feePKR: number;
  meetingPlatform: string;
  status: "pending" | "accepted" | "declined";
  bookingId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  senderRole: MessageSender;
  content: string;
  timestamp: string; // e.g. "10:42 AM"
  date: string;      // e.g. "Today", "Yesterday", "2026-10-20"
  status: MessageStatus;
  type: MessageType;
  invitation?: ClassInvitationPayload;
  attachments?: MessageAttachment[];
  createdAt?: string;
  readAt?: string;
}

export interface ConversationParticipantInfo {
  id: string;
  fullName: string;
  role: "student" | "teacher" | "admin";
  avatarUrl?: string;
  headline?: string;
  subject?: string;
  hourlyRatePkr?: number;
  isOnline: boolean;
  lastSeen?: string;
  isVerified?: boolean;
  bio?: string;
  education?: string[];
  totalCompletedSessions?: number;
}

export interface Conversation {
  id: string;
  // Symmetrical participant info
  participant?: ConversationParticipantInfo;

  // Legacy alias fields for student view compatibility
  teacherId: string;
  teacherName: string;
  teacherAvatarUrl?: string;
  teacherHeadline: string;
  teacherSubject: string;
  teacherHourlyRate: number;
  teacherIsOnline: boolean;
  teacherLastSeen?: string;
  isVerified: boolean;

  // Student specific alias fields when viewed by teacher
  studentId?: string;
  studentName?: string;
  studentAvatarUrl?: string;

  unreadCount: number;
  lastMessage: {
    content: string;
    timestamp: string;
    senderRole: MessageSender;
    senderId?: string;
    isRead: boolean;
  };
  upcomingClass?: {
    date: string;
    time: string;
    topic: string;
    meetingUrl?: string;
    bookingId?: string;
  };
  isArchived?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  updatedAt?: string;
}

export type ConversationFilter = "all" | "unread" | "sessions" | "archived";
