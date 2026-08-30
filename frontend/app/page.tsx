"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Cpu, ChevronDown } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatComposer from "@/components/chat/ChatComposer";
import ProductContextPanel from "@/components/chat/ProductContextPanel";
import SuggestedProducts from "@/components/chat/SuggestedProducts";
import { Button, LiveDot } from "@/components/ui/primitives";
import { getCustomerId, setCustomerId } from "@/lib/session";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Cpu size={14} />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-border bg-surface px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink-faint"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const chat = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [customerId, setCustomerIdState] = useState("CUST-1001");
  const [editingCustomer, setEditingCustomer] = useState(false);

  useEffect(() => {
    setCustomerIdState(getCustomerId());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chat.messages, chat.loading]);

  const conversationStarted = chat.messages.length > 1;

  return (
    <div className="mx-auto flex h-[calc(100vh-64px)] max-w-7xl">
      {/* Context rail */}
      <div className="hidden w-72 shrink-0 border-r border-border bg-surface-raised lg:block">
        <ProductContextPanel
          product={chat.product}
          purchase={chat.purchase}
          warranty={chat.warranty}
          purchaseAgeInput={chat.purchaseAgeInput}
          progressStep={chat.progressStep}
          escalated={chat.escalated}
          toolsUsed={chat.toolsUsed}
        />
      </div>

      {/* Conversation column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <LiveDot />
            <span className="text-sm font-medium text-ink">AI Electronics Support</span>
            <span className="text-xs text-ink-faint">· Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setEditingCustomer((v) => !v)}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 font-mono text-xs text-ink-soft hover:border-accent hover:text-accent"
              >
                {customerId}
                <ChevronDown size={12} />
              </button>
              {editingCustomer && (
                <div className="absolute right-0 top-full z-10 mt-1.5 w-56 rounded-lg border border-border bg-white p-2 shadow-panel">
                  <label className="mb-1 block text-[11px] font-medium text-ink-faint">
                    Customer ID (mock login)
                  </label>
                  <input
                    className="w-full rounded-md border border-border px-2 py-1.5 font-mono text-xs outline-none focus:border-accent"
                    value={customerId}
                    onChange={(e) => setCustomerIdState(e.target.value)}
                    onBlur={() => {
                      setCustomerId(customerId);
                      setEditingCustomer(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setCustomerId(customerId);
                        setEditingCustomer(false);
                      }
                    }}
                    autoFocus
                  />
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={chat.restart}>
              <RotateCcw size={13} /> New conversation
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="thin-scroll flex-1 overflow-y-auto px-5 py-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {chat.messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {chat.loading && <TypingIndicator />}

            {!conversationStarted && !chat.loading && (
              <div className="mt-2">
                <div className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
                  Or pick a category to start
                </div>
                <SuggestedProducts onPick={chat.send} />
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-bg px-5 py-4">
          <div className="mx-auto max-w-2xl">
            <ChatComposer
              onSend={chat.send}
              disabled={chat.loading}
              placeholder={
                conversationStarted
                  ? "Tell me more…"
                  : "What electronic product do you need help with?"
              }
            />
            <p className="mt-2 text-center text-[11px] text-ink-faint">
              Responses are grounded in product documentation and warranty records — not a substitute for professional repair advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
