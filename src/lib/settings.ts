import { normalizeContactMapEmbed } from "./contact-map";
import { prisma } from "./db";
import { DEFAULT_NEWS_URL } from "./external-news";
import { normalizeGa4MeasurementId } from "./ga4";
import { isRealSocialUrl } from "./social-links";
import { normalizeTitleFont, normalizeTitleScale } from "./title-fonts";
import { normalizeWhatsAppHref } from "./whatsapp";

export type SiteSettings = {
  siteTitle: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  whatsapp: string;
  /** WhatsApp sohbetine eklenecek hazır metin. */
  whatsappMessage: string;
  /** Sağ altta sabit WhatsApp düğmesi. */
  whatsappFloat: boolean;
  externalNewsUrl: string;
  externalNewsLabel: string;
  /** Ana sayfadaki CANLI haber slaytı gösterilsin mi. */
  externalNewsEnabled: boolean;
  /** GA4 Measurement ID (G-XXXX). Boşsa takip kodu yüklenmez. */
  ga4MeasurementId: string;
  aboutIntro: string;
  aboutApproachTitle: string;
  aboutApproachText: string;
  aboutScopeTitle: string;
  aboutScopeText: string;
  aboutPromiseTitle: string;
  aboutPromiseText: string;
  contactHeroTitle: string;
  contactHeroText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactHours: string;
  /** Google Haritalar embed URL; boşsa iletişimde harita gösterilmez. */
  contactMapEmbed: string;
  servicesIntro: string;
  /** Site başlığı yazı tipi anahtarı (src/lib/title-fonts.ts); boş = tema varsayılanı. */
  titleFont: string;
  /** Site başlığı boyutu, varsayılanın yüzdesi (70–150). */
  titleScale: number;
  homeHeroTitle: string;
  homeHeroText: string;
  homeHeroPrimaryCta: string;
  homeHeroSecondaryCta: string;
  headerCtaLabel: string;
  footerCtaTitle: string;
  footerCtaText: string;
  footerCtaButton: string;
};

const HOME_COPY_DEFAULTS = {
  homeHeroTitle: "Vergi ve muhasebede net, güvenilir rehberlik",
  homeHeroText:
    "Şirketinizin yükümlülüklerini zamanında yönetir, kararlarınızı mali görünürlükle güçlendiririz.",
  homeHeroPrimaryCta: "Görüşme Talep Et",
  homeHeroSecondaryCta: "Hizmetleri İncele",
  headerCtaLabel: "Randevu Alın",
  footerCtaTitle: "İhtiyacınızı birlikte netleştirelim",
  footerCtaText:
    "Kısa bir ön görüşmeyle başlayalım; kapsamı ve süreci birlikte belirleriz.",
  footerCtaButton: "Görüşme Talep Et",
} as const;

/** Ayar girilmemişse sitede görünen yer tutucu iletişim bilgileri (gerçek bilgi değildir). */
export const CONTACT_PLACEHOLDERS = {
  email: "info@ornek-mm.com",
  phone: "+90 (212) 000 00 00",
  address: "İstanbul, Türkiye",
} as const;

