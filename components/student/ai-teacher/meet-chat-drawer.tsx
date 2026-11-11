"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, MessageSquare } from "lucide-react";

export interface MeetMessage {
  id: string;
  sender: "user" | "ai";
  senderName: string;
  text: string;
  time: string;
}

interface MeetChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerBoardDraw?: (prompt: string) => void;
}

export function MeetChatDrawer({
  isOpen,
  onClose,
  onTriggerBoardDraw,
}: MeetChatDrawerProps) {
  const [messages, setMessages] = useState<MeetMessage[]>([
    {
      id: "1",
      sender: "ai",
      senderName: "AI Teacher",
      text: "Hello Sarah! You can write on the board or message me your calculus questions right here.",
      time: "10:00 AM",
    },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMsg: MeetMessage = {
      id: Date.now().toString(),
      sender: "user",
      senderName: "You",
      text,
      time: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = "Great question! Let's examine the derivative curve on the board.";
      const lower = text.toLowerCase();
      if (lower.includes("derivative") || lower.includes("slope")) {
        reply = "Remember: the derivative represents the instantaneous slope of the tangent line at that exact coordinate.";
      } else if (lower.includes("limit") || lower.includes("h")) {
        reply = "As h approaches 0, the secant line rotates until it snaps into the tangent line.";
      } else if (lower.includes("clear") || lower.includes("board")) {
        reply = "Feel free to use the eraser or the clear tool at the top-left of the board anytime!";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          senderName: "AI Teacher",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsAiTyping(false);
      onTriggerBoardDraw?.(text);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 sm:w-88 h-full bg-[#202124] border-r border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl shrink-0 z-20 animate-in slide-in-from-left-4 duration-200">
      {/* Google Meet Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <MessageSquare className="size-4 text-orange-500" />
            In-call messages
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Messages can only be seen by people in the call
          </p>
        </div>

        <button
          onClick={onClose}
          className="size-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Close chat"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg) => {
          const isMe = msg.sender === "user";
          return (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className={`font-bold ${isMe ? "text-orange-400" : "text-emerald-400"}`}>
                  {msg.senderName}
                </span>
                <span className="text-slate-500 text-[10px]">{msg.time}</span>
              </div>
              <p className="text-slate-200 leading-relaxed bg-[#2d3035] rounded-xl p-2.5 break-words">
                {msg.text}
              </p>
            </div>
          );
        })}

        {isAiTyping && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
            <span>AI Teacher is typing</span>
            <span className="size-1 rounded-full bg-orange-400 animate-bounce" />
            <span className="size-1 rounded-full bg-orange-400 animate-bounce delay-100" />
            <span className="size-1 rounded-full bg-orange-400 animate-bounce delay-200" />
          </div>
        )}
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 border-t border-slate-800 bg-[#282a2d] shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            className="flex-1 bg-[#1e2022] border border-slate-700/80 rounded-full px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />

          <button
            onClick={handleSend}
            disabled={!inputVal.trim()}
            className="size-9 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Send"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

