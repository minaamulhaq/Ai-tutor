import { Conversation, Message } from "./types";

// ============================================================================
// IN-MEMORY REALISTIC CONVERSATIONS SEED
// Connected with authentic student records from ZuhDemy classes
// ============================================================================
let memoryConversations: Conversation[] = [
  {
    id: "conv-1",
    studentId: "std-1",
    studentName: "Ahmed Khan",
    studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    studentInitials: "AK",
    studentGradeLevel: "Grade 11 (A-Levels)",
    studentEmail: "ahmed.khan@gmail.com",
    lastMessageText: "Hi Dr. Alexander! I have prepared the questions for our Python dictionaries session on Monday. Looking forward to it!",
    lastMessageTimestamp: "Today, 05:45 PM",
    lastMessageSenderRole: "student",
    unreadCount: 1,
    updatedAt: "2026-10-10T17:45:00Z",
  },
  {
    id: "conv-2",
    studentId: "std-2",
    studentName: "Sara Ali",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    studentInitials: "SA",
    studentGradeLevel: "Undergraduate (Year 1)",
    studentEmail: "sara.ali@outlook.com",
    lastMessageText: "Could you please send over the whiteboard link before our linked lists session?",
    lastMessageTimestamp: "Today, 04:12 PM",
    lastMessageSenderRole: "student",
    unreadCount: 2,
    updatedAt: "2026-10-10T16:12:00Z",
  },
  {
    id: "conv-3",
    studentId: "std-3",
    studentName: "Zainab Fatima",
    studentAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    studentInitials: "ZF",
    studentGradeLevel: "O-Levels (Year 10)",
    studentEmail: "zainab.f@gmail.com",
    lastMessageText: "I've uploaded the free-body diagram practice sheets to Google Classroom.",
    lastMessageTimestamp: "Yesterday, 06:30 PM",
    lastMessageSenderRole: "teacher",
    unreadCount: 0,
    updatedAt: "2026-10-09T18:30:00Z",
  },
  {
    id: "conv-4",
    studentId: "std-4",
    studentName: "Hamza Tariq",
    studentAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    studentInitials: "HT",
    studentGradeLevel: "Professional Adult Learner",
    studentEmail: "hamza.tariq@code.io",
    lastMessageText: "Thanks for the feedback on the custom hooks. The re-renders are now properly memoized!",
    lastMessageTimestamp: "Yesterday, 02:15 PM",
    lastMessageSenderRole: "student",
    unreadCount: 0,
    updatedAt: "2026-10-09T14:15:00Z",
  },
  {
    id: "conv-5",
    studentId: "std-5",
    studentName: "Daniel Lee",
    studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    studentInitials: "DL",
    studentGradeLevel: "Grade 12 (AP Student)",
    studentEmail: "daniel.lee@nyu.edu",
    lastMessageText: "I've accepted your AP Physics booking request for Oct 14 at 4:00 PM.",
    lastMessageTimestamp: "Oct 8, 11:20 AM",
    lastMessageSenderRole: "teacher",
    unreadCount: 0,
    updatedAt: "2026-10-08T11:20:00Z",
  },
  {
    id: "conv-6",
    studentId: "std-6",
    studentName: "Maya Lin",
    studentAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    studentInitials: "ML",
    studentGradeLevel: "Grade 10",
    studentEmail: "maya.lin@gmail.com",
    lastMessageText: "Looking forward to reviewing the SAT Math diagnostic Module 2 questions.",
    lastMessageTimestamp: "Oct 8, 09:30 AM",
    lastMessageSenderRole: "student",
    unreadCount: 0,
    updatedAt: "2026-10-08T09:30:00Z",
  },
  {
    id: "conv-7",
    studentId: "std-7",
    studentName: "Omar Farooq",
    studentAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
    studentInitials: "OF",
    studentGradeLevel: "Grade 11",
    studentEmail: "omar.farooq@gmail.com",
    lastMessageText: "Excellent work on completing the square exercises. See you next week!",
    lastMessageTimestamp: "Oct 6, 05:15 PM",
    lastMessageSenderRole: "teacher",
    unreadCount: 0,
    updatedAt: "2026-10-06T17:15:00Z",
  },
];

