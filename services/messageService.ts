/**
 * ZuhDemy Message Service & Mock Data Layer
 * Provides conversation querying, real-time message sending, unread badges,
 * and class invitation actions ready for WebSocket or Supabase Realtime integration.
 */

import {
  Conversation,
  Message,
  ConversationFilter,
  MessageAttachment,
} from "@/types/message";
import { SEED_TEACHERS } from "./teacherService";

// ============================================================================
// INITIAL SEED CONVERSATIONS
// ============================================================================
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_01",
    teacherId: "usr_teach_01",
    teacherName: "Dr. Alexander Wright",
    teacherAvatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    teacherHeadline: "Senior Computer Science Instructor & AI Researcher",
    teacherSubject: "Computer Science",
    teacherHourlyRate: 3500,
    teacherIsOnline: true,
    isVerified: true,
    unreadCount: 2,
    lastMessage: {
      content: "I've sent you the slot invite for our Binary Trees walkthrough on Saturday!",
      timestamp: "10:45 AM",
      senderRole: "teacher",
      isRead: false,
    },
    upcomingClass: {
      date: "Saturday, Oct 24",
      time: "04:00 PM - 05:00 PM",
      topic: "Binary Search Trees & Heap Operations",
    },
    isPinned: true,
  },
  {
    id: "conv_02",
    teacherId: "usr_teach_02",
    teacherName: "Ayesha Malik",
    teacherAvatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    teacherHeadline: "Cambridge O & A-Levels Mathematics & Calculus Specialist",
    teacherSubject: "Mathematics",
    teacherHourlyRate: 2800,
    teacherIsOnline: true,
    teacherLastSeen: "Active 5m ago",
    isVerified: true,
    unreadCount: 0,
    lastMessage: {
      content: "Great job on the derivative chain rule worksheet! Review questions 4 and 7 before our next session.",
      timestamp: "Yesterday",
      senderRole: "teacher",
      isRead: true,
    },
    upcomingClass: {
      date: "Monday, Oct 26",
      time: "10:00 AM - 11:00 AM",
      topic: "Definite Integrals & Area Under Curves",
    },
    isPinned: false,
  },
  {
    id: "conv_03",
    teacherId: "usr_teach_03",
    teacherName: "Dr. Bilal Siddiqui",
    teacherAvatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    teacherHeadline: "Assistant Professor of Physics & Mechanics",
    teacherSubject: "Physics",
    teacherHourlyRate: 4200,
    teacherIsOnline: false,
    teacherLastSeen: "Active 2h ago",
    isVerified: true,
    unreadCount: 0,
    lastMessage: {
      content: "Sounds good! Make sure to memorize the conservation of momentum equations.",
      timestamp: "Oct 19",
      senderRole: "teacher",
      isRead: true,
    },
    isPinned: false,
  },
  {
    id: "conv_04",
    teacherId: "usr_teach_04",
    teacherName: "Zainab Tariq",
    teacherAvatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    teacherHeadline: "Medical Biochemist & Biology Teacher",
    teacherSubject: "Biology",
    teacherHourlyRate: 2500,
    teacherIsOnline: false,
    teacherLastSeen: "Active yesterday",
    isVerified: true,
    unreadCount: 0,
    lastMessage: {
      content: "Thank you for the detailed feedback. I will book another session soon!",
      timestamp: "Oct 16",
      senderRole: "student",
      isRead: true,
    },
    isArchived: true,
  },
];

