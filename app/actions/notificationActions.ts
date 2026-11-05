"use server";

import { createClient } from "@/utils/supabase/server";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/services/notificationService";

export async function getMyNotificationsAction() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return { notifications: [], unreadCount: 0 };
  }

  const list = await getUserNotifications(authData.user.id);
  const unreadCount = list.filter((n) => !n.isRead).length;

  return {
    notifications: list.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      relatedBookingId: n.relatedBookingId,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount,
  };
}

export async function markNotificationAsReadAction(notificationId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return { success: false };
  }

  await markNotificationAsRead(notificationId, authData.user.id);
  return { success: true };
}

export async function markAllNotificationsAsReadAction() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData?.user) {
    return { success: false };
  }

  await markAllNotificationsAsRead(authData.user.id);
  return { success: true };
}
