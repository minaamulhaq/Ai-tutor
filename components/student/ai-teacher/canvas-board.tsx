"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Pen,
  Square,
  Circle,
  ArrowUpRight,
  Type,
  Eraser,
  MousePointer,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  X,
} from "lucide-react";

export type ToolType = "select" | "pen" | "rectangle" | "circle" | "arrow" | "text" | "eraser";

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
  title?: string;
  text?: string;
  badge?: string;
  language?: string;
  variant?: "title" | "definition" | "segment" | "code" | "formula" | "box" | "diagram";
}

export interface BoardCircle {
  id: string;
  type: "circle";
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

export type BoardElement = BoardStroke | BoardRect | BoardCircle | BoardArrow | BoardText;

export interface CanvasContextSnapshot {
  elements: Array<{
    id: string;
    type: "stroke" | "rectangle" | "circle" | "arrow" | "text";
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    title?: string;
    text?: string;
    color?: string;
  }>;
  selected_element_id: string | null;
  timestamp: number;
}

export interface AIBoardAction {
  action:
    | "add_title"
    | "add_definition"
    | "add_segment"
    | "add_code"
    | "add_formula"
    | "add_box"
    | "add_circle"
    | "add_text"
    | "add_arrow"
    | "add_diagram"
    | "edit_element"
    | "delete_element"
    | "highlight_element"
    | "clear_board";
  target?: string;
  language?: string;
  diagram_type?: "flowchart" | "hierarchy" | "cycle" | "comparison";
  nodes?: string[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  title?: string;
  text?: string;
  color?: string;
}

interface CanvasBoardProps {
  onContextChange?: (ctx: CanvasContextSnapshot) => void;
  incomingActions?: Array<{ id: string; payload: AIBoardAction }>;
}

/**
 * Finds an element by exact ID or case-insensitive substring match on its title or text.
 */
function findMatchingElement(elements: BoardElement[], target?: string): BoardElement | undefined {
  if (!target) return undefined;
  const q = target.trim().toLowerCase();
  if (!q) return undefined;

  // 1. Exact ID match
  const byId = elements.find((el) => el.id.toLowerCase() === q);
  if (byId) return byId;

  // 2. Exact title or text match
  const byExactText = elements.find((el) => {
    if (el.type === "rectangle") {
      const t = (el.title || "").trim().toLowerCase();
      const b = (el.text || "").trim().toLowerCase();
      return t === q || b === q || `${t}: ${b}` === q;
    }
    if (el.type === "circle" || el.type === "text") {
      return (el.text || "").trim().toLowerCase() === q;
    }
    return false;
  });
  if (byExactText) return byExactText;

  // 3. Substring match
  return elements.find((el) => {
    if (el.type === "rectangle") {
      const combined = `${el.title || ""} ${el.text || ""}`.trim().toLowerCase();
      return combined.includes(q) || (combined.length > 0 && q.includes(combined));
    }
    if (el.type === "circle" || el.type === "text") {
      const txt = (el.text || "").trim().toLowerCase();
      return txt.includes(q) || (txt.length > 0 && q.includes(txt));
    }
    return false;
  });
}

/**
 * Pixel-Aligned Smartboard Layout Engine:
 * - Frame Width: 760px (LEFT_X = 48 .. RIGHT_X = 808, CENTER_X = 428)
 * - Row 1: Complete Topic Title Banner (x=48, y=58, w=760, h=64)
 * - Connector Arrow: (428, 124) -> (428, 144)
 * - Row 2: Proper Topic Definition Card (x=48, y=148, w=760, dynamic height)
 * - Row 3+: 2-Column Aligned Segments Grid (Col 1: x=48 w=368, Col 2: x=440 w=368, equalized row heights)
 * - Diagram Section: Centered & aligned to 48..808 below segments
 */
/**
 * Deterministic Collision-Free & Viewport-Fitted Smartboard Reflow Engine:
 * - Recomputes every AI-managed element's exact (x, y) in vertical pedagogical order:
 *     Row 1: Topic Title Banner (`variant === "title"`)
 *     Row 2: Topic Definition Card (`variant === "definition"`)
 *     Row 3+: 2-Column Segment Grid (`variant === "segment" | "box"`)
 *     Row N: Full-Width Code File / Formula Cards (`variant === "code" | "formula"`)
 *     Row N+1: Diagrams (`variant === "diagram"`, circles, notes)
 * - Guarantee 1: ZERO overlapping between Title, Definition, Segments, Code, and Diagrams.
 * - Guarantee 2: Auto-Pagination / Eviction — if the total vertical height exceeds the
 *   visible canvas viewport (`maxCanvasH`), the oldest non-header cards are automatically
 *   evicted from the top of the body flow (while keeping the Topic Title pinned) so nothing
 *   ever overflows off the bottom of the screen!
 */
function reflowAndPaginateBoard(
  list: BoardElement[],
  maxCanvasH: number = 640
): BoardElement[] {
  const LEFT_X = 48;
  const FULL_W = 760;
  const CENTER_X = LEFT_X + FULL_W / 2;
  const COL_W = 368;
  const COL_1_X = 48;
  const COL_2_X = 440;
  const SAFE_BOTTOM_Y = Math.max(460, maxCanvasH - 22);

  // Separate user-drawn freehand strokes or manual notes from AI structured cards
  const manualElements = list.filter(
    (el) => !el.id.startsWith("ai-")
  );

  // Remove old auto-generated connector arrows between title & definition (we recreate cleanly)
  const aiElements = list.filter(
    (el) => el.id.startsWith("ai-") && !el.id.startsWith("ai-flow-title-def-")
  );

  const titleCard = aiElements.find(
    (el): el is BoardRect => el.type === "rectangle" && el.variant === "title"
  );
  const defCard = aiElements.find(
    (el): el is BoardRect => el.type === "rectangle" && el.variant === "definition"
  );
  const segmentCards = aiElements.filter(
    (el): el is BoardRect =>
      el.type === "rectangle" && (el.variant === "segment" || el.variant === "box")
  );
  const codeAndFormulaCards = aiElements.filter(
    (el): el is BoardRect =>
      el.type === "rectangle" && (el.variant === "code" || el.variant === "formula")
  );
  const diagramAndOtherAI = aiElements.filter(
    (el) =>
      !(
        el.type === "rectangle" &&
        (el.variant === "title" ||
          el.variant === "definition" ||
          el.variant === "segment" ||
          el.variant === "box" ||
          el.variant === "code" ||
          el.variant === "formula")
      )
  );

  // Helper to lay out all current AI elements and return both the positioned list and total bottom Y
  const computeLayout = (
    activeDef: BoardRect | undefined,
    activeSegments: BoardRect[],
    activeCodes: BoardRect[],
    activeDiagrams: BoardElement[]
  ): { positioned: BoardElement[]; maxBottom: number } => {
    const out: BoardElement[] = [];
    let cursorY = 58;

    // 1. Pinned Topic Title Banner at top
    if (titleCard) {
      const placedTitle: BoardRect = {
        ...titleCard,
        x: LEFT_X,
        y: cursorY,
        width: FULL_W,
        height: 62,
      };
      out.push(placedTitle);
      cursorY += placedTitle.height + 16;
    }

    // 2. Definition Card directly below Title Banner
    if (activeDef) {
      if (titleCard) {
        out.push({
          id: "ai-flow-title-def-main",
          type: "arrow",
          startX: CENTER_X,
          startY: cursorY - 14,
          endX: CENTER_X,
          endY: cursorY - 2,
          color: "#38bdf8",
        });
      }
      const placedDef: BoardRect = {
        ...activeDef,
        x: LEFT_X,
        y: cursorY,
        width: FULL_W,
      };
      out.push(placedDef);
      cursorY += placedDef.height + 16;
    }

    // 3. 2-Column Aligned Segments Grid (renumbered cleanly 01..0N)
    for (let i = 0; i < activeSegments.length; i += 2) {
      const leftSeg = activeSegments[i];
      const rightSeg = activeSegments[i + 1];
      const rowH = rightSeg
        ? Math.max(leftSeg.height, rightSeg.height)
        : leftSeg.height;

      out.push({
        ...leftSeg,
        badge: `SEGMENT 0${i + 1}`,
        x: COL_1_X,
        y: cursorY,
        width: COL_W,
        height: rowH,
      });

      if (rightSeg) {
        out.push({
          ...rightSeg,
          badge: `SEGMENT 0${i + 2}`,
          x: COL_2_X,
          y: cursorY,
          width: COL_W,
          height: rowH,
        });
      }
      cursorY += rowH + 16;
    }

    // 4. Full-Width Code File / Formula Cards
    for (const cCard of activeCodes) {
      out.push({
        ...cCard,
        x: LEFT_X,
        y: cursorY,
        width: FULL_W,
      });
      cursorY += cCard.height + 16;
    }

    // 5. Diagram group (shift entire diagram group vertically so its top sits at cursorY)
    if (activeDiagrams.length > 0) {
      let minDiagY = Infinity;
      let maxDiagBottom = 0;
      for (const el of activeDiagrams) {
        if (el.type === "rectangle" || el.type === "circle") {
          minDiagY = Math.min(minDiagY, el.y);
        } else if (el.type === "arrow") {
          minDiagY = Math.min(minDiagY, el.startY, el.endY);
        } else if (el.type === "text") {
          minDiagY = Math.min(minDiagY, el.y - 18);
        }
      }
      const deltaY = Number.isFinite(minDiagY) ? cursorY - minDiagY : 0;
      for (const el of activeDiagrams) {
        if (el.type === "rectangle" || el.type === "circle") {
          const shifted = { ...el, y: el.y + deltaY };
          out.push(shifted);
          maxDiagBottom = Math.max(maxDiagBottom, shifted.y + shifted.height);
        } else if (el.type === "arrow") {
          const shifted = {
            ...el,
            startY: el.startY + deltaY,
            endY: el.endY + deltaY,
          };
          out.push(shifted);
          maxDiagBottom = Math.max(maxDiagBottom, shifted.startY, shifted.endY);
        } else if (el.type === "text") {
          const shifted = { ...el, y: el.y + deltaY };
          out.push(shifted);
          maxDiagBottom = Math.max(maxDiagBottom, shifted.y + 20);
        } else {
          out.push(el);
        }
      }
      cursorY = Math.max(cursorY, maxDiagBottom + 16);
    }

    const maxBottom = out.reduce((acc, el) => {
      if (el.type === "rectangle" || el.type === "circle") {
        return Math.max(acc, el.y + el.height);
      }
      if (el.type === "arrow") {
        return Math.max(acc, el.startY, el.endY);
      }
      if (el.type === "text") {
        return Math.max(acc, el.y + 20);
      }
      return acc;
    }, 58);

    return { positioned: out, maxBottom };
  };

  // Cap segments to at most 4 on screen at a time (2 rows) so the board always stays clean & focused
  let curDef = defCard;
  let curSegments = segmentCards.slice(-4);
  let curCodes = codeAndFormulaCards.slice(-2);
  let curDiagrams = diagramAndOtherAI;

  let layout = computeLayout(curDef, curSegments, curCodes, curDiagrams);

  // Progressive eviction loop: if content would overflow off the bottom of the canvas,
  // remove the oldest previous steps first so the newest step fits cleanly inside the viewport!
  let safetyCounter = 0;
  while (layout.maxBottom > SAFE_BOTTOM_Y && safetyCounter < 12) {
    safetyCounter += 1;
    if (curSegments.length > 2) {
      // Remove oldest pair of segments first
      curSegments = curSegments.slice(2);
    } else if (curDef && (curSegments.length > 0 || curCodes.length > 0 || curDiagrams.length > 0)) {
      // Once we've moved past the definition into examples/code/diagrams, evict the old definition card
      curDef = undefined;
    } else if (curSegments.length > 0 && (curCodes.length > 0 || curDiagrams.length > 0)) {
      // Evict remaining older segments to make room for code or diagram
      curSegments = curSegments.slice(1);
    } else if (curCodes.length > 1) {
      curCodes = curCodes.slice(1);
    } else if (curDiagrams.length > 0 && curCodes.length > 0) {
      curDiagrams = [];
    } else {
      break;
    }
    layout = computeLayout(curDef, curSegments, curCodes, curDiagrams);
  }

  return [...layout.positioned, ...manualElements];
}

function applyAIActionWithAutoLayout(
  prev: BoardElement[],
  cmd: AIBoardAction
): {
  next: BoardElement[];
  selectedId: string | null;
  highlightedId?: string | null;
} {
  const LEFT_X = 48;
  const FULL_W = 760;
  const CENTER_X = LEFT_X + FULL_W / 2; // 428
  const COL_W = 368;
  const COL_1_X = 48;
  const COL_2_X = 440; // 48 + 368 + 24 = 440; 440 + 368 = 808 (matches 48 + 760 = 808!)

  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // 1. CLEAR / RESET BOARD
  if (cmd.action === "clear_board") {
    return { next: [], selectedId: null, highlightedId: null };
  }

  // 2. DELETE ELEMENT
  if (cmd.action === "delete_element") {
    const match = findMatchingElement(prev, cmd.target || cmd.title || cmd.text);
    if (!match) return { next: prev, selectedId: null };
    return {
      next: prev.filter((el) => el.id !== match.id),
      selectedId: null,
      highlightedId: null,
    };
  }

  // 3. EDIT ELEMENT IN PLACE
  if (cmd.action === "edit_element") {
    const match = findMatchingElement(prev, cmd.target);
    if (match) {
      const updated = prev.map((el) => {
        if (el.id !== match.id) return el;
        if (el.type === "rectangle") {
          return {
            ...el,
            title: cmd.title || el.title,
            text: cmd.text || el.text,
            color: cmd.color || el.color,
          };
        }
        if (el.type === "circle" || el.type === "text") {
          return {
            ...el,
            text: cmd.text || cmd.title || el.text,
            color: cmd.color || el.color,
          };
        }
        return el;
      });
      return { next: updated, selectedId: match.id, highlightedId: match.id };
    }
    cmd = { ...cmd, action: "add_segment" };
  }

  // 4. HIGHLIGHT / POINT AT ELEMENT
  if (cmd.action === "highlight_element") {
    const match = findMatchingElement(prev, cmd.target || cmd.title || cmd.text);
    if (match) {
      return { next: prev, selectedId: match.id, highlightedId: match.id };
    }
    return { next: prev, selectedId: null };
  }

  // 5. COMPLETE TOPIC TITLE BANNER (Top of Whiteboard: x=48, y=58, w=760, h=64)
  if (cmd.action === "add_title") {
    const rawTitle = (cmd.title || cmd.text || "Lesson Topic").trim();
    const rawSub = cmd.title && cmd.text && cmd.title !== cmd.text ? cmd.text.trim() : "";

    const existingTitle = prev.find(
      (el): el is BoardRect => el.type === "rectangle" && el.variant === "title"
    );

    if (existingTitle) {
      const updated = prev.map((el) =>
        el.id === existingTitle.id
          ? {
              ...el,
              title: rawTitle,
              text: rawSub || existingTitle.text,
              color: cmd.color || "#f97316",
            }
          : el
      );
      return { next: updated, selectedId: existingTitle.id, highlightedId: existingTitle.id };
    }

    const titleBanner: BoardRect = {
      id: `ai-title-${uid()}`,
      type: "rectangle",
      variant: "title",
      badge: "COMPLETE TOPIC TITLE",
      x: LEFT_X,
      y: 58,
      width: FULL_W,
      height: 64,
      color: cmd.color || "#f97316",
      title: rawTitle,
      text: rawSub,
    };
    return {
      next: [titleBanner, ...prev],
      selectedId: titleBanner.id,
      highlightedId: titleBanner.id,
    };
  }

  // 6. PROPER TOPIC DEFINITION CARD (Full-Width Aligned below Topic Title)
  if (cmd.action === "add_definition") {
    let workingList = [...prev];
    const topicName = (cmd.title || "Topic Definition").trim();
    const defBody = (cmd.text || cmd.title || "").trim();

    // Ensure a Complete Topic Title Banner exists at the top of the board first!
    let titleBanner = workingList.find(
      (el): el is BoardRect => el.type === "rectangle" && el.variant === "title"
    );
    if (!titleBanner) {
      titleBanner = {
        id: `ai-title-auto-${uid()}`,
        type: "rectangle",
        variant: "title",
        badge: "COMPLETE TOPIC TITLE",
        x: LEFT_X,
        y: 58,
        width: FULL_W,
        height: 64,
        color: "#f97316",
        title: topicName,
        text: "Core Topic & Definition Overview",
      };
      workingList = [titleBanner, ...workingList];
    }

    // Check if an existing definition card is already on the board for this topic
    const existingDef = workingList.find(
      (el): el is BoardRect => el.type === "rectangle" && el.variant === "definition"
    );

    // Estimate height needed for multi-line definition text (~82 chars per line across 724px inner width)
    const estLines = Math.max(2, Math.ceil(defBody.length / 82));
    const defHeight = Math.max(92, 46 + estLines * 21);
    const defY = titleBanner.y + titleBanner.height + 24; // 58 + 64 + 24 = 146

    if (existingDef) {
      const updated = workingList.map((el) =>
        el.id === existingDef.id
          ? {
              ...el,
              title: topicName,
              text: defBody,
              height: Math.max(el.height, defHeight),
              color: cmd.color || "#38bdf8",
            }
          : el
      );
      return { next: updated, selectedId: existingDef.id, highlightedId: existingDef.id };
    }

    // Add a clean downward flow arrow from the Topic Title Banner -> Definition Card
    const hasTitleToDefArrow = workingList.some(
      (el) =>
        el.type === "arrow" &&
        Math.abs(el.startX - CENTER_X) < 20 &&
        Math.abs(el.startY - (titleBanner!.y + titleBanner!.height)) < 15
    );
    if (!hasTitleToDefArrow) {
      workingList.push({
        id: `ai-flow-title-def-${uid()}`,
        type: "arrow",
        startX: CENTER_X,
        startY: titleBanner.y + titleBanner.height + 2,
        endX: CENTER_X,
        endY: defY - 3,
        color: "#38bdf8",
      });
    }

    const defCard: BoardRect = {
      id: `ai-def-${uid()}`,
      type: "rectangle",
      variant: "definition",
      badge: "DEFINITION",
      x: LEFT_X,
      y: defY,
      width: FULL_W,
      height: defHeight,
      color: cmd.color || "#38bdf8",
      title: topicName,
      text: defBody,
    };

    return {
      next: [...workingList, defCard],
      selectedId: defCard.id,
      highlightedId: defCard.id,
    };
  }

  // Helper: compute current lowest bottom coordinate across all elements
  const getMaxBottom = (list: BoardElement[], filterFn?: (el: BoardElement) => boolean) => {
    let maxB = 58;
    for (const el of list) {
      if (filterFn && !filterFn(el)) continue;
      if (el.type === "rectangle" || el.type === "circle") {
        maxB = Math.max(maxB, el.y + el.height);
      } else if (el.type === "text") {
        maxB = Math.max(maxB, el.y + 24);
      } else if (el.type === "arrow") {
        maxB = Math.max(maxB, Math.max(el.startY, el.endY));
      }
    }
    return maxB;
  };

  // 6.5 EXECUTABLE CODE FILE CARD & MATHEMATICAL FORMULA CARD (Full-Width IDE / Equation Block)
  if (cmd.action === "add_code" || cmd.action === "add_formula") {
    const isCode = cmd.action === "add_code";
    const fileTitle = (
      cmd.title || (isCode ? "example.py" : "Key Formula")
    ).trim();
    const rawContent = (cmd.text || "")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "    ")
      .trim();

    const codeLines = rawContent
      ? rawContent.split("\n")
      : [isCode ? "# Write your code here" : "Formula"];

    const lineH = isCode ? 20 : 22;
    const headerH = 34;
    const cardHeight = Math.max(
      isCode ? 116 : 92,
      headerH + 24 + codeLines.length * lineH
    );

    // Update existing code/formula card if same filename/title already exists
    const existingCard = prev.find(
      (el): el is BoardRect =>
        el.type === "rectangle" &&
        el.variant === (isCode ? "code" : "formula") &&
        (el.title || "").trim().toLowerCase() === fileTitle.toLowerCase()
    );
    if (existingCard) {
      const updated = prev.map((el) =>
        el.id === existingCard.id
          ? {
              ...el,
              text: rawContent,
              height: Math.max(el.height, cardHeight),
              color: cmd.color || (isCode ? "#10b981" : "#a855f7"),
            }
          : el
      );
      return {
        next: updated,
        selectedId: existingCard.id,
        highlightedId: existingCard.id,
      };
    }

    const cardY = prev.length === 0 ? 60 : getMaxBottom(prev) + 20;
    const langBadge = isCode
      ? (cmd.language || fileTitle.split(".").pop() || "PYTHON").toUpperCase()
      : "FORMULA";

    const codeCard: BoardRect = {
      id: `ai-${isCode ? "code" : "formula"}-${uid()}`,
      type: "rectangle",
      variant: isCode ? "code" : "formula",
      badge: isCode ? `${langBadge} FILE` : langBadge,
      language: cmd.language || "python",
      x: LEFT_X,
      y: cardY,
      width: FULL_W,
      height: cardHeight,
      color: cmd.color || (isCode ? "#10b981" : "#a855f7"),
      title: fileTitle,
      text: rawContent,
    };

    return {
      next: [...prev, codeCard],
      selectedId: codeCard.id,
      highlightedId: codeCard.id,
    };
  }

