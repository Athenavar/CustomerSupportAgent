// The orchestrator (backend/app/agents/orchestrator.py) formats answers with a
// small, predictable subset of markdown: "### heading", "**bold**", and
// "1. / 2. / 3." numbered steps. Rather than pull in a full markdown dependency
// for that, this renders exactly those patterns.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

export default function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = (key: string) => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ol key={key} className="ml-4 list-decimal space-y-1.5 text-sm leading-relaxed text-ink">
        {listBuffer.map((item, i) => (
          <li key={i} className="pl-1">
            {renderInline(item, `${key}-${i}`)}
          </li>
        ))}
      </ol>
    );
    listBuffer = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trim();

    if (line === "") {
      flushList(`list-${idx}`);
      return;
    }

    const heading = line.match(/^###\s+(.*)$/);
    if (heading) {
      flushList(`list-${idx}`);
      blocks.push(
        <h4
          key={`h-${idx}`}
          className="mt-3 font-display text-sm font-semibold uppercase tracking-wide text-ink first:mt-0"
        >
          {renderInline(heading[1], `h-${idx}`)}
        </h4>
      );
      return;
    }

    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (numbered) {
      listBuffer.push(numbered[1]);
      return;
    }

    flushList(`list-${idx}`);
    blocks.push(
      <p key={`p-${idx}`} className="text-sm leading-relaxed text-ink">
        {renderInline(line, `p-${idx}`)}
      </p>
    );
  });

  flushList("list-end");

  return <div className="space-y-2">{blocks}</div>;
}
