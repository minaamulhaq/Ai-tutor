"use client";

import React from "react";
import { Conversation, ConversationFilter } from "@/types/message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Pin,
  BellOff,
  Check,
  CheckCheck,
  Calendar,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  activeFilter: ConversationFilter;
  onChangeFilter: (filter: ConversationFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewMessageModal: () => void;
  isLoading: boolean;
}

export function ConversationSidebar({
  conversations,
  selectedId,
  onSelectConversation,
  activeFilter,
  onChangeFilter,
  searchQuery,
  onSearchChange,
  onOpenNewMessageModal,
  isLoading,
}: ConversationSidebarProps) {
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <aside className="w-full lg:w-80 xl:w-88 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
      {/* 1. Header with Title & New Message Action */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Messages</span>
            {totalUnread > 0 && (
              <span className="size-5 rounded-full bg-orange-500 text-white text-[11px] font-bold flex items-center justify-center">
                {totalUnread > 9 ? "9+" : totalUnread}
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-500">Coordinate lessons & homework</p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onOpenNewMessageModal}
          className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold h-8 px-3 shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="size-3.5 stroke-[2.5]" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* 2. Search Input */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="relative">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8.5 pr-8 h-8.5 text-xs bg-white rounded-lg border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* 3. Category Filter Tabs */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto no-scrollbar">
          {(
            [
              { id: "all", label: "All" },
              { id: "unread", label: "Unread", count: totalUnread },
              { id: "sessions", label: "Upcoming" },
              { id: "archived", label: "Archived" },
            ] as const
          ).map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeFilter(tab.id as ConversationFilter)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1",
                  isActive
                    ? "bg-orange-500 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-200/60 bg-transparent"
                )}
              >
                <span>{tab.label}</span>
                {Boolean(tab.count) && tab.count! > 0 && (
                  <span
                    className={cn(
                      "text-[9px] px-1 py-0.2 rounded-full font-bold leading-tight",
                      isActive ? "bg-white text-orange-600" : "bg-orange-100 text-orange-700"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Conversation Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="size-11 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-3.5 bg-slate-200 rounded-md w-28" />
                  <div className="h-2.5 bg-slate-100 rounded-md w-44" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="size-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto border border-orange-100">
              <MessageSquare className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-800">No conversations found</p>
              <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto">
                {searchQuery
                  ? "No chats matched your search."
                  : activeFilter === "unread"
                  ? "You have caught up with all messages!"
                  : "Start a new conversation with a teacher or student."}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenNewMessageModal}
              className="text-xs rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold h-8"
            >
              Start New Chat
            </Button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === selectedId;
            const partner = conv.participant || {
              id: conv.teacherId || "user",
              fullName: conv.teacherName || "User",
              role: "teacher" as const,
              avatarUrl: conv.teacherAvatarUrl || "",
              isOnline: conv.teacherIsOnline ?? false,
              isVerified: conv.isVerified ?? false,
              headline: conv.teacherHeadline || "",
              subject: conv.teacherSubject || "",
              hourlyRatePkr: conv.teacherHourlyRate || 0,
            };
            const hasUnread = conv.unreadCount > 0;

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full text-left p-3.5 transition-all flex items-start gap-3 relative group cursor-pointer border-l-3",
                  isSelected
                    ? "bg-orange-50/70 border-l-orange-500 shadow-2xs"
                    : "hover:bg-slate-50 border-l-transparent"
                )}
              >
                {/* Avatar with live status dot */}
                <div className="relative shrink-0">
                  <Avatar className="size-11 rounded-full border border-slate-200">
                    <AvatarImage src={partner.avatarUrl} alt={partner.fullName} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                      {partner.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {partner.isOnline ? (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                  ) : (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-slate-300 ring-2 ring-white" />
                  )}
                </div>

                {/* Content details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={cn(
                          "text-xs truncate font-bold",
                          hasUnread ? "text-slate-900" : "text-slate-800"
                        )}
                      >
                        {partner.fullName}
                      </span>
                      {conv.isPinned && (
                        <Pin className="size-3 text-orange-500 fill-orange-500 shrink-0" />
                      )}
                      {conv.isMuted && (
                        <BellOff className="size-3 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] shrink-0 whitespace-nowrap",
                        hasUnread ? "text-orange-600 font-bold" : "text-slate-400 font-medium"
                      )}
                    >
                      {conv.lastMessage.timestamp}
                    </span>
                  </div>

                  {/* Partner Headline / Subject */}
                  <div className="text-[10px] text-slate-500 truncate mb-1">
                    <span className="font-semibold text-slate-700 capitalize">{partner.role}</span>
                    {partner.subject && <span> • {partner.subject}</span>}
                  </div>

                  {/* Last message preview */}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-[11px] truncate leading-tight flex-1",
                        hasUnread
                          ? "font-bold text-slate-900"
                          : "text-slate-500 font-normal"
                      )}
                    >
                      {conv.lastMessage.content}
                    </p>

                    {/* Unread badge */}
                    {hasUnread && (
                      <span className="size-4.5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Upcoming lesson pill indicator */}
                  {conv.upcomingClass && (
                    <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[9px] font-semibold">
                      <Calendar className="size-2.5 shrink-0" />
                      <span className="truncate">{conv.upcomingClass.date} • {conv.upcomingClass.time}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
