"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Clock,
  Radio,
  PhoneOff,
  Maximize2,
  Minimize2,
  FileText,
  Layout,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LESSON_META } from "./mock-lesson-data";
import { ClassroomTab } from "./types";

interface AiClassroomHeaderProps {
  activeTab: ClassroomTab;
  setActiveTab: (tab: ClassroomTab) => void;
  onEndSessionClick: () => void;
  currentStepIndex: number;
  totalSteps: number;
}

export function AiClassroomHeader({
  activeTab,
  setActiveTab,
  onEndSessionClick,
  currentStepIndex,
  totalSteps,
}: AiClassroomHeaderProps) {
  // Real-time ticking classroom clock
  const [secondsElapsed, setSecondsElapsed] = useState<number>(1455); // starts at ~24m 15s
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-16 shrink-0 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between gap-4 select-none z-30">
      {/* Left: Brand + AI Tutor badge */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Link
          href="/student"
          className="flex items-center gap-2.5 group shrink-0"
          title="Return to Student Portal"
        >
          <div className="size-8.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="size-4.5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1 leading-none">
              Zuh<span className="text-orange-500">Demy</span>
            </span>
            <span className="text-[10px] text-orange-400/90 font-medium tracking-wider uppercase mt-0.5">
              AI Classroom Studio
            </span>
          </div>
        </Link>

        <div className="hidden md:block h-6 w-px bg-slate-800" />

        {/* AI Tutor Active Status Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200 truncate">
            {LESSON_META.tutorName}
          </span>
          <span className="text-[10px] text-orange-400 font-medium hidden lg:inline">
            • AI Tutor
          </span>
        </div>

        {/* Lesson Topic Title */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-500">/</span>
          <span className="font-medium text-slate-300 truncate max-w-[220px]">
            {LESSON_META.topic}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-mono border-orange-500/30 text-orange-400 bg-orange-500/10 px-1.5 py-0"
          >
            Step {currentStepIndex + 1}/{totalSteps}
          </Badge>
        </div>
      </div>

      {/* Center: Tabs & Timer */}
      <div className="flex items-center gap-3">
        {/* Navigation Tabs between Whiteboard, Notes, and Quiz */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-950/70 border border-slate-800">
          <button
            onClick={() => setActiveTab("whiteboard")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "whiteboard"
                ? "bg-orange-500 text-white shadow-xs font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layout className="size-3.5" />
            <span className="hidden sm:inline">Interactive Board</span>
            <span className="sm:hidden">Board</span>
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "notes"
                ? "bg-orange-500 text-white shadow-xs font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="size-3.5" />
            <span className="hidden sm:inline">Concept Notes</span>
            <span className="sm:hidden">Notes</span>
          </button>
          <button
            onClick={() => setActiveTab("practice")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "practice"
                ? "bg-orange-500 text-white shadow-xs font-semibold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="size-3.5" />
            <span className="hidden sm:inline">Practice Quiz</span>
            <span className="sm:hidden">Quiz</span>
          </button>
        </div>

        {/* Live Timer Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs font-mono text-slate-300">
          <Clock className="size-3.5 text-orange-400" />
          <span>{formatTimer(secondsElapsed)}</span>
        </div>
      </div>

      {/* Right: Quality signal, Fullscreen & End Session button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded-md">
          <Radio className="size-3 animate-pulse" />
          <span>1080p 60fps</span>
        </div>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="size-8.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/50 cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>

        {/* End Session Button */}
        <Button
          onClick={onEndSessionClick}
          variant="destructive"
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3.5 h-8.5 rounded-lg shadow-sm gap-1.5 transition-all cursor-pointer"
        >
          <PhoneOff className="size-3.5" />
          <span>End Session</span>
        </Button>
      </div>
    </header>
  );
}

