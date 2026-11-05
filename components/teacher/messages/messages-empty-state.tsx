"use client";

import React from "react";
import { MessageSquare, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoConversationSelectedProps {
  conversationsCount: number;
}

export function NoConversationSelected({
  conversationsCount,
}: NoConversationSelectedProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-slate-50/50 space-y-4">
      <div className="size-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-2xs">
        <MessageSquare className="size-8" />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-bold text-base sm:text-lg text-slate-900">
          Select a conversation to start messaging
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {conversationsCount > 0
            ? "Choose a student from the conversation list on the left to review chat history and coordinate lesson plans."
            : "Direct messages with your enrolled students will appear in the list once active."}
        </p>
      </div>
    </div>
  );
}

interface MessagesErrorStateProps {
  onRetry: () => void;
}

export function MessagesErrorState({ onRetry }: MessagesErrorStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white space-y-4">
      <div className="size-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs">
        <AlertTriangle className="size-7" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="font-bold text-base text-slate-900">
          Unable to load messages
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          An error occurred while connecting to the messaging service. Please try again.
        </p>
      </div>
      <Button
        onClick={onRetry}
        className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs h-9 px-4 gap-2 cursor-pointer shadow-2xs"
      >
        <RotateCcw className="size-3.5" />
        <span>Try Again</span>
      </Button>
    </div>
  );
}
