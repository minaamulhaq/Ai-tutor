"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Conversation, Message } from "@/types/message";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Video,
  BookOpen,
  GraduationCap,
  Download,
  FileText,
  FileCode,
  FileArchive,
  ImageIcon,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserInfoSidebarProps {
  conversation: Conversation;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export function UserInfoSidebar({
  conversation,
  messages,
  isOpen,
  onClose,
}: UserInfoSidebarProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<"files" | "photos">("files");

  if (!isOpen) return null;

  const partner = conversation.participant || {
    id: conversation.teacherId || "user",
    fullName: conversation.teacherName || "User",
    role: "teacher" as const,
    avatarUrl: conversation.teacherAvatarUrl || "",
    isOnline: conversation.teacherIsOnline ?? false,
    isVerified: conversation.isVerified ?? false,
    headline: conversation.teacherHeadline || "",
    subject: conversation.teacherSubject || "",
    hourlyRatePkr: conversation.teacherHourlyRate || 0,
  };
  const isTeacher = partner.role === "teacher";
  const profileUrl = isTeacher
    ? `/student/teachers/${partner.id}`
    : `/teacher/students`;

  // Extract all attachments exchanged in this conversation
  const allAttachments = messages.flatMap((m) => m.attachments || []);
  const fileAttachments = allAttachments.filter((a) => a.fileType !== "image");
  const photoAttachments = allAttachments.filter((a) => a.fileType === "image");

  return (
    <aside className="w-full lg:w-76 xl:w-84 border-l border-slate-200 bg-white flex flex-col h-full shrink-0 z-20">
      {/* 1. Header with Close Button */}
      <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          User Information
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="size-8 rounded-lg text-slate-400 hover:text-slate-700"
          title="Close details"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* 2. Scrollable Profile & Context Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Profile Card */}
        <div className="text-center space-y-2.5 pb-4 border-b border-slate-100">
          <Avatar className="size-20 rounded-full border-2 border-orange-200 mx-auto shadow-sm">
            <AvatarImage src={partner.avatarUrl} alt={partner.fullName} />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-extrabold text-xl">
              {partner.fullName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900">{partner.fullName}</h4>
              {partner.isVerified && (
                <ShieldCheck className="size-4 text-blue-500 shrink-0" title="Verified Identity" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {partner.headline || (isTeacher ? "Verified Instructor" : "Enrolled Student")}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0.5 capitalize font-medium text-slate-600 border-slate-200"
            >
              {partner.role}
            </Badge>
            {partner.isOnline ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">
                {partner.lastSeen || "Offline"}
              </span>
            )}
          </div>

          {/* Action to View Full Profile */}
          <div className="pt-1 flex items-center justify-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold h-8 border-slate-200 hover:border-orange-300 hover:text-orange-600"
            >
              <Link href={profileUrl}>
                <ExternalLink className="size-3.5 mr-1.5" />
                <span>View Full Profile</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Teacher Details & Book Class CTA */}
        {isTeacher && (
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Hourly Rate:</span>
              <span className="font-extrabold text-orange-600 text-sm">
                PKR {(partner.hourlyRatePkr || 2500).toLocaleString()} / hr
              </span>
            </div>

            {partner.subject && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Subject Expertise
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/60 text-[11px] font-semibold">
                    {partner.subject}
                  </span>
                </div>
              </div>
            )}

            {partner.bio && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  About
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                  {partner.bio}
                </p>
              </div>
            )}

            <Button
              asChild
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold h-9 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Link href={`/student/teachers/${partner.id}`}>
                <Calendar className="size-3.5" />
                <span>Book a 1-on-1 Class</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Upcoming Class Details */}
        {conversation.upcomingClass && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Calendar className="size-3.5 text-emerald-600" />
              <span>Upcoming Scheduled Class</span>
            </div>
            <div className="text-xs text-slate-800 space-y-0.5 font-medium">
              <div className="font-bold text-slate-900">{conversation.upcomingClass.topic}</div>
              <div className="text-[11px] text-slate-600">
                {conversation.upcomingClass.date} • {conversation.upcomingClass.time}
              </div>
            </div>
            {conversation.upcomingClass.meetingUrl && (
              <Button
                asChild
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-7.5 rounded-lg mt-1"
              >
                <a
                  href={conversation.upcomingClass.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5"
                >
                  <Video className="size-3.5" />
                  <span>Join Google Meet</span>
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Shared Media & Attachments Vault */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Shared Attachments ({allAttachments.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveMediaTab("files")}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded font-semibold transition-colors",
                  activeMediaTab === "files"
                    ? "bg-slate-200 text-slate-900"
                    : "text-slate-400 hover:text-slate-700"
                )}
              >
                Docs ({fileAttachments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab("photos")}
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded font-semibold transition-colors",
                  activeMediaTab === "photos"
                    ? "bg-slate-200 text-slate-900"
                    : "text-slate-400 hover:text-slate-700"
                )}
              >
                Photos ({photoAttachments.length})
              </button>
            </div>
          </div>

          {activeMediaTab === "files" ? (
            fileAttachments.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic text-center py-4">
                No documents shared in this chat yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {fileAttachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-4 text-orange-500 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {file.name}
                      </span>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="size-6 rounded flex items-center justify-center text-slate-500 hover:text-orange-600 shrink-0"
                    >
                      <Download className="size-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )
          ) : photoAttachments.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic text-center py-4">
              No photos shared in this chat yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
              {photoAttachments.map((photo) => (
                <a
                  key={photo.id}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
