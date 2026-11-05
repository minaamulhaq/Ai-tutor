"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Calendar,
  Info,
  MoreVertical,
  Video,
  ExternalLink,
  BellOff,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Conversation } from "@/types/message";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  conversation: Conversation;
  onBackMobile?: () => void;
  onToggleInfoDrawer: () => void;
  isInfoDrawerOpen: boolean;
}

export function ChatHeader({
  conversation,
  onBackMobile,
  onToggleInfoDrawer,
  isInfoDrawerOpen,
}: ChatHeaderProps) {
  const router = useRouter();
  const initials = conversation.teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
      {/* Left: Back button (mobile) + Teacher info */}
      <div className="flex items-center gap-3 min-w-0">
        {onBackMobile && (
          <button
            type="button"
            onClick={onBackMobile}
            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Back to messages"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}

        <Link
          href={`/student/teachers/${conversation.teacherId}`}
          className="relative shrink-0 group/avatar"
        >
          <Avatar className="size-10 sm:size-11 rounded-xl ring-2 ring-slate-100 group-hover/avatar:ring-orange-400 transition-all">
            <AvatarImage src={conversation.teacherAvatarUrl} alt={conversation.teacherName} />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {conversation.teacherIsOnline ? (
            <span
              title="Online now"
              className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-white"
            />
          ) : (
            <span
              title="Offline"
              className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-slate-300 ring-2 ring-white"
            />
          )}
        </Link>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={`/student/teachers/${conversation.teacherId}`}
              className="font-bold text-sm sm:text-base text-slate-900 hover:text-orange-600 transition-colors truncate"
            >
              {conversation.teacherName}
            </Link>
            {conversation.isVerified && (
              <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {conversation.teacherIsOnline ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active now
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                {conversation.teacherLastSeen || "Offline"}
              </span>
            )}
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-medium text-slate-600 truncate">
              PKR {conversation.teacherHourlyRate.toLocaleString()}/hr
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Book Session CTA */}
        <Button
          asChild
          size="sm"
          className="h-9 px-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer"
        >
          <Link href={`/student/teachers/${conversation.teacherId}`}>
            <Calendar className="size-3.5 mr-1.5" />
            <span className="hidden sm:inline">Book Session</span>
            <span className="sm:hidden">Book</span>
          </Link>
        </Button>

        {/* Toggle Info Drawer */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleInfoDrawer}
          className={cn(
            "h-9 px-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer hidden lg:flex items-center gap-1.5 text-xs font-semibold",
            isInfoDrawerOpen && "bg-slate-100 text-slate-900 border-slate-300"
          )}
          title="Teacher Details"
        >
          <Info className="size-4 text-slate-500" />
          <span>Details</span>
        </Button>

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More conversation options"
            className="h-9 w-9 p-0 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center justify-center cursor-pointer outline-hidden focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 shadow-lg text-xs">
            <DropdownMenuItem
              onClick={() => router.push(`/student/teachers/${conversation.teacherId}`)}
              className="cursor-pointer"
            >
              <ExternalLink className="size-3.5 mr-2 text-slate-500" />
              <span>View Full Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <BellOff className="size-3.5 mr-2 text-slate-500" />
              <span>Mute Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-rose-600 focus:text-rose-600">
              <Trash2 className="size-3.5 mr-2 text-rose-500" />
              <span>Clear Conversation</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
