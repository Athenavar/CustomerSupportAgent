"use client";

import { useState, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatComposer({
  onSend,
  disabled,
  placeholder,
}: {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-border bg-white p-2 shadow-panel focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-bright/20">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        placeholder={placeholder || "Type your message…"}
        className="max-h-32 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm text-ink placeholder:text-ink-faint outline-none disabled:opacity-60"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
          value.trim() && !disabled
            ? "bg-ink text-white hover:bg-accent"
            : "bg-surface-raised text-ink-faint"
        )}
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
}
