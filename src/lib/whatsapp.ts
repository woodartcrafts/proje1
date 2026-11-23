import { isRealSocialUrl } from "./social-links";

/**
 * WhatsApp bağlantısı: tam URL (wa.me / api.whatsapp.com) veya telefon numarası.
 */
export function normalizeWhatsAppHref(raw: string | null | undefined): string {
  const text = (raw ?? "").trim();
  if (!text) return "";

  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      const host = url.hostname.toLowerCase();
      const okHost =
        host === "wa.me" ||
        host.endsWith(".wa.me") ||
        host === "api.whatsapp.com" ||
        host === "whatsapp.com" ||
        host.endsWith(".whatsapp.com");
      if (!okHost) return "";
      if (!isRealSocialUrl(url.toString()) && host !== "api.whatsapp.com") {
        // wa.me/9055… path gerekir; api.whatsapp.com?phone= kabul
        if (host === "api.whatsapp.com" && url.searchParams.get("phone")) {
          return url.toString();
        }
        return "";
      }
      return url.toString();
    } catch {
      return "";
    }
  }

  const digits = text.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return "";
  if (/0{7,}/.test(digits)) return "";
  return `https://wa.me/${digits}`;
}

export function isValidWhatsAppInput(raw: string): boolean {
  const value = raw.trim();
  if (!value) return true;
  return normalizeWhatsAppHref(value) !== "";
}

/** Prefill mesajlı WhatsApp sohbet linki. */
export function buildWhatsAppChatUrl(
  href: string,
  message = "",
): string | null {
  const base = normalizeWhatsAppHref(href);
  if (!base) return null;
  const text = message.trim().slice(0, 300);
  if (!text) return base;

  try {
    const url = new URL(base);
    if (url.hostname.toLowerCase().includes("api.whatsapp.com")) {
      url.searchParams.set("text", text);
      return url.toString();
    }
    // wa.me/?text=
    url.searchParams.set("text", text);
    return url.toString();
  } catch {
    return base;
  }
}
