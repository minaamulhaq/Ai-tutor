"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, MessageSquare, Check, Sparkles } from "lucide-react";
import { getDirectoryUsersAction } from "@/app/actions/messageActions";

interface DirectoryUser {
  id: string;
  fullName: string;
  avatarUrl?: string;
  role: "student" | "teacher";
  headline?: string;
  subject?: string;
  hourlyRatePkr?: number;
}

interface NewConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: DirectoryUser) => void;
}

export function NewConversationDialog({
  isOpen,
  onClose,
  onSelectUser,
}: NewConversationDialogProps) {
  const [search, setSearch] = useState("");
  const [usersList, setUsersList] = useState<DirectoryUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;
    setIsLoading(true);

    getDirectoryUsersAction(search)
      .then((data) => {
        if (isCurrent) {
          setUsersList(data as DirectoryUser[]);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, search]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border-slate-200">
        <DialogHeader className="p-5 pb-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <MessageSquare className="size-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Direct Messaging</span>
          </div>
          <DialogTitle className="text-base font-bold text-slate-900">
            Start a New Conversation
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Search for an instructor or enrolled student to ask questions and coordinate lessons.
          </DialogDescription>

          <div className="relative mt-3">
            <Search className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by name, subject, or specialty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 h-10 text-xs bg-white rounded-xl border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto p-3 space-y-1 divide-y divide-slate-100/80">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
              <Loader2 className="size-5 animate-spin text-orange-500" />
              <span className="text-xs">Loading directory...</span>
            </div>
          ) : usersList.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2">
              <div className="size-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="size-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No users found</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Try searching for another instructor name or subject keyword.
              </p>
            </div>
          ) : (
            usersList.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  onSelectUser(user);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-orange-50/60 transition-colors flex items-center gap-3 group cursor-pointer"
              >
                <Avatar className="size-10 rounded-full border border-slate-200 shrink-0">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-bold text-xs">
                    {user.fullName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                      {user.fullName}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 h-4 rounded-md capitalize font-medium text-slate-600 border-slate-200"
                    >
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {user.headline || user.subject || "Instructor"}
                  </p>
                </div>

                {user.hourlyRatePkr && (
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-orange-600">
                      PKR {user.hourlyRatePkr.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/ hour</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
