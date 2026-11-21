import { prisma } from "./db";

const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|linkedinbot|twitterbot|embedly|quora|pinterest|redditbot|applebot|semrush|ahrefs|duckduck|yandex|bingpreview|bytespider|gptbot|claudebot|perplexity/i;

/** Aynı tarayıcıda kısa sürede tekrar sayılmasın (saat). */
export const VIEW_DEDUP_HOURS = 6;
export const VIEW_COOKIE_PREFIX = "pv_";

export function isBotUserAgent(ua: string | null): boolean {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

export function viewCookieName(postId: string): string {
  return `${VIEW_COOKIE_PREFIX}${postId}`;
}

/** Yayındaki yazının görüntülenme sayacını 1 artırır. */
export async function incrementPostViewBySlug(
  slug: string,
): Promise<{ ok: true; postId: string } | { ok: false }> {
  const clean = slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,120}$/.test(clean)) return { ok: false };

  try {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      UPDATE "Post"
      SET "viewCount" = "viewCount" + 1
      WHERE "slug" = ${clean} AND "published" = true
      RETURNING "id"
    `;
    const id = rows[0]?.id;
    if (!id) return { ok: false };
    return { ok: true, postId: id };
  } catch {
    // Sütun henüz yoksa (eski DB) sessizce atla
    return { ok: false };
  }
}

export async function getPostViewCount(id: string): Promise<number> {
  try {
    const rows = await prisma.$queryRaw<{ viewCount: number | bigint }[]>`
      SELECT "viewCount" FROM "Post" WHERE "id" = ${id} LIMIT 1
    `;
    return Number(rows[0]?.viewCount ?? 0);
  } catch {
    return 0;
  }
}
