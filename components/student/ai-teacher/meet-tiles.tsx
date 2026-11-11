"use client";

import React, { useRef, useEffect, useState } from "react";
import { Mic, MicOff, Camera, Video, VideoOff, AlertCircle } from "lucide-react";

interface AiAvatarTileProps {
  isSpeaking?: boolean;
}

export function AiAvatarTile({ isSpeaking = true }: AiAvatarTileProps) {
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-square bg-[#202124] rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center select-none">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 via-transparent to-black/60 pointer-events-none" />

      {/* Speaking Ripple rings */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-28 sm:size-36 rounded-full border border-orange-500/30 animate-ping opacity-30" />
          <div className="size-20 sm:size-28 rounded-full border border-orange-500/40 animate-pulse opacity-50" />
        </div>
      )}

      {/* AI Teacher Avatar */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
            alt="AI Teacher"
            className="size-16 sm:size-22 rounded-full object-cover ring-4 ring-orange-500/40 shadow-2xl"
          />
          <span className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-500 ring-2 ring-[#202124]" />
        </div>
      </div>

      {/* Google Meet style Name & Audio Pill in bottom left */}
      <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-medium">
        <div className="flex items-center gap-0.5 text-emerald-400">
          <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse delay-75" />
          <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
        </div>
        <span className="text-slate-200 font-semibold text-[11px]">AI Teacher</span>
      </div>
    </div>
  );
}

interface UserScreenTileProps {
  isCameraOn: boolean;
  isMicOn: boolean;
  onToggleCamera: () => void;
}

export function UserScreenTile({ isCameraOn, isMicOn, onToggleCamera }: UserScreenTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function startCamera() {
      if (!isCameraOn) {
        // Stop any active streams
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraError(null);
        return;
      }

      setIsInitializing(true);
      setCameraError(null);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser environment.");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            // Autoplay permitted
          }
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const errMsg = err instanceof Error ? err.message : "Camera access denied or unavailable";
          setCameraError(errMsg);
        }
      } finally {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isCameraOn]);

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-square bg-[#202124] rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center select-none group">
      {/* Real Live Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover scale-x-[-1] ${
          isCameraOn && !cameraError ? "block" : "hidden"
        }`}
      />

      {/* Fallback Camera Off view */}
      {(!isCameraOn || cameraError) && (
        <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
          <div className="relative mb-2">
            <div className="size-16 sm:size-20 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              SJ
            </div>
            <button
              onClick={onToggleCamera}
              title="Click to turn on camera"
              className="absolute -bottom-1 -right-1 size-7 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
            >
              <Camera className="size-3.5" />
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            {cameraError ? "Camera blocked" : "Camera is off"}
          </span>

          <button
            onClick={onToggleCamera}
            className="text-[10px] text-orange-400 hover:underline mt-1 font-semibold cursor-pointer"
          >
            Turn on camera
          </button>
        </div>
      )}

      {/* Google Meet style Name Pill in bottom left */}
      <div className="absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-xs font-medium">
        <span className="text-slate-200 font-semibold text-[11px]">You</span>
      </div>

      {/* Top right mic indicator */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <div className={`p-1.5 rounded-full ${isMicOn ? "bg-black/60 text-emerald-400" : "bg-red-600/90 text-white"}`}>
          {isMicOn ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
        </div>
      </div>
    </div>
  );
}
