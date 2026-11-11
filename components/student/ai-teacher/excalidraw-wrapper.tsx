"use client";

import React from "react";
import { CanvasBoard } from "./canvas-board";

/**
 * Safe fallback wrapper that renders the built-in Excalidraw-style
 * board without failing on missing node_modules imports.
 */
export default function ExcalidrawWrapper(props: any) {
  return <CanvasBoard {...props} />;
}
