"use client";

import React from "react";
import { Search, Pin, ShieldCheck, CheckCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Conversation, ConversationFilter } from "@/types/message";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  activeFilter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalUnreadCount: number;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  totalUnreadCount,
}: ConversationListProps) {
  const filterTabs: { id: ConversationFilter; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: totalUnreadCount },
    { id: "sessions", label: "Active Sessions" },
    { id: "archived", label: "Archived" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* 1. Header with Search */}
      <div className="p-4 space-y-3 border-b border-slate-200/80">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Messages
          </h2>
          {totalUnreadCount > 0 && (
            <Badge className="bg-orange-500 text-white font-bold text-[11px] px-2 py-0.5 rounded-full">
              {totalUnreadCount} new
            </Badge>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search teachers or messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8.5 pr-3 h-9 rounded-xl border-slate-200 bg-slate-50 text-xs focus-visible:bg-white focus-visible:ring-orange-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1",
                  isActive
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                )}
              >
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={cn(
                      "size-4 rounded-full text-[10px] font-bold flex items-center justify-center",
                      isActive
                        ? "bg-orange-500 text-white"
                        : "bg-slate-300 text-slate-700"
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

      {/* 2. Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {conversations.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-400">
            <p className="text-xs font-semibold text-slate-600">No conversations found</p>
            <p className="text-[11px] text-slate-400">
              {searchQuery ? "Try a different search query" : "No messages in this folder"}
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = selectedId === conv.id;
            const initials = conv.teacherName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full text-left p-3.5 sm:p-4 transition-all flex items-start gap-3 cursor-pointer relative",
                  isSelected
                    ? "bg-orange-50/70 border-l-4 border-l-orange-500"
                    : "hover:bg-slate-50/80 border-l-4 border-l-transparent",
                  conv.unreadCount > 0 && !isSelected ? "bg-slate-50/40" : ""
                )}
              >
                {/* Avatar with Online indicator */}
                <div className="relative shrink-0 mt-0.5">
                  <Avatar className="size-11 rounded-xl ring-2 ring-slate-100">
                    <AvatarImage src={conv.teacherAvatarUrl} alt={conv.teacherName} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {conv.teacherIsOnline ? (
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
                </div>

                {/* Conversation Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {conv.teacherName}
                      </span>
                      {conv.isVerified && (
                        <ShieldCheck className="size-3 text-emerald-600 shrink-0" />
                      )}
                      {conv.isPinned && (
                        <Pin className="size-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">
                      {conv.lastMessage.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {conv.teacherSubject}
                    </span>
                    {conv.upcomingClass && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 truncate">
                        Session: {conv.upcomingClass.date.split(",")[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <p
                      className={cn(
                        "text-xs truncate",
                        conv.unreadCount > 0
                          ? "font-bold text-slate-900"
                          : "font-normal text-slate-500"
                      )}
                    >
                      {conv.lastMessage.senderRole === "student" && (
                        <span className="text-slate-400 font-normal mr-1">You:</span>
                      )}
                      {conv.lastMessage.content}
                    </p>

                    {conv.unreadCount > 0 && (
                      <span className="size-5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
