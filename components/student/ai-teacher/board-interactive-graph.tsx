"use client";

import React, { useState, useEffect } from "react";
import { Play, RotateCcw, Sparkles, Sliders, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BoardInteractiveGraphProps {
  diagramType: "tangent-graph" | "limit-definition" | "power-rule" | "practice-problem";
  isDarkCanvas: boolean;
}

export function BoardInteractiveGraph({
  diagramType,
  isDarkCanvas,
}: BoardInteractiveGraphProps) {
  // x0 is the fixed point of tangency
  const [x0, setX0] = useState<number>(1.5);
  // h is the offset to the second point Q
  const [h, setH] = useState<number>(1.4);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Parabolic function f(x) = 0.25 * x^2 + 1
  const f = (x: number) => 0.25 * x * x + 1;
  const fPrime = (x: number) => 0.5 * x;

  // SVG coordinate transformation
  // Math domain: x in [-4, 4], y in [0, 6]
  const svgWidth = 560;
  const svgHeight = 280;
  const margin = { top: 20, right: 30, bottom: 35, left: 45 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const toSvgX = (x: number) => margin.left + ((x + 4) / 8) * plotWidth;
  const toSvgY = (y: number) => margin.top + plotHeight - (y / 6) * plotHeight;

  // Points P and Q
  const px = x0;
  const py = f(px);

  const qx = x0 + h;
  const qy = f(qx);

  // Slopes
  const secantSlope = (qy - py) / (qx - px || 0.0001);
  const tangentSlope = fPrime(px);

  // Line endpoints for rendering
  // Tangent line: y - py = tangentSlope * (x - px)
  const tanX1 = px - 2.5;
  const tanY1 = py + tangentSlope * (tanX1 - px);
  const tanX2 = px + 2.5;
  const tanY2 = py + tangentSlope * (tanX2 - px);

  // Secant line
  const secX1 = px - 1.5;
  const secY1 = py + secantSlope * (secX1 - px);
  const secX2 = qx + 1.5;
  const secY2 = py + secantSlope * (secX2 - px);

  // Animate h -> 0
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnimating) {
      interval = setInterval(() => {
        setH((prev) => {
          if (prev <= 0.05) {
            setIsAnimating(false);
            return 0.05;
          }
          return Math.max(0.05, +(prev - 0.08).toFixed(3));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Generate curve path
  const curvePoints: string[] = [];
  for (let x = -3.8; x <= 3.8; x += 0.2) {
    const sx = toSvgX(x);
    const sy = toSvgY(f(x));
    curvePoints.push(`${x === -3.8 ? "M" : "L"} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
  }
  const curveD = curvePoints.join(" ");

  const bgClass = isDarkCanvas
    ? "bg-slate-900 border-slate-800 text-slate-100"
    : "bg-white border-slate-200 text-slate-900";
  const gridStroke = isDarkCanvas ? "#1e293b" : "#f1f5f9";
  const axisStroke = isDarkCanvas ? "#475569" : "#cbd5e1";
  const textMuted = isDarkCanvas ? "#94a3b8" : "#64748b";

  return (
    <div className={`rounded-xl border p-4 shadow-inner transition-colors duration-200 ${bgClass}`}>
      {/* Visualizer header & control buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-orange-500 border-orange-500/30 bg-orange-500/10 font-mono text-[11px] gap-1"
          >
            <Sparkles className="size-3" /> Interactive Geometry
          </Badge>
          <span className="text-xs font-semibold">
            Curve: <code className="text-orange-500 font-mono">f(x) = 0.25x² + 1</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setH(1.8);
              setIsAnimating(true);
            }}
            disabled={isAnimating}
            className="text-xs gap-1 border-orange-500/40 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40"
          >
            <Play className="size-3 fill-current" />
            <span>Simulate h → 0</span>
          </Button>

          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              setX0(1.5);
              setH(1.4);
              setIsAnimating(false);
            }}
            className="text-xs gap-1 text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="size-3" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* SVG Plot Container */}
      <div className="relative w-full overflow-hidden rounded-lg bg-black/5 dark:bg-black/20 p-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none overflow-visible"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <pattern id="gridPattern" width="35" height="35" patternUnits="userSpaceOnUse">
              <path d="M 35 0 L 0 0 0 35" fill="none" stroke={gridStroke} strokeWidth="1" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="url(#gridPattern)"
          />

          {/* Axes */}
          {/* X Axis */}
          <line
            x1={margin.left}
            y1={toSvgY(0)}
            x2={margin.left + plotWidth}
            y2={toSvgY(0)}
            stroke={axisStroke}
            strokeWidth="1.5"
          />
          {/* Y Axis */}
          <line
            x1={toSvgX(0)}
            y1={margin.top}
            x2={toSvgX(0)}
            y2={margin.top + plotHeight}
            stroke={axisStroke}
            strokeWidth="1.5"
          />

          {/* Axis Labels */}
          {[-3, -2, -1, 1, 2, 3].map((val) => (
            <text
              key={`x-${val}`}
              x={toSvgX(val)}
              y={toSvgY(0) + 14}
              fontSize="10"
              fill={textMuted}
              textAnchor="middle"
              className="font-mono"
            >
              {val}
            </text>
          ))}
          {[1, 2, 3, 4, 5].map((val) => (
            <text
              key={`y-${val}`}
              x={toSvgX(0) - 8}
              y={toSvgY(val) + 3}
              fontSize="10"
              fill={textMuted}
              textAnchor="end"
              className="font-mono"
            >
              {val}
            </text>
          ))}

          {/* Function Curve f(x) */}
          <path
            d={curveD}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Secant Line (Cyan/Blue) */}
          <line
            x1={toSvgX(secX1)}
            y1={toSvgY(secY1)}
            x2={toSvgX(secX2)}
            y2={toSvgY(secY2)}
            stroke="#06b6d4"
            strokeWidth="2"
            strokeDasharray="5,4"
            opacity="0.85"
          />

          {/* Tangent Line (Vibrant Orange) */}
          <line
            x1={toSvgX(tanX1)}
            y1={toSvgY(tanY1)}
            x2={toSvgX(tanX2)}
            y2={toSvgY(tanY2)}
            stroke="#ea580c"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Drop lines for point P */}
          <line
            x1={toSvgX(px)}
            y1={toSvgY(0)}
            x2={toSvgX(px)}
            y2={toSvgY(py)}
            stroke="#ea580c"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.6"
          />
          {/* Drop lines for point Q */}
          <line
            x1={toSvgX(qx)}
            y1={toSvgY(0)}
            x2={toSvgX(qx)}
            y2={toSvgY(qy)}
            stroke="#06b6d4"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.6"
          />

          {/* Point P (x0, f(x0)) */}
          <circle
            cx={toSvgX(px)}
            cy={toSvgY(py)}
            r="6"
            fill="#f97316"
            stroke="#ffffff"
            strokeWidth="2"
            className="cursor-pointer drop-shadow-md"
          />
          <text
            x={toSvgX(px) - 10}
            y={toSvgY(py) - 10}
            fontSize="11"
            fontWeight="bold"
            fill="#ea580c"
            className="font-mono"
          >
            P(x₀)
          </text>

          {/* Point Q (x0 + h, f(x0 + h)) */}
          <circle
            cx={toSvgX(qx)}
            cy={toSvgY(qy)}
            r="6"
            fill="#06b6d4"
            stroke="#ffffff"
            strokeWidth="2"
            className="cursor-pointer drop-shadow-md"
          />
          <text
            x={toSvgX(qx) + 8}
            y={toSvgY(qy) - 8}
            fontSize="11"
            fontWeight="bold"
            fill="#0891b2"
            className="font-mono"
          >
            Q(x₀ + h)
          </text>
        </svg>

        {/* Floating Legend / Stats badge inside graph */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 p-2 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-white shadow-lg pointer-events-none">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="size-2 rounded-full bg-cyan-400" />
              Secant Slope (mₛ):
            </span>
            <span className="font-bold">{secantSlope.toFixed(3)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-orange-400">
              <span className="size-2 rounded-full bg-orange-400" />
              Tangent Slope (f&apos;(x₀)):
            </span>
            <span className="font-bold text-orange-400">{tangentSlope.toFixed(3)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800 text-slate-400">
            <span>Interval Gap (h):</span>
            <span className={h <= 0.1 ? "text-emerald-400 font-bold" : "text-slate-300"}>
              {h.toFixed(2)} {h <= 0.1 ? "✨ (h ≈ 0)" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Sliders and intuitive interactions */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/20">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Sliders className="size-3 text-orange-500" />
              Point of Tangency <code className="text-orange-500 font-bold">x₀ = {x0.toFixed(2)}</code>
            </span>
            <span className="text-[11px] text-slate-400">Range: -2.5 to 2.5</span>
          </div>
          <input
            type="range"
            min="-2.5"
            max="2.5"
            step="0.1"
            value={x0}
            onChange={(e) => setX0(parseFloat(e.target.value))}
            className="w-full accent-orange-500 cursor-pointer h-1.5 rounded-lg bg-slate-700"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Sliders className="size-3 text-cyan-400" />
              Step Distance <code className="text-cyan-400 font-bold">h = {h.toFixed(2)}</code>
            </span>
            <span className="text-[11px] text-slate-400">Shrink to zero (h → 0)</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="2.2"
            step="0.05"
            value={h}
            onChange={(e) => setH(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-slate-700"
          />
        </div>
      </div>
    </div>
  );
}

