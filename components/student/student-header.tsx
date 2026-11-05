"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  User,
  Settings,
  BookOpen,
  Heart,
  CreditCard,
  LifeBuoy,
  LogOut,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";
import { getStudentProfileAction } from "@/app/actions/student";

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  initials: string;
  isOnline: boolean;
}

function getInitials(name?: string, fallback: string = "ST"): string {
  if (!name) return fallback;
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function StudentHeader() {
  const [student, setStudent] = useState<StudentProfile>({
    id: "usr_stud_01",
    name: "Student",
    email: "student@example.com",
    role: "Enrolled Student",
    avatarUrl: "",
    initials: "ST",
    isOnline: true,
  });

  // Fetch real authenticated user session from Supabase & PostgreSQL
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Check database profile for authoritative avatar and name
          const profileRes = await getStudentProfileAction();
          const dbUser = profileRes.success ? profileRes.user : null;

          const fullName =
            dbUser?.fullName ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Student";
          const email = user.email || "student@example.com";
          const avatarUrl = dbUser?.avatarUrl || user.user_metadata?.avatar_url || "";
          const initials = getInitials(fullName, "ST");

          setStudent({
            id: user.id,
            name: fullName,
            email: email,
            role: "Enrolled Student",
            avatarUrl: avatarUrl,
            initials: initials,
            isOnline: true,
          });
        }
      } catch (err) {
        console.warn("Could not load authenticated student header info:", err);
      }
    }

    loadCurrentUser();
  }, []);

  // Listen for real-time avatar updates across student profile components
  useEffect(() => {
    const handleAvatarChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl: string }>;
      if (customEvent.detail && typeof customEvent.detail.avatarUrl === "string") {
        setStudent((prev) => ({
          ...prev,
          avatarUrl: customEvent.detail.avatarUrl,
        }));
      }
    };

    window.addEventListener("zuhdemy:avatar-updated", handleAvatarChange);
    return () => {
      window.removeEventListener("zuhdemy:avatar-updated", handleAvatarChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <header className="h-16 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left Section: Global Search for Students */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search teachers, subjects, or upcoming classes..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Right Section: Notification Bell & Avatar Only Trigger */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell Dropdown */}
        <NotificationsDropdown userRole="student" />

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Trigger: AVATAR ONLY (No explanation or name text in header bar) */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative cursor-pointer rounded-full p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition-transform hover:scale-105"
            aria-label="Open student account menu"
          >
            <Avatar className="size-9 ring-2 ring-orange-500/20 transition-all hover:ring-orange-500/50">
              <AvatarImage src={student.avatarUrl} alt={student.name} />
              <AvatarFallback className="bg-orange-50 text-orange-600 font-semibold text-xs">
                {student.initials}
              </AvatarFallback>
            </Avatar>

            {/* Online Status Pill */}
            {student.isOnline && (
              <span
                className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                title="Online"
              />
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-68 min-w-68 p-2 rounded-2xl shadow-xl border border-slate-200 bg-white"
          >
            {/* Header Identity Card inside dropdown */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 mb-1 border border-slate-100">
              <Avatar className="size-10 ring-1 ring-slate-200 shrink-0">
                <AvatarImage src={student.avatarUrl} alt={student.name} />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-xs">
                  {student.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {student.name}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {student.email}
                </span>
                <span className="text-[11px] font-medium text-orange-600 mt-0.5 flex items-center gap-1">
                  <Sparkles className="size-3" />
                  {student.role}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator className="my-1 bg-slate-100" />

            {/* Navigation Shortcuts */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="p-0 rounded-xl cursor-pointer">
                <Link
                  href="/student/profile"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl transition-colors"
                >
                  <User className="size-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="p-0 rounded-xl cursor-pointer">
                <Link
                  href="/student/classes"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl transition-colors"
                >
                  <BookOpen className="size-4 text-slate-400" />
                  <span>My Classes</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="p-0 rounded-xl cursor-pointer">
                <Link
                  href="/student/favorites"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl transition-colors"
                >
                  <Heart className="size-4 text-slate-400" />
                  <span>Favorite Teachers</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="p-0 rounded-xl cursor-pointer">
                <Link
                  href="/student/payments"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl transition-colors"
                >
                  <CreditCard className="size-4 text-slate-400" />
                  <span>Payments & Invoices</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1 bg-slate-100" />

            {/* Settings & Help */}
            <DropdownMenuGroup>
              <DropdownMenuItem className="p-0 rounded-xl cursor-pointer">
                <Link
                  href="/student/settings"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl transition-colors"
                >
                  <Settings className="size-4 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="p-0 rounded-xl cursor-pointer">
                <Link
                  href="/student/help"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl transition-colors"
                >
                  <LifeBuoy className="size-4 text-slate-400" />
                  <span>Help & Support</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-1 bg-slate-100" />

            {/* Logout Option */}
            <DropdownMenuItem className="p-0 rounded-xl cursor-pointer">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="size-4 text-rose-500" />
                <span>Log Out</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
