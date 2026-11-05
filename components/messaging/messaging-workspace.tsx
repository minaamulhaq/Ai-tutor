"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Conversation, Message, ConversationFilter } from "@/types/message";
import {
  getConversationsAction,
  getOrCreateConversationAction,
  getMessagesAction,
  sendMessageAction,
  markConversationAsReadAction,
  togglePinConversationAction,
  toggleMuteConversationAction,
  toggleArchiveConversationAction,
} from "@/app/actions/messageActions";
import { MessagingRealtimeBridge } from "@/lib/realtime/messagingRealtime";
import { ConversationSidebar } from "./conversation-sidebar";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatComposer } from "./chat-composer";
import { UserInfoSidebar } from "./user-info-sidebar";
import { NewConversationDialog } from "./new-conversation-dialog";
import { Card } from "@/components/ui/card";
import { MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessagingWorkspaceProps {
  currentRole: "student" | "teacher";
  initialPartnerId?: string | null;
}

export function MessagingWorkspace({
  currentRole,
  initialPartnerId,
}: MessagingWorkspaceProps) {
  // 1. Primary States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Loading States
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState<ConversationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // UI Panels State
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  // Real-time Partner States
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeBridgeRef = useRef<MessagingRealtimeBridge | null>(null);

  // 2. Load conversations
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const res = await getConversationsAction(activeFilter, searchQuery);
      if (res.success && res.data) {
        setConversations(res.data);

        // Handle initialPartnerId query parameter if provided
        if (initialPartnerId) {
          const matched = res.data.find(
            (c) => c.participant.id === initialPartnerId || c.teacherId === initialPartnerId
          );
          if (matched) {
            setSelectedId(matched.id);
            setIsMobileListVisible(false);
          } else {
            // Create fresh conversation with this partner
            getOrCreateConversationAction(initialPartnerId).then((newRes) => {
              if (newRes.success && newRes.conversation) {
                setConversations((prev) => [newRes.conversation!, ...prev]);
                setSelectedId(newRes.conversation.id);
                setIsMobileListVisible(false);
              }
            });
          }
        } else {
          // Select first if nothing selected
          setSelectedId((prev) => prev || (res.data.length > 0 ? res.data[0].id : null));
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [activeFilter, searchQuery, initialPartnerId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Selected conversation object
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || null;
  }, [conversations, selectedId]);

  // 3. Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    let isCurrent = true;
    setIsLoadingMessages(true);

    getMessagesAction(selectedId)
      .then((res) => {
        if (!isCurrent) return;
        if (res.success) {
          setMessages(res.data);
          // Detect current user ID from messages or conversation
          if (res.data.length > 0) {
            const firstMsg = res.data[0];
            const active = conversations.find((c) => c.id === selectedId);
            if (active) {
              const myId = firstMsg.senderRole === currentRole ? firstMsg.senderId : (firstMsg.receiverId || "");
              if (myId) setCurrentUserId(myId);
            }
          }

          // Mark as read
          markConversationAsReadAction(selectedId);
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, unreadCount: 0 } : c))
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoadingMessages(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedId, currentRole]);

  // 4. Setup Real-time listener for the active conversation
  useEffect(() => {
    if (!selectedId) return;

    if (realtimeBridgeRef.current) {
      realtimeBridgeRef.current.unsubscribe();
    }

    const bridge = new MessagingRealtimeBridge(selectedId, currentUserId, {
      onNewMessage: (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // Update conversation preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? {
                  ...c,
                  lastMessage: {
                    content: newMsg.content,
                    timestamp: newMsg.timestamp,
                    senderRole: newMsg.senderRole,
                    isRead: true,
                  },
                }
              : c
          )
        );

        // Auto mark as read since conversation is open
        markConversationAsReadAction(selectedId);
      },

      onMessageUpdate: (updated) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
        );
      },

      onTyping: (data) => {
        setIsPartnerTyping(Boolean(data.isTyping));
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        if (data.isTyping) {
          typingTimerRef.current = setTimeout(() => {
            setIsPartnerTyping(false);
          }, 3500);
        }
      },
    });

    bridge.subscribe();
    realtimeBridgeRef.current = bridge;

    return () => {
      bridge.unsubscribe();
    };
  }, [selectedId, currentUserId]);

  // 5. Action Handlers
  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
    setIsMobileListVisible(false);
    setIsPartnerTyping(false);
  };

  const handleSendMessage = async (
    content: string,
    attachments?: Array<{
      name: string;
      url: string;
      fileType: "image" | "pdf" | "doc" | "zip" | "other";
      sizeBytes: number;
    }>
  ): Promise<boolean> => {
    if (!selectedId) return false;

    // Optimistic message preview
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversationId: selectedId,
      senderId: currentUserId || "me",
      senderRole: currentRole,
      content,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      date: "Today",
      status: "sending",
      type: attachments?.length ? "file" : "text",
      attachments: attachments?.map((att, i) => ({
        id: (att as any).id || `opt_att_${Date.now()}_${i}`,
        ...att,
      })),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Send to server
    const res = await sendMessageAction({
      conversationId: selectedId,
      content,
      attachments,
    });

    if (res.success && res.message) {
      // Replace optimistic message with confirmed server message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? res.message! : m))
      );

      // Update sidebar preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                lastMessage: {
                  content: res.message!.content,
                  timestamp: res.message!.timestamp,
                  senderRole: currentRole,
                  isRead: true,
                },
              }
            : c
        )
      );

      return true;
    } else {
      // Rollback optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return false;
    }
  };

  const handleTypingNotice = (isTyping: boolean) => {
    if (realtimeBridgeRef.current) {
      realtimeBridgeRef.current.sendTyping("User", isTyping);
    }
  };

  const handleTogglePin = async () => {
    if (!activeConversation) return;
    const nextPin = !activeConversation.isPinned;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, isPinned: nextPin } : c))
    );
    await togglePinConversationAction(activeConversation.id, nextPin);
  };

  const handleToggleMute = async () => {
    if (!activeConversation) return;
    const nextMute = !activeConversation.isMuted;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, isMuted: nextMute } : c))
    );
    await toggleMuteConversationAction(activeConversation.id, nextMute);
  };

  const handleToggleArchive = async () => {
    if (!activeConversation) return;
    const nextArchive = !activeConversation.isArchived;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, isArchived: nextArchive } : c))
    );
    await toggleArchiveConversationAction(activeConversation.id, nextArchive);
  };

  const handleStartNewConversation = async (user: { id: string }) => {
    const res = await getOrCreateConversationAction(user.id);
    if (res.success && res.conversation) {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== res.conversation!.id);
        return [res.conversation!, ...filtered];
      });
      setSelectedId(res.conversation.id);
      setIsMobileListVisible(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-6.5rem)] min-h-[550px] rounded-2xl border-slate-200/90 shadow-sm overflow-hidden flex flex-row bg-white relative">
      {/* COLUMN 1: Conversation List */}
      <div
        className={cn(
          "w-full lg:w-80 xl:w-88 h-full shrink-0",
          !isMobileListVisible ? "hidden lg:flex" : "flex"
        )}
      >
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedId}
          onSelectConversation={handleSelectConversation}
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewMessageModal={() => setIsNewMessageModalOpen(true)}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* COLUMN 2: Chat Window Area */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full min-w-0 bg-white",
          isMobileListVisible ? "hidden lg:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <>
            {/* Header */}
            <ChatHeader
              conversation={activeConversation}
              isInfoSidebarOpen={isInfoSidebarOpen}
              onToggleInfoSidebar={() => setIsInfoSidebarOpen((prev) => !prev)}
              onBackToList={() => setIsMobileListVisible(true)}
              onTogglePin={handleTogglePin}
              onToggleMute={handleToggleMute}
              onToggleArchive={handleToggleArchive}
              isPartnerTyping={isPartnerTyping}
            />

            {/* Messages Scroll Area */}
            <ChatMessages
              conversation={activeConversation}
              messages={messages}
              currentUserId={currentUserId}
              isPartnerTyping={isPartnerTyping}
              isLoading={isLoadingMessages}
            />

            {/* Composer */}
            <ChatComposer
              conversationId={activeConversation.id}
              onSendMessage={handleSendMessage}
              onTypingNotice={handleTypingNotice}
              disabled={isLoadingMessages}
            />
          </>
        ) : (
          /* Empty Chat Area when no conversation is selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 space-y-4">
            <div className="size-16 rounded-3xl bg-orange-100/70 text-orange-600 flex items-center justify-center shadow-xs border border-orange-200">
              <MessageSquare className="size-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-slate-900">
                Welcome to ZuhDemy Messaging
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select a conversation from the sidebar or click{" "}
                <strong className="text-orange-600 font-semibold">New Chat</strong> to connect with an
                instructor or student.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* COLUMN 3: User Information Sidebar */}
      {activeConversation && isInfoSidebarOpen && (
        <UserInfoSidebar
          conversation={activeConversation}
          messages={messages}
          isOpen={isInfoSidebarOpen}
          onClose={() => setIsInfoSidebarOpen(false)}
        />
      )}

      {/* New Conversation Modal Dialog */}
      <NewConversationDialog
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onSelectUser={handleStartNewConversation}
      />
    </Card>
  );
}