  // 7. STRUCTURED SEGMENTS & CONCEPT BOXES (2-Column Pixel-Aligned Bento Grid)
  if (cmd.action === "add_segment" || cmd.action === "add_box") {
    let rawTitle = (cmd.title || "").trim();
    let rawBody = (cmd.text || "").trim();

    if (!rawTitle && rawBody.includes(":")) {
      const parts = rawBody.split(":", 2);
      rawTitle = parts[0].trim();
      rawBody = parts[1].trim();
    } else if (!rawTitle) {
      rawTitle = "Key Concept";
    }
    if (rawTitle.toLowerCase() === rawBody.toLowerCase()) {
      rawBody = "";
    }

    // Deduplicate against existing segment/box cards
    const duplicate = prev.find(
      (el): el is BoardRect =>
        el.type === "rectangle" &&
        (el.variant === "segment" || el.variant === "box" || !el.variant) &&
        (el.title || "").trim().toLowerCase() === rawTitle.toLowerCase() &&
        (el.text || "").trim().toLowerCase() === rawBody.toLowerCase()
    );
    if (duplicate) {
      return { next: prev, selectedId: duplicate.id, highlightedId: duplicate.id };
    }

    const existingSegments = prev.filter(
      (el): el is BoardRect =>
        el.type === "rectangle" && (el.variant === "segment" || el.variant === "box")
    );
    const segIdx = existingSegments.length;
    const colIndex = segIdx % 2; // 0 = Left Column (48), 1 = Right Column (440)
    const segX = colIndex === 0 ? COL_1_X : COL_2_X;

    // Estimate height needed (~40 chars per line inside 336px inner width)
    const bodyLen = (rawBody || rawTitle).length;
    const estLines = Math.max(2, Math.ceil(bodyLen / 38));
    const neededHeight = rawBody ? Math.max(92, 46 + estLines * 20) : 82;

    let segY = 64;
    let workingList = [...prev];

    if (colIndex === 1 && existingSegments.length > 0) {
      // Align horizontally with the left-column card in the same row and equalize their heights!
      const leftPartner = existingSegments[existingSegments.length - 1];
      segY = leftPartner.y;
      const unifiedHeight = Math.max(leftPartner.height, neededHeight);
      workingList = workingList.map((el) =>
        el.id === leftPartner.id ? { ...el, height: unifiedHeight } : el
      );
      const segCard: BoardRect = {
        id: `ai-seg-${uid()}`,
        type: "rectangle",
        variant: "segment",
        badge: `SEGMENT 0${segIdx + 1}`,
        x: segX,
        y: segY,
        width: COL_W,
        height: unifiedHeight,
        color: cmd.color || (segIdx % 2 === 0 ? "#10b981" : "#f97316"),
        title: rawTitle,
        text: rawBody,
      };
      return {
        next: [...workingList, segCard],
        selectedId: segCard.id,
        highlightedId: segCard.id,
      };
    } else {
      // Starting a new row in Column 1 (x = 48)
      const prevBottom = getMaxBottom(workingList);
      segY = workingList.length === 0 ? 60 : prevBottom + 20;

      const segCard: BoardRect = {
        id: `ai-seg-${uid()}`,
        type: "rectangle",
        variant: "segment",
        badge: `SEGMENT 0${segIdx + 1}`,
        x: segX,
        y: segY,
        width: COL_W,
        height: neededHeight,
        color: cmd.color || "#10b981",
        title: rawTitle,
        text: rawBody,
      };
      return {
        next: [...workingList, segCard],
        selectedId: segCard.id,
        highlightedId: segCard.id,
      };
    }
  }

