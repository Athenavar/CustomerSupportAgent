import { AlertTriangle, Cpu } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import Markdown from "./Markdown";
import SourceList from "./SourceList";
import ConfidenceMeter from "./ConfidenceMeter";
import { cn } from "@/lib/utils";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";
  const escalated = message.meta?.escalated;

  if (isUser) {
    return (
      <div className="flex animate-rise justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-sm leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-rise justify-start gap-3">
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          escalated ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"
        )}
      >
        {escalated ? <AlertTriangle size={14} /> : <Cpu size={14} />}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl rounded-tl-md border px-4 py-3.5",
          escalated
            ? "border-danger/30 bg-danger-soft"
            : "border-border bg-surface"
        )}
      >
        <Markdown content={message.content} />
        {message.meta?.sources && message.meta.sources.length > 0 && (
          <SourceList sources={message.meta.sources} />
        )}
        {typeof message.meta?.confidence === "number" && (
          <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5">
            <ConfidenceMeter confidence={message.meta.confidence} />
          </div>
        )}
      </div>
    </div>
  );
}
