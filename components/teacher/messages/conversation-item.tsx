"use client";

import React, { useState } from "react";
import { Conversation } from "./types";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conv: Conversation) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-xl transition-all cursor-pointer select-none border ${
        isSelected
          ? "bg-orange-50/70 border-orange-200/90 shadow-2xs"
          : "bg-white hover:bg-slate-50 border-transparent hover:border-slate-100"
      }`}
    >
      {/* Active accent bar */}
      {isSelected && (
        <span className="absolute left-0 top-3 bottom-3 w-1 bg-orange-500 rounded-r-full" />
      )}

      {/* Avatar Container */}
      <div className="relative shrink-0">
        <div className="size-11 sm:size-12 rounded-full overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shadow-2xs">
          {conversation.studentAvatar && !imgError ? (
            <img
              src={conversation.studentAvatar}
              alt={conversation.studentName}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-orange-600 bg-orange-50 text-sm select-none">
              {conversation.studentInitials}
            </div>
          )}
        </div>

        {/* Unread indicator dot on avatar */}
        {conversation.unreadCount > 0 && !isSelected && (
          <span className="absolute top-0 right-0 size-3 rounded-full bg-orange-500 ring-2 ring-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <h4
            className={`text-xs sm:text-sm truncate leading-snug ${
              conversation.unreadCount > 0 ? "font-bold text-slate-950" : "font-semibold text-slate-900"
            } ${isSelected ? "text-orange-950" : ""}`}
          >
            {conversation.studentName}
          </h4>

          <span className="text-[10px] sm:text-[11px] text-slate-400 shrink-0 font-medium">
            {conversation.lastMessageTimestamp}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={`text-xs truncate leading-relaxed ${
              conversation.unreadCount > 0
                ? "font-semibold text-slate-800"
                : "text-slate-500"
            }`}
          >
            {conversation.lastMessageSenderRole === "teacher" && (
              <span className="text-slate-400 font-normal">You: </span>
            )}
            {conversation.lastMessageText}
          </p>

          {/* Unread message count badge */}
          {conversation.unreadCount > 0 && (
            <span className="size-5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
