"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  checkPhotoUpload,
  getSiteLogo,
  removeSiteLogoFiles,
  saveSiteLogo,
  writeSiteLogoFile,
} from "@/lib/site-logo";
import {
  TITLE_SCALE_MAX,
  TITLE_SCALE_MIN,
  isTitleFontKey,
} from "@/lib/title-fonts";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) => value === "" || /^https?:\/\//i.test(value),
    "Bağlantı http:// veya https:// ile başlamalı",
  );

const schema = z.object({
  siteTitle: z
    .string()
    .trim()
    .min(2, "Başlık en az 2 karakter olmalı")
    .max(80, "Başlık en fazla 80 karakter olabilir"),
  facebook: optionalUrl,
  instagram: optionalUrl,
  linkedin: optionalUrl,
  twitter: optionalUrl,
  youtube: optionalUrl,
  whatsapp: optionalUrl,
  externalNewsUrl: optionalUrl,
  externalNewsLabel: z.string().trim().max(80),
  // Haber şeridi açık/kapalı yalnızca Ayarlar formundan gelir (present bayrağı ile).
  externalNewsEnabled: z.boolean().optional(),
  // Başlık görünümü yalnızca Site Ayarları formundan gelir. Sosyal Medya formu gibi bu alanları
  // göndermeyen formlar mevcut değeri bozmasın diye ikisi de isteğe bağlıdır (yoksa güncellenmez).
  titleFont: z
    .string()
    .refine(isTitleFontKey, "Geçersiz yazı tipi seçildi")
    .optional(),
  titleScale: z
    .number("Başlık boyutu bir sayı olmalı")
    .int("Başlık boyutu tam sayı olmalı")
    .min(TITLE_SCALE_MIN, `Başlık boyutu en az %${TITLE_SCALE_MIN} olabilir`)
    .max(TITLE_SCALE_MAX, `Başlık boyutu en fazla %${TITLE_SCALE_MAX} olabilir`)
    .optional(),
  // Ana sayfa / CTA metinleri yalnızca Ayarlar formundan gelir; diğer formlar göndermez.
  homeHeroTitle: z.string().trim().min(2).max(120).optional(),
  homeHeroText: z.string().trim().min(10).max(400).optional(),
  homeHeroPrimaryCta: z.string().trim().min(2).max(40).optional(),
  homeHeroSecondaryCta: z.string().trim().min(2).max(40).optional(),
  headerCtaLabel: z.string().trim().min(2).max(40).optional(),
  footerCtaTitle: z.string().trim().min(2).max(120).optional(),
  footerCtaText: z.string().trim().min(10).max(400).optional(),
  footerCtaButton: z.string().trim().min(2).max(40).optional(),
});

export type SettingsState = {
  error?: string;
  success?: string;
};

export async function updateSettingsAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const titleFontRaw = formData.get("titleFont");
  const titleScaleRaw = formData.get("titleScale");
  const optionalText = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : undefined;
  };

  const parsed = schema.safeParse({
    siteTitle: formData.get("siteTitle"),
    facebook: formData.get("facebook") ?? "",
    instagram: formData.get("instagram") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    twitter: formData.get("twitter") ?? "",
    youtube: formData.get("youtube") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    externalNewsUrl: formData.get("externalNewsUrl") ?? "",
    externalNewsLabel: formData.get("externalNewsLabel") ?? "",
    externalNewsEnabled:
      formData.get("externalNewsEnabledPresent") === "1"
        ? formData.get("externalNewsEnabled") === "on"
        : undefined,
    titleFont: typeof titleFontRaw === "string" ? titleFontRaw : undefined,
    titleScale:
      typeof titleScaleRaw === "string" && titleScaleRaw.trim() !== ""
        ? Number(titleScaleRaw)
        : undefined,
    homeHeroTitle: optionalText("homeHeroTitle"),
    homeHeroText: optionalText("homeHeroText"),
    homeHeroPrimaryCta: optionalText("homeHeroPrimaryCta"),
    homeHeroSecondaryCta: optionalText("homeHeroSecondaryCta"),
    headerCtaLabel: optionalText("headerCtaLabel"),
    footerCtaTitle: optionalText("footerCtaTitle"),
    footerCtaText: optionalText("footerCtaText"),
    footerCtaButton: optionalText("footerCtaButton"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };
  }

  const {
    titleFont,
    titleScale,
    externalNewsEnabled,
    homeHeroTitle,
    homeHeroText,
    homeHeroPrimaryCta,
    homeHeroSecondaryCta,
    headerCtaLabel,
    footerCtaTitle,
    footerCtaText,
    footerCtaButton,
    ...required
  } = parsed.data;

  const data = {
    ...required,
    externalNewsUrl:
      required.externalNewsUrl || "https://www.ozcankutlu.com/api/news",
    externalNewsLabel:
      required.externalNewsLabel || "Güncel Mali Gelişmeler",
    ...(externalNewsEnabled !== undefined
      ? { externalNewsEnabled: externalNewsEnabled ? 1 : 0 }
      : {}),
    ...(titleFont !== undefined ? { titleFont } : {}),
    ...(titleScale !== undefined ? { titleScale } : {}),
    ...(homeHeroTitle !== undefined ? { homeHeroTitle } : {}),
    ...(homeHeroText !== undefined ? { homeHeroText } : {}),
    ...(homeHeroPrimaryCta !== undefined ? { homeHeroPrimaryCta } : {}),
    ...(homeHeroSecondaryCta !== undefined ? { homeHeroSecondaryCta } : {}),
    ...(headerCtaLabel !== undefined ? { headerCtaLabel } : {}),
    ...(footerCtaTitle !== undefined ? { footerCtaTitle } : {}),
    ...(footerCtaText !== undefined ? { footerCtaText } : {}),
    ...(footerCtaButton !== undefined ? { footerCtaButton } : {}),
  };

  await prisma.setting.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ayarlar");

  return { success: "Ayarlar kaydedildi" };
}

function revalidateLogoSurfaces() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/admin/ayarlar");
}

/** Üst menü / alt bilgi logosunu yükler veya değiştirir. */
export async function updateSiteLogoAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Yüklenecek bir logo dosyası seçin." };
  }

  const check = await checkPhotoUpload(file);
  if (!check.ok) return { error: check.error };

  const current = await getSiteLogo();
  await writeSiteLogoFile(check.ext, check.bytes);
  await saveSiteLogo({ ext: check.ext, version: current.version + 1 });
  revalidateLogoSurfaces();
  return { success: "Logo güncellendi; üst menüde ve sayfa altında görünür." };
}

/** Yüklenen logoyu siler; varsayılan smmm.png kullanılır. */
export async function removeSiteLogoAction(
  _prev: SettingsState,
): Promise<SettingsState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const current = await getSiteLogo();
  await removeSiteLogoFiles();
  await saveSiteLogo({ ext: null, version: current.version + 1 });
  revalidateLogoSurfaces();
  return { success: "Logo silindi. Varsayılan logoya dönüldü." };
}
