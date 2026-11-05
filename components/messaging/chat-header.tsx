"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Conversation } from "@/types/message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  MoreVertical,
  ExternalLink,
  Pin,
  BellOff,
  Bell,
  Archive,
  Info,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  conversation: Conversation;
  isInfoSidebarOpen: boolean;
  onToggleInfoSidebar: () => void;
  onBackToList: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onToggleArchive: () => void;
  isPartnerTyping?: boolean;
}

export function ChatHeader({
  conversation,
  isInfoSidebarOpen,
  onToggleInfoSidebar,
  onBackToList,
  onTogglePin,
  onToggleMute,
  onToggleArchive,
  isPartnerTyping,
}: ChatHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const partner = conversation.participant || {
    id: conversation.teacherId || "user",
    fullName: conversation.teacherName || "User",
    role: "teacher" as const,
    avatarUrl: conversation.teacherAvatarUrl || "",
    isOnline: conversation.teacherIsOnline ?? false,
    isVerified: conversation.isVerified ?? false,
    headline: conversation.teacherHeadline || "",
    subject: conversation.teacherSubject || "",
    hourlyRatePkr: conversation.teacherHourlyRate || 0,
  };
  const isTeacher = partner.role === "teacher";
  const profileUrl = isTeacher
    ? `/student/teachers/${partner.id}`
    : `/teacher/students`;

  return (
    <header className="h-16 px-4 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 z-10">
      {/* 1. Left: Mobile Back + User Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onBackToList}
          className="lg:hidden size-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Back to conversations"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="relative shrink-0">
          <Avatar className="size-10 rounded-full border border-slate-200">
            <AvatarImage src={partner.avatarUrl} alt={partner.fullName} />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
              {partner.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {partner.isOnline ? (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          ) : (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-slate-300 ring-2 ring-white" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {partner.fullName}
            </h3>
            {partner.isVerified && (
              <ShieldCheck className="size-3.5 text-blue-500 shrink-0" title="Verified Identity" />
            )}
            <Badge
              variant="outline"
              className="hidden sm:inline-flex text-[9px] px-1.5 py-0 h-4 rounded-md capitalize font-medium text-slate-600 border-slate-200"
            >
              {partner.role}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {isPartnerTyping ? (
              <span className="text-orange-600 font-bold flex items-center gap-1 animate-pulse">
                <span>typing...</span>
              </span>
            ) : partner.isOnline ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>Online now</span>
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                {partner.lastSeen || "Offline"}
              </span>
            )}

            {partner.subject && (
              <span className="text-slate-400 hidden md:inline">
                • {partner.subject}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Right: Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* View Profile Link */}
        <Link
          href={profileUrl}
          className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl h-8 px-2.5 transition-colors"
        >
          <ExternalLink className="size-3.5" />
          <span>View Profile</span>
        </Link>

        {/* Custom Clean Options Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="size-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            aria-label="Conversation options"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="size-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl p-1 bg-white border border-slate-200 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  onTogglePin();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 font-medium cursor-pointer transition-colors text-slate-700"
              >
                <Pin className="size-3.5 text-slate-500" />
                <span>{conversation.isPinned ? "Unpin Conversation" : "Pin to Top"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleMute();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 font-medium cursor-pointer transition-colors text-slate-700"
              >
                {conversation.isMuted ? (
                  <>
                    <Bell className="size-3.5 text-slate-500" />
                    <span>Unmute Notifications</span>
                  </>
                ) : (
                  <>
                    <BellOff className="size-3.5 text-slate-500" />
                    <span>Mute Notifications</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleArchive();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 font-medium cursor-pointer transition-colors text-slate-700"
              >
                <Archive className="size-3.5 text-slate-500" />
                <span>{conversation.isArchived ? "Unarchive Conversation" : "Archive Conversation"}</span>
              </button>

              <div className="my-1 h-px bg-slate-100" />

              <Link
                href={profileUrl}
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 font-medium text-slate-700 cursor-pointer transition-colors"
              >
                <ExternalLink className="size-3.5 text-slate-500" />
                <span>View Full Profile</span>
              </Link>
            </div>
          )}
        </div>

        {/* Toggle Right Info Sidebar */}
        <button
          type="button"
          onClick={onToggleInfoSidebar}
          className={cn(
            "size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
            isInfoSidebarOpen
              ? "bg-orange-100 text-orange-700"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          )}
          title="Toggle user info"
          aria-label="Toggle user info"
        >
          <Info className="size-4" />
        </button>
      </div>
    </header>
  );
}
