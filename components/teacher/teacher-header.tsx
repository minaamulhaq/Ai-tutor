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
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  GraduationCap,
  CalendarDays,
  BadgeDollarSign,
  LifeBuoy,
  LogOut,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";

/**
 * Interface representing the teacher user profile for ZuhDemy.
 * Bound to the authenticated Supabase session.
 */
export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl: string;
  initials: string;
  isOnline: boolean;
}

function getInitials(name?: string, fallback: string = "TC"): string {
  if (!name) return fallback;
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TeacherHeader() {
  const [dummyData, setDummyData] = useState<TeacherProfile>({
    id: "usr_teach_01",
    name: "Teacher",
    email: "teacher@zuhdemy.com",
    role: "Instructor",
    department: "Verified Instructor",
    avatarUrl: "",
    initials: "TC",
    isOnline: true,
  });

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const fullName =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Instructor";
          const email = user.email || "teacher@zuhdemy.com";
          const avatarUrl = user.user_metadata?.avatar_url || "";
          const department =
            user.user_metadata?.headline ||
            user.user_metadata?.subjects?.[0] ||
            "Academic Instructor";
          const initials = getInitials(fullName, "TC");

          setDummyData({
            id: user.id,
            name: fullName,
            email: email,
            role: "Instructor",
            department: department,
            avatarUrl: avatarUrl,
            initials: initials,
            isOnline: true,
          });
        }
      } catch (err) {
        console.warn("Could not load authenticated teacher header info:", err);
      }
    }

    loadCurrentUser();
  }, []);

  // Real-time listener for instant avatar updates
  useEffect(() => {
    const handleAvatarChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl: string }>;
      if (customEvent.detail && typeof customEvent.detail.avatarUrl === "string") {
        setDummyData((prev) => ({
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

  return (
    <header className="h-16 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left Section: Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search classes, students, or availability..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Right Section: Notifications & User Avatar with Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell Dropdown */}
        <NotificationsDropdown userRole="teacher" />

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Avatar with Shadcn Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer group p-1 -mr-1 rounded-xl hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-500">
            <div className="relative">
              {/* Avatar */}
              <Avatar className="size-9 ring-2 ring-orange-500/10 transition-all group-hover:ring-orange-500/30">
                <AvatarImage src={dummyData.avatarUrl} alt={dummyData.name} />
                <AvatarFallback className="bg-orange-50 text-orange-600 font-semibold text-xs">
                  {dummyData.initials}
                </AvatarFallback>
              </Avatar>

              {/* Online Status Pill */}
              {dummyData.isOnline && (
                <span
                  className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                  title="Online"
                />
              )}
            </div>

            {/* Teacher Details */}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors">
                {dummyData.name}
              </span>
              <span className="text-xs text-slate-500 mt-1 leading-none">
                {dummyData.role}
              </span>
            </div>

            <ChevronDown className="size-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-y-0.5" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-68 min-w-68 p-2 rounded-2xl shadow-xl border border-slate-200 bg-white">
            {/* Header Card */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 mb-1 border border-slate-100">
              <Avatar className="size-10 ring-1 ring-slate-200 shrink-0">
                <AvatarImage src={dummyData.avatarUrl} alt={dummyData.name} />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold text-xs">
                  {dummyData.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {dummyData.name}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {dummyData.email}
                </span>
                <span className="text-[11px] font-medium text-orange-600 mt-0.5 flex items-center gap-1">
                  <Sparkles className="size-3" />
                  {dummyData.department}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Navigation Options */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account & Management</DropdownMenuLabel>
              <Link href="/teacher/profile" className="contents">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="size-4 text-slate-500" />
                  <span>My Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/teacher/schedule" className="contents">
                <DropdownMenuItem className="cursor-pointer">
                  <CalendarDays className="size-4 text-slate-500" />
                  <span>My Schedule & Availability</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/teacher/classes" className="contents">
                <DropdownMenuItem className="cursor-pointer">
                  <GraduationCap className="size-4 text-slate-500" />
                  <span>My Classes</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/teacher/earnings" className="contents">
                <DropdownMenuItem className="cursor-pointer">
                  <BadgeDollarSign className="size-4 text-slate-500" />
                  <span>Earnings & Payouts</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/teacher/settings" className="contents">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="size-4 text-slate-500" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <Link href="/teacher/support" className="contents">
                <DropdownMenuItem className="cursor-pointer">
                  <LifeBuoy className="size-4 text-slate-500" />
                  <span>Help & Faculty Support</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Sign Out */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => {
                  console.log("Teacher signing out...");
                }}
              >
                <LogOut className="size-4" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
