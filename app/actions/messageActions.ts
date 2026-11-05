"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  users,
  teacherProfiles,
  studentProfiles,
  bookings,
  classSessions,
  conversations,
  conversationParticipants,
  messages,
  messageAttachments,
} from "@/db/schema";
import { eq, and, or, desc, asc, sql, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureMessagingSystemSchema } from "@/lib/db/initMessagingSchema";
import { ensureRealTeachersSeeded } from "@/lib/db/seedRealTeachers";
import {
  Conversation,
  Message,
  ConversationFilter,
  MessageSender,
  ClassInvitationPayload,
  MessageAttachment,
} from "@/types/message";
import { createNotification } from "@/services/notificationService";

// Standard demo student user fallback if not logged in
const DEFAULT_DEMO_STUDENT_ID = "00000000-0000-0000-0000-000000000001";
const DEFAULT_DEMO_TEACHER_ID = "11111111-1111-4111-a111-111111111111"; // Dr. Alexander Wright

/**
 * Helper to get currently authenticated user or graceful fallback
 */
export async function getAuthenticatedMessagingUser() {
  await ensureMessagingSystemSchema();
  await ensureRealTeachersSeeded();

  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (authData?.user) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, authData.user.id))
        .limit(1);

      if (dbUser) {
        return {
          id: dbUser.id,
          role: dbUser.role as "student" | "teacher" | "admin",
          fullName: dbUser.fullName,
          avatarUrl: dbUser.avatarUrl || undefined,
          email: dbUser.email,
        };
      }

      // If user exists in auth but not in users table, upsert them
      const [newUser] = await db
        .insert(users)
        .values({
          id: authData.user.id,
          email: authData.user.email || "user@zuhdemy.com",
          fullName: authData.user.user_metadata?.full_name || "Student User",
          role: (authData.user.user_metadata?.role as any) || "student",
          avatarUrl: authData.user.user_metadata?.avatar_url || null,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: { updatedAt: new Date() },
        })
        .returning();

      return {
        id: newUser.id,
        role: newUser.role as "student" | "teacher" | "admin",
        fullName: newUser.fullName,
        avatarUrl: newUser.avatarUrl || undefined,
        email: newUser.email,
      };
    }
  } catch (err) {
    console.warn("[Auth notice in messaging]", err);
  }

  // Ensure default demo student exists in database
  try {
    await db
      .insert(users)
      .values({
        id: DEFAULT_DEMO_STUDENT_ID,
        email: "demo.student@zuhdemy.com",
        fullName: "Zainab Fatima",
        role: "student",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
      })
      .onConflictDoNothing();
  } catch {}

  return {
    id: DEFAULT_DEMO_STUDENT_ID,
    role: "student" as const,
    fullName: "Zainab Fatima",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
    email: "demo.student@zuhdemy.com",
  };
}

/**
 * Format timestamp nicely: e.g. "10:45 AM"
 */
function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  });
}

/**
 * Format date nicely: e.g. "Today", "Yesterday", "Oct 24"
 */
function formatMessageDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) {
    return "Today";
  }
  if (target.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: target.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * 1. Seed interactive demo conversations if database has 0 conversations
 */
async function ensureSeedConversations(currentUserId: string) {
  try {
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversations);

    if (Number(existing[0]?.count || 0) > 0) return;

    // Get 3 seed teachers from Postgres
    const seedTeachers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        headline: teacherProfiles.headline,
        hourlyRate: teacherProfiles.hourlyRatePkr,
        subjects: teacherProfiles.subjects,
      })
      .from(users)
      .innerJoin(teacherProfiles, eq(users.id, teacherProfiles.userId))
      .limit(3);

    if (!seedTeachers.length) return;

    for (let i = 0; i < seedTeachers.length; i++) {
      const teacher = seedTeachers[i];
      const isFirst = i === 0;

      const [newConv] = await db
        .insert(conversations)
        .values({
          studentId: currentUserId,
          teacherId: teacher.id,
          lastMessage: isFirst
            ? "I've sent you the slot invite for our Binary Trees walkthrough on Saturday!"
            : "Great job on the practice worksheet! See you in class.",
          lastMessageAt: new Date(Date.now() - i * 3600 * 1000 * 12),
          lastSenderId: teacher.id,
          unreadStudentCount: isFirst ? 2 : 0,
          unreadTeacherCount: 0,
          isPinned: isFirst,
        })
        .returning();

      // Conversation participants
      await db.insert(conversationParticipants).values([
        {
          conversationId: newConv.id,
          userId: currentUserId,
          isPinned: isFirst,
        },
        {
          conversationId: newConv.id,
          userId: teacher.id,
        },
      ]);

      // Seed messages
      await db.insert(messages).values([
        {
          conversationId: newConv.id,
          senderId: currentUserId,
          receiverId: teacher.id,
          content: "Hello! I would like to review binary search trees and exam past papers for my upcoming test.",
          messageType: "text",
          status: "read",
          createdAt: new Date(Date.now() - 3600 * 1000 * 24),
        },
        {
          conversationId: newConv.id,
          senderId: teacher.id,
          receiverId: currentUserId,
          content: "Welcome! That's a great topic. I've scheduled our live whiteboard session.",
          messageType: "text",
          status: "read",
          createdAt: new Date(Date.now() - 3600 * 1000 * 18),
        },
        {
          conversationId: newConv.id,
          senderId: teacher.id,
          receiverId: currentUserId,
          content: "I've sent you the slot invite for our Binary Trees walkthrough on Saturday!",
          messageType: "class_invitation",
          status: isFirst ? "delivered" : "read",
          invitationData: {
            topicTitle: "Binary Search Trees & Heap Operations",
            date: "Saturday, Oct 24",
            time: "04:00 PM - 05:00 PM",
            durationMinutes: 60,
            feePKR: teacher.hourlyRate || 3500,
            meetingPlatform: "Google Meet",
            status: "pending",
          },
          createdAt: new Date(Date.now() - 3600 * 1000 * 2),
        },
      ]);
    }
  } catch (err) {
    console.warn("Notice: ensureSeedConversations:", err);
  }
}

/**
 * 2. Get Conversations List
 * Fetches all conversations for current user with unread counts and other participant details
 */