// ============================================================================
// INITIAL SEED MESSAGES BY CONVERSATION
// ============================================================================
const INITIAL_MESSAGES: Record<string, Message[]> = {
  conv_01: [
    {
      id: "msg_01_1",
      conversationId: "conv_01",
      senderId: "usr_teach_01",
      senderRole: "teacher",
      content: "Hi Muhammad! How did the recursion problem set go that we discussed in our last session?",
      timestamp: "09:30 AM",
      date: "Today",
      status: "read",
      type: "text",
    },
    {
      id: "msg_01_2",
      conversationId: "conv_01",
      senderId: "student_current",
      senderRole: "student",
      content: "Hello Dr. Alexander! I solved the first 4 problems, but I had trouble visualizing tree traversal order (inorder vs postorder).",
      timestamp: "09:45 AM",
      date: "Today",
      status: "read",
      type: "text",
    },
    {
      id: "msg_01_3",
      conversationId: "conv_01",
      senderId: "usr_teach_01",
      senderRole: "teacher",
      content: "That's completely normal when starting with hierarchical data structures. Let's do a dedicated 1-on-1 session to construct visual call-stack diagrams together.",
      timestamp: "10:15 AM",
      date: "Today",
      status: "read",
      type: "text",
    },
    {
      id: "msg_01_4",
      conversationId: "conv_01",
      senderId: "usr_teach_01",
      senderRole: "teacher",
      content: "Here is the session invitation for Saturday afternoon at 4:00 PM. Please accept to lock in the calendar slot.",
      timestamp: "10:44 AM",
      date: "Today",
      status: "delivered",
      type: "class_invitation",
      invitation: {
        topicTitle: "Binary Search Trees & Call-Stack Recursion",
        date: "Saturday, Oct 24, 2026",
        time: "04:00 PM - 05:00 PM (PKT)",
        durationMinutes: 60,
        feePKR: 3500,
        meetingPlatform: "Google Meet",
        status: "pending",
      },
    },
    {
      id: "msg_01_5",
      conversationId: "conv_01",
      senderId: "usr_teach_01",
      senderRole: "teacher",
      content: "I've sent you the slot invite for our Binary Trees walkthrough on Saturday!",
      timestamp: "10:45 AM",
      date: "Today",
      status: "delivered",
      type: "text",
    },
  ],

  conv_02: [
    {
      id: "msg_02_1",
      conversationId: "conv_02",
      senderId: "student_current",
      senderRole: "student",
      content: "Assalam-o-Alaikum Ma'am Ayesha! Could you share the derivative rule cheat-sheet we used in class?",
      timestamp: "02:15 PM",
      date: "Yesterday",
      status: "read",
      type: "text",
    },
    {
      id: "msg_02_2",
      conversationId: "conv_02",
      senderId: "usr_teach_02",
      senderRole: "teacher",
      content: "Walaikum Assalam! Yes, here is the Cambridge formula sheet with my highlighted exam tips:",
      timestamp: "02:30 PM",
      date: "Yesterday",
      status: "read",
      type: "file",
      attachments: [
        {
          id: "att_01",
          name: "Calculus_Derivatives_CheatSheet.pdf",
          sizeBytes: 1845000,
          fileType: "pdf",
          url: "#",
        },
      ],
    },
    {
      id: "msg_02_3",
      conversationId: "conv_02",
      senderId: "usr_teach_02",
      senderRole: "teacher",
      content: "Great job on the derivative chain rule worksheet! Review questions 4 and 7 before our next session.",
      timestamp: "02:32 PM",
      date: "Yesterday",
      status: "read",
      type: "text",
    },
  ],

  conv_03: [
    {
      id: "msg_03_1",
      conversationId: "conv_03",
      senderId: "student_current",
      senderRole: "student",
      content: "Dr. Bilal, will our upcoming physics quiz include projectile motion with air resistance?",
      timestamp: "11:20 AM",
      date: "Oct 19",
      status: "read",
      type: "text",
    },
    {
      id: "msg_03_2",
      conversationId: "conv_03",
      senderId: "usr_teach_03",
      senderRole: "teacher",
      content: "No, O/A-Levels syllabus only tests ideal projectile motion (vacuum approximation). Don't worry about non-linear air drag.",
      timestamp: "11:45 AM",
      date: "Oct 19",
      status: "read",
      type: "text",
    },
    {
      id: "msg_03_3",
      conversationId: "conv_03",
      senderId: "usr_teach_03",
      senderRole: "teacher",
      content: "Sounds good! Make sure to memorize the conservation of momentum equations.",
      timestamp: "11:46 AM",
      date: "Oct 19",
      status: "read",
      type: "text",
    },
  ],

  conv_04: [
    {
      id: "msg_04_1",
      conversationId: "conv_04",
      senderId: "usr_teach_04",
      senderRole: "teacher",
      content: "Hello! I reviewed your cellular respiration test. You scored 92%!",
      timestamp: "04:10 PM",
      date: "Oct 16",
      status: "read",
      type: "text",
    },
    {
      id: "msg_04_2",
      conversationId: "conv_04",
      senderId: "student_current",
      senderRole: "student",
      content: "Thank you for the detailed feedback. I will book another session soon!",
      timestamp: "05:00 PM",
      date: "Oct 16",
      status: "read",
      type: "text",
    },
  ],
};

