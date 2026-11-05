export type MessageSenderRole = "teacher" | "student";

export type MessageStatus = "sending" | "sent" | "delivered" | "read";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  senderName: string;
  text: string;
  timestamp: string; // ISO string e.g. 2026-10-10T14:30:00Z
  formattedTime: string; // "04:30 PM"
  formattedDate: string; // "2026-10-10" or "Today"
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  studentInitials: string;
  studentGradeLevel?: string;
  studentEmail?: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
  lastMessageSenderRole: MessageSenderRole;
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationFilterState {
  searchQuery: string;
  filter: "all" | "unread";
}
