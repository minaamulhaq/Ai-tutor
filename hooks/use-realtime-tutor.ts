"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  AIBoardAction,
  CanvasContextSnapshot,
} from "@/components/student/ai-teacher/canvas-board";

export interface TranscriptMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isAi?: boolean;
}

interface SynchronizedClauseStep {
  text?: string;
  audioBase64?: string;
  boardActions?: AIBoardAction[];
  chunkIndex?: number;
}

interface UseRealtimeTutorOptions {
  wsUrl?: string;
  sessionId?: string;
  isMicEnabled: boolean;
}

const INITIAL_GREETING = "Hi! How are you, and what would you like to study today?";

export function useRealtimeTutor({
  wsUrl = process.env.NEXT_PUBLIC_TUTOR_WS_URL || "ws://localhost:8000/api/v1/ws/tutor",
  sessionId = "student-session-1",
  isMicEnabled,
}: UseRealtimeTutorOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [boardActionQueue, setBoardActionQueue] = useState<
    Array<{ id: string; payload: AIBoardAction }>
  >([]);
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: "welcome-1",
      sender: "AI Tutor",
      text: INITIAL_GREETING,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isAi: true,
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const canvasContextRef = useRef<CanvasContextSnapshot | null>(null);
  const hasGreetedRef = useRef(false);

  // Lockstep Voice + Canvas Clause Queue
  const stepQueueRef = useRef<SynchronizedClauseStep[]>([]);
  const isPlayingStepRef = useRef(false);
  const currentAudioElemRef = useRef<HTMLAudioElement | null>(null);

  // Helper to append AI text clause to transcript
  const appendAssistantClauseText = useCallback((text: string, chunkIndex?: number) => {
    if (!text.trim()) return;
    const nowTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.isAi && chunkIndex && chunkIndex > 0) {
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            text: `${last.text} ${text.trim()}`,
          },
        ];
      }
      return [
        ...prev,
        {
          id: `ai-${Date.now()}-${Math.random()}`,
          sender: "AI Tutor",
          text: text.trim(),
          time: nowTime,
          isAi: true,
        },
      ];
    });
  }, []);

  // Helper to dispatch board actions to CanvasBoard queue
  const dispatchBoardActions = useCallback((actions?: AIBoardAction[]) => {
    if (!actions || actions.length === 0) return;
    const stamped = actions.map((payload, idx) => ({
      id: `act-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      payload,
    }));
    setBoardActionQueue((prev) => [...prev, ...stamped]);
  }, []);

  // Flush DAC Audio & Step Queue immediately on Barge-In Preemption
  const flushAudioPlaybackQueue = useCallback(() => {
    stepQueueRef.current = [];
    if (currentAudioElemRef.current) {
      currentAudioElemRef.current.pause();
      currentAudioElemRef.current.src = "";
      currentAudioElemRef.current = null;
    }
    isPlayingStepRef.current = false;
    setIsAiSpeaking(false);
  }, []);

  // Play next synchronized (Voice + Canvas + Transcript) clause step
  const playNextStep = useCallback(() => {
    if (stepQueueRef.current.length === 0) {
      isPlayingStepRef.current = false;
      setIsAiSpeaking(false);
      return;
    }

    isPlayingStepRef.current = true;
    const nextStep = stepQueueRef.current.shift()!;

    // 0. Notify FastAPI backend that this clause is now actively playing & drawing on the student's screen
    if (
      typeof nextStep.chunkIndex === "number" &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: "clause_ack",
          chunk_index: nextStep.chunkIndex,
          text: nextStep.text || "",
        })
      );
    }

    // 1. Execute Canvas Board Actions AT THE EXACT MOMENT this clause begins speaking!
    if (nextStep.boardActions && nextStep.boardActions.length > 0) {
      dispatchBoardActions(nextStep.boardActions);
    }

    // 2. Append clause text to chat transcript
    if (nextStep.text) {
      appendAssistantClauseText(nextStep.text, nextStep.chunkIndex);
    }

    // 3. Play synthesized voice audio for this clause
    if (nextStep.audioBase64) {
      setIsAiSpeaking(true);
      const audio = new Audio(`data:audio/mp3;base64,${nextStep.audioBase64}`);
      currentAudioElemRef.current = audio;

      audio.onended = () => {
        playNextStep();
      };
      audio.onerror = () => {
        playNextStep();
      };
      audio.play().catch(() => {
        playNextStep();
      });
    } else {
      playNextStep();
    }
  }, [appendAssistantClauseText, dispatchBoardActions]);

  const enqueueClauseStep = useCallback(
    (step: SynchronizedClauseStep) => {
      stepQueueRef.current.push(step);
      if (!isPlayingStepRef.current) {
        playNextStep();
      }
    },
    [playNextStep]
  );

  // Connect WebSocket to FastAPI Realtime Gateway
  useEffect(() => {
    const endpoint = `${wsUrl}/${sessionId}`;
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      try {
        ws = new WebSocket(endpoint);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          if (canvasContextRef.current) {
            ws.send(
              JSON.stringify({
                type: "canvas_context",
                canvas_context: canvasContextRef.current,
              })
            );
          }
          if (!hasGreetedRef.current) {
            hasGreetedRef.current = true;
            ws.send(JSON.stringify({ type: "start_session" }));
          }
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            // 1. Preemption Flush Signal from Barge-In FSM
            if (msg.type === "preempt_flush") {
              flushAudioPlaybackQueue();
              return;
            }

            // 2. Unified Lockstep Clause Step (Audio + Canvas Board Actions + Text)
            if (msg.type === "clause_step") {
              enqueueClauseStep({
                text: msg.text,
                audioBase64: msg.audio_base64,
                boardActions: msg.board_actions,
                chunkIndex: msg.chunk_index,
              });
              return;
            }

            // 3. Standalone Board Action (fallback compatibility)
            if (msg.type === "board_action" && msg.board_action) {
              dispatchBoardActions([msg.board_action as AIBoardAction]);
              return;
            }

            // 4. Standalone Audio Chunk (fallback compatibility)
            if (msg.type === "audio_chunk" && msg.audio_base64) {
              enqueueClauseStep({
                audioBase64: msg.audio_base64,
                chunkIndex: msg.chunk_index,
              });
              return;
            }

            // 5. Live Interim User Transcript (while student is still speaking)
            if (msg.type === "interim_transcript" && msg.text) {
              const nowTime = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && !last.isAi && last.id.startsWith("interim-usr")) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, text: msg.text },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: `interim-usr-${Date.now()}`,
                    sender: "You",
                    text: msg.text,
                    time: nowTime,
                    isAi: false,
                  },
                ];
              });
              return;
            }

            // 6. User / Assistant Transcript Delta
            if (msg.type === "transcript_delta" && msg.text) {
              if (msg.role === "user") {
                const nowTime = new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && !last.isAi && last.id.startsWith("interim-usr")) {
                    return [
                      ...prev.slice(0, -1),
                      {
                        id: `usr-${Date.now()}-${Math.random()}`,
                        sender: "You",
                        text: msg.text,
                        time: nowTime,
                        isAi: false,
                      },
                    ];
                  }
                  return [
                    ...prev,
                    {
                      id: `usr-${Date.now()}-${Math.random()}`,
                      sender: "You",
                      text: msg.text,
                      time: nowTime,
                      isAi: false,
                    },
                  ];
                });
              } else {
                appendAssistantClauseText(msg.text, msg.chunk_index);
              }
            }
          } catch {
            // Ignore malformed packets
          }
        };

        ws.onclose = () => {
          if (disposed) return;
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          if (!disposed) ws.close();
        };
      } catch {
        if (!disposed) reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        // Avoid "closed before connection established" warning while still CONNECTING
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        } else if (ws.readyState === WebSocket.CONNECTING) {
          ws.onopen = () => ws.close();
        }
      }
    };
  }, [
    wsUrl,
    sessionId,
    enqueueClauseStep,
    dispatchBoardActions,
    appendAssistantClauseText,
    flushAudioPlaybackQueue,
  ]);

  // Update live canvas context and sync with FastAPI
  const updateCanvasContext = useCallback((ctx: CanvasContextSnapshot) => {
    canvasContextRef.current = ctx;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "canvas_context",
          canvas_context: ctx,
        })
      );
    }
  }, []);

  // Send direct text query + canvas context
  const sendTextQuery = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      flushAudioPlaybackQueue();

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "text_query",
            text: text.trim(),
            canvas_context: canvasContextRef.current,
          })
        );
      } else {
        const nowTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `u-${Date.now()}`,
            sender: "You",
            text: text.trim(),
            time: nowTime,
            isAi: false,
          },
          {
            id: `a-${Date.now() + 1}`,
            sender: "AI Tutor",
            text: "FastAPI backend is currently offline. Start `uv run dev` inside the backend folder to enable live voice & canvas streaming!",
            time: nowTime,
            isAi: true,
          },
        ]);
      }
    },
    [flushAudioPlaybackQueue]
  );

  // Accurate Voice Capture & Endpointing (Time-Domain RMS VAD + Deepgram ASR)
  useEffect(() => {
    if (!isMicEnabled) return;

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let activeRecorder: MediaRecorder | null = null;
    let vadInterval: ReturnType<typeof setInterval>;
    let isDisposed = false;

    const startAcousticPipeline = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 16000,
          },
        });

        if (isDisposed) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

        let isSpeaking = false;
        let speechStartTime = 0;
        let silenceStartTime = 0;
        let consecutiveSpeechFrames = 0;
        let recordedChunks: Blob[] = [];

        const createAndStartRecorder = () => {
          if (!stream || isDisposed) return null;
          recordedChunks = [];
          const rec = new MediaRecorder(stream, { mimeType });

          // Notify backend immediately that live speech streaming has started
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: "audio_stream_start",
                mime_type: mimeType,
                canvas_context: canvasContextRef.current,
              })
            );
          }

          rec.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunks.push(e.data);
              // Stream each 200ms audio slice immediately to backend while user is speaking
              const chunkReader = new FileReader();
              chunkReader.onloadend = () => {
                const chunkB64 = (chunkReader.result as string)?.split(",")[1];
                if (
                  chunkB64 &&
                  wsRef.current &&
                  wsRef.current.readyState === WebSocket.OPEN
                ) {
                  wsRef.current.send(
                    JSON.stringify({
                      type: "audio_stream_chunk",
                      audio_base64: chunkB64,
                      mime_type: mimeType,
                    })
                  );
                }
              };
              chunkReader.readAsDataURL(e.data);
            }
          };

          rec.onstop = () => {
            if (isDisposed) return;
            const totalDuration = Date.now() - speechStartTime;
            if (recordedChunks.length > 0 && totalDuration >= 300) {
              // Wait 80ms so the final ondataavailable FileReader chunk finishes sending BEFORE audio_stream_stop!
              setTimeout(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(
                    JSON.stringify({
                      type: "audio_stream_stop",
                      mime_type: mimeType,
                      canvas_context: canvasContextRef.current,
                    })
                  );
                }
              }, 80);
            }
            recordedChunks = [];
          };
          rec.start(200);
          return rec;
        };

        const floatTimeData = new Float32Array(analyser.fftSize);

        // Frame-Synchronous 30ms Time-Domain RMS VAD Loop
        vadInterval = setInterval(() => {
          if (isDisposed) return;
          analyser.getFloatTimeDomainData(floatTimeData);

          let sumSquares = 0;
          for (let i = 0; i < floatTimeData.length; i++) {
            sumSquares += floatTimeData[i] * floatTimeData[i];
          }
          const rms = Math.sqrt(sumSquares / floatTimeData.length);

          // Higher threshold while AI is speaking to prevent speaker bleed self-interruption
          const threshold = isPlayingStepRef.current ? 0.085 : 0.032;
          const requiredFrames = isPlayingStepRef.current ? 8 : 4;

          if (rms > threshold) {
            consecutiveSpeechFrames += 1;
            silenceStartTime = 0;

            if (!isSpeaking && consecutiveSpeechFrames >= requiredFrames) {
              isSpeaking = true;
              speechStartTime = Date.now();

              if (isPlayingStepRef.current) {
                flushAudioPlaybackQueue();
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: "barge_in_interrupt" }));
                }
              }

              activeRecorder = createAndStartRecorder();
            }
          } else {
            consecutiveSpeechFrames = 0;
            if (isSpeaking) {
              if (silenceStartTime === 0) {
                silenceStartTime = Date.now();
              } else if (Date.now() - silenceStartTime > 480) {
                isSpeaking = false;
                silenceStartTime = 0;
                if (activeRecorder && activeRecorder.state === "recording") {
                  activeRecorder.stop();
                  activeRecorder = null;
                }
              }
            }
          }
        }, 30);
      } catch {
        // Mic permission denied or unavailable
      }
    };

    startAcousticPipeline();

    return () => {
      isDisposed = true;
      clearInterval(vadInterval);
      if (activeRecorder && activeRecorder.state !== "inactive") {
        try {
          activeRecorder.stop();
        } catch {
          // ignore
        }
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [isMicEnabled, flushAudioPlaybackQueue]);

  return {
    isConnected,
    isAiSpeaking,
    boardActionQueue,
    messages,
    updateCanvasContext,
    sendTextQuery,
    flushAudioPlaybackQueue,
  };
}
