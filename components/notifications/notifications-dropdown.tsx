"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Calendar,
  CheckCircle2,
  XCircle,
  Video,
  Clock,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getMyNotificationsAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/app/actions/notificationActions";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedBookingId?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsDropdownProps {
  userRole?: "student" | "teacher";
}

export function NotificationsDropdown({ userRole = "student" }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await getMyNotificationsAction();
      if (res && res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.warn("Notice: getMyNotificationsAction error:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await markNotificationAsReadAction(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllNotificationsAsReadAction();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "booking_approved":
        return <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />;
      case "booking_requested":
        return <Calendar className="size-4 text-orange-600 shrink-0" />;
      case "booking_rejected":
      case "booking_cancelled":
        return <XCircle className="size-4 text-rose-600 shrink-0" />;
      case "meet_ready":
        return <Video className="size-4 text-emerald-600 shrink-0" />;
      case "calendar_error":
        return <AlertCircle className="size-4 text-amber-600 shrink-0" />;
      default:
        return <Clock className="size-4 text-slate-500 shrink-0" />;
    }
  };

  const targetLink = userRole === "teacher" ? "/teacher/classes" : "/student/classes";

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="relative size-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 bg-orange-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl p-0 overflow-hidden z-50"
      >
        {/* Header */}
        <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
            {unreadCount > 0 && (
              <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <Check className="size-3" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-8 text-center space-y-1">
              <Bell className="size-6 text-slate-300 mx-auto stroke-1" />
              <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
              <p className="text-[11px] text-slate-400">
                Booking updates and Google Meet alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Link
                key={notif.id}
                href={targetLink}
                onClick={() => {
                  if (!notif.isRead) handleMarkAsRead(notif.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer text-left block",
                  !notif.isRead && "bg-orange-50/40"
                )}
              >
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="size-1.5 rounded-full bg-orange-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(notif.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-slate-50/60 border-t border-slate-100 text-center">
          <Link
            href={targetLink}
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 block"
          >
            View My Classes Dashboard →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
