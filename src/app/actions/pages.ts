"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  checkPhotoUpload,
  getAboutPhoto,
  removeAboutPhotoFiles,
  saveAboutPhoto,
  writeAboutPhotoFile,
} from "@/lib/about-photo";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PROFESSIONAL_MAX_LENGTH } from "@/lib/professional-fields";
import {
  KVKK_CUSTOM_TEXT_MAX,
  normalizeLegalText,
} from "@/lib/kvkk-fields";
import { getKvkkInfo, saveKvkkInfo } from "@/lib/kvkk-info";
import { buildKvkkTemplate, kvkkTemplateInput } from "@/lib/kvkk-text";
import { saveProfessionalInfo } from "@/lib/professional-info";
import {
  isValidContactMapEmbedInput,
  normalizeContactMapEmbed,
} from "@/lib/contact-map";
import { getSiteSettings } from "@/lib/settings";

export type PageState = {
  error?: string;
  success?: string;
};

const aboutSchema = z.object({
  aboutIntro: z.string().trim().min(20).max(600),
  aboutApproachTitle: z.string().trim().min(2).max(80),
  aboutApproachText: z.string().trim().min(20).max(1200),
  aboutScopeTitle: z.string().trim().min(2).max(80),
  aboutScopeText: z.string().trim().min(20).max(1200),
  aboutPromiseTitle: z.string().trim().min(2).max(80),
  aboutPromiseText: z.string().trim().min(20).max(1200),
});

const contactSchema = z.object({
  contactHeroTitle: z.string().trim().min(2).max(80),
  contactHeroText: z.string().trim().min(10).max(400),
  contactEmail: z.string().trim().email("Geçerli e-posta girin").max(120),
  contactPhone: z.string().trim().min(5).max(40),
  contactAddress: z.string().trim().min(3).max(160),
  contactHours: z.string().trim().min(3).max(80),
  contactMapEmbed: z
    .string()
    .trim()
    .max(2000)
    .refine(
      isValidContactMapEmbedInput,
      "Google Haritalar yerleştirme (embed) kodu veya adresi yapıştırın",
    ),
});

export async function updateAboutAction(
  _prev: PageState,
  formData: FormData,
): Promise<PageState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const parsed = aboutSchema.safeParse({
    aboutIntro: formData.get("aboutIntro"),
    aboutApproachTitle: formData.get("aboutApproachTitle"),
    aboutApproachText: formData.get("aboutApproachText"),
    aboutScopeTitle: formData.get("aboutScopeTitle"),
    aboutScopeText: formData.get("aboutScopeText"),
    aboutPromiseTitle: formData.get("aboutPromiseTitle"),
    aboutPromiseText: formData.get("aboutPromiseText"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };
  }

  await prisma.setting.upsert({
    where: { id: "main" },
    update: parsed.data,
    create: {
      id: "main",
      siteTitle: "Mali Müşavirlik",
      ...parsed.data,
    },
  });

  revalidatePath("/hakkimizda");
  revalidatePath("/admin/hakkimizda");
  return { success: "Hakkımda sayfası kaydedildi" };
}

export async function updateContactAction(
  _prev: PageState,
  formData: FormData,
): Promise<PageState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const parsed = contactSchema.safeParse({
    contactHeroTitle: formData.get("contactHeroTitle"),
    contactHeroText: formData.get("contactHeroText"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    contactAddress: formData.get("contactAddress"),
    contactHours: formData.get("contactHours"),
    contactMapEmbed: formData.get("contactMapEmbed") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };
  }

  const data = {
    ...parsed.data,
    contactMapEmbed: normalizeContactMapEmbed(parsed.data.contactMapEmbed),
  };

  await prisma.setting.upsert({
    where: { id: "main" },
    update: data,
    create: {
      id: "main",
      siteTitle: "Mali Müşavirlik",
      ...data,
    },
  });

  revalidatePath("/iletisim");
  revalidatePath("/", "layout");
  revalidatePath("/admin/iletisim");
  return { success: "İletişim sayfası kaydedildi" };
}

const professionalValue = z
  .string()
  .trim()
  .max(PROFESSIONAL_MAX_LENGTH, `Her alan en fazla ${PROFESSIONAL_MAX_LENGTH} karakter olabilir`);

const professionalSchema = z.object({
  academicTitle: professionalValue,
  officeTitle: professionalValue,
  chamber: professionalValue,
  registryNo: professionalValue,
  officeNo: professionalValue,
  startDate: professionalValue,
  university: professionalValue,
  languages: professionalValue,
  fax: professionalValue,
});

export async function updateProfessionalInfoAction(
  _prev: PageState,
  formData: FormData,
): Promise<PageState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const parsed = professionalSchema.safeParse({
    academicTitle: formData.get("academicTitle") ?? "",
    officeTitle: formData.get("officeTitle") ?? "",
    chamber: formData.get("chamber") ?? "",
    registryNo: formData.get("registryNo") ?? "",
    officeNo: formData.get("officeNo") ?? "",
    startDate: formData.get("startDate") ?? "",
    university: formData.get("university") ?? "",
    languages: formData.get("languages") ?? "",
    fax: formData.get("fax") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };
  }

  await saveProfessionalInfo(parsed.data);

  revalidatePath("/hakkimizda");
  revalidatePath("/iletisim");
  revalidatePath("/admin/iletisim");
  return { success: "Mesleki bilgiler kaydedildi" };
}