// In-memory message store grouped by conversation ID
let memoryMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-101",
      conversationId: "conv-1",
      senderId: "teacher-alexander",
      senderRole: "teacher",
      senderName: "Dr. Alexander Wright",
      text: "Hello Ahmed! I saw your booking for Python Programming on Monday, Oct 12 at 4:00 PM.",
      timestamp: "2026-10-08T14:15:00Z",
      formattedTime: "02:15 PM",
      formattedDate: "Oct 8, 2026",
      status: "read",
    },
    {
      id: "msg-102",
      conversationId: "conv-1",
      senderId: "std-1",
      senderRole: "student",
      senderName: "Ahmed Khan",
      text: "Yes Dr. Alexander! I really need help mastering nested dictionaries and list comprehensions for my upcoming school coding exam.",
      timestamp: "2026-10-08T14:20:00Z",
      formattedTime: "02:20 PM",
      formattedDate: "Oct 8, 2026",
      status: "read",
    },
    {
      id: "msg-103",
      conversationId: "conv-1",
      senderId: "teacher-alexander",
      senderRole: "teacher",
      senderName: "Dr. Alexander Wright",
      text: "Sounds great. We will solve practice problem set #4 together, write unit test cases, and analyze runtime complexity.",
      timestamp: "2026-10-08T14:25:00Z",
      formattedTime: "02:25 PM",
      formattedDate: "Oct 8, 2026",
      status: "read",
    },
    {
      id: "msg-104",
      conversationId: "conv-1",
      senderId: "std-1",
      senderRole: "student",
      senderName: "Ahmed Khan",
      text: "Hi Dr. Alexander! I have prepared the questions for our Python dictionaries session on Monday. Looking forward to it!",
      timestamp: "2026-10-10T17:45:00Z",
      formattedTime: "05:45 PM",
      formattedDate: "Today",
      status: "delivered",
    },
  ],
  "conv-2": [
    {
      id: "msg-201",
      conversationId: "conv-2",
      senderId: "teacher-alexander",
      senderRole: "teacher",
      senderName: "Dr. Alexander Wright",
      text: "Hi Sara, welcome to ZuhDemy! I received your booking request for Data Structures on Oct 13.",
      timestamp: "2026-10-10T15:30:00Z",
      formattedTime: "03:30 PM",
      formattedDate: "Today",
      status: "read",
    },
    {
      id: "msg-202",
      conversationId: "conv-2",
      senderId: "std-2",
      senderRole: "student",
      senderName: "Sara Ali",
      text: "Thank you Dr. Alexander! I'm preparing for my university midterm and having trouble visualizing pointers in memory.",
      timestamp: "2026-10-10T16:05:00Z",
      formattedTime: "04:05 PM",
      formattedDate: "Today",
      status: "delivered",
    },
    {
      id: "msg-203",
      conversationId: "conv-2",
      senderId: "std-2",
      senderRole: "student",
      senderName: "Sara Ali",
      text: "Could you please send over the whiteboard link before our linked lists session?",
      timestamp: "2026-10-10T16:12:00Z",
      formattedTime: "04:12 PM",
      formattedDate: "Today",
      status: "delivered",
    },
  ],
  "conv-3": [
    {
      id: "msg-301",
      conversationId: "conv-3",
      senderId: "std-3",
      senderRole: "student",
      senderName: "Zainab Fatima",
      text: "Sir, for question 14 on inclined planes, should I resolve the weight vector along the slope first?",
      timestamp: "2026-10-09T18:15:00Z",
      formattedTime: "06:15 PM",
      formattedDate: "Yesterday",
      status: "read",
    },
    {
      id: "msg-302",
      conversationId: "conv-3",
      senderId: "teacher-alexander",
      senderRole: "teacher",
      senderName: "Dr. Alexander Wright",
      text: "Yes Zainab! Always resolve mg into mg sin(θ) along the incline and mg cos(θ) perpendicular to it. The normal reaction equals mg cos(θ).",
      timestamp: "2026-10-09T18:22:00Z",
      formattedTime: "06:22 PM",
      formattedDate: "Yesterday",
      status: "read",
    },
    {
      id: "msg-303",
      conversationId: "conv-3",
      senderId: "teacher-alexander",
      senderRole: "teacher",
      senderName: "Dr. Alexander Wright",
      text: "I've uploaded the free-body diagram practice sheets to Google Classroom.",
      timestamp: "2026-10-09T18:30:00Z",
      formattedTime: "06:30 PM",
      formattedDate: "Yesterday",
      status: "read",
    },
  ],
  "conv-4": [
    {
      id: "msg-401",
      conversationId: "conv-4",
      senderId: "teacher-alexander",
      senderRole: "teacher",
      senderName: "Dr. Alexander Wright",
      text: "Hamza, here is the reference architecture for managing async state with AbortController in custom hooks.",
      timestamp: "2026-10-09T13:45:00Z",
      formattedTime: "01:45 PM",
      formattedDate: "Yesterday",
      status: "read",
    },
    {
      id: "msg-402",
      conversationId: "conv-4",
      senderId: "std-4",
      senderRole: "student",
      senderName: "Hamza Tariq",
      text: "Thanks for the feedback on the custom hooks. The re-renders are now properly memoized!",
      timestamp: "2026-10-09T14:15:00Z",
      formattedTime: "02:15 PM",
      formattedDate: "Yesterday",
      status: "read",
    },
  ],
  "conv-5": [
    {
      id: "msg-501",
      conversationId: "conv-5",
      senderId: "teacher-alexander",
      senderRole: "teacher",
      senderName: "Dr. Alexander Wright",
      text: "I've accepted your AP Physics booking request for Oct 14 at 4:00 PM.",
      timestamp: "2026-10-08T11:20:00Z",
      formattedTime: "11:20 AM",
      formattedDate: "Oct 8, 2026",
      status: "read",
    },
  ],
  "conv-6": [
    {
      id: "msg-601",
      conversationId: "conv-6",
      senderId: "std-6",
      senderRole: "student",
      senderName: "Maya Lin",
      text: "Looking forward to reviewing the SAT Math diagnostic Module 2 questions.",
      timestamp: "2026-10-08T09:30:00Z",
      formattedTime: "09:30 AM",
      formattedDate: "Oct 8, 2026",
      status: "read",
    },
  ],
  "conv-7": [
    {
      id: "msg-701",
      conversationId: "conv-7",
      senderId: "teacher-alexander",
      senderRole: "teacher",
      senderName: "Dr. Alexander Wright",
      text: "Excellent work on completing the square exercises. See you next week!",
      timestamp: "2026-10-06T17:15:00Z",
      formattedTime: "05:15 PM",
      formattedDate: "Oct 6, 2026",
      status: "read",
    },
  ],
};