export async function getConversationsAction(
  filter: ConversationFilter = "all",
  searchQuery?: string
): Promise<{ success: boolean; data: Conversation[]; error?: string }> {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    await ensureSeedConversations(currentUser.id);

    // Fetch conversations where user is student or teacher
    const rawConversations = await db
      .select({
        conv: conversations,
        student: {
          id: users.id,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          role: users.role,
        },
      })
      .from(conversations)
      .innerJoin(users, eq(conversations.studentId, users.id))
      .where(
        or(
          eq(conversations.studentId, currentUser.id),
          eq(conversations.teacherId, currentUser.id)
        )
      )
      .orderBy(desc(conversations.isPinned), desc(conversations.lastMessageAt));

    const result: Conversation[] = [];

    for (const item of rawConversations) {
      const c = item.conv;
      const isStudent = currentUser.id === c.studentId;
      const partnerId = isStudent ? c.teacherId : c.studentId;

      // Fetch partner user record
      const [partnerUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, partnerId))
        .limit(1);

      if (!partnerUser) continue;

      // Fetch partner teacher profile if partner is teacher
      const [partnerTeacher] = await db
        .select()
        .from(teacherProfiles)
        .where(eq(teacherProfiles.userId, partnerId))
        .limit(1);

      // Fetch user-specific participant preferences (pinned, muted, archived)
      const [pref] = await db
        .select()
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, c.id),
            eq(conversationParticipants.userId, currentUser.id)
          )
        )
        .limit(1);

      const isArchived = pref?.isArchived ?? c.isArchived;
      const isPinned = pref?.isPinned ?? c.isPinned;
      const isMuted = pref?.isMuted ?? false;

      // Filter logic
      if (filter === "archived" && !isArchived) continue;
      if (filter !== "archived" && isArchived) continue;

      const unreadCount = isStudent ? c.unreadStudentCount : c.unreadTeacherCount;
      if (filter === "unread" && unreadCount <= 0) continue;

      // Query upcoming class between student and teacher
      const [upcomingBooking] = await db
        .select({
          bookingId: bookings.id,
          subject: bookings.subject,
          topicTitle: bookings.topicTitle,
          startTime: bookings.startTime,
          endTime: bookings.endTime,
          status: bookings.status,
          meetingUrl: classSessions.meetingUrl,
        })
        .from(bookings)
        .leftJoin(classSessions, eq(bookings.id, classSessions.bookingId))
        .where(
          and(
            eq(bookings.studentId, c.studentId),
            eq(bookings.teacherId, c.teacherId),
            or(eq(bookings.status, "confirmed"), eq(bookings.status, "pending")),
            sql`${bookings.startTime} >= now()`
          )
        )
        .orderBy(asc(bookings.startTime))
        .limit(1);

      let upcomingClass: Conversation["upcomingClass"] = undefined;
      if (upcomingBooking) {
        const start = new Date(upcomingBooking.startTime);
        upcomingClass = {
          date: start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          time: `${formatMessageTime(start)} PKT`,
          topic: upcomingBooking.topicTitle || upcomingBooking.subject,
          meetingUrl: upcomingBooking.meetingUrl || undefined,
          bookingId: upcomingBooking.bookingId,
        };
      }

      if (filter === "sessions" && !upcomingClass) continue;

      // Search query filter
      if (searchQuery && searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = partnerUser.fullName.toLowerCase().includes(q);
        const matchesSubject = (partnerTeacher?.subjects || []).some((s) => s.toLowerCase().includes(q));
        const matchesLastMsg = (c.lastMessage || "").toLowerCase().includes(q);
        if (!matchesName && !matchesSubject && !matchesLastMsg) continue;
      }

      const senderRole: MessageSender = c.lastSenderId === c.teacherId ? "teacher" : "student";

      result.push({
        id: c.id,
        participant: {
          id: partnerUser.id,
          fullName: partnerUser.fullName,
          role: partnerUser.role as any,
          avatarUrl: partnerUser.avatarUrl || undefined,
          headline: partnerTeacher?.headline || (partnerUser.role === "teacher" ? "Instructor" : "Student"),
          subject: partnerTeacher?.subjects?.[0] || "General Tutoring",
          hourlyRatePkr: partnerTeacher?.hourlyRatePkr || 2500,
          isOnline: true, // active
          lastSeen: "Active recently",
          isVerified: partnerTeacher?.isVerified ?? true,
          bio: partnerTeacher?.aboutMe || "",
          totalCompletedSessions: 8,
        },
        teacherId: isStudent ? partnerUser.id : currentUser.id,
        teacherName: isStudent ? partnerUser.fullName : currentUser.fullName,
        teacherAvatarUrl: isStudent ? partnerUser.avatarUrl || undefined : currentUser.avatarUrl || undefined,
        teacherHeadline: partnerTeacher?.headline || "Instructor",
        teacherSubject: partnerTeacher?.subjects?.[0] || "General Tutoring",
        teacherHourlyRate: partnerTeacher?.hourlyRatePkr || 2500,
        teacherIsOnline: true,
        teacherLastSeen: "Active recently",
        isVerified: partnerTeacher?.isVerified ?? true,

        studentId: isStudent ? currentUser.id : partnerUser.id,
        studentName: isStudent ? currentUser.fullName : partnerUser.fullName,
        studentAvatarUrl: isStudent ? currentUser.avatarUrl || undefined : partnerUser.avatarUrl || undefined,

        unreadCount,
        lastMessage: {
          content: c.lastMessage || "No messages yet. Say hello!",
          timestamp: formatMessageTime(new Date(c.lastMessageAt)),
          senderRole,
          senderId: c.lastSenderId || undefined,
          isRead: unreadCount === 0,
        },
        upcomingClass,
        isArchived,
        isPinned,
        isMuted,
        updatedAt: c.updatedAt.toISOString(),
      });
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.error("getConversationsAction error:", err);
    return { success: false, data: [], error: err?.message || "Failed to load conversations" };
  }
}

/**
 * 3. Get or Create Conversation with a Specific User (Idempotent 1-on-1)
 */
export async function getOrCreateConversationAction(
  targetUserId: string
): Promise<{ success: boolean; conversation?: Conversation; error?: string }> {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    if (currentUser.id === targetUserId) {
      return { success: false, error: "You cannot start a conversation with yourself." };
    }

    // Determine who is student and who is teacher
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, targetUserId))
      .limit(1);

    if (!targetUser) {
      return { success: false, error: "User profile not found." };
    }

    let studentId = currentUser.id;
    let teacherId = targetUserId;

    if (currentUser.role === "teacher" && targetUser.role === "student") {
      studentId = targetUserId;
      teacherId = currentUser.id;
    }

    // Check if conversation already exists between student and teacher
    let [existingConv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.studentId, studentId),
          eq(conversations.teacherId, teacherId)
        )
      )
      .limit(1);

    if (!existingConv) {
      // Create new conversation
      const [created] = await db
        .insert(conversations)
        .values({
          studentId,
          teacherId,
          lastMessage: "Conversation started.",
          lastMessageAt: new Date(),
          lastSenderId: currentUser.id,
          unreadStudentCount: 0,
          unreadTeacherCount: 0,
        })
        .returning();

      existingConv = created;

      // Add participants
      await db.insert(conversationParticipants).values([
        { conversationId: existingConv.id, userId: studentId },
        { conversationId: existingConv.id, userId: teacherId },
      ]);
    }

    // Fetch full conversation details to return
    const convs = await getConversationsAction("all");
    const found = convs.data?.find((c) => c.id === existingConv.id);

    return { success: true, conversation: found };
  } catch (err: any) {
    console.error("getOrCreateConversationAction error:", err);
    return { success: false, error: err?.message || "Failed to create conversation" };
  }
}

