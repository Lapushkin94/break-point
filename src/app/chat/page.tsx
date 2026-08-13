"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function isMessageStreaming(message: UIMessage): boolean {
  return message.parts.some(
    (part) => part.type === "text" && part.state === "streaming",
  );
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, regenerate, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-10">
      <div className="flex items-center gap-3">
        <Button
          render={<Link href="/" aria-label="Back" />}
          nativeButton={false}
          variant="ghost"
          size="icon"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Ask your coach</h1>
      </div>

      <div className="flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ask anything about your training and match history — e.g. &ldquo;How
            is my second serve trending?&rdquo;
          </p>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "user" ? (
              <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                {getMessageText(message)}
              </div>
            ) : (
              <div className="max-w-[85%] rounded-2xl bg-card px-4 py-2 ring-1 ring-foreground/10">
                <Streamdown
                  mode={isMessageStreaming(message) ? "streaming" : "static"}
                  className="prose prose-sm max-w-none"
                >
                  {getMessageText(message)}
                </Streamdown>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-destructive">Something went wrong.</p>
          <Button variant="ghost" size="sm" onClick={() => regenerate()}>
            Retry
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={isBusy}
        />
        <Button type="submit" disabled={isBusy || !input.trim()}>
          Send
        </Button>
      </form>
    </main>
  );
}
