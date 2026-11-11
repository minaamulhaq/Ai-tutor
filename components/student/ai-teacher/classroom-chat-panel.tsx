"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, MessageSquare, Mic, Bot, User, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "./types";
import { INITIAL_CHAT_MESSAGES, SUGGESTED_QUESTIONS, LESSON_META } from "./mock-lesson-data";

interface ClassroomChatPanelProps {
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

export function ClassroomChatPanel({
  externalPrompt,
  onClearExternalPrompt,
}: ClassroomChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to latest
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAiTyping]);

  // Handle external prompts sent from board buttons (e.g. "Simplify", "Generate Analogy")
  useEffect(() => {
    if (externalPrompt) {
      sendMessage(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const sendMessage = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newStudentMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "student",
      senderName: "Sarah J.",
      text: content.trim(),
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newStudentMsg]);
    setInputText("");
    setIsAiTyping(true);

    // Mock AI response generation
    setTimeout(() => {
      let replyText =
        "That's a thoughtful question, Sarah! In calculus, think of the tangent line as the speedometer of your car: even if you look at it for a fraction of a millisecond, it shows your instantaneous rate of motion.";

      const lower = content.toLowerCase();
      if (lower.includes("0/0") || lower.includes("undefined")) {
        replyText =
          "0/0 is called an 'indeterminate form'. It means the expression lacks sufficient information by itself to determine the value. The limit allows us to factor out the dividing zero and reveal the true slope!";
      } else if (lower.includes("power rule")) {
        replyText =
          "The power rule states that d/dx[xⁿ] = n·xⁿ⁻¹. For example, if f(x) = x⁴, we pull down the 4 and reduce the power to 3, giving 4x³. Try it on x⁵!";
      } else if (lower.includes("simplify") || lower.includes("simpler")) {
        replyText =
          "To put it simply: the secant line is the average speed between two cities, while the tangent line is the exact radar gun reading at a specific mile marker!";
      } else if (lower.includes("constant") || lower.includes("zero")) {
        replyText =
          "A constant function like f(x) = 7 is a completely flat horizontal line. Its slope is 0 everywhere, which is why the derivative of any constant is always 0!";
      } else if (lower.includes("analogy") || lower.includes("example")) {
        replyText =
          "Imagine tossing an apple into the air. At the very peak of its flight, before falling back down, its vertical velocity is momentarily zero. That peak corresponds to a horizontal tangent line with slope m = 0!";
      }

      const aiReply: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        senderName: LESSON_META.tutorName,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isAi: true,
      };

      setMessages((prev) => [...prev, aiReply]);
      setIsAiTyping(false);
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-3.5 text-orange-500" />
          <span className="text-xs font-bold text-slate-200">Classroom Inquiries</span>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0"
        >
          AI Active
        </Badge>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[140px]">
        {messages.map((msg) => {
          const isMe = msg.sender === "student";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">{msg.senderName}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  isMe
                    ? "bg-orange-500 text-white rounded-tr-none shadow-xs"
                    : "bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {isAiTyping && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold">
              {LESSON_META.tutorName} is thinking...
            </span>
            <div className="bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700/60 flex items-center gap-1 text-slate-400 text-xs">
              <span className="size-1.5 rounded-full bg-orange-400 animate-bounce" />
              <span className="size-1.5 rounded-full bg-orange-400 animate-bounce delay-100" />
              <span className="size-1.5 rounded-full bg-orange-400 animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-1.5 border-t border-slate-800/70 bg-slate-950/60 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
        <Sparkles className="size-3 text-orange-500 shrink-0" />
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(q)}
            className="text-[10px] whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-900/95 shrink-0">
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI Tutor anything..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!inputText.trim()}
            className="size-8 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
            title="Send Message"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