/**
 * 4. Get Messages for a Conversation (Chronological order)
 */
export async function getMessagesAction(
  conversationId: string,
  limitCount = 60
): Promise<{ success: boolean; data: Message[]; error?: string }> {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    // Verify user is participant
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.studentId, currentUser.id),
            eq(conversations.teacherId, currentUser.id)
          )
        )
      )
      .limit(1);

    if (!conv) {
      return { success: false, data: [], error: "Conversation not found or unauthorized access." };
    }

    // Fetch messages
    const rawMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limitCount);

    // Fetch all attachments for these messages in 1 query
    const messageIds = rawMessages.map((m) => m.id);
    let allAttachments: any[] = [];
    if (messageIds.length > 0) {
      allAttachments = await db
        .select()
        .from(messageAttachments)
        .where(sql`${messageAttachments.messageId} IN ${messageIds}`);
    }

    const attachmentsByMessageId = new Map<string, MessageAttachment[]>();
    for (const att of allAttachments) {
      if (!attachmentsByMessageId.has(att.messageId)) {
        attachmentsByMessageId.set(att.messageId, []);
      }
      attachmentsByMessageId.get(att.messageId)!.push({
        id: att.id,
        name: att.fileName,
        sizeBytes: att.fileSize,
        fileType: att.fileType as any,
        url: att.fileUrl,
      });
    }

    const formattedMessages: Message[] = rawMessages.map((m) => {
      const createdDate = new Date(m.createdAt);
      const isFromTeacher = m.senderId === conv.teacherId;
      const senderRole: MessageSender = isFromTeacher ? "teacher" : "student";

      return {
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        receiverId: m.receiverId,
        senderRole,
        content: m.content,
        timestamp: formatMessageTime(createdDate),
        date: formatMessageDate(createdDate),
        status: m.status as any,
        type: m.messageType as any,
        invitation: (m.invitationData as any) || undefined,
        attachments: attachmentsByMessageId.get(m.id) || undefined,
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt ? m.readAt.toISOString() : undefined,
      };
    });

    return { success: true, data: formattedMessages };
  } catch (err: any) {
    console.error("getMessagesAction error:", err);
    return { success: false, data: [], error: err?.message || "Failed to load messages" };
  }
}

/**
 * 5. Send Message (Text, Class Invitation, File/Image Attachments)
 */
