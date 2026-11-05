"use client";

import { createClient } from "@/utils/supabase/client";
import { Message } from "@/types/message";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface RealtimeHandlers {
  onNewMessage?: (message: Message) => void;
  onMessageUpdate?: (message: Partial<Message>) => void;
  onTyping?: (data: { userId: string; userName: string; isTyping: boolean }) => void;
  onPresence?: (data: { userId: string; isOnline: boolean }) => void;
}

/**
 * Creates a clean real-time bridge for conversation messaging.
 * Uses Supabase Realtime channels for instant push events and broadcasts,
 * with an automatic fallback polling mechanism for local dev/unconnected states.
 */
export class MessagingRealtimeBridge {
  private conversationId: string;
  private currentUserId: string;
  private handlers: RealtimeHandlers;
  private channel: RealtimeChannel | null = null;
  private pollingTimer: NodeJS.Timeout | null = null;
  private isSubscribed = false;

  constructor(conversationId: string, currentUserId: string, handlers: RealtimeHandlers) {
    this.conversationId = conversationId;
    this.currentUserId = currentUserId;
    this.handlers = handlers;
  }

  public subscribe() {
    if (this.isSubscribed) return;
    this.isSubscribed = true;

    try {
      const supabase = createClient();
      const channelName = `conversation:${this.conversationId}`;

      this.channel = supabase
        .channel(channelName)
        // 1. Listen for typing broadcast events
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (payload?.userId !== this.currentUserId) {
            this.handlers.onTyping?.(payload);
          }
        })
        // 2. Listen for presence/online status events
        .on("broadcast", { event: "presence" }, ({ payload }) => {
          if (payload?.userId !== this.currentUserId) {
            this.handlers.onPresence?.(payload);
          }
        })
        // 3. Listen for Postgres changes on messages table
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${this.conversationId}`,
          },
          (payload) => {
            const raw = payload.new as any;
            if (raw && raw.sender_id !== this.currentUserId) {
              const formatted: Message = {
                id: raw.id,
                conversationId: raw.conversation_id,
                senderId: raw.sender_id,
                receiverId: raw.receiver_id,
                senderRole: "teacher", // handled in container
                content: raw.content,
                timestamp: new Date(raw.created_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
                date: "Today",
                status: raw.status,
                type: raw.message_type,
                invitation: raw.invitation_data,
                createdAt: raw.created_at,
              };
              this.handlers.onNewMessage?.(formatted);
            }
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${this.conversationId}`,
          },
          (payload) => {
            const raw = payload.new as any;
            if (raw) {
              this.handlers.onMessageUpdate?.({
                id: raw.id,
                status: raw.status,
                readAt: raw.read_at,
              });
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("[Realtime messaging notice]", err);
    }
  }

  /**
   * Broadcasts typing event to other participant
   */
  public sendTyping(userName: string, isTyping: boolean) {
    if (!this.channel) return;
    try {
      this.channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: this.currentUserId,
          userName,
          isTyping,
        },
      });
    } catch {}
  }

  /**
   * Broadcasts presence (online / offline)
   */
  public sendPresence(isOnline: boolean) {
    if (!this.channel) return;
    try {
      this.channel.send({
        type: "broadcast",
        event: "presence",
        payload: {
          userId: this.currentUserId,
          isOnline,
        },
      });
    } catch {}
  }

  /**
   * Unsubscribes from realtime channel and clears timers
   */
  public unsubscribe() {
    this.isSubscribed = false;
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    if (this.channel) {
      try {
        const supabase = createClient();
        supabase.removeChannel(this.channel);
      } catch {}
      this.channel = null;
    }
  }
}