  // 8. INTERNAL CANVAS DIAGRAM GENERATOR (Aligned within 48..808 frame)
    if (
      cmd.action === "add_diagram" &&
      cmd.nodes &&
      cmd.nodes.length > 0
    ) {
      // Remove any previous diagram elements before adding the new diagram so diagrams never stack!
      prev = prev.filter(
        (el) =>
          !el.id.startsWith("ai-diag-") &&
          !el.id.startsWith("ai-cycle-") &&
          !el.id.startsWith("ai-comp-") &&
          !el.id.startsWith("ai-flow-")
      );
      const nodes = cmd.nodes.map((n) => n.trim()).filter(Boolean);
    const dtype = cmd.diagram_type || "flowchart";
    const baseColor = cmd.color || "#f97316";
    const created: BoardElement[] = [];
    let lastId: string | null = null;

    const diagStartY = prev.length === 0 ? 70 : getMaxBottom(prev) + 26;

    if (dtype === "hierarchy" && nodes.length >= 2) {
      // Root card centered at CENTER_X (428), child cards evenly spanning 48..808
      const rootText = nodes[0];
      const children = nodes.slice(1, 5);
      const rootW = 280;
      const rootH = 68;
      const rootX = CENTER_X - rootW / 2;
      const rootY = diagStartY;

      const rootRect: BoardRect = {
        id: `ai-diag-root-${uid()}`,
        type: "rectangle",
        variant: "diagram",
        badge: "ROOT CONCEPT",
        x: rootX,
        y: rootY,
        width: rootW,
        height: rootH,
        color: baseColor,
        title: rootText,
        text: "",
      };
      created.push(rootRect);
      lastId = rootRect.id;

      const childY = rootY + rootH + 46;
      const count = children.length;
      const gap = 20;
      const childW = Math.floor((FULL_W - gap * (count - 1)) / count);
      const childH = 74;

      children.forEach((childText, idx) => {
        const cx = LEFT_X + idx * (childW + gap);
        let cTitle = childText;
        let cBody = "";
        if (childText.includes(":")) {
          const sp = childText.split(":", 2);
          cTitle = sp[0].trim();
          cBody = sp[1].trim();
        }

        const arrow: BoardArrow = {
          id: `ai-diag-arr-${uid()}-${idx}`,
          type: "arrow",
          startX: rootX + rootW / 2,
          startY: rootY + rootH + 2,
          endX: cx + childW / 2,
          endY: childY - 4,
          color: "#10b981",
        };
        const childBox: BoardRect = {
          id: `ai-diag-child-${uid()}-${idx}`,
          type: "rectangle",
          variant: "diagram",
          badge: `BRANCH 0${idx + 1}`,
          x: cx,
          y: childY,
          width: childW,
          height: childH,
          color: "#38bdf8",
          title: cTitle,
          text: cBody,
        };
        created.push(arrow, childBox);
        lastId = childBox.id;
      });

      return { next: [...prev, ...created], selectedId: lastId, highlightedId: lastId };
    }

    if (dtype === "cycle" && nodes.length >= 3) {
      // Circular cycle layout centered at CENTER_X (428)
      const cycleNodes = nodes.slice(0, 5);
      const radiusX = 225;
      const radiusY = 105;
      const nodeW = 180;
      const nodeH = 68;
      const centerY = diagStartY + radiusY + nodeH / 2 + 10;

      const centers: Point[] = cycleNodes.map((_, idx) => {
        const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / cycleNodes.length;
        return {
          x: CENTER_X + radiusX * Math.cos(angle),
          y: centerY + radiusY * Math.sin(angle),
        };
      });

      cycleNodes.forEach((nText, idx) => {
        const c = centers[idx];
        const circleElem: BoardCircle = {
          id: `ai-cycle-node-${uid()}-${idx}`,
          type: "circle",
          x: c.x - nodeW / 2,
          y: c.y - nodeH / 2,
          width: nodeW,
          height: nodeH,
          color: idx === 0 ? "#f97316" : "#10b981",
          text: nText,
        };
        created.push(circleElem);
        lastId = circleElem.id;

        const nextC = centers[(idx + 1) % centers.length];
        const angle = Math.atan2(nextC.y - c.y, nextC.x - c.x);
        const startX = c.x + Math.cos(angle) * (nodeW * 0.48);
        const startY = c.y + Math.sin(angle) * (nodeH * 0.52);
        const endX = nextC.x - Math.cos(angle) * (nodeW * 0.48);
        const endY = nextC.y - Math.sin(angle) * (nodeH * 0.52);

        created.push({
          id: `ai-cycle-arr-${uid()}-${idx}`,
          type: "arrow",
          startX,
          startY,
          endX,
          endY,
          color: "#38bdf8",
        });
      });

      return { next: [...prev, ...created], selectedId: lastId, highlightedId: lastId };
    }

    if (dtype === "comparison" && nodes.length >= 2) {
      // Two side-by-side columns aligned exactly with COL_1_X (48) and COL_2_X (440)
      const boxH = 76;
      nodes.slice(0, 6).forEach((nText, idx) => {
        const isLeft = idx % 2 === 0;
        const rowIdx = Math.floor(idx / 2);
        const bx = isLeft ? COL_1_X : COL_2_X;
        const by = diagStartY + rowIdx * (boxH + 18);
        let cTitle = nText;
        let cBody = "";
        if (nText.includes(":")) {
          const sp = nText.split(":", 2);
          cTitle = sp[0].trim();
          cBody = sp[1].trim();
        }
        const box: BoardRect = {
          id: `ai-comp-${uid()}-${idx}`,
          type: "rectangle",
          variant: "segment",
          badge: isLeft ? "OPTION A" : "OPTION B",
          x: bx,
          y: by,
          width: COL_W,
          height: boxH,
          color: isLeft ? "#f97316" : "#38bdf8",
          title: cTitle,
          text: cBody,
        };
        created.push(box);
        lastId = box.id;
      });

      return { next: [...prev, ...created], selectedId: lastId, highlightedId: lastId };
    }

    // Default: 3-Column Pixel-Aligned Flowchart (232px * 3 + 32px * 2 = 760px -> 48..808!)
    const flowNodes = nodes.slice(0, 6);
    const boxW = 232;
    const boxH = 74;
    const gapX = 32;

    flowNodes.forEach((nText, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const bx = LEFT_X + col * (boxW + gapX);
      const by = diagStartY + row * (boxH + 48);

      let fTitle = nText;
      let fBody = "";
      if (nText.includes(":")) {
        const sp = nText.split(":", 2);
        fTitle = sp[0].trim();
        fBody = sp[1].trim();
      }

      const box: BoardRect = {
        id: `ai-flow-box-${uid()}-${idx}`,
        type: "rectangle",
        variant: "diagram",
        badge: `STEP 0${idx + 1}`,
        x: bx,
        y: by,
        width: boxW,
        height: boxH,
        color: idx === 0 ? "#f97316" : idx === flowNodes.length - 1 ? "#10b981" : "#38bdf8",
        title: fTitle,
        text: fBody,
      };
      created.push(box);
      lastId = box.id;

      if (idx < flowNodes.length - 1) {
        const nextCol = (idx + 1) % 3;
        const nextRow = Math.floor((idx + 1) / 3);
        if (nextRow === row) {
          created.push({
            id: `ai-flow-arr-${uid()}-${idx}`,
            type: "arrow",
            startX: bx + boxW + 4,
            startY: by + boxH / 2,
            endX: bx + boxW + gapX - 4,
            endY: by + boxH / 2,
            color: "#10b981",
          });
        } else {
          const nextBx = LEFT_X + nextCol * (boxW + gapX);
          const nextBy = diagStartY + nextRow * (boxH + 48);
          created.push({
            id: `ai-flow-arr-${uid()}-${idx}`,
            type: "arrow",
            startX: bx + boxW / 2,
            startY: by + boxH + 4,
            endX: nextBx + boxW / 2,
            endY: nextBy - 4,
            color: "#10b981",
          });
        }
      }
    });

    return { next: [...prev, ...created], selectedId: lastId, highlightedId: lastId };
  }

