export type WhiteboardTool = "select" | "pen" | "highlighter" | "laser" | "eraser";

export type BoardTheme = "dark" | "light";

export type ClassroomTab = "whiteboard" | "notes" | "practice";

export interface TeachingStep {
  id: number;
  stepNumber: number;
  title: string;
  subtitle: string;
  explanation: string;
  formula: string;
  formulaBreakdown?: {
    symbol: string;
    meaning: string;
  }[];
  keyTakeaway: string;
  diagramType: "tangent-graph" | "limit-definition" | "power-rule" | "practice-problem";
  bulletPoints: string[];
  aiSpeechTranscript: string;
}

export interface ChatMessage {
  id: string;
  sender: "student" | "ai" | "system";
  senderName: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface StudentMediaState {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  audioLevel: number;
}

