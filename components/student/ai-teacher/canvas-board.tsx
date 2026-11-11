"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Table as TableIcon,
  Sparkles,
  Pen,
  Square,
  ArrowUpRight,
  Type,
  Eraser,
  MousePointer,
  Plus,
} from "lucide-react";
import {
  AI_LESSON_TIMELINE,
  AiDrawingBeat,
  createDynamicBoardBeatFromPrompt,
} from "./excalidraw-lesson-steps";

interface CanvasBoardProps {
  onAiSpeakingChange?: (speaking: boolean) => void;
  externalDrawTrigger?: string | null;
  onClearExternalTrigger?: () => void;
}

interface TableRowData {
  id: string;
  x: string;
  fx: string;
  fPrime: string;
  behavior: string;
  isHeader?: boolean;
}

const INITIAL_TABLE_ROWS: TableRowData[] = [
  {
    id: "header",
    x: "Input (x)",
    fx: "Function f(x) = x²",
    fPrime: "Derivative f'(x) = 2x",
    behavior: "Curve Behavior",
    isHeader: true,
  },
  {
    id: "r1",
    x: "x = -2",
    fx: "f(-2) = 4",
    fPrime: "f'(-2) = -4",
    behavior: "↘ Decreasing (Steep)",
  },
  {
    id: "r2",
    x: "x = -1",
    fx: "f(-1) = 1",
    fPrime: "f'(-1) = -2",
    behavior: "↘ Decreasing (Gentle)",
  },
  {
    id: "r3",
    x: "x = 0",
    fx: "f(0) = 0",
    fPrime: "f'(0) = 0",
    behavior: "━ Horizontal Minimum",
  },
  {
    id: "r4",
    x: "x = +1",
    fx: "f(1) = 1",
    fPrime: "f'(1) = +2",
    behavior: "↗ Increasing (Gentle)",
  },
  {
    id: "r5",
    x: "x = +2",
    fx: "f(2) = 4",
    fPrime: "f'(2) = +4",
    behavior: "↗ Increasing (Steep)",
  },
];

type ToolType = "select" | "pen" | "rectangle" | "arrow" | "text" | "eraser";

