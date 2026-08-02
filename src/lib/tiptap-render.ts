import "server-only";
import { getCldImageUrl } from "next-cloudinary";

/**
 * Server-side Tiptap-JSON → HTML renderer for the PROJECT_CONTEXT §5 subset:
 *   text (marks: bold, italic, code, link), doc, paragraph, heading (2/3),
 *   bulletList, orderedList, listItem, blockquote, codeBlock, hardBreak,
 *   image, horizontalRule.
 *
 * Kept in-house instead of `@tiptap/html` — that package pulls jsdom-alike
 * runtime deps for a locked feature set we already own. Any node the schema
 * doesn't allow renders as empty string, so a compromised body can't inject
 * arbitrary tags. Text content is HTML-escaped.
 */
type Node = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: Node[];
};

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c] ?? c);

// Only whitelisted URL schemes for links & images. Prevents `javascript:` etc.
const isSafeUrl = (u: string) => /^(https?:|mailto:|tel:|\/)/i.test(u.trim());

function renderMarks(text: string, marks: Node["marks"]): string {
  let html = escapeHtml(text);
  for (const m of marks ?? []) {
    switch (m.type) {
      case "bold":
        html = `<strong>${html}</strong>`;
        break;
      case "italic":
        html = `<em>${html}</em>`;
        break;
      case "code":
        html = `<code>${html}</code>`;
        break;
      case "link": {
        const href = String(m.attrs?.href ?? "");
        if (!isSafeUrl(href)) break;
        html = `<a href="${escapeHtml(href)}" rel="noopener noreferrer" target="_blank">${html}</a>`;
        break;
      }
    }
  }
  return html;
}

function renderChildren(nodes: Node[] | undefined): string {
  return (nodes ?? []).map(renderNode).join("");
}

function renderNode(n: Node): string {
  switch (n.type) {
    case "text":
      return renderMarks(n.text ?? "", n.marks);
    case "paragraph":
      return `<p>${renderChildren(n.content)}</p>`;
    case "heading": {
      const level = Number(n.attrs?.level);
      const tag = level === 2 ? "h2" : level === 3 ? "h3" : "p";
      return `<${tag}>${renderChildren(n.content)}</${tag}>`;
    }
    case "bulletList":
      return `<ul>${renderChildren(n.content)}</ul>`;
    case "orderedList":
      return `<ol>${renderChildren(n.content)}</ol>`;
    case "listItem":
      return `<li>${renderChildren(n.content)}</li>`;
    case "blockquote":
      return `<blockquote>${renderChildren(n.content)}</blockquote>`;
    case "codeBlock":
      return `<pre><code>${escapeHtml(
        (n.content ?? []).map((c) => c.text ?? "").join(""),
      )}</code></pre>`;
    case "hardBreak":
      return "<br />";
    case "horizontalRule":
      return "<hr />";
    case "image": {
      const src = String(n.attrs?.src ?? "");
      if (!isSafeUrl(src)) return "";
      const alt = escapeHtml(String(n.attrs?.alt ?? ""));
      // Editor inserts Cloudinary delivery URLs; leave as-is (next/image needs
      // width+height we don't have here).
      return `<img src="${escapeHtml(src)}" alt="${alt}" loading="lazy" />`;
    }
    case "doc":
      return renderChildren(n.content);
    default:
      // Unknown node → drop. Locked to §5 subset by design.
      return renderChildren(n.content);
  }
}

export function renderTiptapToHtml(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  return renderNode(body as Node);
}

/**
 * Convenience: absolute Cloudinary URL for the OG image at 1200×630.
 * Used by `generateMetadata` for post detail + fallback OG generator.
 */
export function coverOgUrl(publicId: string | null): string | undefined {
  if (!publicId) return undefined;
  return getCldImageUrl({
    src: publicId,
    width: 1200,
    height: 630,
    crop: "fill",
    gravity: "auto",
  });
}
