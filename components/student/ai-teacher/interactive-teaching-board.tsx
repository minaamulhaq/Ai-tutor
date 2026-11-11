"use client";

import React, { useState } from "react";
import {
  PenTool,
  Highlighter,
  Eraser,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TeachingStep, WhiteboardTool, BoardTheme, ClassroomTab } from "./types";
import { BoardInteractiveGraph } from "./board-interactive-graph";

interface InteractiveTeachingBoardProps {
  currentStep: TeachingStep;
  currentStepIndex: number;
  totalSteps: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  activeTab: ClassroomTab;
  onAskAiPrompt: (prompt: string) => void;
}

export function InteractiveTeachingBoard({
  currentStep,
  currentStepIndex,
  totalSteps,
  onNextStep,
  onPrevStep,
  activeTab,
  onAskAiPrompt,
}: InteractiveTeachingBoardProps) {
  const [boardTheme, setBoardTheme] = useState<BoardTheme>("dark");
  const [selectedTool, setSelectedTool] = useState<WhiteboardTool>("select");
  const [activePenColor, setActivePenColor] = useState<string>("#f97316"); // ZuhDemy orange
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Quiz state for practice tab
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  const isDark = boardTheme === "dark";

  return (
    <div
      className={`flex-1 flex flex-col h-full rounded-2xl border transition-colors duration-200 overflow-hidden relative shadow-sm ${
        isDark
          ? "bg-slate-950 border-slate-800 text-slate-100"
          : "bg-slate-50 border-slate-200 text-slate-900"
      }`}
    >
      {/* 1. Board Top Action / Toolbar Bar */}
      <div
        className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Left: Step Breadcrumb & Indicator */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-orange-500/10 text-orange-500 border-orange-500/30 text-xs font-semibold px-2.5 py-0.5"
          >
            Concept {currentStep.stepNumber} of {totalSteps}
          </Badge>
          <span className="font-bold text-sm truncate max-w-[240px] sm:max-w-md">
            {currentStep.title}
          </span>
        </div>

        {/* Center: Whiteboard Tools (Visible on Whiteboard tab) */}
        {activeTab === "whiteboard" && (
          <div
            className={`flex items-center gap-1 px-1.5 py-1 rounded-xl border ${
              isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              onClick={() => setSelectedTool("select")}
              title="Pointer / Select"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                selectedTool === "select"
                  ? "bg-orange-500 text-white"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Sparkles className="size-3.5" />
            </button>

            <button
              onClick={() => setSelectedTool("pen")}
              title="Pen Marker"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                selectedTool === "pen"
                  ? "bg-orange-500 text-white"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <PenTool className="size-3.5" />
            </button>

            <button
              onClick={() => setSelectedTool("highlighter")}
              title="Highlighter"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                selectedTool === "highlighter"
                  ? "bg-orange-500 text-white"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Highlighter className="size-3.5" />
            </button>

            <button
              onClick={() => setSelectedTool("eraser")}
              title="Eraser"
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                selectedTool === "eraser"
                  ? "bg-orange-500 text-white"
                  : isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white"
              }`}
            >
              <Eraser className="size-3.5" />
            </button>

            {/* Quick Palette colors */}
            <div className="flex items-center gap-1 pl-1 ml-1 border-l border-slate-700/50">
              {["#f97316", "#06b6d4", "#10b981", "#ffffff"].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setActivePenColor(color);
                    setSelectedTool("pen");
                  }}
                  className={`size-3.5 rounded-full border transition-transform ${
                    activePenColor === color ? "scale-125 ring-2 ring-orange-500" : "opacity-70"
                  }`}
                  style={{ backgroundColor: color, borderColor: isDark ? "#334155" : "#cbd5e1" }}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Right: Board Canvas Theme & Zoom */}
        <div className="flex items-center gap-1.5">
          <div
            className={`hidden sm:flex items-center gap-1 px-1 py-0.5 rounded-lg border text-xs ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <button
              onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
              title="Zoom out"
              className="p-1 hover:text-orange-500"
            >
              <ZoomOut className="size-3" />
            </button>
            <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
              title="Zoom in"
              className="p-1 hover:text-orange-500"
            >
              <ZoomIn className="size-3" />
            </button>
          </div>

          <button
            onClick={() => setBoardTheme(isDark ? "light" : "dark")}
            title={isDark ? "Switch to Light Canvas" : "Switch to Dark Studio"}
            className={`p-1.5 rounded-lg text-xs transition-colors border ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            {isDark ? <Sun className="size-3.5 text-amber-400" /> : <Moon className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Live Tutor Speech Activity Banner */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between gap-3 text-xs shrink-0 ${
          isDark
            ? "bg-slate-900/60 border-slate-800 text-slate-300"
            : "bg-orange-50/70 border-orange-100 text-slate-700"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-0.5 text-orange-500">
            <span className="size-1 rounded-full bg-orange-500 animate-bounce" />
            <span className="size-1.5 rounded-full bg-orange-500 animate-bounce delay-100" />
            <span className="size-1 rounded-full bg-orange-500 animate-bounce delay-200" />
          </div>
          <span className="font-bold text-orange-500 shrink-0">AI Tutor Speaking:</span>
          <span className="truncate italic text-slate-400 dark:text-slate-300">
            &ldquo;{currentStep.aiSpeechTranscript}&rdquo;
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={() => onAskAiPrompt("Can you rephrase the last sentence in simpler words?")}
            className="text-[11px] font-medium text-orange-500 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Wand2 className="size-3" />
            <span>Simplify</span>
          </button>
        </div>
      </div>

      {/* 3. Main Board Content Canvas (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {activeTab === "whiteboard" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Step Subtitle & Conceptual Intro */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-orange-500">
                  {currentStep.subtitle}
                </span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-slate-300 dark:text-slate-200">
                {currentStep.explanation}
              </p>
            </div>

            {/* Interactive SVG Geometry Canvas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-orange-500" />
                  Live Dynamic Whiteboard Board
                </span>
                <span className="text-[11px] text-slate-500">
                  Interact with sliders to adjust tangency & limit
                </span>
              </div>

              <BoardInteractiveGraph
                diagramType={currentStep.diagramType}
                isDarkCanvas={isDark}
              />
            </div>

            {/* Mathematical Formula Card with Step breakdown */}
            <div
              className={`rounded-xl border p-4 sm:p-5 transition-colors ${
                isDark
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-orange-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                    Governing Equation
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono text-slate-400">
                  Calculus Definition
                </Badge>
              </div>

              {/* Large styled formula box */}
              <div
                className={`py-4 px-6 rounded-lg text-center font-mono text-base sm:text-xl font-bold tracking-wider my-2 border ${
                  isDark
                    ? "bg-slate-950 border-slate-800 text-orange-400"
                    : "bg-slate-50 border-orange-200 text-orange-600"
                }`}
              >
                {currentStep.formula}
              </div>

              {/* Breakdown of terms */}
              {currentStep.formulaBreakdown && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/60">
                  {currentStep.formulaBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                        isDark ? "bg-slate-950/60 border-slate-800/80" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <code className="text-orange-500 font-bold block">{item.symbol}</code>
                      <span className="text-slate-400 dark:text-slate-300 block text-[11px]">
                        {item.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Takeaway Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isDark
                  ? "bg-gradient-to-r from-orange-950/30 to-amber-950/20 border-orange-500/30 text-orange-200"
                  : "bg-orange-50 border-orange-200 text-orange-900"
              }`}
            >
              <Lightbulb className="size-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wide text-orange-500 block">
                  Core Intuition
                </span>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {currentStep.keyTakeaway}
                </p>
              </div>
            </div>

            {/* Bullet Points */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">
                Key Classroom Observations:
              </span>
              <ul className="space-y-1.5">
                {currentStep.bulletPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Notes Tab: Full Lesson Notes View */}
        {activeTab === "notes" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <Badge className="bg-orange-500 text-white mb-2">Lesson Study Notes</Badge>
              <h2 className="text-xl font-bold">Derivatives & Tangent Slopes Master Reference</h2>
              <p className="text-xs text-slate-400 mt-1">
                Auto-generated by ZuhDemy AI Tutor during your live session on Nov 09, 2026.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="font-bold text-sm text-orange-400">1. Instantaneous vs. Average</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Average rate of change calculates the slope between two separate points: Δy / Δx.
                  Instantaneous rate of change represents the slope of the curve at a single infinitesimal moment,
                  derived as the limit of average slopes as interval width h approaches 0.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="font-bold text-sm text-orange-400">2. First Principles Limit Definition</h3>
                <p className="text-xs font-mono bg-black/40 p-2 rounded text-orange-300">
                  f&apos;(x) = lim(h → 0) [f(x + h) - f(x)] / h
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every derivative shortcut (power rule, product rule, chain rule) stems directly from this fundamental limit.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <h3 className="font-bold text-sm text-orange-400">3. Power Rule Cheat Sheet</h3>
                <ul className="text-xs space-y-1 text-slate-300 font-mono">
                  <li>• d/dx [c] = 0 (Constant rule)</li>
                  <li>• d/dx [xⁿ] = n · xⁿ⁻¹</li>
                  <li>• d/dx [3x²] = 6x</li>
                  <li>• d/dx [5x⁴] = 20x³</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Practice Tab: Quick Interactive Checkpoint */}
        {activeTab === "practice" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <Badge className="bg-orange-500 text-white text-xs">Live Checkpoint</Badge>
              <h2 className="text-xl font-bold">Quick Concept Check</h2>
              <p className="text-xs text-slate-400">
                Test your understanding of tangent slopes before proceeding.
              </p>
            </div>

            <Card className="p-6 bg-slate-900 border-slate-800 text-white space-y-4">
              <p className="font-medium text-sm sm:text-base">
                If the position of an autonomous delivery drone is modeled by{" "}
                <code className="text-orange-400 font-mono font-bold">s(t) = 3t² + 2</code> (where t is in seconds),
                what is its instantaneous velocity at <code className="text-orange-400 font-mono font-bold">t = 4</code> seconds?
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  { id: 0, text: "A) 14 m/s", correct: false, explanation: "Did you take the derivative, or just plug into s(t)?" },
                  { id: 1, text: "B) 24 m/s", correct: true, explanation: "Correct! The derivative s'(t) = 6t. Evaluating at t = 4 yields 6(4) = 24 m/s." },
                  { id: 2, text: "C) 50 m/s", correct: false, explanation: "50 is s(4), the total distance traveled, not the instantaneous speed." },
                  { id: 3, text: "D) 12 m/s", correct: false, explanation: "Almost! Check your power rule coefficient." },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedQuizOption(option.id);
                      setIsAnswerSubmitted(true);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer ${
                      selectedQuizOption === option.id
                        ? option.correct
                          ? "bg-emerald-950/60 border-emerald-500 text-emerald-200"
                          : "bg-red-950/60 border-red-500 text-red-200"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <span>{option.text}</span>
                    {isAnswerSubmitted && selectedQuizOption === option.id && (
                      <span className="text-xs font-bold">
                        {option.correct ? "✓ Correct!" : "✗ Try again"}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {isAnswerSubmitted && selectedQuizOption !== null && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    selectedQuizOption === 1
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-orange-950/40 border-orange-500/40 text-orange-300"
                  }`}
                >
                  <p className="font-bold mb-1">
                    {selectedQuizOption === 1 ? "🎉 Stellar comprehension!" : "💡 Tutor Hint:"}
                  </p>
                  <p>
                    {selectedQuizOption === 1
                      ? "By the Power Rule, d/dt [3t² + 2] = 6t + 0. At t = 4: v(4) = 6(4) = 24 m/s."
                      : "Remember that velocity is the derivative of position: v(t) = s'(t). Differentiate 3t² with respect to t first!"}
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* 4. Bottom Board Navigation Bar */}
      <div
        className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPrevStep}
            disabled={currentStepIndex === 0}
            className="text-xs gap-1 border-slate-700"
          >
            <ChevronLeft className="size-3.5" />
            <span>Previous Concept</span>
          </Button>

          <Button
            size="sm"
            onClick={onNextStep}
            disabled={currentStepIndex === totalSteps - 1}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs gap-1 cursor-pointer shadow-sm"
          >
            <span>Next Concept</span>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        {/* AI Quick Inquiry shortcuts */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => onAskAiPrompt("Can you give me another visual example of this curve?")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <Sparkles className="size-3 text-orange-400" />
            <span>Generate Analogy</span>
          </button>

          <button
            onClick={() => onAskAiPrompt("Why does the derivative of a constant term equal zero?")}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <HelpCircle className="size-3 text-cyan-400" />
            <span>Ask &quot;Why zero?&quot;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

