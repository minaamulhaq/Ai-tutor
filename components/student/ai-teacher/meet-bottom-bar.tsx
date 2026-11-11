"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Hand, MessageSquare } from "lucide-react";

interface MeetBottomBarProps {
  isMicOn: boolean;
  isCameraOn: boolean;
  isHandRaised: boolean;
  isChatOpen: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleHand: () => void;
  onToggleChat: () => void;
  onLeaveCall: () => void;
}

export function MeetBottomBar({
  isMicOn,
  isCameraOn,
  isHandRaised,
  isChatOpen,
  onToggleMic,
  onToggleCamera,
  onToggleHand,
  onToggleChat,
  onLeaveCall,
}: MeetBottomBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-20 shrink-0 px-6 bg-[#202124] text-white flex items-center justify-between select-none z-30">
      {/* Left: Meeting Name & Time */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-300 font-mono">{time}</span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
          ZuhDemy AI Teacher Board
        </span>
      </div>

      {/* Center: Google Meet circular control buttons */}
      <div className="flex items-center gap-3">
        {/* Mic Button */}
        <button
          onClick={onToggleMic}
          className={`size-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
            isMicOn
              ? "bg-[#3c4043] hover:bg-[#474a4d] text-white"
              : "bg-[#ea4335] hover:bg-[#d93025] text-white"
          }`}
          title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
        >
          {isMicOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </button>

        {/* Camera Button */}
        <button
          onClick={onToggleCamera}
          className={`size-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
            isCameraOn
              ? "bg-[#3c4043] hover:bg-[#474a4d] text-white"
              : "bg-[#ea4335] hover:bg-[#d93025] text-white"
          }`}
          title={isCameraOn ? "Turn off camera" : "Turn on camera"}
        >
          {isCameraOn ? <Video className="size-5" /> : <VideoOff className="size-5" />}
        </button>

        {/* Hand Raise Button */}
        <button
          onClick={onToggleHand}
          className={`size-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
            isHandRaised
              ? "bg-[#fbbc04] text-slate-900 font-bold"
              : "bg-[#3c4043] hover:bg-[#474a4d] text-white"
          }`}
          title={isHandRaised ? "Lower hand" : "Raise hand"}
        >
          <Hand className="size-5" />
        </button>

        {/* In-Call Chat Button */}
        <button
          onClick={onToggleChat}
          className={`size-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
            isChatOpen
              ? "bg-orange-500 text-white ring-2 ring-orange-400"
              : "bg-[#3c4043] hover:bg-[#474a4d] text-white"
          }`}
          title={isChatOpen ? "Close chat" : "Open in-call messages"}
        >
          <MessageSquare className="size-5" />
        </button>

        {/* Leave Call (Red Pill button) */}
        <button
          onClick={onLeaveCall}
          className="h-12 px-6 rounded-full bg-[#ea4335] hover:bg-[#d93025] text-white flex items-center justify-center gap-2 font-medium transition-all cursor-pointer shadow-md ml-2"
          title="Leave call"
        >
          <PhoneOff className="size-5" />
          <span className="text-xs font-bold hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Right spacer for alignment */}
      <div className="w-24 hidden md:block" />
    </footer>
  );
}
