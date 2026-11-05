"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isSending?: boolean;
}

const QUICK_REPLIES = [
  "Are you available this weekend?",
  "Can we review past exam questions?",
  "Could you share the lecture slides?",
  "Thank you so much!",
];

export function ChatInput({ onSendMessage, isSending = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedAttachmentName, setSelectedAttachmentName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() && !selectedAttachmentName) return;

    onSendMessage(text);
    setText("");
    setSelectedAttachmentName(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedAttachmentName(e.target.files[0].name);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2 shrink-0">
      {/* Quick Replies Shortcut Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {QUICK_REPLIES.map((reply, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setText(reply)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 text-[11px] font-medium transition-all shrink-0 cursor-pointer border border-transparent hover:border-orange-200"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Selected Mock Attachment Preview */}
      {selectedAttachmentName && (
        <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs text-orange-900">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="size-3.5 text-orange-600 shrink-0" />
            <span className="truncate font-semibold">{selectedAttachmentName}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAttachmentName(null)}
            className="text-orange-600 hover:text-orange-900 p-1"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Attachment Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer shrink-0"
          title="Attach PDF or homework document"
          aria-label="Attach file"
        >
          <Paperclip className="size-4.5" />
        </button>

        {/* Text Area */}
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Enter to send, Shift+Enter for new line)"
          className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm py-2 px-1 focus:outline-hidden text-slate-900 placeholder:text-slate-400 max-h-32 min-h-[38px]"
        />

        {/* Send Button */}
        <Button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!text.trim() && !selectedAttachmentName}
          className="size-9 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white p-0 flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-all"
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
