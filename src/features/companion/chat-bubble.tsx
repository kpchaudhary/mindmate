"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/user-avatar";
import { MarkdownLite } from "@/lib/markdown-lite";
import { cn } from "@/lib/utils";

type ChatBubbleProps = {
  role: "user" | "assistant";
  content: string;
  userName: string;
  avatarUrl?: string | null;
  timestamp?: string;
};

export function ChatBubble({ role, content, userName, avatarUrl, timestamp }: ChatBubbleProps) {
  const isUser = role === "user";
  const reducedMotion = useReducedMotion();

  const speakerLabel = isUser ? `You said: ${content}` : `MindMate said: ${content}`;

  const bubble = (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-4 py-2.5",
        isUser
          ? "rounded-br-md bg-primary text-primary-foreground"
          : "rounded-bl-md bg-accent text-accent-foreground"
      )}
      aria-label={speakerLabel}
    >
      {isUser ? (
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      ) : (
        <MarkdownLite content={content} />
      )}
      {timestamp && (
        <p
          className={cn(
            "mt-1 text-[10px] opacity-70",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {timestamp}
        </p>
      )}
    </div>
  );

  const wrapped = reducedMotion ? (
    bubble
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {bubble}
    </motion.div>
  );

  return (
    <div className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
      {isUser ? (
        <UserAvatar name={userName} avatarUrl={avatarUrl} className="h-8 w-8 shrink-0" />
      ) : (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-gradient-purple text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      )}
      {wrapped}
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-gradient-purple text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <div
        className="rounded-2xl rounded-bl-md bg-accent px-4 py-3"
        role="status"
        aria-live="polite"
        aria-label="MindMate is thinking"
      >
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
