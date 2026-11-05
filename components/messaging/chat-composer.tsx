"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Paperclip,
  Smile,
  Send,
  Loader2,
  X,
  FileText,
  ImageIcon,
  AlertCircle,
  FileArchive,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadMessageAttachment } from "@/lib/media/attachmentStorage";

interface PendingAttachment {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  fileType: "image" | "pdf" | "doc" | "zip" | "other";
  previewUrl?: string;
  isUploading?: boolean;
}

interface ChatComposerProps {
  onSendMessage: (
    content: string,
    attachments?: Array<{
      name: string;
      url: string;
      fileType: "image" | "pdf" | "doc" | "zip" | "other";
      sizeBytes: number;
    }>
  ) => Promise<boolean>;
  onTypingNotice?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  conversationId?: string;
}

const EMOJI_CATEGORIES = [
  {
    category: "Smileys",
    emojis: ["😊", "👋", "🙌", "👍", "👏", "🎉", "🔥", "💯", "✨", "🤝", "💡", "🎯"],
  },
  {
    category: "Study & Academics",
    emojis: ["📚", "📖", "✏️", "📝", "💻", "🔬", "📐", "🧪", "🎓", "🧠", "📊", "🏆"],
  },
  {
    category: "Expressions",
    emojis: ["❤️", "⭐", "✅", "❓", "❗", "clock", "⏰", "⏳", "👀", "🚀", "🌟", "💪"],
  },
];

const MAX_CHAR_LIMIT = 2000;
const DANGEROUS_EXTS = new Set([".exe", ".bat", ".cmd", ".sh", ".bash", ".bin", ".msi", ".vbs", ".ps1"]);

