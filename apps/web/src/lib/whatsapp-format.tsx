import * as React from "react"

const LINE_TOKEN =
  /```([^`]+)```|\*([^*]+)\*|_([^_]+)_|~([^~]+)~|(\{\{\s*\w+\s*\}\})/g

function formatLine(line: string, lineKey: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  LINE_TOKEN.lastIndex = 0
  while ((match = LINE_TOKEN.exec(line))) {
    if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index))
    if (match[1] !== undefined) {
      nodes.push(
        <code key={`${lineKey}-${key++}`} className="rounded bg-black/10 px-1 font-mono text-[12px]">
          {match[1]}
        </code>,
      )
    } else if (match[2] !== undefined) {
      nodes.push(<strong key={`${lineKey}-${key++}`}>{match[2]}</strong>)
    } else if (match[3] !== undefined) {
      nodes.push(<em key={`${lineKey}-${key++}`}>{match[3]}</em>)
    } else if (match[4] !== undefined) {
      nodes.push(
        <span key={`${lineKey}-${key++}`} className="line-through">
          {match[4]}
        </span>,
      )
    } else if (match[5] !== undefined) {
      nodes.push(
        <span
          key={`${lineKey}-${key++}`}
          className="rounded bg-amber-400/40 px-0.5 text-amber-900 dark:bg-amber-400/20 dark:text-amber-300"
        >
          {match[5]}
        </span>,
      )
    }
    lastIndex = LINE_TOKEN.lastIndex
  }
  if (lastIndex < line.length) nodes.push(line.slice(lastIndex))
  return nodes
}

/** Renders WhatsApp's lightweight markup (*bold*, _italic_, ~strike~, ```mono```) and highlights {{variables}}. */
export function formatWhatsAppText(text: string): React.ReactNode {
  const lines = text.split("\n")
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {formatLine(line, i)}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ))
}

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "tr",
  "blockquote",
])

function walk(node: Node, out: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    out.push(node.textContent ?? "")
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return

  const el = node as Element
  const tag = el.tagName.toLowerCase()
  if (tag === "script" || tag === "style") return
  if (tag === "br") {
    out.push("\n")
    return
  }

  const wrap =
    tag === "b" || tag === "strong"
      ? "*"
      : tag === "i" || tag === "em"
        ? "_"
        : tag === "s" || tag === "strike" || tag === "del"
          ? "~"
          : tag === "code" || tag === "pre"
            ? "```"
            : ""
  const isBlock = BLOCK_TAGS.has(tag)
  const isListItem = tag === "li"

  if (isBlock && out.length > 0 && out[out.length - 1] !== "\n") out.push("\n")
  if (isListItem) out.push("- ")
  if (wrap) out.push(wrap)

  for (const child of Array.from(node.childNodes)) {
    walk(child, out);
  }

  if (wrap) out.push(wrap)
  if (isBlock) out.push("\n")
}

/** Converts pasted/imported HTML into a WhatsApp-safe plain-text body (basic bold/italic/strike/list markup preserved, everything else stripped). */
export function htmlToWhatsAppText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html")
  const out: string[] = []
  walk(doc.body, out)
  return out
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