  // 9. SINGLE CIRCLE OR TEXT NOTE OR ARROW
  const cleanText = (cmd.text || cmd.title || "").trim();
  const nextY = prev.length === 0 ? 64 : getMaxBottom(prev) + 20;

  if (cmd.action === "add_circle") {
    const newCircle: BoardCircle = {
      id: `ai-circle-${uid()}`,
      type: "circle",
      x: LEFT_X,
      y: nextY,
      width: 220,
      height: 76,
      color: cmd.color || "#10b981",
      text: cleanText || "Node",
    };
    return { next: [...prev, newCircle], selectedId: newCircle.id, highlightedId: newCircle.id };
  }

  if (cmd.action === "add_text") {
    const newText: BoardText = {
      id: `ai-text-${uid()}`,
      type: "text",
      x: LEFT_X + 10,
      y: nextY + 22,
      text: cleanText || "Important Note",
      color: cmd.color || "#38bdf8",
      fontSize: 16,
    };
    return { next: [...prev, newText], selectedId: newText.id, highlightedId: newText.id };
  }

  if (cmd.action === "add_arrow") {
    const startY = Math.max(60, getMaxBottom(prev) + 2);
    const newArrow: BoardArrow = {
      id: `ai-arrow-${uid()}`,
      type: "arrow",
      startX: CENTER_X,
      startY,
      endX: CENTER_X,
      endY: startY + 24,
      color: cmd.color || "#10b981",
    };
    return { next: [...prev, newArrow], selectedId: newArrow.id };
  }