// In-memory working copies for dynamic state
let conversationsStore: Conversation[] = JSON.parse(JSON.stringify(INITIAL_CONVERSATIONS));
let messagesStore: Record<string, Message[]> = JSON.parse(JSON.stringify(INITIAL_MESSAGES));

// ============================================================================
// PUBLIC SERVICE API
// ============================================================================

export async function fetchConversations(
  filter: ConversationFilter = "all",
  search: string = ""
): Promise<Conversation[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  let list = [...conversationsStore];

  // Apply search query
  if (search.trim() !== "") {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.teacherName.toLowerCase().includes(q) ||
        c.teacherSubject.toLowerCase().includes(q) ||
        c.lastMessage.content.toLowerCase().includes(q)
    );
  }

  // Apply category filter
  switch (filter) {
    case "unread":
      return list.filter((c) => c.unreadCount > 0);
    case "sessions":
      return list.filter((c) => Boolean(c.upcomingClass));
    case "archived":
      return list.filter((c) => Boolean(c.isArchived));
    case "all":
    default:
      return list.filter((c) => !c.isArchived);
  }
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return messagesStore[conversationId] ? [...messagesStore[conversationId]] : [];
}

export async function sendMessage(
  conversationId: string,
  content: string,
  attachments?: MessageAttachment[]
): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId: "student_current",
    senderRole: "student",
    content: content.trim(),
    timestamp: timeString,
    date: "Today",
    status: "sent",
    type: attachments && attachments.length > 0 ? "file" : "text",
    attachments,
  };

  if (!messagesStore[conversationId]) {
    messagesStore[conversationId] = [];
  }
  messagesStore[conversationId].push(newMessage);

  // Update conversation's last message
  const conv = conversationsStore.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = {
      content: newMessage.content || (attachments ? "Sent an attachment" : ""),
      timestamp: timeString,
      senderRole: "student",
      isRead: true,
    };
  }

  return newMessage;
}

export async function markConversationAsRead(conversationId: string): Promise<void> {
  const conv = conversationsStore.find((c) => c.id === conversationId);
  if (conv && conv.unreadCount > 0) {
    conv.unreadCount = 0;
    conv.lastMessage.isRead = true;
  }

  if (messagesStore[conversationId]) {
    messagesStore[conversationId].forEach((m) => {
      if (m.senderRole === "teacher") {
        m.status = "read";
      }
    });
  }
}

export async function acceptClassInvitation(
  conversationId: string,
  messageId: string
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const msgs = messagesStore[conversationId];
  if (!msgs) return false;

  const msg = msgs.find((m) => m.id === messageId);
  if (msg && msg.invitation) {
    msg.invitation.status = "accepted";

    // Set as upcoming class on conversation
    const conv = conversationsStore.find((c) => c.id === conversationId);
    if (conv) {
      conv.upcomingClass = {
        date: msg.invitation.date,
        time: msg.invitation.time,
        topic: msg.invitation.topicTitle,
      };
    }
    return true;
  }
  return false;
}

export async function getOrCreateConversationByTeacherId(
  teacherId: string
): Promise<Conversation> {
  const existing = conversationsStore.find((c) => c.teacherId === teacherId);
  if (existing) {
    return existing;
  }

  // Create new conversation from SEED_TEACHERS if found
  const teacher = SEED_TEACHERS.find((t) => t.id === teacherId);
  const newConv: Conversation = {
    id: `conv_${Date.now()}`,
    teacherId,
    teacherName: teacher ? teacher.name : "Instructor",
    teacherAvatarUrl: teacher ? teacher.avatarUrl : undefined,
    teacherHeadline: teacher ? teacher.headline : "Instructor",
    teacherSubject: teacher && teacher.subjects[0] ? teacher.subjects[0] : "General",
    teacherHourlyRate: teacher ? teacher.hourlyRate : 3000,
    teacherIsOnline: true,
    isVerified: true,
    unreadCount: 0,
    lastMessage: {
      content: "Conversation started. Say hi to introduce yourself!",
      timestamp: "Just now",
      senderRole: "system",
      isRead: true,
    },
  };

  conversationsStore.unshift(newConv);
  messagesStore[newConv.id] = [
    {
      id: `msg_init_${Date.now()}`,
      conversationId: newConv.id,
      senderId: "system",
      senderRole: "system",
      content: `You started a new conversation with ${newConv.teacherName}. Discuss goals, lesson schedules, or ask any subject questions.`,
      timestamp: "Just now",
      date: "Today",
      status: "read",
      type: "text",
    },
  ];

  return newConv;
}