export async function sendMessageAction(params: {
  conversationId: string;
  content: string;
  messageType?: "text" | "class_invitation" | "file" | "image";
  attachments?: Array<{
    name: string;
    url: string;
    fileType: "pdf" | "image" | "doc" | "zip" | "other";
    sizeBytes: number;
    mimeType?: string;
  }>;
  invitation?: ClassInvitationPayload;
}): Promise<{ success: boolean; message?: Message; error?: string }> {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    const cleanContent = params.content.trim();
    if (!cleanContent && (!params.attachments || params.attachments.length === 0) && !params.invitation) {
      return { success: false, error: "Message content cannot be empty." };
    }

    if (cleanContent.length > 2000) {
      return { success: false, error: "Message is too long (maximum 2,000 characters)." };
    }

    // Verify conversation membership
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, params.conversationId),
          or(
            eq(conversations.studentId, currentUser.id),
            eq(conversations.teacherId, currentUser.id)
          )
        )
      )
      .limit(1);

    if (!conv) {
      return { success: false, error: "Conversation not found or access denied." };
    }

    const isStudent = currentUser.id === conv.studentId;
    const receiverId = isStudent ? conv.teacherId : conv.studentId;
    const messageType = params.messageType || (params.attachments?.length ? "file" : "text");

    // Insert message record
    const [newMsg] = await db
      .insert(messages)
      .values({
        conversationId: params.conversationId,
        senderId: currentUser.id,
        receiverId,
        content: cleanContent || (params.attachments?.length ? `Sent ${params.attachments.length} attachment(s)` : "Class invitation"),
        messageType,
        status: "sent",
        invitationData: params.invitation ? params.invitation : null,
      })
      .returning();

    // Insert attachments if present
    const insertedAttachments: MessageAttachment[] = [];
    if (params.attachments && params.attachments.length > 0) {
      for (const att of params.attachments) {
        const [savedAtt] = await db
          .insert(messageAttachments)
          .values({
            messageId: newMsg.id,
            fileName: att.name,
            fileUrl: att.url,
            fileType: att.fileType,
            fileSize: att.sizeBytes,
            mimeType: att.mimeType,
          })
          .returning();

        insertedAttachments.push({
          id: savedAtt.id,
          name: savedAtt.fileName,
          sizeBytes: savedAtt.fileSize,
          fileType: savedAtt.fileType as any,
          url: savedAtt.fileUrl,
        });
      }
    }

    // Update conversation metadata & unread counters
    const now = new Date();
    await db
      .update(conversations)
      .set({
        lastMessage: cleanContent || (params.attachments?.length ? "📎 Attachment" : "📅 Class Invitation"),
        lastMessageAt: now,
        lastSenderId: currentUser.id,
        unreadStudentCount: isStudent ? conv.unreadStudentCount : conv.unreadStudentCount + 1,
        unreadTeacherCount: isStudent ? conv.unreadTeacherCount + 1 : conv.unreadTeacherCount,
        updatedAt: now,
      })
      .where(eq(conversations.id, params.conversationId));

    // Send in-app notification to receiver
    await createNotification({
      userId: receiverId,
      title: `New message from ${currentUser.fullName}`,
      message: cleanContent.slice(0, 100) || "Sent an attachment",
      type: "general",
    });

    const createdDate = new Date(newMsg.createdAt);
    const formattedMessage: Message = {
      id: newMsg.id,
      conversationId: newMsg.conversationId,
      senderId: newMsg.senderId,
      receiverId: newMsg.receiverId,
      senderRole: isStudent ? "student" : "teacher",
      content: newMsg.content,
      timestamp: formatMessageTime(createdDate),
      date: formatMessageDate(createdDate),
      status: "sent",
      type: newMsg.messageType as any,
      invitation: (newMsg.invitationData as any) || undefined,
      attachments: insertedAttachments.length > 0 ? insertedAttachments : undefined,
      createdAt: newMsg.createdAt.toISOString(),
    };

    revalidatePath("/student/messages");
    revalidatePath("/teacher/messages");

    return { success: true, message: formattedMessage };
  } catch (err: any) {
    console.error("sendMessageAction error:", err);
    return { success: false, error: err?.message || "Failed to send message." };
  }
}

/**
 * 6. Mark Conversation Messages as Read
 */
export async function markConversationAsReadAction(conversationId: string) {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.studentId, currentUser.id),
            eq(conversations.teacherId, currentUser.id)
          )
        )
      )
      .limit(1);

    if (!conv) return { success: false, error: "Conversation not found" };

    const isStudent = currentUser.id === conv.studentId;

    // Reset unread count for current user role
    await db
      .update(conversations)
      .set({
        unreadStudentCount: isStudent ? 0 : conv.unreadStudentCount,
        unreadTeacherCount: isStudent ? conv.unreadTeacherCount : 0,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    // Mark unread messages sent to current user as read
    await db
      .update(messages)
      .set({
        status: "read",
        readAt: new Date(),
      })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.receiverId, currentUser.id),
          sql`${messages.status} != 'read'`
        )
      );

    // Update participant last read timestamp
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, currentUser.id)
        )
      );

    return { success: true };
  } catch (err: any) {
    console.warn("markConversationAsReadAction notice:", err);
    return { success: false, error: err?.message };
  }
}

/**
 * 7. Manage Conversation (Pin, Mute, Archive)
 */