  return { next: prev, selectedId: null };
}

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

/**
 * Helper to word-wrap a paragraph into lines that fit within maxLineWidth
 */
function wrapParagraphLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxLineWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxLineWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Multi-line centered text renderer inside a simple shape (Circle or plain user Rectangle)
 */
function drawWrappedShapeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13.5px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxLineWidth = Math.max(60, width - 24);
  const lines = wrapParagraphLines(ctx, text, maxLineWidth);
  const lineHeight = 18;
  const totalTextH = (lines.length - 1) * lineHeight;
  const startY = y + height / 2 - totalTextH / 2;

  lines.forEach((line, idx) => {
    ctx.fillText(line, x + width / 2, startY + idx * lineHeight);
  });
}

/**
 * Renders structured Smartboard Cards (Complete Topic Title, Definition Card, Segment Card, Diagram Node)
 * with crisp alignment, header strips, badges, and word-wrapped body text.
 */
function drawStructuredRectCard(
  ctx: CanvasRenderingContext2D,
  elem: BoardRect,
  isHighlighted: boolean
) {
  const { x, y, width, height, color, variant, badge } = elem;
  const titleText = (elem.title || "").trim();
  const bodyText = (elem.text || "").trim();

  // 1. Outer Card Surface & Border
  if (isHighlighted) {
    ctx.shadowColor = color || "#f97316";
    ctx.shadowBlur = 24;
  }
  ctx.fillStyle = isHighlighted ? "rgba(30, 41, 59, 0.98)" : "rgba(15, 23, 42, 0.95)";
  ctx.strokeStyle = isHighlighted ? "#facc15" : color;
  ctx.lineWidth = isHighlighted ? 3.5 : 2;
  drawSafeRoundedRect(ctx, x, y, width, height, 11);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // CASE A: COMPLETE TOPIC TITLE BANNER (variant === "title")
  if (variant === "title") {
    // Left vertical accent bar
    ctx.fillStyle = color || "#f97316";
    drawSafeRoundedRect(ctx, x + 8, y + 10, 6, Math.max(16, height - 20), 3);
    ctx.fill();

    // Micro badge at top-left
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = color || "#f97316";
    ctx.fillText(badge || "COMPLETE TOPIC TITLE", x + 24, y + 21);

    // Main Complete Topic Title
    ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    const mainTitle = titleText || bodyText || "Lesson Topic";
    ctx.fillText(mainTitle, x + 24, y + 46);

    // Optional category / subtitle on the right or beside title
    if (bodyText && bodyText !== mainTitle) {
      const titleW = ctx.measureText(mainTitle).width;
      if (x + 36 + titleW + 120 < x + width) {
        ctx.font = "500 13px system-ui, -apple-system, sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(`—  ${bodyText}`, x + 34 + titleW, y + 46);
      }
    }
    return;
  }

  // CASE A2: IDE CODE FILE WINDOW (variant === "code") & FORMULA CARD (variant === "formula")
  if (variant === "code" || variant === "formula") {
    const isCode = variant === "code";
    const headerH = 34;

    // Darker IDE editor background for code files
    ctx.save();
    drawSafeRoundedRect(ctx, x, y, width, height, 11);
    ctx.fillStyle = isCode ? "rgba(9, 14, 26, 0.98)" : "rgba(24, 16, 42, 0.96)";
    ctx.fill();

    // Top IDE window bar
    drawSafeRoundedRect(ctx, x + 1, y + 1, width - 2, headerH, 10);
    ctx.fillStyle = isCode
      ? "rgba(16, 185, 129, 0.14)"
      : "rgba(168, 85, 247, 0.16)";
    ctx.fill();

    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + headerH);
    ctx.lineTo(x + width - 1, y + headerH);
    ctx.stroke();

    // macOS / VSCode style window dots on the left of the header
    const dotColors = ["#ef4444", "#f59e0b", "#10b981"];
    dotColors.forEach((dc, idx) => {
      ctx.fillStyle = dc;
      ctx.beginPath();
      ctx.arc(x + 16 + idx * 14, y + headerH / 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // File name tab & language badge
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 12.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    ctx.fillStyle = "#f8fafc";
    const fileLabel = titleText || (isCode ? "script.py" : "Formula");
    ctx.fillText(fileLabel, x + 64, y + headerH / 2);

    if (badge) {
      ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = color || "#10b981";
      ctx.textAlign = "right";
      ctx.fillText(badge, x + width - 16, y + headerH / 2);
    }

    // Render multi-line code with line numbers and syntax coloring
    const rawLines = (bodyText || titleText).split("\n");
    const lineH = isCode ? 20 : 22;
    const maxVisible = Math.max(1, Math.floor((height - headerH - 14) / lineH));

    if (isCode) {
      // Left gutter background for line numbers
      const gutterW = 38;
      ctx.fillStyle = "rgba(30, 41, 59, 0.45)";
      ctx.fillRect(x + 2, y + headerH + 1, gutterW, height - headerH - 3);

      rawLines.slice(0, maxVisible).forEach((rawLine, idx) => {
        const lineY = y + headerH + 20 + idx * lineH;

        // Line number
        ctx.font = "500 11.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "right";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(String(idx + 1), x + gutterW - 8, lineY);

        // Code line coloring (comments in emerald/slate, output in amber, code in crisp sky/white)
        const trimmed = rawLine.trim();
        ctx.font = "500 13.5px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
        ctx.textAlign = "left";
        if (trimmed.toLowerCase().startsWith("# output") || trimmed.toLowerCase().startsWith("// output")) {
          ctx.fillStyle = "#fbbf24";
        } else if (trimmed.startsWith("#") || trimmed.startsWith("//")) {
          ctx.fillStyle = "#6ee7b7";
        } else {
          ctx.fillStyle = "#e2e8f0";
        }
        ctx.fillText(rawLine, x + gutterW + 12, lineY);
      });
    } else {
      // Centered crisp formula lines
      ctx.font = "bold 16px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      ctx.fillStyle = "#f3e8ff";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      rawLines.slice(0, maxVisible).forEach((fLine, idx) => {
        ctx.fillText(fLine, x + width / 2, y + headerH + 26 + idx * lineH);
      });
    }

    ctx.restore();
    return;
  }

  // CASE B: DEFINITION CARD OR STRUCTURED SEGMENT CARD OR 2-PART DIAGRAM NODE
  const hasSeparateBody = Boolean(titleText && bodyText && titleText.toLowerCase() !== bodyText.toLowerCase());
  if (variant === "definition" || variant === "segment" || hasSeparateBody || badge) {
    const headerH = 30;

    // Subtle tinted header strip
    ctx.save();
    ctx.beginPath();
    drawSafeRoundedRect(ctx, x + 1, y + 1, width - 2, headerH, 10);
    ctx.fillStyle =
      variant === "definition"
        ? "rgba(56, 189, 248, 0.14)"
        : "rgba(148, 163, 184, 0.10)";
    ctx.fill();

    // Divider line under header
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 1, y + headerH);
    ctx.lineTo(x + width - 1, y + headerH);
    ctx.stroke();
    ctx.restore();

    // Left accent dot in header
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 14, y + headerH / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Header Title (Badge + Proper Topic / Segment Title)
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let headerCursorX = x + 25;

    if (badge) {
      ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(badge, headerCursorX, y + headerH / 2);
      headerCursorX += ctx.measureText(badge).width + 8;

      ctx.fillStyle = "#64748b";
      ctx.fillText("•", headerCursorX, y + headerH / 2);
      headerCursorX += 10;
    }

    const displayHeaderTitle = hasSeparateBody ? titleText : badge ? titleText || bodyText : titleText;
    if (displayHeaderTitle) {
      ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      // Truncate header title cleanly if needed so it never overflows header width
      let clippedTitle = displayHeaderTitle;
      const maxHeaderW = Math.max(60, x + width - headerCursorX - 12);
      while (clippedTitle.length > 4 && ctx.measureText(clippedTitle).width > maxHeaderW) {
        clippedTitle = clippedTitle.slice(0, -2) + "…";
      }
      ctx.fillText(clippedTitle, headerCursorX, y + headerH / 2);
    }

    // Body Content below header
    const contentToWrap = hasSeparateBody ? bodyText : !badge ? bodyText : "";
    if (contentToWrap) {
      ctx.font =
        variant === "definition"
          ? "500 14px system-ui, -apple-system, sans-serif"
          : "500 13px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";

      const padX = 16;
      const lines = wrapParagraphLines(ctx, contentToWrap, Math.max(80, width - padX * 2));
      const lineH = variant === "definition" ? 20 : 18.5;
      const maxVisibleLines = Math.max(1, Math.floor((height - headerH - 12) / lineH));

      lines.slice(0, maxVisibleLines).forEach((line, idx) => {
        ctx.fillText(line, x + padX, y + headerH + 20 + idx * lineH);
      });
    } else if (badge && (titleText || bodyText)) {
      // Single-part diagram node with a badge (e.g. STEP 01 in header, main label centered in body)
      const label = titleText || bodyText;
      ctx.font = "bold 13.5px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = wrapParagraphLines(ctx, label, Math.max(60, width - 24));
      const lineH = 17;
      const bodyCenterY = y + headerH + (height - headerH) / 2;
      const startY = bodyCenterY - ((lines.length - 1) * lineH) / 2;
      lines.slice(0, 2).forEach((line, idx) => {
        ctx.fillText(line, x + width / 2, startY + idx * lineH);
      });
    }
    return;
  }

  // CASE C: PLAIN USER-DRAWN OR SIMPLE RECTANGLE
  if (titleText || bodyText) {
    drawWrappedShapeText(ctx, titleText || bodyText, x, y, width, height);
  }
}

