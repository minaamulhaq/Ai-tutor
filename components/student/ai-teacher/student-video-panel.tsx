"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Volume2,
  Sparkles,
  User,
  Radio,
  Wifi,
  ThumbsUp,
  HelpCircle,
  Smile,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LESSON_META } from "./mock-lesson-data";
import { StudentMediaState } from "./types";

interface StudentVideoPanelProps {
  mediaState: StudentMediaState;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleHand: () => void;
}

export function StudentVideoPanel({
  mediaState,
  onToggleMic,
  onToggleCamera,
  onToggleHand,
}: StudentVideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  // Trigger temporary reaction bubble
  const triggerReaction = (emoji: string) => {
    setActiveReaction(emoji);
    setTimeout(() => setActiveReaction(null), 2500);
  };

  // Attempt to bind real webcam if camera is toggled on
  useEffect(() => {
    let isCancelled = false;

    async function setupCamera() {
      if (mediaState.isCameraOn && typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false,
          });

          if (!isCancelled) {
            streamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setHasCameraPermission(true);
          }
        } catch (err) {
          if (!isCancelled) {
            setHasCameraPermission(false);
          }
        }
      } else {
        // Stop stream when camera turned off
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    }

    setupCamera();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaState.isCameraOn]);

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Student Live Camera Box */}
      <div className="relative aspect-video sm:aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-md group">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform scale-x-[-1] ${
            mediaState.isCameraOn && hasCameraPermission ? "block" : "hidden"
          }`}
        />

        {/* Fallback Placeholder when Camera is Off or Permission Denied */}
        {(!mediaState.isCameraOn || !hasCameraPermission) && (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-400 select-none relative">
            <div className="relative">
              <Avatar className="size-20 border-2 border-slate-700 shadow-xl ring-4 ring-orange-500/20">
                <AvatarImage src={LESSON_META.studentAvatar} alt={LESSON_META.studentName} />
                <AvatarFallback className="bg-orange-500 text-white font-bold text-xl">
                  SJ
                </AvatarFallback>
              </Avatar>

              {/* Hand Raised badge on avatar */}
              {mediaState.isHandRaised && (
                <div className="absolute -top-1 -right-1 size-7 rounded-full bg-amber-500 text-white flex items-center justify-center animate-bounce shadow-md">
                  <Hand className="size-4" />
                </div>
              )}
            </div>

            <span className="text-xs font-semibold text-slate-200 mt-2.5">
              {LESSON_META.studentName}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              {mediaState.isCameraOn && !hasCameraPermission
                ? "Camera feed simulated (permission denied)"
                : "Camera is paused"}
            </span>
          </div>
        )}

        {/* Top Floating Overlay: Quality & Hand Raised */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <Badge
            variant="outline"
            className="bg-black/60 backdrop-blur-md border-white/10 text-white font-mono text-[10px] px-2 py-0.5 flex items-center gap-1"
          >
            <Wifi className="size-2.5 text-emerald-400" />
            <span>HD 720p</span>
          </Badge>

          {mediaState.isHandRaised && (
            <div className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md animate-pulse">
              <Hand className="size-3" />
              <span>Hand Raised</span>
            </div>
          )}
        </div>

        {/* Bottom Floating Overlay: Name + Audio Level Visualizer */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium">
            <span className="truncate max-w-[120px]">{LESSON_META.studentName} (You)</span>
            <span className="size-1.5 rounded-full bg-emerald-500" />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Indicator */}
            <div className="p-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white">
              {mediaState.isMicOn ? (
                <div className="flex items-center gap-0.5 h-3 px-0.5">
                  <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-75" />
                  <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
                </div>
              ) : (
                <MicOff className="size-3 text-red-400" />
              )}
            </div>
          </div>
        </div>

        {/* Reaction Animation Popup */}
        {activeReaction && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-4xl animate-bounce drop-shadow-lg">
              {activeReaction}
            </div>
          </div>
        )}
      </div>

      {/* 2. AI Tutor Visual Live Presence Card */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <Avatar className="size-10 border border-orange-500/40 shadow-sm ring-2 ring-orange-500/20">
              <AvatarImage src={LESSON_META.tutorAvatar} alt={LESSON_META.tutorName} />
              <AvatarFallback className="bg-orange-500 text-white font-bold text-xs">
                AI
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100 truncate">
                {LESSON_META.tutorName}
              </span>
              <Sparkles className="size-3 text-orange-400 shrink-0" />
            </div>
            <span className="text-[10px] text-slate-400 truncate">
              {LESSON_META.tutorRole}
            </span>
          </div>
        </div>

        {/* Live Audio Equalizer Waveform */}
        <div className="flex items-center gap-0.5 px-2 py-1 rounded bg-slate-950/70 border border-slate-800">
          <span className="w-0.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
          <span className="w-0.5 h-4 bg-orange-500 rounded-full animate-pulse delay-100" />
          <span className="w-0.5 h-3 bg-orange-500 rounded-full animate-pulse delay-200" />
          <span className="w-0.5 h-1.5 bg-orange-500 rounded-full animate-pulse delay-75" />
        </div>
      </div>

      {/* 3. Quick Student Engagement Buttons */}
      <div className="flex items-center justify-between gap-1.5 px-1">
        <button
          onClick={onToggleHand}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
            mediaState.isHandRaised
              ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-sm"
              : "bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800"
          }`}
          title="Raise hand to ask a question"
        >
          <Hand className="size-3" />
          <span>{mediaState.isHandRaised ? "Hand Raised" : "Raise Hand"}</span>
        </button>

        <button
          onClick={() => triggerReaction("👍")}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
          title="Understood / Got It"
        >
          👍
        </button>

        <button
          onClick={() => triggerReaction("💡")}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
          title="Eureka / Insight"
        >
          💡
        </button>

        <button
          onClick={() => triggerReaction("🤔")}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
          title="Need clarification"
        >
          🤔
        </button>
      </div>
    </div>
  );
}

