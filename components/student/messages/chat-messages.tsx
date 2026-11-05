"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Check,
  CheckCheck,
  Calendar,
  Clock,
  Video,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Message, Conversation } from "@/types/message";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
  conversation: Conversation;
  isTeacherTyping?: boolean;
  onAcceptInvitation?: (messageId: string) => void;
}

export function ChatMessages({
  messages,
  conversation,
  isTeacherTyping = false,
  onAcceptInvitation,
}: ChatMessagesProps) {
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages or typing indicator
  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTeacherTyping]);

  const teacherInitials = conversation.teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Group messages by date
  const groupedMessages: { date: string; items: Message[] }[] = [];
  messages.forEach((msg) => {
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === msg.date) {
      lastGroup.items.push(msg);
    } else {
      groupedMessages.push({ date: msg.date, items: [msg] });
    }
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">
      {/* Encryption / Trust Notice */}
      <div className="flex items-center justify-center">
        <span className="text-[11px] font-medium text-slate-500 bg-white/90 px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
          🔒 Messages are encrypted & protected by ZuhDemy Student Safety
        </span>
      </div>

      {/* Grouped Messages by Date */}
      {groupedMessages.map((group, groupIdx) => (
        <div key={groupIdx} className="space-y-4">
          {/* Date Separator Pill */}
          <div className="flex items-center justify-center my-2">
            <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-3 py-0.5 rounded-full uppercase tracking-wider">
              {group.date}
            </span>
          </div>

          {/* Messages in this date */}
          {group.items.map((msg) => {
            const isStudent = msg.senderRole === "student";
            const isSystem = msg.senderRole === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <div className="max-w-md p-3 rounded-xl bg-orange-50/70 border border-orange-200/60 text-xs text-orange-950 text-center space-y-1">
                    <p className="font-semibold">{msg.content}</p>
                    <span className="text-[10px] text-orange-700/80">{msg.timestamp}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%]",
                  isStudent ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Teacher Avatar (only on teacher messages) */}
                {!isStudent && (
                  <Avatar className="size-8 rounded-xl ring-1 ring-slate-200 shrink-0 mb-1">
                    <AvatarImage
                      src={conversation.teacherAvatarUrl}
                      alt={conversation.teacherName}
                    />
                    <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-[10px]">
                      {teacherInitials}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Bubble Container */}
                <div className="space-y-1.5 min-w-0">
                  {/* Standard Text Bubble */}
                  {msg.content && (
                    <div
                      className={cn(
                        "p-3.5 text-xs sm:text-sm leading-relaxed",
                        isStudent
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl rounded-br-xs shadow-xs"
                          : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-xs shadow-xs"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  )}

                  {/* Class Invitation Card Type */}
                  {msg.type === "class_invitation" && msg.invitation && (
                    <div className="p-4 rounded-2xl border border-orange-200 bg-white shadow-xs space-y-3 max-w-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs">
                          <Calendar className="size-4" />
                          <span>1-on-1 Class Invitation</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                            msg.invitation.status === "accepted"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {msg.invitation.status === "accepted" ? "Slot Booked" : "Pending Action"}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {msg.invitation.topicTitle}
                        </h4>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5 text-orange-500 shrink-0" />
                          <span>{msg.invitation.date} • {msg.invitation.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="size-3.5 text-emerald-600 shrink-0" />
                          <span>Platform: {msg.invitation.meetingPlatform}</span>
                        </div>
                        <div className="pt-1 flex items-baseline justify-between font-bold text-slate-900">
                          <span className="text-xs">Class Fee:</span>
                          <span className="text-sm text-orange-600">
                            PKR {msg.invitation.feePKR.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Accept & Book Button */}
                      {msg.invitation.status === "pending" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onAcceptInvitation && onAcceptInvitation(msg.id)}
                          className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          <Sparkles className="size-3.5 mr-1.5" />
                          <span>Accept & Confirm Slot</span>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full h-9 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-xs"
                        >
                          <Link href="/student/classes">
                            <span>View in My Classes</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}

                  {/* File Attachment Card */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-2">
                      {msg.attachments.map((file) => (
                        <div
                          key={file.id}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs max-w-sm"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                              <FileText className="size-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {(file.sizeBytes / (1024 * 1024)).toFixed(1)} MB • PDF Document
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="size-8 p-0 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
                            title="Download attachment"
                          >
                            <Download className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Read Receipts */}
                  <div
                    className={cn(
                      "flex items-center gap-1 text-[10px] text-slate-400 px-1",
                      isStudent ? "justify-end" : "justify-start"
                    )}
                  >
                    <span>{msg.timestamp}</span>
                    {isStudent && (
                      <>
                        {msg.status === "read" ? (
                          <CheckCheck className="size-3 text-orange-500" />
                        ) : msg.status === "delivered" ? (
                          <CheckCheck className="size-3 text-slate-400" />
                        ) : (
                          <Check className="size-3 text-slate-400" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Simulated Teacher Typing Indicator */}
      {isTeacherTyping && (
        <div className="flex items-end gap-2.5 mr-auto">
          <Avatar className="size-8 rounded-xl ring-1 ring-slate-200 shrink-0">
            <AvatarImage
              src={conversation.teacherAvatarUrl}
              alt={conversation.teacherName}
            />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-[10px]">
              {teacherInitials}
            </AvatarFallback>
          </Avatar>
          <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-white border border-slate-200 shadow-2xs flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1.5 rounded-full bg-slate-400 animate-bounce" />
          </div>
        </div>
      )}

      <div ref={scrollEndRef} />
    </div>
  );
}
