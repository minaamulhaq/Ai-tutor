"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Pen,
  Square,
  ArrowUpRight,
  Type,
  Eraser,
  MousePointer,
  RotateCcw,
  Trash2,
  Copy,
  Plus,
  GripHorizontal,
  Check,
  X,
} from "lucide-react";

export type ToolType = "select" | "pen" | "rectangle" | "arrow" | "text" | "eraser";

export interface Point {
  x: number;
  y: number;
}

export interface BoardStroke {
  id: string;
  type: "stroke";
  points: Point[];
  color: string;
  width: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface BoardRect {
  id: string;
  type: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
}

export interface BoardArrow {
  id: string;
  type: "arrow";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export interface BoardText {
  id: string;
  type: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export type BoardElement = BoardStroke | BoardRect | BoardArrow | BoardText;

export interface TableRowData {
  id: string;
  x: string;
  fx: string;
  fPrime: string;
  behavior: string;
}

const DEFAULT_ROWS: TableRowData[] = [
  { id: "r1", x: "x = -2", fx: "f(-2) = 4", fPrime: "f'(-2) = -4", behavior: "↘ Decreasing (Steep)" },
  { id: "r2", x: "x = -1", fx: "f(-1) = 1", fPrime: "f'(-1) = -2", behavior: "↘ Decreasing (Gentle)" },
  { id: "r3", x: "x = 0", fx: "f(0) = 0", fPrime: "f'(0) = 0", behavior: "━ Horizontal Minimum" },
  { id: "r4", x: "x = +1", fx: "f(1) = 1", fPrime: "f'(1) = +2", behavior: "↗ Increasing (Gentle)" },
  { id: "r5", x: "x = +2", fx: "f(2) = 4", fPrime: "f'(2) = +4", behavior: "↗ Increasing (Steep)" },
];

/**
 * Universal cross-browser rounded rectangle drawer
 */
function drawSafeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number = 8
) {
  const r = Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function CanvasBoard() {
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState<string>("#f97316");

  // Canvas elements state
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Dedicated reliable text editing state
  const [editingText, setEditingText] = useState<{
    id: string;
    x: number;
    y: number;
    text: string;
    isNew: boolean;
  } | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Table position & editing
  const [tablePos, setTablePos] = useState<Point>({ x: 70, y: 70 });
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [tableRows, setTableRows] = useState<TableRowData[]>(DEFAULT_ROWS);
  const [tableTitle, setTableTitle] = useState("Calculus I: Function & Derivative Analysis Table — f(x) = x²");

  // Summary card position
  const [summaryPos, setSummaryPos] = useState<Point>({ x: 70, y: 460 });
  const [isDraggingSummary, setIsDraggingSummary] = useState(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction refs
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef<Point | null>(null);
  const shapePreviewRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const currentStrokeRef = useRef<Point[]>([]);

  // Moving / Resizing elements
  const isDraggingElementRef = useRef(false);
  const isResizingBoxRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number } | null>(null);

  // Table & Summary Dragging refs
  const tableDragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const summaryDragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);

  const editingId = editingText?.id ?? null;

  // Focus textarea ONLY when a new editing session opens (when editingId changes)
  useEffect(() => {
    if (editingId && textInputRef.current) {
      textInputRef.current.focus();
      const len = textInputRef.current.value.length;
      textInputRef.current.setSelectionRange(len, len);
    }
  }, [editingId]);

  // Keyboard delete listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId) {
          e.preventDefault();
          setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
          setSelectedElementId(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId]);