export function CanvasBoard({ onContextChange, incomingActions = [] }: CanvasBoardProps = {}) {
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [activeColor, setActiveColor] = useState<string>("#f97316");

  // Clean & empty canvas elements state
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [highlightedElementId, setHighlightedElementId] = useState<string | null>(null);

  // Dedicated reliable text editing state
  const [editingText, setEditingText] = useState<{
    id: string;
    x: number;
    y: number;
    text: string;
    isNew: boolean;
  } | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement | null>(null);

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

  const editingId = editingText?.id ?? null;

  // Focus textarea ONLY when a new editing session opens (when editingId changes)
  useEffect(() => {
    if (editingId && textInputRef.current) {
      textInputRef.current.focus();
      const len = textInputRef.current.value.length;
      textInputRef.current.setSelectionRange(len, len);
    }
  }, [editingId]);

  // Report live canvas context to parent WebSocket stream
  useEffect(() => {
    if (!onContextChange) return;
    const summaryElements = elements.map((el) => {
      if (el.type === "stroke") {
        return {
          id: el.id,
          type: el.type,
          x: Math.round(el.minX),
          y: Math.round(el.minY),
          width: Math.round(el.maxX - el.minX),
          height: Math.round(el.maxY - el.minY),
          color: el.color,
        };
      }
      if (el.type === "arrow") {
        return {
          id: el.id,
          type: el.type,
          x: Math.round(el.startX),
          y: Math.round(el.startY),
          color: el.color,
        };
      }
      if (el.type === "rectangle") {
        return {
          id: el.id,
          type: el.type,
          x: Math.round(el.x),
          y: Math.round(el.y),
          width: Math.round(el.width),
          height: Math.round(el.height),
          title: el.title,
          text: el.text,
          color: el.color,
        };
      }
      if (el.type === "circle") {
        return {
          id: el.id,
          type: el.type,
          x: Math.round(el.x),
          y: Math.round(el.y),
          width: Math.round(el.width),
          height: Math.round(el.height),
          text: el.text,
          color: el.color,
        };
      }
      return {
        id: el.id,
        type: el.type,
        x: Math.round(el.x),
        y: Math.round(el.y),
        text: el.text,
        color: el.color,
      };
    });

    onContextChange({
      elements: summaryElements,
      selected_element_id: selectedElementId,
      timestamp: Date.now(),
    });
  }, [elements, selectedElementId, onContextChange]);

  // Execute all queued AI Board Actions in order using collision-free auto-layout
  const processedActionIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!incomingActions || incomingActions.length === 0) return;

    const unconsumed = incomingActions.filter(
      (item) => !processedActionIdsRef.current.has(item.id)
    );
    if (unconsumed.length === 0) return;

    unconsumed.forEach((item) => processedActionIdsRef.current.add(item.id));

    let latestSelectedId: string | null = null;
    let latestHighlightedId: string | null = null;

    const canvasH = canvasRef.current?.height || containerRef.current?.clientHeight || 640;

    setElements((prev) => {
      let current = prev;
      for (const item of unconsumed) {
        const result = applyAIActionWithAutoLayout(current, item.payload);
        current = reflowAndPaginateBoard(result.next, canvasH);
        if (result.selectedId !== undefined) {
          latestSelectedId = result.selectedId;
        }
        if (result.highlightedId !== undefined) {
          latestHighlightedId = result.highlightedId;
        }
      }
      return current;
    });

    if (latestSelectedId !== null) {
      setSelectedElementId(latestSelectedId);
    }
    if (latestHighlightedId !== null) {
      setHighlightedElementId(latestHighlightedId);
      const timer = setTimeout(() => {
        setHighlightedElementId((curr) => (curr === latestHighlightedId ? null : curr));
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [incomingActions]);

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
      const isHighlighted = elem.id === highlightedElementId;

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
        }
        ctx.restore();
      } else if (elem.type === "rectangle") {
        ctx.save();
        drawStructuredRectCard(ctx, elem, isHighlighted);

        if (isSelected) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(elem.x - 4, elem.y - 4, elem.width + 8, elem.height + 8);

          ctx.setLineDash([]);
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(elem.x + elem.width - 4, elem.y + elem.height - 4, 8, 8);
        }
        ctx.restore();
      } else if (elem.type === "circle") {
        ctx.save();
        if (isHighlighted) {
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 22;
        }
        ctx.strokeStyle = isHighlighted ? "#facc15" : elem.color;
        ctx.lineWidth = isHighlighted ? 3.5 : 2.5;
        ctx.fillStyle = isHighlighted ? "rgba(16, 185, 129, 0.22)" : "rgba(15, 23, 42, 0.88)";
        ctx.beginPath();
        ctx.ellipse(
          elem.x + elem.width / 2,
          elem.y + elem.height / 2,
          Math.abs(elem.width / 2),
          Math.abs(elem.height / 2),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        if (elem.text) {
          drawWrappedShapeText(ctx, elem.text, elem.x, elem.y, elem.width, elem.height);
        }

        if (isSelected) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(elem.x - 4, elem.y - 4, elem.width + 8, elem.height + 8);

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

          if (isHighlighted) {
            ctx.shadowColor = "#facc15";
            ctx.shadowBlur = 20;
          }
          ctx.fillStyle = isHighlighted ? "rgba(249, 115, 22, 0.25)" : "rgba(15, 23, 42, 0.92)";
          ctx.strokeStyle = isHighlighted
            ? "#facc15"
            : isSelected
              ? "#38bdf8"
              : "rgba(100, 116, 139, 0.5)";
          ctx.lineWidth = isHighlighted ? 3 : isSelected ? 2 : 1.5;
          drawSafeRoundedRect(
            ctx,
            elem.x - 10,
            elem.y - elem.fontSize - 6,
            maxW + 20,
            totalH + 14,
            8
          );
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.fillStyle = elem.color || "#ffffff";
          ctx.textBaseline = "alphabetic";
          lines.forEach((line, idx) => {
            ctx.fillText(line, elem.x, elem.y + idx * lineHeight);
          });

          if (isSelected) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(
              elem.x - 14,
              elem.y - elem.fontSize - 10,
              maxW + 28,
              totalH + 22
            );
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

    // 3. Draw live shape preview (Rectangle, Circle, or Arrow)
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
      } else if (activeTool === "circle") {
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        ctx.beginPath();
        ctx.ellipse(
          shapePreviewRef.current.x + shapePreviewRef.current.w / 2,
          shapePreviewRef.current.y + shapePreviewRef.current.h / 2,
          Math.abs(shapePreviewRef.current.w / 2),
          Math.abs(shapePreviewRef.current.h / 2),
          0,
          0,
          Math.PI * 2
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
  }, [elements, selectedElementId, highlightedElementId, editingId, activeTool, activeColor]);

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
        if (
          x >= elem.minX - pad &&
          x <= elem.maxX + pad &&
          y >= elem.minY - pad &&
          y <= elem.maxY + pad
        ) {
          for (const p of elem.points) {
            if (Math.hypot(p.x - x, p.y - y) <= 14) return elem;
          }
        }
      } else if (elem.type === "rectangle" || elem.type === "circle") {
        if (
          x >= elem.x - 4 &&
          x <= elem.x + elem.width + 4 &&
          y >= elem.y - 4 &&
          y <= elem.y + elem.height + 4
        ) {
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
        if (
          x >= elem.x - 12 &&
          x <= elem.x + textLen + 12 &&
          y >= elem.y - elem.fontSize - 8 &&
          y <= elem.y + 10
        ) {
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

    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isPointerDownRef.current = true;
    pointerStartRef.current = { x, y };

    // 1. SELECT TOOL
    if (activeTool === "select") {
      if (selectedElementId) {
        const selected = elements.find((el) => el.id === selectedElementId);
        if (selected && (selected.type === "rectangle" || selected.type === "circle")) {
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

    // 3. RECTANGLE, CIRCLE, OR ARROW TOOL
    if (activeTool === "rectangle" || activeTool === "circle" || activeTool === "arrow") {
      shapePreviewRef.current = { x, y, w: 0, h: 0 };
      drawCanvas();
      return;
    }

    // 4. TEXT TOOL
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

    // 1. Resizing selected shape
    if (isResizingBoxRef.current && dragStartRef.current && selectedElementId) {
      const dx = x - dragStartRef.current.mouseX;
      const dy = y - dragStartRef.current.mouseY;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedElementId || (el.type !== "rectangle" && el.type !== "circle"))
            return el;
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

    // 4. Creating Rectangle / Circle / Arrow live preview
    if (
      pointerStartRef.current &&
      (activeTool === "rectangle" || activeTool === "circle" || activeTool === "arrow")
    ) {
      const start = pointerStartRef.current;
      const w = x - start.x;
      const h = y - start.y;

      if (activeTool === "rectangle" || activeTool === "circle") {
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

    if (isResizingBoxRef.current) {
      isResizingBoxRef.current = false;
      dragStartRef.current = null;
      return;
    }

    if (isDraggingElementRef.current) {
      isDraggingElementRef.current = false;
      dragStartRef.current = null;
      return;
    }

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

    if (pointerStartRef.current) {
      const preview = shapePreviewRef.current;
      const start = pointerStartRef.current;

      if (activeTool === "rectangle") {
        if (preview && (preview.w >= 15 || preview.h >= 15)) {
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
      } else if (activeTool === "circle") {
        if (preview && (preview.w >= 15 || preview.h >= 15)) {
          const newCircle: BoardCircle = {
            id: `circle-${Date.now()}`,
            type: "circle",
            x: preview.x,
            y: preview.y,
            width: Math.max(40, preview.w),
            height: Math.max(40, preview.h),
            color: activeColor,
          };
          setElements((prev) => [...prev, newCircle]);
          setSelectedElementId(newCircle.id);
        } else {
          const newCircle: BoardCircle = {
            id: `circle-${Date.now()}`,
            type: "circle",
            x: Math.max(10, start.x - 85),
            y: Math.max(10, start.y - 45),
            width: 170,
            height: 90,
            color: activeColor,
          };
          setElements((prev) => [...prev, newCircle]);
          setSelectedElementId(newCircle.id);
        }
      } else if (activeTool === "arrow") {
        if (preview && (Math.abs(preview.w) >= 15 || Math.abs(preview.h) >= 15)) {
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

  // Double-click on canvas to edit text, box, or circle note directly
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
        const combined =
          hit.title && hit.text && hit.title !== hit.text
            ? `${hit.title}: ${hit.text}`
            : hit.text || hit.title || "";
        setEditingText({
          id: hit.id,
          x: hit.x + 12,
          y: hit.y + 24,
          text: combined,
          isNew: false,
        });
      } else if (hit.type === "circle") {
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
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== editingText.id) return el;
          if (el.type === "text") {
            return { ...el, text: trimmed || "Note" };
          }
          if (el.type === "rectangle") {
            if (trimmed.includes(":")) {
              const [newTitle, ...rest] = trimmed.split(":");
              return { ...el, title: newTitle.trim(), text: rest.join(":").trim() };
            }
            return { ...el, title: trimmed, text: "" };
          }
          if (el.type === "circle") {
            return { ...el, text: trimmed };
          }
          return el;
        })
      );
    }

    setEditingText(null);
  };

  const cancelTextEdit = () => {
    setEditingText(null);
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
    setHighlightedElementId(null);
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
          onClick={() => setActiveTool("select")}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${activeTool === "select" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
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
          className={`p-2 rounded-lg transition-colors cursor-pointer ${activeTool === "pen" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
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
          className={`p-2 rounded-lg transition-colors cursor-pointer ${activeTool === "rectangle" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          title="Box / Rectangle Tool (Click on board or drag to size)"
        >
          <Square className="size-4" />
        </button>

        {/* 4. Circle / Node Tool */}
        <button
          onClick={() => {
            setActiveTool("circle");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${activeTool === "circle" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          title="Circle / Diagram Node Tool (Click or drag to size)"
        >
          <Circle className="size-4" />
        </button>

        {/* 5. Arrow Tool */}
        <button
          onClick={() => {
            setActiveTool("arrow");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${activeTool === "arrow" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          title="Draw Arrow (Click or drag to create arrow)"
        >
          <ArrowUpRight className="size-4" />
        </button>

        {/* 6. Text Tool */}
        <button
          onClick={() => {
            setActiveTool("text");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${activeTool === "text" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          title="Text Note Tool (Click on canvas to add note)"
        >
          <Type className="size-4" />
        </button>

        {/* 7. Eraser Tool */}
        <button
          onClick={() => {
            setActiveTool("eraser");
            setSelectedElementId(null);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${activeTool === "eraser" ? "bg-orange-500 text-white" : "text-slate-400 hover:text-white"
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
              className={`size-3.5 rounded-full transition-transform cursor-pointer ${activeColor === color ? "scale-125 ring-2 ring-white" : "opacity-75"
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

      {/* Main Clean & Empty Workspace Stage */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          className={`absolute inset-0 z-20 w-full h-full touch-none ${activeTool === "select"
              ? "cursor-default pointer-events-auto"
              : activeTool === "text"
                ? "cursor-text pointer-events-auto"
                : "cursor-crosshair pointer-events-auto"
            }`}
        />

        {/* Dedicated Floating Text Note Editor */}
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

function elemIsArrow(elem: BoardElement): elem is BoardArrow {
  return elem.type === "arrow";
}
