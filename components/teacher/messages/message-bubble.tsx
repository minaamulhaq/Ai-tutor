"use client";

import React from "react";
import { Check, CheckCheck, Clock } from "lucide-react";
import { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isTeacher = message.senderRole === "teacher";

  return (
    <div
      className={`flex flex-col ${
        isTeacher ? "items-end" : "items-start"
      } w-full group select-text`}
    >
      {/* Bubble Container */}
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
          isTeacher
            ? "bg-orange-500 text-white rounded-tr-xs"
            : "bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs"
        }`}
      >
        {/* Message Text with preserved whitespace and linebreaks */}
        <p className="whitespace-pre-wrap break-words">{message.text}</p>

        {/* Timestamp & Status footer */}
        <div
          className={`flex items-center justify-end gap-1.5 pt-1.5 text-[10px] ${
            isTeacher ? "text-orange-100/80" : "text-slate-400"
          }`}
        >
          <span>{message.formattedTime}</span>

          {isTeacher && (
            <span title={`Status: ${message.status}`}>
              {message.status === "sending" ? (
                <Clock className="size-3 animate-pulse" />
              ) : message.status === "read" ? (
                <CheckCheck className="size-3 text-white" />
              ) : (
                <Check className="size-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