// ============================================================================
// BACKEND API SERVICE LAYER
// When connecting to your real Supabase or WebSocket backend, replace these implementations.
// ============================================================================

/**
 * Fetch all conversations for the authenticated teacher.
 */
export async function apiFetchConversations(): Promise<Conversation[]> {
  // ============================================================================
  // [BACKEND API INTEGRATION POINT: FETCH CONVERSATIONS]
  // In production:
  // const res = await fetch("/api/teacher/conversations");
  // if (!res.ok) throw new Error("Failed to fetch conversations");
  // return await res.json();
  // ============================================================================

  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...memoryConversations].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

/**
 * Fetch complete message history for a given conversation.
 */
export async function apiFetchMessages(
  conversationId: string
): Promise<Message[]> {
  // ============================================================================
  // [BACKEND API INTEGRATION POINT: FETCH CHAT MESSAGES]
  // In production:
  // const res = await fetch(`/api/teacher/conversations/${conversationId}/messages`);
  // return await res.json();
  // ============================================================================

  await new Promise((resolve) => setTimeout(resolve, 250));
  return memoryMessages[conversationId] || [];
}

/**
 * Send a new chat message from the teacher.
 */
export async function apiSendMessage(
  conversationId: string,
  text: string
): Promise<Message> {
  // ============================================================================
  // [BACKEND API INTEGRATION POINT: SEND MESSAGE]
  // In production:
  // const res = await fetch(`/api/teacher/conversations/${conversationId}/messages`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ text }),
  // });
  // if (!res.ok) throw new Error("Failed to deliver message");
  // return await res.json();
  // ============================================================================

  await new Promise((resolve) => setTimeout(resolve, 350));

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  const minStr = minutes < 10 ? `0${minutes}` : minutes;
  const formattedTime = `${hour12}:${minStr} ${period}`;

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    conversationId,
    senderId: "teacher-alexander",
    senderRole: "teacher",
    senderName: "Dr. Alexander Wright",
    text: text.trim(),
    timestamp: now.toISOString(),
    formattedTime,
    formattedDate: "Today",
    status: "sent",
  };

  // 1. Append to in-memory messages
  if (!memoryMessages[conversationId]) {
    memoryMessages[conversationId] = [];
  }
  memoryMessages[conversationId].push(newMessage);

  // 2. Update conversation record & move to top
  memoryConversations = memoryConversations.map((conv) => {
    if (conv.id === conversationId) {
      return {
        ...conv,
        lastMessageText: newMessage.text,
        lastMessageTimestamp: "Just now",
        lastMessageSenderRole: "teacher",
        updatedAt: now.toISOString(),
      };
    }
    return conv;
  });

  return newMessage;
}

/**
 * Mark a conversation's messages as read.
 */
export async function apiMarkConversationAsRead(
  conversationId: string
): Promise<void> {
  // ============================================================================
  // [BACKEND API INTEGRATION POINT: MARK AS READ]
  // In production:
  // await fetch(`/api/teacher/conversations/${conversationId}/read`, { method: "POST" });
  // ============================================================================

  await new Promise((resolve) => setTimeout(resolve, 150));

  memoryConversations = memoryConversations.map((conv) => {
    if (conv.id === conversationId) {
      return { ...conv, unreadCount: 0 };
    }
    return conv;
  });

  if (memoryMessages[conversationId]) {
    memoryMessages[conversationId] = memoryMessages[conversationId].map((m) => ({
      ...m,
      status: "read",
    }));
  }
}
