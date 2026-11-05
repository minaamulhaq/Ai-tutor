import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ensureBookingSystemSchema } from "@/lib/db/init";

export type NotificationType =
  | "booking_requested"
  | "booking_approved"
  | "booking_rejected"
  | "booking_cancelled"
  | "meet_ready"
  | "calendar_error"
  | "reminder"
  | "general";

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedBookingId?: string;
}

/**
 * Creates an in-app notification in Supabase Postgres.
 */
export async function createNotification(params: CreateNotificationParams) {
  await ensureBookingSystemSchema();
  try {
    const [inserted] = await db
      .insert(notifications)
      .values({
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        relatedBookingId: params.relatedBookingId,
        isRead: false,
      })
      .returning();

    return inserted;
  } catch (err) {
    console.warn("Notice: createNotification error:", err);
    return null;
  }
}

/**
 * Fetches recent notifications for a user.
 */
export async function getUserNotifications(userId: string, limitCount = 20) {
  await ensureBookingSystemSchema();
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limitCount);
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  await ensureBookingSystemSchema();
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

/**
 * Marks all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId: string) {
  await ensureBookingSystemSchema();
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}
