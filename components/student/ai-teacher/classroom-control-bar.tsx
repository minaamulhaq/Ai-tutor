"use client";

import React, { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Hand,
  Settings,
  PhoneOff,
  Volume2,
  VolumeX,
  FileDown,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentMediaState } from "./types";

interface ClassroomControlBarProps {
  mediaState: StudentMediaState;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleHand: () => void;
  onToggleScreenShare: () => void;
  onEndSessionClick: () => void;
  isChatOpen: boolean;
  onToggleChat?: () => void;
}

export function ClassroomControlBar({
  mediaState,
  onToggleMic,
  onToggleCamera,
  onToggleHand,
  onToggleScreenShare,
  onEndSessionClick,
  isChatOpen,
  onToggleChat,
}: ClassroomControlBarProps) {
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);

  return (
    <footer className="h-18 shrink-0 px-4 sm:px-6 bg-slate-900 border-t border-slate-800 text-white flex items-center justify-between gap-4 select-none z-30 relative">
      {/* Left: Device status & Audio preview */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={isSpeakerMuted ? "Unmute Classroom Audio" : "Mute Classroom Audio"}
        >
          {isSpeakerMuted ? (
            <VolumeX className="size-3.5 text-red-400" />
          ) : (
            <Volume2 className="size-3.5 text-emerald-400" />
          )}
          <span className="font-mono text-[11px]">
            {isSpeakerMuted ? "Muted" : "Audio Active"}
          </span>
        </button>

        <div className="text-[11px] text-slate-500 font-medium">
          ZuhDemy AI Audio Engine v2.4
        </div>
      </div>

      {/* Center: Core Meeting Action Controls */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 md:flex-initial">
        {/* 1. Microphone Toggle */}
        <button
          onClick={onToggleMic}
          className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
            mediaState.isMicOn
              ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 hover:scale-105"
              : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
          }`}
          title={mediaState.isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {mediaState.isMicOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </button>

        {/* 2. Camera Toggle */}
        <button
          onClick={onToggleCamera}
          className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
            mediaState.isCameraOn
              ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80 hover:scale-105"
              : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
          }`}
          title={mediaState.isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {mediaState.isCameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
        </button>

        {/* 3. Raise Hand Toggle */}
        <button
          onClick={onToggleHand}
          className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md border ${
            mediaState.isHandRaised
              ? "bg-amber-500 text-slate-950 border-amber-400 font-bold scale-105 shadow-amber-500/25 ring-2 ring-amber-400/50"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/80"
          }`}
          title={mediaState.isHandRaised ? "Lower Hand" : "Raise Hand"}
        >
          <Hand className="size-5" />
        </button>

        {/* 4. Screen Share Toggle (Mock) */}
        <button
          onClick={onToggleScreenShare}
          className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md border ${
            mediaState.isScreenSharing
              ? "bg-orange-500 text-white border-orange-400 scale-105"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/80"
          }`}
          title="Share Screen to AI Tutor"
        >
          <ScreenShare className="size-5" />
        </button>

        {/* 5. Mobile Chat Toggle (if small screens) */}
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className={`xl:hidden size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md border ${
              isChatOpen
                ? "bg-orange-500 text-white border-orange-400"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/80"
            }`}
            title="Toggle Classroom Inquiries"
          >
            <MessageSquare className="size-5" />
          </button>
        )}

        {/* 6. Settings Popover Toggle */}
        <button
          onClick={() => setShowSettingsPopover(!showSettingsPopover)}
          className="size-11 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/80 shadow-md"
          title="Classroom Device Settings"
        >
          <Settings className="size-5" />
        </button>
      </div>

      {/* Right: Leave Classroom Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onEndSessionClick}
          className="h-11 px-4 sm:px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 gap-2 transition-all cursor-pointer"
        >
          <PhoneOff className="size-4" />
          <span className="hidden sm:inline">Leave Classroom</span>
          <span className="sm:hidden">Leave</span>
        </Button>
      </div>

      {/* Settings Dialog / Popover */}
      {showSettingsPopover && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 w-80 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-200 space-y-3 z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Settings className="size-3.5 text-orange-500" /> Audio & Video Settings
            </span>
            <button
              onClick={() => setShowSettingsPopover(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-[11px] font-semibold text-slate-400">Microphone Input</label>
            <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500">
              <option>Default - High Definition Microphone (Realtek)</option>
              <option>Built-in Array Microphone</option>
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-[11px] font-semibold text-slate-400">Camera Device</label>
            <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500">
              <option>Integrated Webcam (720p HD)</option>
              <option>External USB Camera</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
            <span>Noise Cancellation</span>
            <span className="text-emerald-400 font-bold">AI Active</span>
          </div>
        </div>
      )}
    </footer>
  );
}