export function ChatComposer({
  onSendMessage,
  onTypingNotice,
  disabled = false,
  placeholder = "Type your message here... (Press Enter to send, Shift + Enter for new line)",
  conversationId,
}: ChatComposerProps) {
  const [content, setContent] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close emoji picker on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    }
    if (isEmojiPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEmojiPickerOpen]);

  // Auto-resize textarea up to max-height
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [content]);

  // Typing notice trigger
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setErrorMessage(null);

    if (onTypingNotice) {
      onTypingNotice(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTypingNotice(false);
      }, 2000);
    }
  };

  // Keyboard shortcut: Enter to send, Shift + Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Insert emoji at cursor position
  const handleInsertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    if (el) {
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const updated = content.slice(0, start) + emoji + content.slice(end);
      setContent(updated);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setContent((prev) => prev + emoji);
    }
  };

  // File selection handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    const newItems: PendingAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 15MB file size limit.`);
        continue;
      }

      // Validate extension
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (DANGEROUS_EXTS.has(ext)) {
        setErrorMessage(`"${file.name}" has an unsafe file extension and cannot be uploaded.`);
        continue;
      }

      let fileType: "image" | "pdf" | "doc" | "zip" | "other" = "other";
      let previewUrl: string | undefined = undefined;

      if (file.type.startsWith("image/")) {
        fileType = "image";
        previewUrl = URL.createObjectURL(file);
      } else if (file.type === "application/pdf" || ext === ".pdf") {
        fileType = "pdf";
      } else if (ext === ".doc" || ext === ".docx" || ext === ".txt") {
        fileType = "doc";
      } else if (ext === ".zip" || ext === ".rar") {
        fileType = "zip";
      }

      newItems.push({
        id: `att_${Date.now()}_${i}`,
        file,
        name: file.name,
        sizeBytes: file.size,
        fileType,
        previewUrl,
      });
    }

    setPendingAttachments((prev) => [...prev, ...newItems].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  // Upload attachments and send message
  const handleSend = async () => {
    const clean = content.trim();
    if (!clean && pendingAttachments.length === 0) return;
    if (isSubmitting || disabled) return;

    if (clean.length > MAX_CHAR_LIMIT) {
      setErrorMessage(`Message is too long (${clean.length}/${MAX_CHAR_LIMIT} chars).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    if (onTypingNotice) onTypingNotice(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      // 1. Upload files directly to the storage bucket
      const uploadedAttachments: Array<{
        name: string;
        url: string;
        fileType: "image" | "pdf" | "doc" | "zip" | "other";
        sizeBytes: number;
        mimeType?: string;
      }> = [];

      for (const item of pendingAttachments) {
        const uploaded = await uploadMessageAttachment(
          item.file,
          conversationId || "general"
        );
        uploadedAttachments.push(uploaded);
      }

      // 2. Send the message via action
      const success = await onSendMessage(
        clean,
        uploadedAttachments.length > 0 ? uploadedAttachments : undefined
      );

      if (success) {
        setContent("");
        // Clean up preview URLs
        pendingAttachments.forEach((att) => {
          if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
        });
        setPendingAttachments([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.focus();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverLimit = content.length > MAX_CHAR_LIMIT;

  return (
    <footer className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2">
      {/* 1. Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-fadeIn">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-600"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* 2. Pending Attachments Preview Shelf */}
      {pendingAttachments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {pendingAttachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-orange-50 border border-orange-200 text-slate-800 text-xs shrink-0 max-w-[200px]"
            >
              {att.fileType === "image" && att.previewUrl ? (
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="size-8 object-cover rounded-lg shrink-0 border border-orange-200"
                />
              ) : att.fileType === "pdf" ? (
                <FileText className="size-6 text-rose-500 shrink-0" />
              ) : att.fileType === "zip" ? (
                <FileArchive className="size-6 text-amber-500 shrink-0" />
              ) : (
                <FileCode className="size-6 text-blue-500 shrink-0" />
              )}

              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold truncate">{att.name}</div>
                <div className="text-[10px] text-slate-500">
                  {(att.sizeBytes / 1024).toFixed(0)} KB
                </div>
              </div>

              <button
                type="button"
                onClick={() => removePendingAttachment(att.id)}
                className="size-5 rounded-full hover:bg-orange-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
                title="Remove attachment"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Message Input Composer Box */}
      <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,.zip"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || isSubmitting}
          onClick={() => fileInputRef.current?.click()}
          className="size-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 shrink-0 cursor-pointer"
          title="Attach PDF, document, or image (Max 15MB)"
        >
          <Paperclip className="size-4.5" />
        </Button>

        {/* Emoji Picker Popover */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            disabled={disabled || isSubmitting}
            onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
            className="size-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 flex items-center justify-center shrink-0 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 disabled:pointer-events-none"
            title="Insert emoji"
            aria-label="Insert emoji"
            aria-expanded={isEmojiPickerOpen}
          >
            <Smile className="size-4.5" />
          </button>

          {isEmojiPickerOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 select-none">
              <div className="space-y-3">
                {EMOJI_CATEGORIES.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {cat.category}
                    </span>
                    <div className="grid grid-cols-6 gap-1">
                      {cat.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            handleInsertEmoji(emoji);
                            setIsEmojiPickerOpen(false);
                          }}
                          className="size-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-base cursor-pointer transition-transform hover:scale-120"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Auto-growing Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSubmitting}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[36px] max-h-[120px] py-2 px-1 leading-relaxed"
        />

        {/* Character Limit Badge (if approaching limit) */}
        {content.length > 1500 && (
          <span
            className={cn(
              "text-[10px] font-semibold self-center px-1",
              isOverLimit ? "text-rose-600 font-bold" : "text-slate-400"
            )}
          >
            {content.length}/{MAX_CHAR_LIMIT}
          </span>
        )}

        {/* Send Action Button */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={
            disabled ||
            isSubmitting ||
            isOverLimit ||
            (!content.trim() && pendingAttachments.length === 0)
          }
          className="size-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shrink-0 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Send Message"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4 stroke-[2.5]" />
          )}
        </Button>
      </div>
    </footer>
  );
}
