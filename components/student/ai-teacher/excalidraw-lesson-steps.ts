export interface AiDrawingBeat {
  id: string;
  title: string;
  speech: string;
  cursorTarget: { x: number; y: number };
  elements: any[];
}

/**
 * Helper to generate Excalidraw skeleton elements for a single table row
 * so the AI can draw a table header and then populate rows in sync with speech.
 */
export function buildTableRowElements({
  rowIndex,
  cells,
  startX,
  startY,
  colWidths,
  rowHeight = 52,
  isHeader = false,
  idPrefix = "tbl",
}: {
  rowIndex: number;
  cells: string[];
  startX: number;
  startY: number;
  colWidths: number[];
  rowHeight?: number;
  isHeader?: boolean;
  idPrefix?: string;
}) {
  const y = startY + rowIndex * rowHeight;
  let currentX = startX;

  return cells.map((cellText, colIndex) => {
    const width = colWidths[colIndex] || 150;
    const x = currentX;
    currentX += width;

    return {
      type: "rectangle",
      id: `${idPrefix}-r${rowIndex}-c${colIndex}`,
      x,
      y,
      width,
      height: rowHeight,
      strokeColor: isHeader ? "#f97316" : "#475569",
      backgroundColor: isHeader
        ? "#431407"
        : rowIndex % 2 === 1
        ? "#1e293b"
        : "#0f172a",
      fillStyle: "solid",
      strokeWidth: isHeader ? 2 : 1,
      roughness: 0,
      label: {
        text: cellText,
        fontSize: isHeader ? 16 : 15,
        strokeColor: isHeader ? "#fdba74" : "#f8fafc",
        fontFamily: 1,
      },
    };
  });
}

const TABLE_START_X = 60;
const TABLE_START_Y = 140;
const COL_WIDTHS = [110, 160, 170, 210];
const ROW_HEIGHT = 54;

/**
 * Default synchronized AI lesson timeline:
 * Each beat contains the exact voice transcript and the Excalidraw elements
 * drawn simultaneously while the AI speaks that sentence.
 */
