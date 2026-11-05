"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUnreadMessageCountAction } from "@/app/actions/messageActions";
import {
  LayoutDashboard,
  Compass,
  BookOpen,
  Heart,
  MessageSquare,
  CreditCard,
  User,
  Settings,
  LifeBuoy,
  Sparkles,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface StudentNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const primaryStudentNavItems: StudentNavItem[] = [
  {
    title: "Overview",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    title: "Find Teachers",
    href: "/student/find-teachers",
    icon: Compass,
  },
  {
    title: "My Classes",
    href: "/student/classes",
    icon: BookOpen,
  },
  {
    title: "Favorite Teachers",
    href: "/student/favorites",
    icon: Heart,
  },
  {
    title: "Messages",
    href: "/student/messages",
    icon: MessageSquare,
    badge: "2",
  },
  {
    title: "Payments & History",
    href: "/student/payments",
    icon: CreditCard,
  },
];

export const secondaryStudentNavItems: StudentNavItem[] = [
  {
    title: "My Profile",
    href: "/student/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/student/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/student/help",
    icon: LifeBuoy,
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    getUnreadMessageCountAction()
      .then((count) => setUnreadCount(count))
      .catch(() => {});
  }, [pathname]);

  // Fallback demo student identity (ready for Supabase session integration)
  const student = {
    name: "Sarah Jenkins",
    role: "Enrolled Student",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    initials: "SJ",
  };

  const renderNavLinks = (items: StudentNavItem[]) => {
    return items.map((item) => {
      const Icon = item.icon;
      // Active match check (also supports previewing on /teacher routes)
      const isActive =
        pathname === item.href ||
        (item.href !== "/student" && pathname.startsWith(item.href));

      const badgeValue =
        item.href === "/student/messages"
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
            "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative cursor-pointer",
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
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
        <Link href="/student" className="flex items-center gap-3 group">
          <div className="size-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1">
              Zuh<span className="text-orange-500">Demy</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">
              Student Portal
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main Learning Navigation */}
        <nav className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Learning Menu
          </div>
          {renderNavLinks(primaryStudentNavItems)}
        </nav>

        {/* Account & Support Section */}
        <nav className="space-y-1 pt-2 border-t border-slate-100">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            Account & Support
          </div>
          {renderNavLinks(secondaryStudentNavItems)}
        </nav>
      </div>

      {/* Sidebar Footer: Student Profile Card */}
      <div className="p-3 border-t border-slate-200 mt-auto bg-slate-50/70">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="relative shrink-0">
            <Avatar className="size-9 ring-2 ring-orange-500/20">
              <AvatarImage src={student.avatarUrl} alt={student.name} />
              <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                {student.initials}
              </AvatarFallback>
            </Avatar>
            <span
              className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
              title="Active Student"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-900 truncate">
              {student.name}
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              {student.role}
            </span>
          </div>
          <Link
            href="/student/settings"
            title="Account Settings"
            className="size-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Settings className="size-3.5" />
          </Link>
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

      {/* Mobile Drawer Trigger (Floating on small screens) */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="size-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors cursor-pointer"
          aria-label="Open student navigation menu"
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