const kvkkSchema = z.object({
  controllerName: z.string().trim().max(120, "Unvan en fazla 120 karakter olabilir"),
  kepAddress: z
    .string()
    .trim()
    .max(120, "KEP adresi en fazla 120 karakter olabilir")
    .refine(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      "Geçerli bir KEP adresi girin",
    ),
  retention: z.string().trim().max(800, "Saklama süresi en fazla 800 karakter olabilir"),
  recipients: z.string().trim().max(800, "Aktarım metni en fazla 800 karakter olabilir"),
  extra: z.string().trim().max(800, "Ek açıklama en fazla 800 karakter olabilir"),
  effectiveDate: z.string().trim().max(40, "Tarih en fazla 40 karakter olabilir"),
});

export async function updateKvkkAction(
  _prev: PageState,
  formData: FormData,
): Promise<PageState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const parsed = kvkkSchema.safeParse({
    controllerName: formData.get("controllerName") ?? "",
    kepAddress: formData.get("kepAddress") ?? "",
    retention: formData.get("retention") ?? "",
    recipients: formData.get("recipients") ?? "",
    extra: formData.get("extra") ?? "",
    effectiveDate: formData.get("effectiveDate") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };
  }

  // Yalnızca şablon alanlarını günceller; varsa yöneticinin yazdığı özel metne dokunmaz.
  const current = await getKvkkInfo();
  await saveKvkkInfo({ ...current, ...parsed.data });

  revalidatePath("/kvkk");
  revalidatePath("/admin/kvkk");
  return {
    success: current.customText
      ? "Şablon alanları kaydedildi. Şu an özel metin gösterildiği için sayfada değişiklik görünmez."
      : "Aydınlatma metni kaydedildi",
  };
}

export async function updateKvkkTextAction(
  _prev: PageState,
  formData: FormData,
): Promise<PageState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const text = normalizeLegalText(String(formData.get("customText") ?? ""));
  if (text.length > KVKK_CUSTOM_TEXT_MAX) {
    return {
      error: `Metin en fazla ${KVKK_CUSTOM_TEXT_MAX} karakter olabilir`,
    };
  }

  const [settings, info] = await Promise.all([getSiteSettings(), getKvkkInfo()]);
  const template = normalizeLegalText(
    buildKvkkTemplate(kvkkTemplateInput(settings, info)),
  );

  // Boş ya da şablonla aynıysa özel metin tutulmaz; adres/e-posta değişiklikleri şablona yansımaya devam eder.
  let customText = text;
  if (text === "" || text === template) {
    customText = "";
  } else if (text.length < 100) {
    return {
      error:
        "Metin çok kısa görünüyor. Hazır metne dönmek için “Şablona Dön” düğmesini kullanın.",
    };
  }

  await saveKvkkInfo({ ...info, customText });

  revalidatePath("/kvkk");
  revalidatePath("/admin/kvkk");
  return {
    success: customText
      ? "Özel metin kaydedildi. Sitede artık bu metin gösteriliyor."
      : "Metin şablonla aynı olduğu için şablon kullanılmaya devam ediyor.",
  };
}

export async function resetKvkkTextAction(_prev: PageState): Promise<PageState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const info = await getKvkkInfo();
  await saveKvkkInfo({ ...info, customText: "" });

  revalidatePath("/kvkk");
  revalidatePath("/admin/kvkk");
  return { success: "Hazır metne dönüldü." };
}

function revalidateAboutPages() {
  revalidatePath("/hakkimizda");
  revalidatePath("/admin/hakkimizda");
}

/** Hakkımda fotoğrafı: göster/gizle anahtarı ve (isteğe bağlı) yeni fotoğraf yükleme. */
export async function updateAboutPhotoAction(
  _prev: PageState,
  formData: FormData,
): Promise<PageState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const current = await getAboutPhoto();
  const show = formData.get("show") === "on";
  const file = formData.get("photo");

  let ext = current.ext;
  let uploaded = false;
  if (file instanceof File && file.size > 0) {
    const check = await checkPhotoUpload(file);
    if (!check.ok) return { error: check.error };
    await writeAboutPhotoFile(check.ext, check.bytes);
    ext = check.ext;
    uploaded = true;
  }

  await saveAboutPhoto({ show, ext, version: current.version + 1 });
  revalidateAboutPages();

  if (uploaded) {
    return {
      success: show
        ? "Fotoğraf yüklendi; Hakkımda sayfasında gösteriliyor."
        : "Fotoğraf yüklendi ama sayfada gizli. Göstermek için kutuyu işaretleyip kaydedin.",
    };
  }
  return {
    success: show
      ? "Fotoğraf Hakkımda sayfasında gösterilecek."
      : "Fotoğraf Hakkımda sayfasında gizlendi.",
  };
}

/** Yüklenen fotoğrafı siler; sayfa (açıksa) yeniden örnek görseli gösterir. */
export async function removeAboutPhotoAction(
  _prev: PageState,
): Promise<PageState> {
  try {
    await requireSession();
  } catch {
    return { error: "Oturum gerekli" };
  }

  const current = await getAboutPhoto();
  await removeAboutPhotoFiles();
  await saveAboutPhoto({ show: current.show, ext: null, version: current.version + 1 });
  revalidateAboutPages();
  return { success: "Fotoğraf silindi. Örnek görsele dönüldü." };
}
