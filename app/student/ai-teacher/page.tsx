"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CanvasBoard } from "@/components/student/ai-teacher/canvas-board";
import { AiAvatarTile, UserScreenTile } from "@/components/student/ai-teacher/meet-tiles";
import { MeetBottomBar } from "@/components/student/ai-teacher/meet-bottom-bar";
import { MeetChatDrawer } from "@/components/student/ai-teacher/meet-chat-drawer";

export default function AiTeacherPage() {
  const router = useRouter();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLeaveCall = () => {
    router.push("/student");
  };

  const handleToggleCamera = () => {
    setIsCameraOn((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#202124] text-white flex flex-col h-screen w-screen overflow-hidden select-none font-sans">
      {/* Main Meet Workspace */}
      <main className="flex-1 flex flex-row min-h-0 p-4 gap-4 overflow-hidden">
        {/* Left Side: In-Call Chat Drawer (Google Meet style) */}
        {isChatOpen && (
          <MeetChatDrawer
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {/* Center: Clean Board with Table & Drawing Tools */}
        <section className="flex-1 h-full min-h-0 min-w-0">
          <CanvasBoard />
        </section>

        {/* Right Side: Participant Squares (AI Avatar & User Video) */}
        <aside className="w-64 sm:w-72 xl:w-80 flex flex-col gap-4 shrink-0 justify-center">
          {/* AI Teacher Avatar Square */}
          <AiAvatarTile isSpeaking={false} />

          {/* User Screen Square (Camera Feed) */}
          <UserScreenTile
            isCameraOn={isCameraOn}
            isMicOn={isMicOn}
            onToggleCamera={handleToggleCamera}
          />
        </aside>
      </main>

      {/* Google Meet Bottom Control Bar */}
      <MeetBottomBar
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isHandRaised={isHandRaised}
        isChatOpen={isChatOpen}
        onToggleMic={() => setIsMicOn(!isMicOn)}
        onToggleCamera={handleToggleCamera}
        onToggleHand={() => setIsHandRaised(!isHandRaised)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onLeaveCall={handleLeaveCall}
      />
    </div>
  );
}
