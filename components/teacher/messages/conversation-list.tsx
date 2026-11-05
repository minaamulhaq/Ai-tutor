"use client";

import React from "react";
import { Search, MessageSquare, CheckCheck, Inbox, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Conversation, ConversationFilterState } from "./types";
import { ConversationItem } from "./conversation-item";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (conv: Conversation) => void;
  filters: ConversationFilterState;
  onFilterChange: (updates: Partial<ConversationFilterState>) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
  filters,
  onFilterChange,
}: ConversationListProps) {
  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // 1. Search Query
    if (filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = conv.studentName.toLowerCase().includes(q);
      const matchText = conv.lastMessageText.toLowerCase().includes(q);
      if (!matchName && !matchText) return false;
    }

    // 2. Unread filter
    if (filters.filter === "unread") {
      if (conv.unreadCount <= 0) return false;
    }

    return true;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Top Header / Search Toolbar */}
      <div className="p-4 border-b border-slate-200 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-slate-900">Messages</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {conversations.length}
            </span>
          </div>

          {totalUnread > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              {totalUnread} unread
            </span>
          )}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search students..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="pl-9 pr-8 h-9.5 text-xs sm:text-sm bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* All / Unread Filter Pills */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => onFilterChange({ filter: "all" })}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filters.filter === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ filter: "unread" })}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filters.filter === "unread"
                ? "bg-orange-500 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Unread</span>
            {totalUnread > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filters.filter === "unread" ? "bg-white text-orange-600" : "bg-orange-100 text-orange-700"
                }`}
              >
                {totalUnread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Scrollable Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-500">
            {filters.filter === "unread" ? (
              <>
                <CheckCheck className="size-8 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                  You&apos;re all caught up.
                </h4>
                <p className="text-xs text-slate-400">
                  No unread messages from your students.
                </p>
              </>
            ) : filters.searchQuery ? (
              <>
                <Search className="size-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                  No students match your search.
                </h4>
                <p className="text-xs text-slate-400">
                  Try checking the spelling or clearing search filters.
                </p>
              </>
            ) : (
              <>
                <Inbox className="size-8 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                  No conversations yet.
                </h4>
                <p className="text-xs text-slate-400">
                  Direct chats with your enrolled students will appear here.
                </p>
              </>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedId}
              onSelect={onSelectConversation}
            />
          ))
        )}
      </div>
    </div>
  );
}
