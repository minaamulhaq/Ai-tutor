"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageComposerProps {
  onSendMessage: (text: string) => Promise<boolean>;
  disabled?: boolean;
}

export function MessageComposer({
  onSendMessage,
  disabled = false,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [text]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending || disabled) return;

    setIsSending(true);
    setError(null);

    try {
      const success = await onSendMessage(trimmed);
      if (success) {
        // Clear text ONLY after successful message delivery
        setText("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      } else {
        // Preserves message text on failure!
        setError("Failed to deliver message. Tap to retry.");
      }
    } catch (err) {
      console.error("Composer send error:", err);
      // Preserves message text on failure!
      setError("Failed to deliver message. Tap to retry.");
    } finally {
      setIsSending(false);
      // Re-focus composer
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends the message, Shift+Enter inserts a new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0 && !isSending && !disabled;

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2">
      {error && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleSend}
            className="font-semibold underline hover:text-rose-900 cursor-pointer"
          >
            Retry Send
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
        {/* Multiline Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled || isSending}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-0 resize-none outline-none text-xs sm:text-sm px-3 py-2 max-h-[140px] text-slate-900 placeholder:text-slate-400 disabled:opacity-50"
          aria-label="Type message text"
        />

        {/* Send Button */}
        <Button
          type="button"
          size="sm"
          disabled={!canSend}
          onClick={handleSend}
          className="size-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shrink-0 shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center p-0"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4 -ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
