"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  DEFAULT_HERO_DOCS,
  normalizeHeroDocs,
  saveHeroDocs,
  type HeroDocSheet,
} from "@/lib/hero-docs";

export type HeroDocsState = {
  error?: string;
  success?: string;
};

function sheetFromForm(formData: FormData, index: number): HeroDocSheet {
  const fallback = DEFAULT_HERO_DOCS[index] ?? DEFAULT_HERO_DOCS[0];
  const title = String(formData.get(`doc${index}_title`) ?? "");
  const rows = [0, 1, 2, 3].map((rowIndex) => ({
    label: String(formData.get(`doc${index}_row${rowIndex}`) ?? ""),
    width: fallback.rows[rowIndex]?.width ?? 40,
    total: rowIndex === 3,
  }));

  if (index !== 2) {
    return { title, rows };
  }

  return {
    title,
    rows,
    stamp: formData.get(`doc${index}_stamp`) === "on",
    stampText: String(formData.get(`doc${index}_stampText`) ?? ""),
    signLeft: String(formData.get(`doc${index}_signLeft`) ?? ""),
    signRight: String(formData.get(`doc${index}_signRight`) ?? ""),
  };
}

export async function updateHeroDocsAction(
  _prev: HeroDocsState,
  formData: FormData,
): Promise<HeroDocsState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  try {
    const sheets = normalizeHeroDocs([
      sheetFromForm(formData, 0),
      sheetFromForm(formData, 1),
      sheetFromForm(formData, 2),
    ]);
    await saveHeroDocs(sheets);
  } catch {
    return {
      error:
        "Kayıt başarısız. Veritabanı güncel mi kontrol edin (heroDocs sütunu).",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/ayarlar");
  return { success: "Hero evrakları kaydedildi." };
}