export const AI_LESSON_TIMELINE: AiDrawingBeat[] = [
  {
    id: "beat-1",
    title: "Topic Introduction",
    speech:
      "Welcome to ZuhDemy AI Classroom! Today we will analyze derivatives and instantaneous slopes using a structured function table on our Excalidraw board.",
    cursorTarget: { x: 260, y: 70 },
    elements: [
      {
        type: "rectangle",
        id: "lesson-title-box",
        x: 60,
        y: 40,
        width: 650,
        height: 70,
        strokeColor: "#f97316",
        backgroundColor: "#1e293b",
        fillStyle: "solid",
        strokeWidth: 2,
        roughness: 0,
        roundness: { type: 3 },
        label: {
          text: "Calculus I: Function & Derivative Analysis Table — f(x) = x²",
          fontSize: 20,
          strokeColor: "#ffffff",
        },
      },
    ],
  },
  {
    id: "beat-2",
    title: "Create Table Headers",
    speech:
      "First, let's set up our table columns: the input x, the function value f of x equals x squared, the derivative f prime of x equals 2x, and the geometric behavior.",
    cursorTarget: { x: 350, y: TABLE_START_Y + 25 },
    elements: buildTableRowElements({
      rowIndex: 0,
      cells: ["Input (x)", "Function f(x) = x²", "Derivative f'(x) = 2x", "Curve Behavior"],
      startX: TABLE_START_X,
      startY: TABLE_START_Y,
      colWidths: COL_WIDTHS,
      rowHeight: ROW_HEIGHT,
      isHeader: true,
    }),
  },
  {
    id: "beat-3",
    title: "Row 1: Negative Slope (x = -2)",
    speech:
      "At x equals negative 2, f of x is 4, and the derivative is 2 times negative 2, which equals negative 4. Because the slope is negative, the curve is decreasing.",
    cursorTarget: { x: 400, y: TABLE_START_Y + ROW_HEIGHT * 1.5 },
    elements: buildTableRowElements({
      rowIndex: 1,
      cells: ["x = -2", "f(-2) = 4", "f'(-2) = -4", "↘ Decreasing (Steep)"],
      startX: TABLE_START_X,
      startY: TABLE_START_Y,
      colWidths: COL_WIDTHS,
      rowHeight: ROW_HEIGHT,
    }),
  },
  {
    id: "beat-4",
    title: "Row 2: Gentle Negative Slope (x = -1)",
    speech:
      "Next, at x equals negative 1, f of x is 1, and the derivative is negative 2. Notice how the downward slope becomes gentler as we approach zero.",
    cursorTarget: { x: 400, y: TABLE_START_Y + ROW_HEIGHT * 2.5 },
    elements: buildTableRowElements({
      rowIndex: 2,
      cells: ["x = -1", "f(-1) = 1", "f'(-1) = -2", "↘ Decreasing (Gentle)"],
      startX: TABLE_START_X,
      startY: TABLE_START_Y,
      colWidths: COL_WIDTHS,
      rowHeight: ROW_HEIGHT,
    }),
  },
  {
    id: "beat-5",
    title: "Row 3: Turning Point (x = 0)",
    speech:
      "At x equals 0, both the function and its derivative equal 0. This gives us a flat horizontal tangent line at the exact minimum vertex.",
    cursorTarget: { x: 400, y: TABLE_START_Y + ROW_HEIGHT * 3.5 },
    elements: buildTableRowElements({
      rowIndex: 3,
      cells: ["x = 0", "f(0) = 0", "f'(0) = 0", "━ Horizontal Minimum"],
      startX: TABLE_START_X,
      startY: TABLE_START_Y,
      colWidths: COL_WIDTHS,
      rowHeight: ROW_HEIGHT,
    }),
  },
  {
    id: "beat-6",
    title: "Row 4 & 5: Positive Slopes (x = 1, 2)",
    speech:
      "Finally, for positive inputs x equals 1 and x equals 2, the derivative becomes positive 2 and positive 4, meaning the curve climbs upward symmetrically.",
    cursorTarget: { x: 400, y: TABLE_START_Y + ROW_HEIGHT * 5 },
    elements: [
      ...buildTableRowElements({
        rowIndex: 4,
        cells: ["x = +1", "f(1) = 1", "f'(1) = +2", "↗ Increasing (Gentle)"],
        startX: TABLE_START_X,
        startY: TABLE_START_Y,
        colWidths: COL_WIDTHS,
        rowHeight: ROW_HEIGHT,
      }),
      ...buildTableRowElements({
        rowIndex: 5,
        cells: ["x = +2", "f(2) = 4", "f'(2) = +4", "↗ Increasing (Steep)"],
        startX: TABLE_START_X,
        startY: TABLE_START_Y,
        colWidths: COL_WIDTHS,
        rowHeight: ROW_HEIGHT,
      }),
    ],
  },
  {
    id: "beat-7",
    title: "Key Formula Summary Box",
    speech:
      "To summarize our table: whenever the derivative is negative, the function falls; when it is zero, we reach a turning point; and when positive, the function rises!",
    cursorTarget: { x: 860, y: 260 },
    elements: [
      {
        type: "arrow",
        id: "table-to-summary-arrow",
        x: 720,
        y: 280,
        width: 70,
        height: 0,
        points: [
          [0, 0],
          [70, 0],
        ],
        strokeColor: "#f97316",
        strokeWidth: 3,
        roughness: 0,
      },
      {
        type: "rectangle",
        id: "summary-rule-card",
        x: 800,
        y: 180,
        width: 280,
        height: 200,
        strokeColor: "#10b981",
        backgroundColor: "#064e3b",
        fillStyle: "solid",
        strokeWidth: 2,
        roughness: 0,
        roundness: { type: 3 },
        label: {
          text: "Core Derivative Rules\n\n• f'(x) < 0  ⇒  Decreasing\n• f'(x) = 0  ⇒  Stationary\n• f'(x) > 0  ⇒  Increasing\n\nPower Rule:\nd/dx [xⁿ] = n · xⁿ⁻¹",
          fontSize: 15,
          strokeColor: "#ecfdf5",
        },
      },
    ],
  },
];

/**
 * Generates an on-demand Excalidraw table or diagram when the student
 * asks a question in the chat drawer.
 */
export function createDynamicBoardBeatFromPrompt(prompt: string, indexOffset: number): AiDrawingBeat {
  const baseY = 500 + indexOffset * 220;

  return {
    id: `custom-beat-${Date.now()}`,
    title: "AI Custom Board Explanation",
    speech: `Let me draw a quick reference table on the board for your question: "${prompt}".`,
    cursorTarget: { x: 320, y: baseY + 60 },
    elements: [
      {
        type: "text",
        id: `custom-title-${Date.now()}`,
        x: 60,
        y: baseY - 35,
        text: `Q: ${prompt}`,
        fontSize: 18,
        strokeColor: "#f97316",
      },
      ...buildTableRowElements({
        rowIndex: 0,
        cells: ["Function f(x)", "Rule Applied", "Derivative f'(x)"],
        startX: 60,
        startY: baseY,
        colWidths: [200, 220, 230],
        rowHeight: 48,
        isHeader: true,
        idPrefix: `dyn-${Date.now()}-h`,
      }),
      ...buildTableRowElements({
        rowIndex: 1,
        cells: ["f(x) = c (Constant)", "Constant Rule", "f'(x) = 0"],
        startX: 60,
        startY: baseY,
        colWidths: [200, 220, 230],
        rowHeight: 48,
        idPrefix: `dyn-${Date.now()}-r1`,
      }),
      ...buildTableRowElements({
        rowIndex: 2,
        cells: ["f(x) = x³", "Power Rule (n=3)", "f'(x) = 3x²"],
        startX: 60,
        startY: baseY,
        colWidths: [200, 220, 230],
        rowHeight: 48,
        idPrefix: `dyn-${Date.now()}-r2`,
      }),
    ],
  };
}