  // Redraw entire canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw stored elements
    elements.forEach((elem) => {
      const isSelected = elem.id === selectedElementId;

      if (elem.type === "stroke") {
        if (elem.points.length < 2) return;
        ctx.save();
        ctx.strokeStyle = elem.color;
        ctx.lineWidth = elem.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(elem.points[0].x, elem.points[0].y);
        for (let i = 1; i < elem.points.length; i++) {
          ctx.lineTo(elem.points[i].x, elem.points[i].y);
        }
        ctx.stroke();

        if (isSelected) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          const pad = 8;
          ctx.strokeRect(
            elem.minX - pad,
            elem.minY - pad,
            elem.maxX - elem.minX + pad * 2,
            elem.maxY - elem.minY + pad * 2
          );

          ctx.fillStyle = "#ffffff";
          ctx.setLineDash([]);
          const corners = [
            { x: elem.minX - pad, y: elem.minY - pad },
            { x: elem.maxX + pad, y: elem.minY - pad },
            { x: elem.minX - pad, y: elem.maxY + pad },
            { x: elem.maxX + pad, y: elem.maxY + pad },
          ];
          corners.forEach((c) => {
            ctx.fillRect(c.x - 3.5, c.y - 3.5, 7, 7);
            ctx.strokeRect(c.x - 3.5, c.y - 3.5, 7, 7);
          });
        }
        ctx.restore();
      } else if (elem.type === "rectangle") {
        ctx.save();
        ctx.strokeStyle = elem.color;
        ctx.lineWidth = 2.5;
        // Dark translucent glass card background for high contrast
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        drawSafeRoundedRect(ctx, elem.x, elem.y, elem.width, elem.height, 10);
        ctx.fill();
        ctx.stroke();

        // Optional text inside box
        if (elem.text) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 14px system-ui, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(elem.text, elem.x + elem.width / 2, elem.y + elem.height / 2);
        }

        if (isSelected) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(elem.x - 4, elem.y - 4, elem.width + 8, elem.height + 8);

          // Resize handle on bottom-right corner
          ctx.setLineDash([]);
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(elem.x + elem.width - 4, elem.y + elem.height - 4, 8, 8);
        }
        ctx.restore();
      } else if (elem.type === "arrow") {
        ctx.save();
        ctx.strokeStyle = elem.color;
        ctx.fillStyle = elem.color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(elem.startX, elem.startY);
        ctx.lineTo(elem.endX, elem.endY);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(elem.endY - elem.startY, elem.endX - elem.startX);
        const headlen = 14;
        ctx.beginPath();
        ctx.moveTo(elem.endX, elem.endY);
        ctx.lineTo(
          elem.endX - headlen * Math.cos(angle - Math.PI / 6),
          elem.endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          elem.endX - headlen * Math.cos(angle + Math.PI / 6),
          elem.endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          const minX = Math.min(elem.startX, elem.endX) - 6;
          const minY = Math.min(elem.startY, elem.endY) - 6;
          const w = Math.abs(elem.endX - elem.startX) + 12;
          const h = Math.abs(elem.endY - elem.startY) + 12;
          ctx.strokeRect(minX, minY, w, h);
        }
        ctx.restore();
      } else if (elem.type === "text") {
        // Only draw on canvas if not actively being edited in the floating popup
        if (editingId !== elem.id) {
          ctx.save();
          ctx.font = `bold ${elem.fontSize}px system-ui, -apple-system, sans-serif`;
          const lines = (elem.text || "Note").split("\n");
          const lineHeight = elem.fontSize * 1.3;
          let maxW = 0;
          lines.forEach((line) => {
            const w = ctx.measureText(line).width;
            if (w > maxW) maxW = w;
          });
          const totalH = (lines.length - 1) * lineHeight + elem.fontSize;

          // Translucent badge card for text note
          ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
          ctx.strokeStyle = isSelected ? "#38bdf8" : "rgba(100, 116, 139, 0.5)";
          ctx.lineWidth = isSelected ? 2 : 1.5;
          drawSafeRoundedRect(ctx, elem.x - 10, elem.y - elem.fontSize - 6, maxW + 20, totalH + 14, 8);
          ctx.fill();
          ctx.stroke();

          // Render text lines
          ctx.fillStyle = elem.color || "#ffffff";
          ctx.textBaseline = "alphabetic";
          lines.forEach((line, idx) => {
            ctx.fillText(line, elem.x, elem.y + idx * lineHeight);
          });

          if (isSelected) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(elem.x - 14, elem.y - elem.fontSize - 10, maxW + 28, totalH + 22);
          }
          ctx.restore();
        }
      }
    });

    // 2. Draw live freehand stroke in progress
    if (currentStrokeRef.current.length > 1) {
      ctx.save();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(currentStrokeRef.current[0].x, currentStrokeRef.current[0].y);
      for (let i = 1; i < currentStrokeRef.current.length; i++) {
        ctx.lineTo(currentStrokeRef.current[i].x, currentStrokeRef.current[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw live shape preview (Rectangle or Arrow)
    if (pointerStartRef.current && shapePreviewRef.current) {
      ctx.save();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);

      if (activeTool === "rectangle") {
        ctx.fillStyle = "rgba(249, 115, 22, 0.15)";
        drawSafeRoundedRect(
          ctx,
          shapePreviewRef.current.x,
          shapePreviewRef.current.y,
          shapePreviewRef.current.w,
          shapePreviewRef.current.h,
          10
        );
        ctx.fill();
        ctx.stroke();
      } else if (activeTool === "arrow") {
        const start = pointerStartRef.current;
        const endX = start.x + shapePreviewRef.current.w;
        const endY = start.y + shapePreviewRef.current.h;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        const angle = Math.atan2(endY - start.y, endX - start.x);
        const headlen = 14;
        ctx.fillStyle = activeColor;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headlen * Math.cos(angle - Math.PI / 6),
          endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - headlen * Math.cos(angle + Math.PI / 6),
          endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }, [elements, selectedElementId, editingId, activeTool, activeColor]);

  // Redraw when state changes
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Robust ResizeObserver for canvas resolution
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawCanvas();
      }
    };

    updateSize();
    const ro = new ResizeObserver(() => updateSize());
    ro.observe(container);

    return () => ro.disconnect();
  }, [drawCanvas]);

  // Hit detection for selecting/erasing elements
  const findElementAt = (x: number, y: number): BoardElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const elem = elements[i];
      if (elem.type === "stroke") {
        const pad = 12;
        if (x >= elem.minX - pad && x <= elem.maxX + pad && y >= elem.minY - pad && y <= elem.maxY + pad) {
          for (let p of elem.points) {
            if (Math.hypot(p.x - x, p.y - y) <= 14) return elem;
          }
        }
      } else if (elem.type === "rectangle") {
        if (x >= elem.x - 4 && x <= elem.x + elem.width + 4 && y >= elem.y - 4 && y <= elem.y + elem.height + 4) {
          return elem;
        }
      } else if (elem.type === "arrow") {
        const minX = Math.min(elem.startX, elem.endX) - 10;
        const maxX = Math.max(elem.startX, elem.endX) + 10;
        const minY = Math.min(elem.startY, elem.endY) - 10;
        const maxY = Math.max(elem.startY, elem.endY) + 10;
        if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
          return elem;
        }
      } else if (elem.type === "text") {
        const textLen = (elem.text || "Note").length * (elem.fontSize * 0.65);
        if (x >= elem.x - 12 && x <= elem.x + textLen + 12 && y >= elem.y - elem.fontSize - 8 && y <= elem.y + 10) {
          return elem;
        }
      }
    }
    return null;
  };

  // Pointer Down handler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer so move and up are never lost if cursor leaves canvas
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isPointerDownRef.current = true;
    pointerStartRef.current = { x, y };

    // 1. SELECT TOOL
    if (activeTool === "select") {
      // Check if clicking resize handle on selected rectangle
      if (selectedElementId) {
        const selected = elements.find((el) => el.id === selectedElementId);
        if (selected && selected.type === "rectangle") {
          const handleX = selected.x + selected.width;
          const handleY = selected.y + selected.height;
          if (Math.hypot(x - handleX, y - handleY) <= 16) {
            isResizingBoxRef.current = true;
            dragStartRef.current = { mouseX: x, mouseY: y };
            return;
          }
        }
      }

      const hit = findElementAt(x, y);
      if (hit) {
        setSelectedElementId(hit.id);
        isDraggingElementRef.current = true;
        dragStartRef.current = { mouseX: x, mouseY: y };
      } else {
        setSelectedElementId(null);
        if (editingText) {
          commitTextEdit();
        }
      }
      drawCanvas();
      return;
    }

    // 2. PEN TOOL
    if (activeTool === "pen") {
      currentStrokeRef.current = [{ x, y }];
      drawCanvas();
      return;
    }

    // 3. RECTANGLE OR ARROW TOOL: record start point
    if (activeTool === "rectangle" || activeTool === "arrow") {
      shapePreviewRef.current = { x, y, w: 0, h: 0 };
      drawCanvas();
      return;
    }

    // 4. TEXT TOOL: immediately open the floating text editor at clicked position
    if (activeTool === "text") {
      if (editingText) {
        commitTextEdit();
        return;
      }
      const newTextId = `text-${Date.now()}`;
      setEditingText({
        id: newTextId,
        x: Math.max(20, x),
        y: Math.max(30, y),
        text: "",
        isNew: true,
      });
      return;
    }

    // 5. ERASER TOOL
    if (activeTool === "eraser") {
      const hit = findElementAt(x, y);
      if (hit) {
        setElements((prev) => prev.filter((el) => el.id !== hit.id));
        if (selectedElementId === hit.id) setSelectedElementId(null);
      }
    }
  };

  // Pointer Move handler
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Resizing selected box
    if (isResizingBoxRef.current && dragStartRef.current && selectedElementId) {
      const dx = x - dragStartRef.current.mouseX;
      const dy = y - dragStartRef.current.mouseY;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedElementId || el.type !== "rectangle") return el;
          return {
            ...el,
            width: Math.max(40, el.width + dx),
            height: Math.max(30, el.height + dy),
          };
        })
      );

      dragStartRef.current.mouseX = x;
      dragStartRef.current.mouseY = y;
      return;
    }

    // 2. Dragging selected element
    if (isDraggingElementRef.current && dragStartRef.current && selectedElementId) {
      const dx = x - dragStartRef.current.mouseX;
      const dy = y - dragStartRef.current.mouseY;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedElementId) return el;
          if (el.type === "stroke") {
            return {
              ...el,
              points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
              minX: el.minX + dx,
              maxX: el.maxX + dx,
              minY: el.minY + dy,
              maxY: el.maxY + dy,
            };
          } else if (elemIsArrow(el)) {
            return {
              ...el,
              startX: el.startX + dx,
              startY: el.startY + dy,
              endX: el.endX + dx,
              endY: el.endY + dy,
            };
          } else {
            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy,
            };
          }
        })
      );

      dragStartRef.current.mouseX = x;
      dragStartRef.current.mouseY = y;
      return;
    }

    // 3. Drawing freehand stroke
    if (activeTool === "pen") {
      currentStrokeRef.current.push({ x, y });
      drawCanvas();
      return;
    }

    // 4. Creating Rectangle / Arrow live preview
    if (pointerStartRef.current && (activeTool === "rectangle" || activeTool === "arrow")) {
      const start = pointerStartRef.current;
      const w = x - start.x;
      const h = y - start.y;

      if (activeTool === "rectangle") {
        shapePreviewRef.current = {
          x: Math.min(start.x, x),
          y: Math.min(start.y, y),
          w: Math.abs(w),
          h: Math.abs(h),
        };
      } else {
        shapePreviewRef.current = {
          x: start.x,
          y: start.y,
          w,
          h,
        };
      }
      drawCanvas();
      return;
    }

    // 5. Eraser sweep
    if (activeTool === "eraser") {
      const hit = findElementAt(x, y);
      if (hit) {
        setElements((prev) => prev.filter((el) => el.id !== hit.id));
        if (selectedElementId === hit.id) setSelectedElementId(null);
      }
    }
  };

  // Pointer Up handler
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = false;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    // Finish resizing box
    if (isResizingBoxRef.current) {
      isResizingBoxRef.current = false;
      dragStartRef.current = null;
      return;
    }

    // Finish dragging element
    if (isDraggingElementRef.current) {
      isDraggingElementRef.current = false;
      dragStartRef.current = null;
      return;
    }

    // Finish Pen Stroke
    if (activeTool === "pen") {
      const strokePts = currentStrokeRef.current;
      if (strokePts.length > 1) {
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        strokePts.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });

        const newStroke: BoardStroke = {
          id: `stroke-${Date.now()}`,
          type: "stroke",
          points: strokePts,
          color: activeColor,
          width: 2.5,
          minX,
          minY,
          maxX,
          maxY,
        };

        setElements((prev) => [...prev, newStroke]);
        setSelectedElementId(newStroke.id);
      }
      currentStrokeRef.current = [];
      drawCanvas();
      return;
    }

    // Finish Shape Creation (Rectangle or Arrow)
    if (pointerStartRef.current) {
      const preview = shapePreviewRef.current;
      const start = pointerStartRef.current;

      if (activeTool === "rectangle") {
        if (preview && (preview.w >= 15 || preview.h >= 15)) {
          // Dragged box
          const newRect: BoardRect = {
            id: `rect-${Date.now()}`,
            type: "rectangle",
            x: preview.x,
            y: preview.y,
            width: Math.max(30, preview.w),
            height: Math.max(30, preview.h),
            color: activeColor,
          };
          setElements((prev) => [...prev, newRect]);
          setSelectedElementId(newRect.id);
        } else {
          // Single-clicked: spawn a neat 180x110 rectangular note card centered at cursor
          const newRect: BoardRect = {
            id: `rect-${Date.now()}`,
            type: "rectangle",
            x: Math.max(10, start.x - 90),
            y: Math.max(10, start.y - 55),
            width: 180,
            height: 110,
            color: activeColor,
          };
          setElements((prev) => [...prev, newRect]);
          setSelectedElementId(newRect.id);
        }
      } else if (activeTool === "arrow") {
        if (preview && (Math.abs(preview.w) >= 15 || Math.abs(preview.h) >= 15)) {
          // Dragged arrow
          const newArrow: BoardArrow = {
            id: `arrow-${Date.now()}`,
            type: "arrow",
            startX: start.x,
            startY: start.y,
            endX: start.x + preview.w,
            endY: start.y + preview.h,
            color: activeColor,
          };
          setElements((prev) => [...prev, newArrow]);
          setSelectedElementId(newArrow.id);
        } else {
          // Single-clicked arrow: spawn 120px arrow pointing right
          const newArrow: BoardArrow = {
            id: `arrow-${Date.now()}`,
            type: "arrow",
            startX: start.x,
            startY: start.y,
            endX: start.x + 120,
            endY: start.y,
            color: activeColor,
          };
          setElements((prev) => [...prev, newArrow]);
          setSelectedElementId(newArrow.id);
        }
      }

      pointerStartRef.current = null;
      shapePreviewRef.current = null;
      drawCanvas();
      return;
    }
  };

  // Double-click on canvas to edit text or box note directly
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hit = findElementAt(x, y);
    if (hit) {
      setSelectedElementId(hit.id);
      if (hit.type === "text") {
        setEditingText({
          id: hit.id,
          x: hit.x,
          y: hit.y,
          text: hit.text,
          isNew: false,
        });
      } else if (hit.type === "rectangle") {
        // Can also edit text inside a rectangle
        setEditingText({
          id: hit.id,
          x: hit.x + 12,
          y: hit.y + 24,
          text: hit.text || "",
          isNew: false,
        });
      }
    }
  };

  // Commit text edit from floating popup
  const commitTextEdit = () => {
    if (!editingText) return;
    const trimmed = editingText.text.trim();

    if (editingText.isNew) {
      if (trimmed.length > 0) {
        const newTextElem: BoardText = {
          id: editingText.id,
          type: "text",
          x: editingText.x,
          y: editingText.y,
          text: trimmed,
          color: activeColor,
          fontSize: 18,
        };
        setElements((prev) => [...prev, newTextElem]);
        setSelectedElementId(newTextElem.id);
      }
    } else {
      // Update existing element (Text or Rectangle label)
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== editingText.id) return el;
          if (el.type === "text") {
            return { ...el, text: trimmed || "Note" };
          }
          if (el.type === "rectangle") {
            return { ...el, text: trimmed };
          }
          return el;
        })
      );
    }

    setEditingText(null);
  };

  // Cancel text edit
  const cancelTextEdit = () => {
    setEditingText(null);
  };

  // Table Grip dragging
  const handleTableGripDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingTable(true);
    tableDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: tablePos.x,
      startY: tablePos.y,
    };
  };

  // Summary Grip dragging
  const handleSummaryGripDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingSummary(true);
    summaryDragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: summaryPos.x,
      startY: summaryPos.y,
    };
  };

  // Window-level mouse listeners for dragging the Table and Summary cards
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingTable && tableDragStartRef.current) {
        const dx = e.clientX - tableDragStartRef.current.mouseX;
        const dy = e.clientY - tableDragStartRef.current.mouseY;
        setTablePos({
          x: Math.max(10, tableDragStartRef.current.startX + dx),
          y: Math.max(10, tableDragStartRef.current.startY + dy),
        });
      }
      if (isDraggingSummary && summaryDragStartRef.current) {
        const dx = e.clientX - summaryDragStartRef.current.mouseX;
        const dy = e.clientY - summaryDragStartRef.current.mouseY;
        setSummaryPos({
          x: Math.max(10, summaryDragStartRef.current.startX + dx),
          y: Math.max(10, summaryDragStartRef.current.startY + dy),
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDraggingTable) {
        setIsDraggingTable(false);
        tableDragStartRef.current = null;
      }
      if (isDraggingSummary) {
        setIsDraggingSummary(false);
        summaryDragStartRef.current = null;
      }
    };

    if (isDraggingTable || isDraggingSummary) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingTable, isDraggingSummary]);

  // Table cell editing
  const handleCellChange = (rowIndex: number, field: keyof TableRowData, value: string) => {
    setTableRows((prev) => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], [field]: value };
      return copy;
    });
  };

  const handleAddTableRow = () => {
    const newRow: TableRowData = {
      id: `r-${Date.now()}`,
      x: `x = +${tableRows.length - 2}`,
      fx: "...",
      fPrime: "...",
      behavior: "Increasing",
    };
    setTableRows((prev) => [...prev, newRow]);
  };

  // Duplicate selected element
  const handleDuplicateSelected = () => {
    if (!selectedElementId) return;
    const elem = elements.find((el) => el.id === selectedElementId);
    if (!elem) return;

    if (elem.type === "stroke") {
      const cloned: BoardStroke = {
        ...elem,
        id: `stroke-${Date.now()}`,
        points: elem.points.map((p) => ({ x: p.x + 20, y: p.y + 20 })),
        minX: elem.minX + 20,
        maxX: elem.maxX + 20,
        minY: elem.minY + 20,
        maxY: elem.maxY + 20,
      };
      setElements((prev) => [...prev, cloned]);
      setSelectedElementId(cloned.id);
    } else if (elemIsArrow(elem)) {
      const cloned: BoardArrow = {
        ...elem,
        id: `arrow-${Date.now()}`,
        startX: elem.startX + 20,
        startY: elem.startY + 20,
        endX: elem.endX + 20,
        endY: elem.endY + 20,
      };
      setElements((prev) => [...prev, cloned]);
      setSelectedElementId(cloned.id);
    } else {
      const cloned = {
        ...elem,
        id: `${elem.type}-${Date.now()}`,
        x: elem.x + 20,
        y: elem.y + 20,
      };
      setElements((prev) => [...prev, cloned as BoardElement]);
      setSelectedElementId(cloned.id);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
      setSelectedElementId(null);
    }
  };

  const handleClearAll = () => {
    setElements([]);
    setSelectedElementId(null);
    setEditingText(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#121316] shadow-2xl flex flex-col select-none"
    >
      {/* Excalidraw Style Subtle Dot-Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(#475569 1px, transparent 1px), radial-gradient(#475569 1px, #121316 1px)",
          backgroundSize: "24px 24px",
          backgroundPosition: "0 0, 12px 12px",
        }}
      />

      {/* Excalidraw Top-Left Toolbar */}
      <div className="absolute top-3 left-4 z-50 flex items-center gap-1 p-1 rounded-xl bg-[#202124]/95 backdrop-blur-md border border-slate-700/80 shadow-2xl">
        {/* 1. Selection Tool */}
        <button
          onClick={() => {
            setActiveTool("select");
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "select" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Selection tool (Click to move & manipulate objects)"
        >
          <MousePointer className="size-4" />
        </button>

        {/* 2. Pen Tool */}
        <button
          onClick={() => {
            setActiveTool("pen");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "pen" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Freehand Draw (Marker)"
        >
          <Pen className="size-4" />
        </button>

        {/* 3. Rectangle Tool */}
        <button
          onClick={() => {
            setActiveTool("rectangle");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "rectangle" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Box / Rectangle Tool (Click on board or drag to size)"
        >
          <Square className="size-4" />
        </button>

        {/* 4. Arrow Tool */}
        <button
          onClick={() => {
            setActiveTool("arrow");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "arrow" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Draw Arrow (Click or drag to create arrow)"
        >
          <ArrowUpRight className="size-4" />
        </button>

        {/* 5. Text Tool */}
        <button
          onClick={() => {
            setActiveTool("text");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "text" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Text Note Tool (Click on canvas to add note)"
        >
          <Type className="size-4" />
        </button>

        {/* 6. Eraser Tool */}
        <button
          onClick={() => {
            setActiveTool("eraser");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTool === "eraser" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
          }`}
          title="Eraser (Click or sweep over elements to delete)"
        >
          <Eraser className="size-4" />
        </button>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 pl-1.5 ml-1 border-l border-slate-700">
          {["#f97316", "#38bdf8", "#10b981", "#ffffff"].map((color) => (
            <button
              key={color}
              onClick={() => {
                setActiveColor(color);
                if (selectedElementId) {
                  setElements((prev) =>
                    prev.map((el) => (el.id === selectedElementId ? { ...el, color } : el))
                  );
                }
              }}
              className={`size-3.5 rounded-full transition-transform cursor-pointer ${
                activeColor === color ? "scale-125 ring-2 ring-white" : "opacity-75"
              }`}
              style={{ backgroundColor: color }}
              title={`Color: ${color}`}
            />
          ))}
        </div>

        {/* Clear All Drawings */}
        <button
          onClick={handleClearAll}
          className="p-2 ml-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer border-l border-slate-700"
          title="Clear all drawings"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      {/* Floating Action Menu for Selected Element (Duplicate, Delete) */}
      {selectedElementId && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#202124]/95 backdrop-blur-md border border-orange-500 shadow-2xl animate-in fade-in duration-150">
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
            Element Selected
          </span>
          <button
            onClick={handleDuplicateSelected}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer font-medium"
            title="Duplicate selected element"
          >
            <Copy className="size-3.5" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs transition-colors cursor-pointer font-medium"
            title="Delete selected element"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Main Workspace Stage */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* ============================================================ */}
        {/* DRAGGABLE & EDITABLE TABLE CARD                             */}
        {/* ============================================================ */}
        <div
          style={{ transform: `translate3d(${tablePos.x}px, ${tablePos.y}px, 0)` }}
          className={`absolute w-[680px] max-w-[90vw] ${
            activeTool === "select" ? "z-30 pointer-events-auto" : "z-10 pointer-events-none"
          }`}
        >
          {/* Header & Drag Handle */}
          <div
            onMouseDown={handleTableGripDown}
            className="p-3 rounded-t-2xl bg-[#1e293b] border-2 border-b-0 border-orange-500 shadow-xl flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing hover:bg-slate-800 transition-colors pointer-events-auto"
          >
            <div className="flex items-center gap-2 min-w-0">
              <GripHorizontal className="size-4 text-orange-400 shrink-0" />
              <input
                type="text"
                value={tableTitle}
                onChange={(e) => setTableTitle(e.target.value)}
                className="font-bold text-xs sm:text-sm text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-orange-500 rounded px-1 w-full truncate"
                title="Click to edit table title"
              />
            </div>
            <span className="text-[10px] font-mono text-orange-400 px-2 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 shrink-0">
              Drag to move
            </span>
          </div>

          {/* Table Body */}
          <div className="bg-[#0f172a] rounded-b-2xl border-2 border-orange-500 shadow-2xl overflow-hidden font-mono text-xs pointer-events-auto">
            {/* Header Row */}
            <div className="grid grid-cols-4 bg-[#431407] text-orange-200 font-bold border-b border-orange-500/80 text-[11px] uppercase tracking-wider">
              <div className="p-2.5 border-r border-orange-900/60">Input (x)</div>
              <div className="p-2.5 border-r border-orange-900/60">Function f(x)</div>
              <div className="p-2.5 border-r border-orange-900/60">Derivative f&apos;(x)</div>
              <div className="p-2.5">Curve Behavior</div>
            </div>

            {/* Editable Rows */}
            {tableRows.map((row, index) => (
              <div
                key={row.id}
                className={`grid grid-cols-4 border-b border-slate-800 ${
                  index % 2 === 1 ? "bg-[#1e293b]/50" : "bg-[#0f172a]/70"
                }`}
              >
                <div className="p-1 border-r border-slate-800">
                  <input
                    type="text"
                    value={row.x}
                    onChange={(e) => handleCellChange(index, "x", e.target.value)}
                    className="w-full h-full bg-transparent text-slate-200 px-2 py-1.5 focus:outline-none focus:bg-orange-500/20 rounded font-semibold text-xs"
                  />
                </div>
                <div className="p-1 border-r border-slate-800">
                  <input
                    type="text"
                    value={row.fx}
                    onChange={(e) => handleCellChange(index, "fx", e.target.value)}
                    className="w-full h-full bg-transparent text-slate-200 px-2 py-1.5 focus:outline-none focus:bg-orange-500/20 rounded text-xs"
                  />
                </div>
                <div className="p-1 border-r border-slate-800">
                  <input
                    type="text"
                    value={row.fPrime}
                    onChange={(e) => handleCellChange(index, "fPrime", e.target.value)}
                    className="w-full h-full bg-transparent text-orange-400 font-bold px-2 py-1.5 focus:outline-none focus:bg-orange-500/20 rounded text-xs"
                  />
                </div>
                <div className="p-1">
                  <input
                    type="text"
                    value={row.behavior}
                    onChange={(e) => handleCellChange(index, "behavior", e.target.value)}
                    className="w-full h-full bg-transparent text-slate-300 px-2 py-1.5 focus:outline-none focus:bg-orange-500/20 rounded text-xs"
                  />
                </div>
              </div>
            ))}

            {/* Add Row Button */}
            <div className="p-1.5 bg-[#1e293b]/40 flex justify-end">
              <button
                onClick={handleAddTableRow}
                className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 px-2 py-1 rounded hover:bg-orange-500/10 transition-colors cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Row</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DRAGGABLE SUMMARY CARD                                       */}
        {/* ============================================================ */}
        <div
          style={{ transform: `translate3d(${summaryPos.x}px, ${summaryPos.y}px, 0)` }}
          className={`absolute w-[680px] max-w-[90vw] ${
            activeTool === "select" ? "z-30 pointer-events-auto" : "z-10 pointer-events-none"
          }`}
        >
          <div
            onMouseDown={handleSummaryGripDown}
            className="flex items-center justify-between p-2 rounded-t-xl bg-slate-900/90 border border-b-0 border-slate-800 cursor-grab active:cursor-grabbing text-[11px] text-slate-400 hover:text-white pointer-events-auto"
          >
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <GripHorizontal className="size-3.5" />
              Calculus Derivative Rules Note
            </span>
            <span className="text-[10px] font-mono text-slate-500">Drag to move</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-3 rounded-b-xl bg-[#0f172a] border border-slate-800 shadow-xl pointer-events-auto">
            <div className="p-2.5 rounded-lg bg-[#064e3b]/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
              <span className="font-bold block text-emerald-400">1. Negative Slope (f&apos;(x) &lt; 0)</span>
              <p className="text-[11px] text-slate-300">The curve slopes downwards as x increases.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-500/40 text-orange-200 text-xs space-y-1">
              <span className="font-bold block text-orange-400">2. Zero Slope (f&apos;(x) = 0)</span>
              <p className="text-[11px] text-slate-300">Horizontal tangent. Minimum turning point.</p>
            </div>
            <div className="p-2.5 rounded-lg bg-[#064e3b]/40 border border-emerald-500/40 text-emerald-200 text-xs space-y-1">
              <span className="font-bold block text-emerald-400">3. Positive Slope (f&apos;(x) &gt; 0)</span>
              <p className="text-[11px] text-slate-300">The curve climbs upwards symmetrically.</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE DRAWING & OBJECT CANVAS LAYER                    */}
        {/* ============================================================ */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          className={`absolute inset-0 w-full h-full touch-none ${
            activeTool === "select"
              ? "z-20 cursor-default pointer-events-auto"
              : activeTool === "text"
              ? "z-40 cursor-text pointer-events-auto"
              : "z-40 cursor-crosshair pointer-events-auto"
          }`}
        />

        {/* ============================================================ */}
        {/* DEDICATED RELIABLE FLOATING TEXT NOTE EDITOR                 */}
        {/* ============================================================ */}
        {editingText && (
          <div
            style={{
              left: `${editingText.x}px`,
              top: `${editingText.y - 30}px`,
            }}
            className="absolute z-50 flex flex-col gap-1.5 p-2.5 bg-[#1e293b]/98 backdrop-blur-md border-2 border-orange-500 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 min-w-[240px] max-w-[340px]"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-700/60 pb-1.5">
              <span className="flex items-center gap-1 text-orange-400 font-bold">
                <Type className="size-3.5" /> Note Editor
              </span>
              <span className="text-[10px] text-slate-400">Enter to save</span>
            </div>

            <textarea
              ref={textInputRef}
              rows={2}
              value={editingText.text}
              onChange={(e) =>
                setEditingText((prev) => (prev ? { ...prev, text: e.target.value } : null))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  commitTextEdit();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancelTextEdit();
                }
              }}
              placeholder="Type formula or note here..."
              style={{ color: activeColor }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />

            <div className="flex items-center justify-end gap-1.5 pt-0.5">
              <button
                onClick={cancelTextEdit}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="size-3" />
                <span>Cancel</span>
              </button>
              <button
                onClick={commitTextEdit}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer shadow-md"
              >
                <Check className="size-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Type guard helper
function elemIsArrow(elem: BoardElement): elem is BoardArrow {
  return elem.type === "arrow";
}
