export type ExternalNewsItem = {
  id: string;
  title: string;
  summary: string;
  dateLabel: string;
  source: string;
  href: string;
  kind: string;
  theme: string;
  badge: string;
};

const DEFAULT_NEWS_URL = "https://www.ozcankutlu.com/api/news";

// Haber kaynağı yavaşlarsa/takılırsa ana sayfa üretimi beklemesin; süre dolunca boş liste döner.
const NEWS_TIMEOUT_MS = 3000;

type ApiNewsItem = {
  id?: string;
  title?: string;
  summary?: string;
  analysis?: string;
  primarySource?: string;
  primaryUrl?: string;
  effectiveDate?: string;
  publishedAt?: string;
  kind?: string;
  category?: string;
  visualTheme?: string;
  disableSourceLink?: boolean;
  sources?: Array<{ name?: string; url?: string }>;
};

type ApiNewsResponse = {
  success?: boolean;
  data?: ApiNewsItem[];
};

// Haber akışında tarihler farklı biçimlerde gelebiliyor:
// "2026-11-10", "2026-11-09T16:57:45.398Z" ve "10.07.2025" (gg.aa.yyyy).
function parseNewsDate(value?: string): Date | null {
  if (!value) return null;
  const text = value.trim();

  const dotted = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotted) {
    const [, day, month, year] = dotted;
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(text.includes("T") ? text : `${text}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateLabel(date: Date | null) {
  if (!date) return "";
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function badgeFor(item: ApiNewsItem) {
  const category = item.category?.trim();
  if (category) return category.slice(0, 24);
  if (item.kind === "deadline") return "Son tarih";
  if (item.kind === "alert") return "Uyarı";
  return "Güncel";
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Haberleri çeker; yalnızca son `maxAgeDays` gün içinde yayımlananları,
 * en yeniden eskiye sıralayıp en fazla `limit` adet döndürür.
 * Yayın tarihi (publishedAt) esas alınır; yoksa effectiveDate kullanılır.
 * Tarihi okunamayan haber, güncelliği doğrulanamadığı için dışarıda kalır.
 */
export async function fetchExternalNews(
  sourceUrl = DEFAULT_NEWS_URL,
  limit = 15,
  maxAgeDays = 60,
): Promise<ExternalNewsItem[]> {
  const url = sourceUrl.trim() || DEFAULT_NEWS_URL;

  try {
    const response = await fetch(url, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(NEWS_TIMEOUT_MS),
      headers: {
        Accept: "application/json",
        "User-Agent": "Proje1NewsBot/1.0",
      },
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as ApiNewsResponse;
    const rows = Array.isArray(payload.data) ? payload.data : [];

    const cutoff = Date.now() - maxAgeDays * DAY_MS;

    const fresh = rows
      .map((item, index) => ({
        item,
        index,
        date: parseNewsDate(item.publishedAt) ?? parseNewsDate(item.effectiveDate),
      }))
      .filter(
        (entry): entry is typeof entry & { date: Date } =>
          entry.date !== null && entry.date.getTime() >= cutoff,
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);

    return fresh.map(({ item, index, date }) => {
      const href =
        item.disableSourceLink
          ? ""
          : item.primaryUrl || item.sources?.[0]?.url || "";

      return {
        id: item.id || `news-${index}`,
        title: item.title?.trim() || "Güncel mali gelişme",
        summary: (item.summary || item.analysis || "").trim(),
        dateLabel: formatDateLabel(date),
        source: item.primarySource || item.sources?.[0]?.name || "Resmi kaynak",
        href,
        kind: item.kind || item.category || "news",
        theme: item.visualTheme || "crimson",
        badge: badgeFor(item),
      };
    });
  } catch {
    return [];
  }
}

export { DEFAULT_NEWS_URL };
