/**
 * Google Haritalar yerleştirme (embed) adresi.
 * Admin’e iframe HTML veya yalnızca src URL yapıştırılabilir.
 */

const MAX_LEN = 2000;

export function normalizeContactMapEmbed(
  raw: string | null | undefined,
): string {
  const text = (raw ?? "").trim();
  if (!text) return "";

  const fromIframe = text.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();
  const candidate = fromIframe || text;

  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase();
    const isGoogle =
      host === "google.com" ||
      host.endsWith(".google.com") ||
      host === "maps.google.com" ||
      host.endsWith(".google.com.tr");
    if (!isGoogle) return "";

    const path = url.pathname.toLowerCase();
    const isEmbed =
      path.includes("/maps/embed") ||
      path.includes("/maps/embed/") ||
      url.searchParams.get("output") === "embed";
    if (!isEmbed) return "";

    return url.toString().slice(0, MAX_LEN);
  } catch {
    return "";
  }
}

export function isValidContactMapEmbedInput(raw: string): boolean {
  const value = raw.trim();
  if (!value) return true;
  return normalizeContactMapEmbed(value) !== "";
}