export function CanvasBoard({
  onAiSpeakingChange,
  externalDrawTrigger,
  onClearExternalTrigger,
}: CanvasBoardProps) {
  // Excalidraw tool selection
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState<string>("#f97316");

  // Table state
  const [tableRows, setTableRows] = useState<TableRowData[]>(INITIAL_TABLE_ROWS.slice(0, 2));
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);

  // Lesson & voice sync states
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [activeCaption, setActiveCaption] = useState<string>(
    "Click 'Start AI Lesson' to watch the AI Teacher draw the table and speak in sync."
  );

  // AI Virtual Laser Pointer position on canvas
  const [aiPointer, setAiPointer] = useState<{ x: number; y: number; visible: boolean }>({
    x: 320,
    y: 180,
    visible: false,
  });

  // Freehand drawing canvas overlay
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const activeTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = useCallback(() => {
    activeTimersRef.current.forEach((t) => clearTimeout(t));
    activeTimersRef.current = [];
  }, []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    onAiSpeakingChange?.(false);
  }, [onAiSpeakingChange]);

  // Canvas resize and resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Freehand Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "select") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === "select") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "eraser") {
      ctx.clearRect(x - 16, y - 16, 32, 32);
      return;
    }

    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeTool === "pen" ? 2.5 : 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Play a single AI lesson step with synchronized voice & table row reveal
  const playBeat = useCallback(
    (beat: AiDrawingBeat, onComplete?: () => void) => {
      setActiveCaption(beat.speech);
      setAiPointer({ x: beat.cursorTarget.x, y: beat.cursorTarget.y, visible: true });

      // Highlight the corresponding row based on beat
      if (beat.id === "beat-2") {
        setTableRows(INITIAL_TABLE_ROWS.slice(0, 2));
        setHighlightedRowId("header");
      } else if (beat.id === "beat-3") {
        setTableRows(INITIAL_TABLE_ROWS.slice(0, 2));
        setHighlightedRowId("r1");
      } else if (beat.id === "beat-4") {
        setTableRows(INITIAL_TABLE_ROWS.slice(0, 3));
        setHighlightedRowId("r2");
      } else if (beat.id === "beat-5") {
        setTableRows(INITIAL_TABLE_ROWS.slice(0, 4));
        setHighlightedRowId("r3");
      } else if (beat.id === "beat-6") {
        setTableRows(INITIAL_TABLE_ROWS);
        setHighlightedRowId("r4");
      } else if (beat.id === "beat-7") {
        setTableRows(INITIAL_TABLE_ROWS);
        setHighlightedRowId(null);
      }

      // Voice TTS
      if (!isVoiceMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(beat.speech);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => onAiSpeakingChange?.(true);
        utterance.onend = () => {
          onAiSpeakingChange?.(false);
          setAiPointer((prev) => ({ ...prev, visible: false }));
          onComplete?.();
        };
        utterance.onerror = () => {
          onAiSpeakingChange?.(false);
          setAiPointer((prev) => ({ ...prev, visible: false }));
          onComplete?.();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        onAiSpeakingChange?.(true);
        const timer = setTimeout(() => {
          onAiSpeakingChange?.(false);
          setAiPointer((prev) => ({ ...prev, visible: false }));
          onComplete?.();
        }, 3200);
        activeTimersRef.current.push(timer);
      }
    },
    [isVoiceMuted, onAiSpeakingChange]
  );

  // Lesson progression loop
  useEffect(() => {
    if (!isAutoPlaying) return;

    if (currentBeatIndex >= AI_LESSON_TIMELINE.length) {
      setIsAutoPlaying(false);
      setActiveCaption("Table complete! You can edit cells, draw annotations, or ask in chat.");
      return;
    }

    const beat = AI_LESSON_TIMELINE[currentBeatIndex];
    playBeat(beat, () => {
      if (isAutoPlaying) {
        const pause = setTimeout(() => {
          setCurrentBeatIndex((prev) => prev + 1);
        }, 500);
        activeTimersRef.current.push(pause);
      }
    });

    return () => clearAllTimers();
  }, [isAutoPlaying, currentBeatIndex, playBeat, clearAllTimers]);

  // Handle questions asked from chat drawer
  useEffect(() => {
    if (!externalDrawTrigger) return;
    clearAllTimers();
    stopSpeech();
    setIsAutoPlaying(false);

    const dynamicBeat = createDynamicBoardBeatFromPrompt(externalDrawTrigger, 0);
    playBeat(dynamicBeat);
    onClearExternalTrigger?.();
  }, [externalDrawTrigger, playBeat, clearAllTimers, stopSpeech, onClearExternalTrigger]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      stopSpeech();
    };
  }, [clearAllTimers, stopSpeech]);

  // Button actions
  const handleTogglePlay = () => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      clearAllTimers();
      stopSpeech();
    } else {
      if (currentBeatIndex >= AI_LESSON_TIMELINE.length) {
        setCurrentBeatIndex(0);
        setTableRows(INITIAL_TABLE_ROWS.slice(0, 1));
      }
      setIsAutoPlaying(true);
    }
  };

  const handleNextRow = () => {
    setIsAutoPlaying(false);
    clearAllTimers();
    stopSpeech();

    const nextIndex = currentBeatIndex < AI_LESSON_TIMELINE.length ? currentBeatIndex : 0;
    playBeat(AI_LESSON_TIMELINE[nextIndex]);
    setCurrentBeatIndex(nextIndex + 1);
  };

  const handleRenderFullTable = () => {
    setIsAutoPlaying(false);
    clearAllTimers();
    stopSpeech();
    setTableRows(INITIAL_TABLE_ROWS);
    setHighlightedRowId(null);
    setCurrentBeatIndex(AI_LESSON_TIMELINE.length);
    setActiveCaption("Full Derivative & Function Analysis Table displayed on the board.");
  };

  const handleClearBoard = () => {
    setIsAutoPlaying(false);
    clearAllTimers();
    stopSpeech();
    setTableRows(INITIAL_TABLE_ROWS.slice(0, 1));
    setHighlightedRowId(null);
    setCurrentBeatIndex(0);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setActiveCaption("Canvas cleared. Click 'Start AI Lesson' or 'Full Table' to populate.");
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#121316] shadow-2xl flex flex-col select-none">
      {/* Excalidraw Style Subtle Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(#475569 1px, transparent 1px), radial-gradient(#475569 1px, #121316 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      />

      {/* Excalidraw Top Toolbar */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-1 p-1 rounded-xl bg-[#202124]/95 backdrop-blur-md border border-slate-700/80 shadow-xl">
        <button
          onClick={() => setActiveTool("select")}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "select" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Selection tool"
        >
          <MousePointer className="size-4" />
        </button>

        <button
          onClick={() => setActiveTool("pen")}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "pen" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Freehand Draw (Marker)"
        >
          <Pen className="size-4" />
        </button>

        <button
          onClick={() => setActiveTool("rectangle")}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "rectangle" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Draw Rectangle / Cell"
        >
          <Square className="size-4" />
        </button>

        <button
          onClick={() => setActiveTool("arrow")}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "arrow" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Draw Arrow"
        >
          <ArrowUpRight className="size-4" />
        </button>

        <button
          onClick={() => setActiveTool("eraser")}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "eraser" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Eraser"
        >
          <Eraser className="size-4" />
        </button>

        {/* Color Palette */}
        <div className="flex items-center gap-1 pl-1 ml-1 border-l border-slate-700">
          {["#f97316", "#38bdf8", "#10b981", "#ffffff"].map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className={`size-3.5 rounded-full transition-transform ${
                activeColor === color ? "scale-125 ring-2 ring-white" : "opacity-75"
              }`}
              style={{ backgroundColor: color }}
              title={`Color: ${color}`}
            />
          ))}
        </div>
      </div>

      {/* Top Center: AI Sync & Table Controls */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#202124]/95 backdrop-blur-md border border-slate-700/80 shadow-xl">
        <button
          onClick={handleTogglePlay}
          className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isAutoPlaying
              ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
          title={isAutoPlaying ? "Pause AI" : "Play Lesson"}
        >
          {isAutoPlaying ? <Pause className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
          <span>{isAutoPlaying ? "Pause AI" : "Start AI Lesson"}</span>
        </button>

        <button
          onClick={handleNextRow}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3c4043] hover:bg-[#4a4e52] text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          title="Draw Next Row"
        >
          <SkipForward className="size-3.5" />
          <span className="hidden sm:inline">Next Row</span>
        </button>

        <button
          onClick={handleRenderFullTable}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#3c4043] hover:bg-[#4a4e52] text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          title="Render Complete Table"
        >
          <TableIcon className="size-3.5 text-orange-400" />
          <span className="hidden md:inline">Full Table</span>
        </button>

        <button
          onClick={() => {
            const nextMuted = !isVoiceMuted;
            setIsVoiceMuted(nextMuted);
            if (nextMuted) stopSpeech();
          }}
          className="p-1.5 rounded-full bg-[#3c4043] hover:bg-[#4a4e52] text-slate-200 transition-colors cursor-pointer"
          title={isVoiceMuted ? "Unmute Voice" : "Mute Voice"}
        >
          {isVoiceMuted ? <VolumeX className="size-3.5 text-red-400" /> : <Volume2 className="size-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={handleClearBoard}
          className="p-1.5 rounded-full bg-[#3c4043] hover:bg-[#4a4e52] text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Clear Board"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      {/* Main Board Stage: The Interactive Table & Excalidraw Elements */}
      <div className="relative flex-1 w-full h-full p-6 pt-18 overflow-auto flex flex-col items-center">
        {/* Lesson Title Box */}
        <div className="w-full max-w-4xl mb-4 p-3 rounded-2xl bg-[#1e293b]/90 border-2 border-orange-500 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h1 className="font-bold text-sm sm:text-base text-white tracking-wide">
              Calculus I: Function & Derivative Analysis Table — f(x) = x²
            </h1>
          </div>
          <span className="text-[11px] font-mono text-orange-400 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20">
            d/dx [x²] = 2x
          </span>
        </div>

        {/* The Structured Excalidraw Table */}
        <div className="w-full max-w-4xl bg-[#0f172a] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden font-mono text-xs sm:text-sm">
          {tableRows.map((row, index) => {
            const isHighlight = highlightedRowId === row.id;

            return (
              <div
                key={row.id}
                className={`grid grid-cols-4 transition-all duration-300 border-b border-slate-800/80 ${
                  row.isHeader
                    ? "bg-[#431407]/90 text-orange-200 font-bold border-b-2 border-orange-500/80 text-xs uppercase tracking-wider"
                    : isHighlight
                    ? "bg-orange-500/20 text-white ring-2 ring-orange-500 z-10"
                    : index % 2 === 1
                    ? "bg-[#1e293b]/50 text-slate-200"
                    : "bg-[#0f172a]/70 text-slate-300"
                }`}
              >
                <div className="p-3 sm:p-3.5 border-r border-slate-800/80 flex items-center font-semibold">
                  {row.x}
                </div>
                <div className="p-3 sm:p-3.5 border-r border-slate-800/80 flex items-center">
                  {row.fx}
                </div>
                <div className="p-3 sm:p-3.5 border-r border-slate-800/80 flex items-center font-bold text-orange-400">
                  {row.fPrime}
                </div>
                <div className="p-3 sm:p-3.5 flex items-center font-medium">
                  {row.behavior}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Card (Appears as beat progresses) */}
        {tableRows.length >= 4 && (
          <div className="w-full max-w-4xl mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-300">
            <div className="p-3 rounded-xl bg-[#064e3b]/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
              <span className="font-bold block text-emerald-400">1. Negative Slope (f&apos;(x) &lt; 0)</span>
              <p className="text-[11px] text-slate-300">The curve slopes downwards as x increases.</p>
            </div>
            <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/40 text-orange-200 text-xs space-y-1">
              <span className="font-bold block text-orange-400">2. Zero Slope (f&apos;(x) = 0)</span>
              <p className="text-[11px] text-slate-300">The tangent line is horizontal. Minimum vertex.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#064e3b]/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
              <span className="font-bold block text-emerald-400">3. Positive Slope (f&apos;(x) &gt; 0)</span>
              <p className="text-[11px] text-slate-300">The curve climbs upwards symmetrically.</p>
            </div>
          </div>
        )}

        {/* Interactive Freehand Layer on top */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 z-10 ${
            activeTool === "select" ? "pointer-events-none" : "cursor-crosshair pointer-events-auto"
          }`}
        />

        {/* AI Virtual Laser Pointer */}
        {aiPointer.visible && (
          <div
            className="absolute z-30 pointer-events-none transition-all duration-300 flex items-center gap-1.5"
            style={{ left: `${aiPointer.x}px`, top: `${aiPointer.y}px` }}
          >
            <div className="size-3.5 rounded-full bg-orange-500 ring-4 ring-orange-500/40 animate-ping" />
            <span className="px-2 py-0.5 rounded-full bg-orange-600 text-[10px] font-bold text-white shadow-md">
              AI Teacher
            </span>
          </div>
        )}
      </div>

      {/* Bottom Live Synced Speech Subtitle Overlay */}
      {activeCaption && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 max-w-2xl w-[92%] px-4 py-2 rounded-xl bg-black/85 backdrop-blur-md border border-slate-800 text-center pointer-events-none shadow-lg">
          <p className="text-xs text-slate-200 flex items-center justify-center gap-2 leading-relaxed">
            <Sparkles className="size-3.5 text-orange-400 shrink-0 animate-pulse" />
            <span>{activeCaption}</span>
          </p>
        </div>
      )}
    </div>
  );
}
