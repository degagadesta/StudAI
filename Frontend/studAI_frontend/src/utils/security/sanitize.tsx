import DOMPurify from "dompurify";

/**
 * Frontend sanitization utilities.
 *
 * Important framing: these are defense-in-depth for the CLIENT.
 * They protect against XSS/injection in what the browser renders and
 * where it navigates. They are NOT a substitute for backend validation —
 * anything sent to your API must be re-validated server-side regardless
 * of what happens here (someone can always bypass the frontend entirely).
 */

/* ------------------------------------------------------------------ */
/* 1. HTML / DOM Injection (XSS)                                       */
/* ------------------------------------------------------------------ */

/**
 * Sanitizes an HTML string before it's ever placed in the DOM.
 * Use this ANY time you have `dangerouslySetInnerHTML` — e.g. rendering
 * an AI-generated summary that may contain markup, or a course note
 * that supports rich text. Never use dangerouslySetInnerHTML on raw,
 * un-sanitized input.
 *
 * Not currently used on the login page (nothing here renders dynamic
 * HTML) — this is here for AI Chat / Notes / Summaries pages later.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof dirty !== "string") return "";

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * React component wrapper so call sites never touch
 * dangerouslySetInnerHTML directly or forget to sanitize first.
 *
 * Usage:
 *   <SafeHtml html={aiSummaryFromApi} className="prose" />
 */
import { useMemo } from "react";

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  const clean = useMemo(() => sanitizeHtml(html), [html]);
  // eslint-disable-next-line react/no-danger -- sanitized above via DOMPurify
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}

/**
 * Safe text-binding pattern (the default, and what the login page
 * actually uses): just render as a child. React escapes this
 * automatically — no HTML in the string can execute.
 *
 *   ❌ <div dangerouslySetInnerHTML={{ __html: user.name }} />
 *   ✅ <div>{user.name}</div>
 */

/* ------------------------------------------------------------------ */
/* 2. Dynamic Link & Protocol Validation                               */
/* ------------------------------------------------------------------ */

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/**
 * Validates a URL before it's used in an href, window.location, or
 * anywhere else the browser will navigate. Blocks javascript:, data:,
 * vbscript:, and any other protocol not explicitly whitelisted.
 *
 * Returns the safe URL string, or null if it should be rejected.
 */
export function sanitizeUrl(rawUrl: string): string | null {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") return null;

  const trimmed = rawUrl.trim();

  // Reject control characters and whitespace tricks some browsers used
  // to historically parse around (e.g. "java\tscript:alert(1)").
  // eslint-disable-next-line no-control-regex
  const stripped = trimmed.replace(/[\u0000-\u001F\u200B-\u200D\uFEFF]/g, "");

  try {
    // Relative URLs (e.g. "/dashboard") don't have a protocol — allow
    // those separately via isSafeRelativePath below. Here we only
    // validate absolute URLs.
    const parsed = new URL(stripped, window.location.origin);

    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Validates that a redirect target is a safe, same-site relative path —
 * never an absolute URL to another domain. This is what stops
 * /login?redirect=https://evil.com from being usable as an open redirect
 * off your own domain.
 *
 * Only allows paths starting with a single "/" (not "//" or "/\", which
 * browsers can interpret as protocol-relative URLs to another host).
 */
export function validateRedirectPath(
  path: string | null | undefined,
  fallback: string = "/dashboard",
): string {
  if (!path || typeof path !== "string") return fallback;

  const trimmed = path.trim();

  const isSingleSlashStart =
    trimmed.startsWith("/") && !trimmed.startsWith("//");
  const hasNoBackslashTrick =
    !trimmed.startsWith("/\\") && !trimmed.includes("\\");
  const hasNoProtocol = !/^[a-z][a-z0-9+.-]*:/i.test(trimmed); // blocks "https:", "javascript:", etc. even without slashes
  const hasNoControlChars = !/[\u0000-\u001F\u200B-\u200D\uFEFF]/.test(trimmed);

  if (
    isSingleSlashStart &&
    hasNoBackslashTrick &&
    hasNoProtocol &&
    hasNoControlChars
  ) {
    return trimmed;
  }

  return fallback;
}

/* ------------------------------------------------------------------ */
/* 3. Attribute & Form Input Security                                  */
/* ------------------------------------------------------------------ */

/**
 * Entity-encodes a value before it's inserted into an HTML attribute
 * (e.g. a dynamically built title="", data-*, or aria-label). Prevents
 * "attribute breakout" — a value like `" onmouseover="alert(1)` closing
 * the quote early and injecting a new event handler attribute.
 *
 * Note: in React, JSX attributes (className={x}, title={x}, etc.) are
 * already escaped automatically. This is for the rarer case of building
 * a raw HTML string yourself (e.g. server-side rendering, email
 * templates, or string concatenation outside JSX).
 */
export function encodeAttribute(value: string): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/`/g, "&#x60;")
    .replace(/=/g, "&#x3D;");
}

/**
 * Strips ASCII control characters (0x00–0x1F, 0x7F) and invisible
 * Unicode formatting characters (zero-width space, BOM, etc.) that
 * have no legitimate place in a name/email/password field and are
 * sometimes used to smuggle payloads past naive filters.
 */
export function stripControlChars(value: string): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, "");
}

/**
 * Trims surrounding whitespace. Deliberately does NOT touch internal
 * whitespace or case — that's field-specific (e.g. emails get
 * lowercased, passwords never do).
 */
export function trimInput(value: string): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

/**
 * Caps a string to a maximum length, applied BEFORE it's stored in
 * state — not just as a display-layer maxLength attribute, since a
 * paste event or programmatic input can bypass HTML attribute limits
 * in some edge cases.
 */
export function capLength(value: string, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, maxLength);
}

/**
 * Convenience composer for text inputs: strip control chars, cap
 * length, then trim. Order matters — trimming last means a max-length
 * cut that happened to land mid-whitespace still gets cleaned up.
 */
export function sanitizeTextInput(value: string, maxLength: number): string {
  return trimInput(capLength(stripControlChars(value), maxLength));
}
