import { Fragment } from "react";
import { ExternalLink } from "lucide-react";

type Block =
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "p"; text: string }
  | { type: "sources"; items: { label: string; href: string }[] };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      blocks.push({ type: "h2", text: h2[1] });
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^##\s+/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
      paragraph.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  for (let idx = 0; idx < blocks.length - 1; idx++) {
    const b = blocks[idx];
    const next = blocks[idx + 1];
    if (b.type === "h2" && /^fuentes$/i.test(b.text) && next.type === "ul") {
      const items = next.items
        .map((raw) => {
          const m = raw.match(/\[([^\]]+)\]\(([^)]+)\)/);
          if (m && /^https?:\/\//i.test(m[2])) return { label: m[1], href: m[2] };
          return null;
        })
        .filter((x): x is { label: string; href: string } => !!x);
      if (items.length) {
        blocks.splice(idx, 2, { type: "sources", items });
      }
    }
  }

  return blocks;
}

function InlineMarkdown({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(`[^`]+`)|(\[[^\]]+\]\(https?:\/\/[^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith("**")) {
      parts.push(<strong key={key++} className="font-semibold text-foreground">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("`")) {
      parts.push(<code key={key++} className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono">{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith("[")) {
      const linkMatch = tok.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-baseline gap-0.5 text-brand-700 underline underline-offset-2 hover:text-brand-800"
          >
            {linkMatch[1]}
          </a>
        );
      }
    } else {
      parts.push(<em key={key++} className="italic">{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  return <>{parts}</>;
}

export function Markdown({ children }: { children: string }) {
  const blocks = parseBlocks(children);
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-foreground">
      {blocks.map((b, i) => {
        if (b.type === "h2")
          return (
            <h3 key={i} className="font-display text-base font-bold pt-1">
              <InlineMarkdown text={b.text} />
            </h3>
          );
        if (b.type === "p")
          return (
            <p key={i}>
              <InlineMarkdown text={b.text} />
            </p>
          );
        if (b.type === "ul")
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {b.items.map((it, j) => (
                <li key={j}>
                  <InlineMarkdown text={it} />
                </li>
              ))}
            </ul>
          );
        if (b.type === "ol")
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1">
              {b.items.map((it, j) => (
                <li key={j}>
                  <InlineMarkdown text={it} />
                </li>
              ))}
            </ol>
          );
        if (b.type === "sources")
          return (
            <div key={i} className="mt-3 rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                <ExternalLink className="h-3 w-3" />
                Fuentes consultadas
              </div>
              <ul className="space-y-1">
                {b.items.map((it, j) => (
                  <li key={j} className="text-xs">
                    <a
                      href={it.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      {it.label}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        return null;
      })}
    </div>
  );
}
