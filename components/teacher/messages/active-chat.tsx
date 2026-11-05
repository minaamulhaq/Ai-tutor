"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Calendar,
  ExternalLink,
  MessageCircle,
  MoreVertical,
  CheckCircle2,
} from "lucide-react";
import { Conversation, Message } from "./types";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";

interface ActiveChatProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (text: string) => Promise<boolean>;
  onBackToList?: () => void; // Used on mobile to return to list
  isLoadingMessages?: boolean;
}

export function ActiveChat({
  conversation,
  messages,
  onSendMessage,
  onBackToList,
  isLoadingMessages = false,
}: ActiveChatProps) {
  const [imgError, setImgError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, Message[]>>(
    (groups, message) => {
      const date = message.formattedDate || "Today";
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
      return groups;
    },
    {}
  );

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* A. Conversation Header */}
      <div className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="md:hidden p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Back to conversation list"
            >
              <ArrowLeft className="size-5" />
            </button>
          )}

          {/* Student Avatar */}
          <div className="relative shrink-0">
            <div className="size-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-2xs">
              {conversation.studentAvatar && !imgError ? (
                <img
                  src={conversation.studentAvatar}
                  alt={conversation.studentName}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-orange-600 bg-orange-50 text-xs">
                  {conversation.studentInitials}
                </div>
              )}
            </div>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          {/* Student Info */}
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 truncate">
              {conversation.studentName}
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              {conversation.studentGradeLevel || "Student Learner"}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Shortcut to Student Profile */}
          <Link
            href={`/teacher/students/${conversation.studentId}`}
            className="inline-flex items-center gap-1.5 h-8.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-orange-600 hover:border-orange-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <User className="size-3.5" />
            <span className="hidden sm:inline">View Profile</span>
          </Link>
        </div>
      </div>

      {/* B. Message History Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {isLoadingMessages ? (
          <div className="space-y-4 py-8">
            <div className="flex justify-start">
              <div className="w-48 h-12 rounded-2xl bg-slate-200 animate-pulse" />
            </div>
            <div className="flex justify-end">
              <div className="w-56 h-14 rounded-2xl bg-orange-200/50 animate-pulse" />
            </div>
            <div className="flex justify-start">
              <div className="w-64 h-16 rounded-2xl bg-slate-200 animate-pulse" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
            <MessageCircle className="size-10 text-slate-300" />
            <h4 className="font-semibold text-slate-700 text-sm">
              No messages yet
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Send a greeting below to start coordinating lessons with{" "}
              {conversation.studentName}.
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-4">
              {/* Date Group Divider */}
              <div className="flex items-center justify-center">
                <span className="px-3 py-0.5 rounded-full bg-white/90 border border-slate-200 text-[11px] font-medium text-slate-500 shadow-2xs">
                  {date}
                </span>
              </div>

              {/* Messages in this date */}
              <div className="space-y-3">
                {msgs.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* C. Message Composer */}
      <MessageComposer onSendMessage={onSendMessage} />
    </div>
  );
}
