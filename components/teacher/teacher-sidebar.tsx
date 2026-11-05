"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUnreadMessageCountAction } from "@/app/actions/messageActions";
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  Users,
  BadgeDollarSign,
  MessageSquare,
  BookOpen,
  UserCheck,
  Settings,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/teacher",
    icon: LayoutDashboard,
  },
  {
    title: "My Availability",
    href: "/teacher/availability",
    icon: CalendarDays,
  },
  {
    title: "My Classes",
    href: "/teacher/classes",
    icon: GraduationCap,
  },
  {
    title: "Students",
    href: "/teacher/students",
    icon: Users,
  },
  {
    title: "Earnings",
    href: "/teacher/earnings",
    icon: BadgeDollarSign,
  },
  {
    title: "Messages",
    href: "/teacher/messages",
    icon: MessageSquare,
    badge: "3",
  },
  {
    title: "My Courses",
    href: "/teacher/courses",
    icon: BookOpen,
  },
  {
    title: "My Profile",
    href: "/teacher/profile",
    icon: UserCheck,
  },
  {
    title: "Settings",
    href: "/teacher/settings",
    icon: Settings,
  },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    getUnreadMessageCountAction()
      .then((count) => setUnreadCount(count))
      .catch(() => {});
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
        <Link href="/teacher" className="flex items-center gap-3 group">
          <div className="size-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1">
              Zuh<span className="text-orange-500">Demy</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">
              Teacher Studio
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
          Faculty Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/teacher" && pathname.startsWith(item.href)) ||
            (item.href === "/teacher/availability" && pathname.startsWith("/teacher/schedule"));

          const badgeValue =
            item.href === "/teacher/messages"
              ? unreadCount !== null
                ? unreadCount > 0
                  ? unreadCount > 9 ? "9+" : String(unreadCount)
                  : undefined
                : item.badge
              : item.badge;

          return (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative",
                isActive
                  ? "bg-orange-50 text-orange-600 font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-orange-500 rounded-r-full" />
              )}
              <Icon
                className={cn(
                  "size-4.5 shrink-0 transition-transform duration-150 group-hover:scale-110",
                  isActive
                    ? "text-orange-500"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="truncate flex-1">{item.title}</span>

              {badgeValue && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-orange-100 text-orange-700"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {badgeValue}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer: Teacher Profile */}
      <div className="p-3 border-t border-slate-200 mt-auto bg-slate-50/70">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              alt="Dr. Alexander Wright"
              className="size-9 rounded-full object-cover ring-2 ring-orange-500/20"
            />
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-900 truncate">
              Dr. Alexander Wright
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              Senior Instructor
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Trigger (Floating on small screens if not open) */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="size-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