const defaults = {
  aboutIntro:
    "işletmelerin vergi ve muhasebe süreçlerini düzenli, anlaşılır ve denetlenebilir şekilde yönetmesi için kurulmuş bir mali müşavirlik ofisidir.",
  aboutApproachText:
    "Her müşteriye aynı standart kaliteyi sunarız: net iletişim, zamanında teslim ve belgelenmiş süreçler. Amacımız yalnızca beyanları tamamlamak değil, işletmenizin mali kararlarını daha sağlam temellere oturtmaktır.",
  aboutScopeText:
    "Limited şirketler, anonim şirketler, şahıs işletmeleri ve serbest meslek sahipleriyle çalışıyoruz. Sektör fark etmeksizin ortak ihtiyacınız düzen ve güvenilir danışmanlıktır.",
  aboutPromiseText:
    "Kaçırılmayan tarihler, anlaşılır raporlar ve ihtiyaç anında hızlı dönüş. Büyürken yanınızda duran bir mali iş ortağı olmayı hedefleriz.",
  contactHeroText:
    "ile görüşmek için formu doldurun. Mesajınız doğrudan ofisimize ulaşır.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const setting = await prisma.setting.findUnique({ where: { id: "main" } });
  const siteTitle = setting?.siteTitle ?? "SMMM Ad Soyad";

  return {
    siteTitle,
    facebook: setting?.facebook ?? "",
    instagram: setting?.instagram ?? "",
    linkedin: setting?.linkedin ?? "",
    twitter: setting?.twitter ?? "",
    youtube: setting?.youtube ?? "",
    whatsapp: normalizeWhatsAppHref(setting?.whatsapp ?? ""),
    whatsappMessage: (
      (setting as { whatsappMessage?: string | null } | null)?.whatsappMessage ?? ""
    )
      .trim()
      .slice(0, 300),
    whatsappFloat:
      ((setting as { whatsappFloat?: number | null } | null)?.whatsappFloat ?? 1) ===
      1,
    externalNewsUrl: setting?.externalNewsUrl || DEFAULT_NEWS_URL,
    externalNewsLabel:
      setting?.externalNewsLabel || "Güncel Mali Gelişmeler",
    externalNewsEnabled: (setting?.externalNewsEnabled ?? 1) === 1,
    ga4MeasurementId: normalizeGa4MeasurementId(
      (setting as { ga4MeasurementId?: string | null } | null)?.ga4MeasurementId,
    ),
    aboutIntro:
      setting?.aboutIntro || `${siteTitle}, ${defaults.aboutIntro}`,
    aboutApproachTitle: setting?.aboutApproachTitle || "Çalışma yaklaşımımız",
    aboutApproachText: setting?.aboutApproachText || defaults.aboutApproachText,
    aboutScopeTitle: setting?.aboutScopeTitle || "Kimlerle çalışıyoruz",
    aboutScopeText: setting?.aboutScopeText || defaults.aboutScopeText,
    aboutPromiseTitle: setting?.aboutPromiseTitle || "Ne vaat ediyoruz",
    aboutPromiseText: setting?.aboutPromiseText || defaults.aboutPromiseText,
    contactHeroTitle: setting?.contactHeroTitle || "Birlikte planlayalım",
    contactHeroText:
      setting?.contactHeroText ||
      `${siteTitle} ${defaults.contactHeroText}`,
    contactEmail: setting?.contactEmail || CONTACT_PLACEHOLDERS.email,
    contactPhone: setting?.contactPhone || CONTACT_PLACEHOLDERS.phone,
    contactAddress: setting?.contactAddress || CONTACT_PLACEHOLDERS.address,
    contactHours: setting?.contactHours || "Hafta içi 09:00 – 18:00",
    contactMapEmbed: normalizeContactMapEmbed(
      (setting as { contactMapEmbed?: string | null } | null)?.contactMapEmbed,
    ),
    servicesIntro:
      setting?.servicesIntro ||
      "Standart hizmet paketimiz, mali müşavirlik ofisinizin temel ihtiyaçlarını kapsayacak şekilde hazırlanmıştır.",
    titleFont: normalizeTitleFont(setting?.titleFont),
    titleScale: normalizeTitleScale(setting?.titleScale),
    homeHeroTitle: setting?.homeHeroTitle?.trim() || HOME_COPY_DEFAULTS.homeHeroTitle,
    homeHeroText: setting?.homeHeroText?.trim() || HOME_COPY_DEFAULTS.homeHeroText,
    homeHeroPrimaryCta:
      setting?.homeHeroPrimaryCta?.trim() || HOME_COPY_DEFAULTS.homeHeroPrimaryCta,
    homeHeroSecondaryCta:
      setting?.homeHeroSecondaryCta?.trim() ||
      HOME_COPY_DEFAULTS.homeHeroSecondaryCta,
    headerCtaLabel:
      setting?.headerCtaLabel?.trim() || HOME_COPY_DEFAULTS.headerCtaLabel,
    footerCtaTitle:
      setting?.footerCtaTitle?.trim() || HOME_COPY_DEFAULTS.footerCtaTitle,
    footerCtaText:
      setting?.footerCtaText?.trim() || HOME_COPY_DEFAULTS.footerCtaText,
    footerCtaButton:
      setting?.footerCtaButton?.trim() || HOME_COPY_DEFAULTS.footerCtaButton,
  };
}

/** Sitede gösterilecek sosyal medya bağlantıları (yer tutucu adresler hariç). */
export function getActiveSocialLinks(settings: SiteSettings) {
  return [
    { key: "facebook", label: "Facebook", href: settings.facebook },
    { key: "instagram", label: "Instagram", href: settings.instagram },
    { key: "linkedin", label: "LinkedIn", href: settings.linkedin },
    { key: "twitter", label: "X", href: settings.twitter },
    { key: "youtube", label: "YouTube", href: settings.youtube },
    { key: "whatsapp", label: "WhatsApp", href: settings.whatsapp },
  ].filter((item) => isRealSocialUrl(item.href));
}

export function slugify(text: string) {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
