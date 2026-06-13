"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChatMessageList,
  type ChatMessage,
} from "@/features/companion/chat-message-list";
import { useLanguage } from "@/lib/i18n/language-context";
import type { SessionUser } from "@/lib/auth/types";

const DEFAULT_CHIPS = [
  "I'm anxious about tomorrow's mock test",
  "Help me unwind after a long study day",
  "I feel behind compared to my friends",
];

type CompanionChatProps = {
  user: SessionUser & { name: string; examType: string };
};

export function CompanionChat({ user }: CompanionChatProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [promptChips, setPromptChips] = useState<string[]>(DEFAULT_CHIPS);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/companion");
        if (response.ok) {
          const data = (await response.json()) as {
            messages: Array<ChatMessage & { createdAt?: string }>;
            promptChips?: string[];
          };
          setMessages(data.messages);
          if (data.promptChips?.length) {
            setPromptChips(data.promptChips);
          }
        }
      } finally {
        setInitialLoading(false);
      }
    }
    void loadHistory();
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setNetworkError(false);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: userMessage },
    ]);
    setLoading(true);

    try {
      const response = await fetch("/api/companion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error("Failed");

      const data = (await response.json()) as { id: string; message: string };
      setMessages((prev) => [
        ...prev,
        { id: data.id, role: "assistant", content: data.message },
      ]);
    } catch {
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  }

  const emptyState = (
    <div className="rounded-lg border border-dashed p-6 text-center space-y-4">
      <p className="text-sm text-muted-foreground">
        Hi {user.name}! {t("companion.empty")}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {promptChips.map((chip) => (
          <Button
            key={chip}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setInput(chip)}
          >
            {chip}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-2 py-4">
      <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-xl border bg-card shadow-lg min-h-[70vh] max-h-[85vh]">
        <div className="shrink-0 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
            <div>
              <h1 className="text-base font-semibold">{t("companion.title")}</h1>
              <p className="text-xs text-muted-foreground">
                {t("companion.subtitle")} {user.examType} journey
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
          {networkError && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between gap-2">
                <span>Could not send message. Please try again.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNetworkError(false)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
            <ChatMessageList
              messages={messages}
              userName={user.name}
              loading={loading}
              initialLoading={initialLoading}
              emptyState={emptyState}
            />
          </div>

          <form onSubmit={handleSend} className="flex shrink-0 gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("companion.placeholder")}
              className="min-h-[60px] flex-1 resize-none"
              maxLength={2000}
              aria-label="Message to MindMate"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="shrink-0 self-end"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
