"use client";

import React, { useRef, useEffect, useState } from "react";
import { Message, Conversation } from "@/types/message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CheckCheck,
  Clock,
  Download,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Calendar,
  Video,
  ChevronDown,
  Sparkles,
  MessageSquare,
  Lock,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  isPartnerTyping?: boolean;
  onAcceptInvitation?: (invitation: any) => void;
  onDeclineInvitation?: (invitation: any) => void;
  isLoading: boolean;
}

export function ChatMessages({
  conversation,
  messages,
  currentUserId,
  isPartnerTyping,
  onAcceptInvitation,
  onDeclineInvitation,
  isLoading,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  const partner = conversation.participant;

  // Auto-scroll to bottom on messages load/send
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, [messages.length, isPartnerTyping]);

  // Track scroll position to show "scroll to bottom" button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isScrolledUp);
  };

  // Helper to get formatted file size
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Helper to render correct file icon
  const renderFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="size-5 text-rose-500 shrink-0" />;
      case "doc":
        return <FileCode className="size-5 text-blue-500 shrink-0" />;
      case "zip":
        return <FileArchive className="size-5 text-amber-500 shrink-0" />;
      case "image":
        return <ImageIcon className="size-5 text-emerald-500 shrink-0" />;
      default:
        return <FileText className="size-5 text-slate-500 shrink-0" />;
    }
  };

  // Render message status tick for sent messages
  const renderStatusIndicator = (status: Message["status"]) => {
    switch (status) {
      case "sending":
        return <Clock className="size-3 text-orange-200 animate-spin" title="Sending..." />;
      case "sent":
        return <Check className="size-3 text-orange-200" title="Sent to server" />;
      case "delivered":
        return <CheckCheck className="size-3 text-orange-200" title="Delivered" />;
      case "read":
        return <CheckCheck className="size-3 text-white" title="Read" />;
      default:
        return <Check className="size-3 text-orange-200" />;
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40 relative"
    >
      {/* 1. Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4 py-6">
          <div className="flex gap-3 max-w-sm">
            <div className="size-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="h-14 bg-slate-200 rounded-2xl w-56 animate-pulse" />
          </div>
          <div className="flex justify-end">
            <div className="h-10 bg-orange-200/60 rounded-2xl w-48 animate-pulse" />
          </div>
          <div className="flex gap-3 max-w-sm">
            <div className="size-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="h-20 bg-slate-200 rounded-2xl w-64 animate-pulse" />
          </div>
        </div>
      ) : messages.length === 0 ? (
        /* 2. Empty State for New Conversation */
        <div className="text-center py-12 px-4 space-y-4 max-w-md mx-auto">
          <Avatar className="size-16 rounded-full border-2 border-orange-200 mx-auto shadow-sm">
            <AvatarImage src={partner.avatarUrl} alt={partner.fullName} />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-base">
              {partner.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900">
              Start chatting with {partner.fullName}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {partner.role === "teacher"
                ? `Ask ${partner.fullName.split(" ")[0]} questions about syllabus, past papers, homework support, or scheduling a 1-on-1 session.`
                : `Coordinate lesson objectives, send worksheets, and prepare for your upcoming class with ${partner.fullName}.`}
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 text-[11px] font-semibold text-orange-700">
            <Lock className="size-3 text-orange-600" />
            <span>Messages are private and protected by ZuhDemy Escrow policy</span>
          </div>
        </div>
      ) : (
        /* 3. Message Bubbles grouped by date */
        messages.map((msg, idx) => {
          const isSentByMe = msg.senderId === currentUserId;
          const showDateSeparator =
            idx === 0 || messages[idx - 1].date !== msg.date;
          const messageKey = msg.id ? `msg_${msg.id}` : `msg_idx_${idx}`;

          return (
            <React.Fragment key={messageKey}>
              {/* Date Separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                    {msg.date}
                  </span>
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={cn(
                  "flex items-end gap-2 group",
                  isSentByMe ? "justify-end" : "justify-start"
                )}
              >
                {/* Received message avatar */}
                {!isSentByMe && (
                  <Avatar className="size-7 rounded-full border border-slate-200 shrink-0 mb-1">
                    <AvatarImage src={partner.avatarUrl} alt={partner.fullName} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 text-[10px] font-bold">
                      {partner.fullName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[85%] sm:max-w-md rounded-2xl p-3 sm:p-3.5 space-y-2 relative transition-all",
                    isSentByMe
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-xs shadow-xs"
                      : "bg-white border border-slate-200/90 text-slate-900 rounded-bl-xs shadow-2xs"
                  )}
                >
                  {/* Sender Name on Received message */}
                  {!isSentByMe && (
                    <div className="text-[10px] font-bold text-orange-600 mb-0.5">
                      {partner.fullName}
                    </div>
                  )}

                  {/* A. Class Invitation Message Type */}
                  {msg.type === "class_invitation" && msg.invitation && (
                    <div
                      className={cn(
                        "p-3 rounded-xl border space-y-2.5",
                        isSentByMe
                          ? "bg-orange-600/60 border-orange-400 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Calendar className="size-3.5 text-orange-500" />
                          <span>Class Session Invitation</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 font-bold rounded capitalize",
                            msg.invitation.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : msg.invitation.status === "declined"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          )}
                        >
                          {msg.invitation.status}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="font-bold">{msg.invitation.topicTitle}</div>
                        <div className="text-[11px] opacity-90">
                          {msg.invitation.date} • {msg.invitation.time} ({msg.invitation.durationMinutes} mins)
                        </div>
                        <div className="text-[11px] font-extrabold flex items-center justify-between pt-1 border-t border-current/20">
                          <span>Session Fee:</span>
                          <span>PKR {msg.invitation.feePKR.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Interactive Buttons for Student */}
                      {!isSentByMe && msg.invitation.status === "pending" && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onAcceptInvitation?.(msg.invitation)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-7 rounded-lg cursor-pointer"
                          >
                            Accept & Confirm
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onDeclineInvitation?.(msg.invitation)}
                            className="text-xs h-7 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* B. Text Content (omitted if only automated attachment label) */}
                  {msg.content && !msg.content.startsWith("Sent ") && (
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}

                  {/* C. Attachments (Direct Storage Download Cards) */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {msg.attachments.map((att, aIdx) => {
                        const isImage = att.fileType === "image";
                        const attachmentKey = att.id || att.url || `att_${msg.id || idx}_${aIdx}`;

                        return (
                          <div
                            key={attachmentKey}
                            className={cn(
                              "p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all",
                              isSentByMe
                                ? "bg-orange-700/40 border-orange-400/50 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-800"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={cn(
                                  "size-9 rounded-lg flex items-center justify-center shrink-0 shadow-2xs",
                                  isSentByMe ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"
                                )}
                              >
                                {renderFileIcon(att.fileType)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate max-w-[160px] sm:max-w-[210px]">
                                  {att.name}
                                </div>
                                <div className="text-[10px] opacity-80 flex items-center gap-1.5 font-medium">
                                  <span>{formatBytes(att.sizeBytes)}</span>
                                  <span>•</span>
                                  <span className="uppercase">{att.fileType}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isImage && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedPreviewImage(att.url)}
                                  className={cn(
                                    "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer",
                                    isSentByMe
                                      ? "hover:bg-white/20 text-white/90"
                                      : "hover:bg-slate-200 text-slate-600"
                                  )}
                                  title="Preview Photo"
                                  aria-label="Preview Photo"
                                >
                                  <Eye className="size-3.5" />
                                </button>
                              )}

                              <a
                                href={att.url}
                                download={att.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-bold shrink-0 transition-all cursor-pointer shadow-2xs",
                                  isSentByMe
                                    ? "bg-white text-orange-700 hover:bg-orange-50"
                                    : "bg-orange-500 hover:bg-orange-600 text-white"
                                )}
                                title={`Download ${att.name}`}
                              >
                                <Download className="size-3.5" />
                                <span>Download</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Timestamp & Read Receipt Indicator */}
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1 text-[10px] pt-0.5",
                      isSentByMe ? "text-orange-100" : "text-slate-400"
                    )}
                  >
                    <span>{msg.timestamp}</span>
                    {isSentByMe && renderStatusIndicator(msg.status)}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })
      )}

      {/* 4. Typing Indicator Bubble */}
      {isPartnerTyping && (
        <div className="flex items-end gap-2 animate-fadeIn">
          <Avatar className="size-7 rounded-full border border-slate-200 shrink-0">
            <AvatarImage src={partner.avatarUrl} alt={partner.fullName} />
            <AvatarFallback className="bg-orange-100 text-orange-700 text-[10px] font-bold">
              {partner.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-bl-xs shadow-2xs flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium mr-1">
              {partner.fullName.split(" ")[0]} is typing
            </span>
            <span className="size-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1.5 rounded-full bg-orange-500 animate-bounce" />
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} className="h-1" />

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <Button
          type="button"
          size="icon"
          onClick={() => scrollToBottom("smooth")}
          className="absolute right-6 bottom-4 size-9 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg cursor-pointer animate-bounce z-20"
          title="Scroll to latest messages"
        >
          <ChevronDown className="size-4.5 stroke-[2.5]" />
        </Button>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {selectedPreviewImage && (
        <div
          role="dialog"
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={selectedPreviewImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
