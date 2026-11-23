import { prisma } from "./db";

export type HeroDocRow = {
  label: string;
  /** Dekoratif çubuk genişliği (%). */
  width: number;
  total?: boolean;
};

export type HeroDocSheet = {
  title: string;
  rows: HeroDocRow[];
  /** Ön yüz belgede mühür + imza satırları. */
  stamp?: boolean;
  stampText?: string;
  signLeft?: string;
  signRight?: string;
};

/** Sıra: arka → orta → ön (CSS: doc-c, doc-b, doc-a). */
export const DEFAULT_HERO_DOCS: HeroDocSheet[] = [
  {
    title: "Gelir Tablosu",
    rows: [
      { label: "Satışlar", width: 44 },
      { label: "Satışların maliyeti", width: 36 },
      { label: "Faaliyet gideri", width: 30 },
      { label: "Dönem net kârı", width: 40, total: true },
    ],
  },
  {
    title: "Bordro",
    rows: [
      { label: "Brüt ücret", width: 42 },
      { label: "SGK işçi payı", width: 28 },
      { label: "Gelir vergisi", width: 32 },
      { label: "Net ödenen", width: 40, total: true },
    ],
  },
  {
    title: "KDV Beyannamesi",
    stamp: true,
    stampText: "ONAYLANDI",
    signLeft: "Mükellef",
    signRight: "Danışman",
    rows: [
      { label: "Matrah", width: 46 },
      { label: "Hesaplanan KDV", width: 34 },
      { label: "İndirilecek KDV", width: 30 },
      { label: "Ödenecek KDV", width: 38, total: true },
    ],
  },
];

const WIDTHS = [
  [44, 36, 30, 40],
  [42, 28, 32, 40],
  [46, 34, 30, 38],
] as const;

function cleanLabel(value: unknown, fallback: string, max = 40): string {
  if (typeof value !== "string") return fallback;
  const text = value.trim().slice(0, max);
  return text || fallback;
}

function parseSheet(
  raw: unknown,
  index: number,
  fallback: HeroDocSheet,
): HeroDocSheet {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return structuredClone(fallback);
  }
  const record = raw as Record<string, unknown>;
  const widths = WIDTHS[index] ?? WIDTHS[0];
  const rawRows = Array.isArray(record.rows) ? record.rows : [];
  const rows: HeroDocRow[] = [0, 1, 2, 3].map((i) => {
    const row = rawRows[i];
    const labelFallback = fallback.rows[i]?.label ?? `Satır ${i + 1}`;
    const label =
      row && typeof row === "object" && !Array.isArray(row)
        ? cleanLabel((row as { label?: unknown }).label, labelFallback)
        : labelFallback;
    return {
      label,
      width: widths[i],
      total: i === 3,
    };
  });

  const stamp = index === 2 ? record.stamp !== false : false;

  return {
    title: cleanLabel(record.title, fallback.title, 48),
    rows,
    ...(stamp
      ? {
          stamp: true,
          stampText: cleanLabel(record.stampText, fallback.stampText || "ONAYLANDI", 20),
          signLeft: cleanLabel(record.signLeft, fallback.signLeft || "Mükellef", 24),
          signRight: cleanLabel(
            record.signRight,
            fallback.signRight || "Danışman",
            24,
          ),
        }
      : {}),
  };
}

export function parseHeroDocs(raw: string | null | undefined): HeroDocSheet[] {
  if (!raw?.trim()) return structuredClone(DEFAULT_HERO_DOCS);
  try {
    const data: unknown = JSON.parse(raw);
    const list = Array.isArray(data)
      ? data
      : data &&
          typeof data === "object" &&
          Array.isArray((data as { sheets?: unknown }).sheets)
        ? (data as { sheets: unknown[] }).sheets
        : null;
    if (!list) return structuredClone(DEFAULT_HERO_DOCS);
    return [0, 1, 2].map((i) =>
      parseSheet(list[i], i, DEFAULT_HERO_DOCS[i] ?? DEFAULT_HERO_DOCS[0]),
    );
  } catch {
    return structuredClone(DEFAULT_HERO_DOCS);
  }
}

export function normalizeHeroDocs(input: HeroDocSheet[]): HeroDocSheet[] {
  return [0, 1, 2].map((i) =>
    parseSheet(input[i], i, DEFAULT_HERO_DOCS[i] ?? DEFAULT_HERO_DOCS[0]),
  );
}

export async function getHeroDocs(): Promise<HeroDocSheet[]> {
  try {
    const rows = await prisma.$queryRaw<{ heroDocs: string | null }[]>`
      SELECT "heroDocs" FROM "Setting" WHERE "id" = 'main' LIMIT 1
    `;
    return parseHeroDocs(rows[0]?.heroDocs);
  } catch {
    return structuredClone(DEFAULT_HERO_DOCS);
  }
}

export async function saveHeroDocs(sheets: HeroDocSheet[]): Promise<void> {
  const normalized = normalizeHeroDocs(sheets);
  const json = JSON.stringify({ sheets: normalized });

  await prisma.setting.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", siteTitle: "Mali Müşavirlik" },
  });

  await prisma.$executeRaw`
    UPDATE "Setting" SET "heroDocs" = ${json} WHERE "id" = 'main'
  `;
}