export async function togglePinConversationAction(conversationId: string, isPinned: boolean) {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    await db
      .insert(conversationParticipants)
      .values({
        conversationId,
        userId: currentUser.id,
        isPinned,
      })
      .onConflictDoUpdate({
        target: [conversationParticipants.conversationId, conversationParticipants.userId],
        set: { isPinned, updatedAt: new Date() },
      });

    return { success: true, isPinned };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function toggleMuteConversationAction(conversationId: string, isMuted: boolean) {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    await db
      .insert(conversationParticipants)
      .values({
        conversationId,
        userId: currentUser.id,
        isMuted,
      })
      .onConflictDoUpdate({
        target: [conversationParticipants.conversationId, conversationParticipants.userId],
        set: { isMuted, updatedAt: new Date() },
      });

    return { success: true, isMuted };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function toggleArchiveConversationAction(conversationId: string, isArchived: boolean) {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    await db
      .insert(conversationParticipants)
      .values({
        conversationId,
        userId: currentUser.id,
        isArchived,
      })
      .onConflictDoUpdate({
        target: [conversationParticipants.conversationId, conversationParticipants.userId],
        set: { isArchived, updatedAt: new Date() },
      });

    return { success: true, isArchived };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * 8. Delete Message (Sender Only)
 */
export async function deleteMessageAction(messageId: string) {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    const [msg] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!msg) {
      return { success: false, error: "Message not found." };
    }

    if (msg.senderId !== currentUser.id) {
      return { success: false, error: "You can only delete your own messages." };
    }

    await db.delete(messages).where(eq(messages.id, messageId));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete message." };
  }
}

/**
 * 9. Get Total Unread Message Count for Navbar & Sidebar Badges
 */
export async function getUnreadMessageCountAction(): Promise<number> {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    const result = await db
      .select({
        studentUnread: sql<number>`COALESCE(SUM(CASE WHEN ${conversations.studentId} = ${currentUser.id} THEN ${conversations.unreadStudentCount} ELSE 0 END), 0)`,
        teacherUnread: sql<number>`COALESCE(SUM(CASE WHEN ${conversations.teacherId} = ${currentUser.id} THEN ${conversations.unreadTeacherCount} ELSE 0 END), 0)`,
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.studentId, currentUser.id),
          eq(conversations.teacherId, currentUser.id)
        )
      );

    const total = Number(result[0]?.studentUnread || 0) + Number(result[0]?.teacherUnread || 0);
    return total;
  } catch {
    return 0;
  }
}

/**
 * 10. Directory Search for "New Message" Modal
 */
export async function getDirectoryUsersAction(searchQuery?: string) {
  try {
    await ensureMessagingSystemSchema();
    const currentUser = await getAuthenticatedMessagingUser();

    // If current user is student, list verified teachers
    if (currentUser.role === "student") {
      let query = db
        .select({
          id: users.id,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          role: users.role,
          headline: teacherProfiles.headline,
          subject: teacherProfiles.subjects,
          hourlyRate: teacherProfiles.hourlyRatePkr,
        })
        .from(users)
        .innerJoin(teacherProfiles, eq(users.id, teacherProfiles.userId));

      const teachers = await query.limit(20);

      return teachers
        .filter((t) => t.id !== currentUser.id)
        .filter((t) => {
          if (!searchQuery?.trim()) return true;
          const q = searchQuery.toLowerCase().trim();
          return (
            t.fullName.toLowerCase().includes(q) ||
            (t.headline || "").toLowerCase().includes(q) ||
            (t.subject || []).some((s) => s.toLowerCase().includes(q))
          );
        })
        .map((t) => ({
          id: t.id,
          fullName: t.fullName,
          avatarUrl: t.avatarUrl || undefined,
          role: "teacher" as const,
          headline: t.headline || "Verified Instructor",
          subject: t.subject?.[0] || "General Tutoring",
          hourlyRatePkr: t.hourlyRate || 2500,
        }));
    } else {
      // If current user is teacher, list students who enrolled or booked
      const students = await db
        .selectDistinct({
          id: users.id,
          fullName: users.fullName,
          avatarUrl: users.avatarUrl,
          role: users.role,
        })
        .from(users)
        .where(eq(users.role, "student"))
        .limit(20);

      return students
        .filter((s) => s.id !== currentUser.id)
        .filter((s) => {
          if (!searchQuery?.trim()) return true;
          const q = searchQuery.toLowerCase().trim();
          return s.fullName.toLowerCase().includes(q);
        })
        .map((s) => ({
          id: s.id,
          fullName: s.fullName,
          avatarUrl: s.avatarUrl || undefined,
          role: "student" as const,
          headline: "Student",
          subject: "Enrolled Student",
        }));
    }
  } catch (err) {
    console.warn("getDirectoryUsersAction error:", err);
    return [];
  }
}
