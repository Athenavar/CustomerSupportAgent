"use client";

import { useCallback, useEffect, useState } from "react";
import { sendChatMessage, ApiError } from "@/lib/api";
import {
  getOrCreateConversationId,
  getCustomerId,
  resetConversationId,
} from "@/lib/session";
import type {
  ChatMessage,
  ProductSummary,
  PurchaseInfo,
  WarrantyInfo,
} from "@/lib/types";

const GREETING =
  "Hi! I'm your AI Product Support Assistant. I can help you troubleshoot electronic products, check warranty eligibility, track orders, and understand return or replacement options.\n\nFirst, what electronic product do you need help with?";

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [product, setProduct] = useState<ProductSummary | undefined>();
  const [purchase, setPurchase] = useState<PurchaseInfo | undefined>();
  const [warranty, setWarranty] = useState<WarrantyInfo | undefined>();
  const [purchaseAgeInput, setPurchaseAgeInput] = useState<string | undefined>();
  const [progressStep, setProgressStep] = useState<string | undefined>();
  const [escalated, setEscalated] = useState(false);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);

  useEffect(() => {
    setMessages([
      {
        id: makeId(),
        sender: "assistant",
        content: GREETING,
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const send = useCallback(async (text: string) => {
    const userMessage: ChatMessage = {
      id: makeId(),
      sender: "user",
      content: text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    if (!purchase && !product) {
      // heuristic: before a product is identified, a purchase-age-ish reply
      // still gets stored so the rail shows *something* while waiting on the order lookup
    } else if (!purchase) {
      setPurchaseAgeInput(text);
    }

    try {
      const res = await sendChatMessage({
        conversation_id: getOrCreateConversationId(),
        customer_id: getCustomerId(),
        message: text,
      });

      if (res.product) setProduct(res.product);
      if (res.purchase) setPurchase(res.purchase);
      if (res.warranty) setWarranty(res.warranty);
      if (res.progress_step) setProgressStep(res.progress_step);
      if (typeof res.escalated === "boolean") setEscalated(res.escalated);
      if (res.tools_used?.length) {
        setToolsUsed((prev) => Array.from(new Set([...prev, ...res.tools_used])));
      }

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          sender: "assistant",
          content: res.answer,
          meta: res,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong reaching the support agent. Please try again.";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          sender: "assistant",
          content: `⚠️ ${message}`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [product, purchase]);

  const restart = useCallback(() => {
    resetConversationId();
    setMessages([
      {
        id: makeId(),
        sender: "assistant",
        content: GREETING,
        createdAt: Date.now(),
      },
    ]);
    setProduct(undefined);
    setPurchase(undefined);
    setWarranty(undefined);
    setPurchaseAgeInput(undefined);
    setProgressStep(undefined);
    setEscalated(false);
    setToolsUsed([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    send,
    restart,
    product,
    purchase,
    warranty,
    purchaseAgeInput,
    progressStep,
    escalated,
    toolsUsed,
  };
}
