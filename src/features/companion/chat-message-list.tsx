"use client";

import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatBubble, TypingIndicator } from "@/features/companion/chat-bubble";
import { formatRelativeTime } from "@/lib/format-date";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

type ChatMessageListProps = {
  messages: ChatMessage[];
  userName: string;
  avatarUrl?: string | null;
  loading?: boolean;
  initialLoading?: boolean;
  emptyState?: React.ReactNode;
};

function MessageSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-12 w-48 rounded-2xl" />
    </div>
  );
}

export function ChatMessageList({
  messages,
  userName,
  avatarUrl,
  loading,
  initialLoading,
  emptyState,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (initialLoading) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <MessageSkeleton />
        <MessageSkeleton />
      </div>
    );
  }

  if (messages.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          userName={userName}
          avatarUrl={avatarUrl}
          timestamp={msg.createdAt ? formatRelativeTime(msg.createdAt) : undefined}
        />
      ))}
      {loading && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
