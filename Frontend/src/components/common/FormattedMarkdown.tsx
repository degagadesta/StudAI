import { useMemo } from "react";
import DOMPurify from "dompurify";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export default function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  const formattedHtml = useMemo(() => {
    if (!content) return "";

    let raw = content.trim();

    // 1. Normalize line endings
    raw = raw.replace(/\r\n/g, "\n");

    // 2. Escape basic HTML entities to avoid unescaped injections
    raw = raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 3. Process Code Blocks (```code```)
    raw = raw.replace(/```([\s\S]*?)```/g, (_, code) => {
      return `<pre class="my-2.5 p-3 bg-[#1C3026] text-[#FFFDF7] rounded-xl text-[11px] font-mono overflow-x-auto leading-normal"><code>${code.trim()}</code></pre>`;
    });

    // 4. Process Inline Code (`code`)
    raw = raw.replace(/`([^`]+)`/g, `<code class="font-mono bg-[#253D31]/10 text-[#253D31] px-1.5 py-0.5 rounded text-[11px] font-semibold">$1</code>`);

    // 5. Process Headings (# Heading, ## Heading, ### Heading)
    raw = raw.replace(/^###?\s+(.+)$/gm, '<strong class="block text-xs font-bold text-primary mt-3 mb-1 uppercase tracking-wider">$1</strong>');
    raw = raw.replace(/^#\s+(.+)$/gm, '<strong class="block text-sm font-bold text-[#253D31] mt-3 mb-1 uppercase tracking-wider">$1</strong>');

    // 6. Process Blockquotes (> Quote)
    raw = raw.replace(/^&gt;\s+(.+)$/gm, '<blockquote class="my-2.5 border-l-3 border-[#253D31] bg-[#253D31]/5 px-3.5 py-2 rounded-r-xl text-xs text-[#253D31] italic font-medium">$1</blockquote>');

    // 7. Process Bold (**text** or __text__)
    raw = raw.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary">$1</strong>');

    // 8. Process Italic (*text* or _text_)
    raw = raw.replace(/\*([^*]+)\*/g, '<em class="italic text-secondary">$1</em>');

    // 9. Process Bullet Lists (* item or - item)
    raw = raw.replace(/^[\*\-]\s+(.+)$/gm, '<li class="ml-4 list-disc text-primary my-0.5 pl-0.5">$1</li>');
    raw = raw.replace(/(<li class="ml-4 list-disc text-primary my-0.5 pl-0.5">[\s\S]*?<\/li>\n?)+/g, (match) => {
      return `<ul class="my-2 space-y-1">${match}</ul>`;
    });

    // 10. Process Paragraphs (double line breaks)
    const blocks = raw.split(/\n\n+/);
    const htmlResult = blocks
      .map((block) => {
        const trimmed = block.trim();
        if (
          trimmed.startsWith("<ul") ||
          trimmed.startsWith("<blockquote") ||
          trimmed.startsWith("<pre") ||
          trimmed.startsWith("<strong class=\"block")
        ) {
          return trimmed;
        }
        return `<p class="mb-2.5 leading-relaxed text-primary">${trimmed.replace(/\n/g, "<br />")}</p>`;
      })
      .join("");

    return DOMPurify.sanitize(htmlResult, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "code", "pre", "blockquote", "ul", "ol", "li", "span", "div"],
      ALLOWED_ATTR: ["class"],
    });
  }, [content]);

  return (
    <div
      className={`formatted-markdown text-xs leading-relaxed text-primary ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
}
