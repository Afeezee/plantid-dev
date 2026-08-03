"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const conversationId = useRef<string | undefined>(undefined);

  async function send() {
    if (!input.trim() || sending) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversationId.current, message: userMessage.content }),
    });
    conversationId.current = res.headers.get("X-Conversation-Id") ?? conversationId.current;

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (reader) {
      let full = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = { role: "assistant", content: full };
          return next;
        });
      }
    }
    setSending(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      <h1 className="text-2xl mb-6">AI Assistant</h1>
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4">
        {messages.length === 0 && (
          <p className="text-parchment-200/50 text-sm">
            Ask about plant care, disease treatment, or dig deeper into a recent identification.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-label px-4 py-3 max-w-[85%] text-sm ${
              m.role === "user"
                ? "bg-moss-600/20 self-end"
                : "bg-ink-800 self-start prose dark:prose-invert prose-sm max-w-none"
            }`}
          >
            {m.role === "assistant" ? <ReactMarkdown>{m.content || "…"}</ReactMarkdown> : m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-ink-700 pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask a follow-up question…"
          className="flex-1 bg-ink-900 border border-ink-700 rounded-label px-4 h-11 text-sm outline-none focus:border-moss-500"
        />
        <button
          onClick={send}
          disabled={sending}
          className="btn-primary px-5 h-11"
        >
          Send
        </button>
      </div>
    </div>
  );
}
