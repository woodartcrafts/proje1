import { prisma } from "./db";
import { parseLegalText } from "./kvkk-text";

export { parseLegalText };

export const LEGAL_TEXT_MAX = 20000;

export type LegalPageKey = "gizlilik" | "cerez" | "kullanim";

export type LegalPageDef = {
  key: LegalPageKey;
  path: string;
  title: string;
  description: string;
};

export const LEGAL_PAGE_DEFS: LegalPageDef[] = [
  {
    key: "gizlilik",
    path: "/gizlilik",
    title: "Gizlilik Politikası",
    description:
      "Kişisel verilerinizin ve site kullanım bilgilerinizin nasıl korunduğunu açıklar.",
  },
  {
    key: "cerez",
    path: "/cerez",
    title: "Çerez Politikası",
    description:
      "Sitede hangi çerezlerin kullanılabileceğini ve tercihlerinizi açıklar.",
  },
  {
    key: "kullanim",
    path: "/kullanim-kosullari",
    title: "Kullanım Koşulları",
    description:
      "İnternet sitesinin kullanımına ilişkin genel kuralları açıklar.",
  },
];

export type LegalPagesContent = Record<LegalPageKey, string>;

type TemplateCtx = {
  siteTitle: string;
  email: string;
  phone: string;
  address: string;
};

function defaultGizlilik(c: TemplateCtx): string {
  return [
    `Bu gizlilik politikası, ${c.siteTitle} internet sitesinin ziyaretçilerine ve iletişim kanallarını kullanan kişilere yönelik genel bilgilendirme amacıyla hazırlanmıştır. Hukuki görüş niteliği taşımaz.`,
    "",
    "## 1. Kapsam",
    "Bu politika; web sitesi ziyareti, iletişim / görüşme talebi formu, isteğe bağlı WhatsApp veya e-posta yoluyla kurulan iletişim ve (açıksa) Mükellef Köşesi kullanımına ilişkin genel ilkeleri kapsar.",
    "",
    "## 2. Toplanan bilgiler",
    "İletişim formunda ad soyad, e-posta, telefon (isteğe bağlı) ve mesaj içeriği toplanabilir. Teknik olarak sunucu erişim kayıtları (IP, tarayıcı bilgisi vb.) altyapı sağlayıcısı tarafından tutulabilir.",
    "",
    "## 3. Kullanım amaçları",
    "- Talebinize yanıt vermek ve iletişimi sürdürmek",
    "- Hizmetlerimizi sunmak ve iyileştirmek",
    "- Güvenlik, kötüye kullanımın önlenmesi ve yasal yükümlülükler",
    "",
    "## 4. Paylaşım",
    "Verileriniz, talebinizi yerine getirmek için gerekli olduğunda barındırma, e-posta ve benzeri hizmet sağlayıcılarıyla sınırlı şekilde paylaşılabilir. Yasal zorunluluk olmadıkça üçüncü kişilere pazarlama amacıyla satılmaz.",
    "",
    "## 5. Saklama",
    "İletişim kayıtları, talebin takibi ve yasal yükümlülükler için gerekli süre boyunca saklanır; süre sonunda silinir veya anonimleştirilir.",
    "",
    "## 6. Haklarınız",
    "KVKK kapsamındaki haklarınız ve başvuru yolları için sitedeki KVKK Aydınlatma Metni’ne bakınız.",
    "",
    "## 7. İletişim",
    `- E-posta: ${c.email}`,
    `- Telefon: ${c.phone}`,
    `- Adres: ${c.address}`,
    "",
    "## 8. Güncellemeler",
    "Bu metin güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır.",
  ].join("\n");
}

function defaultCerez(c: TemplateCtx): string {
  return [
    `Bu çerez politikası, ${c.siteTitle} internet sitesinde kullanılan çerezler hakkında bilgilendirme amacıyla hazırlanmıştır.`,
    "",
    "## 1. Çerez nedir?",
    "Çerezler, bir siteyi ziyaret ettiğinizde tarayıcınızda saklanan küçük metin dosyalarıdır. Oturumun sürmesi, tercihlerin hatırlanması veya (açıksa) istatistik toplamak için kullanılabilir.",
    "",
    "## 2. Bu sitede kullanılan çerezler",
    "Zorunlu / teknik çerezler: Yönetim paneli veya Mükellef Köşesi girişi yapıldığında oturumun devamı için teknik çerezler kullanılabilir. Bunlar sitenin temel işlevi için gereklidir.",
    "",
    "Analiz çerezleri (isteğe bağlı): Site yöneticisi Google Analytics 4 (veya benzeri) ölçüm kimliğini etkinleştirmişse, ziyaret istatistikleri için üçüncü taraf analiz çerezleri / benzeri teknolojiler yüklenebilir. Bu durumda veriler ilgili sağlayıcının altyapısında işlenebilir.",
    "",
    "Reklam çerezleri: Bu şablon varsayılan olarak reklam / yeniden pazarlama çerezleri kullanıldığını varsaymaz. Siteye reklam kodu eklenirse bu bölüm güncellenmelidir.",
    "",
    "## 3. Çerezleri yönetme",
    "Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezleri engellemek bazı oturum özelliklerinin çalışmamasına yol açabilir.",
    "",
    "## 4. Daha fazla bilgi",
    "Kişisel verilerin işlenmesi hakkında ayrıntılar için KVKK Aydınlatma Metni ve Gizlilik Politikası sayfalarına bakınız.",
    "",
    `İletişim: ${c.email}`,
  ].join("\n");
}

function defaultKullanim(c: TemplateCtx): string {
  return [
    `İşbu kullanım koşulları, ${c.siteTitle} internet sitesinin (“Site”) kullanımına ilişkin genel kuralları belirler.`,
    "",
    "## 1. Kabul",
    "Siteyi kullanarak bu koşulları okuduğunuzu ve kabul ettiğinizi beyan etmiş sayılırsınız. Kabul etmiyorsanız Site’yi kullanmayınız.",
    "",
    "## 2. Hizmetin niteliği",
    "Sitedeki içerikler genel bilgilendirme amaçlıdır; somut bir hukuki, mali veya yatırım tavsiyesi oluşturmaz. Hesaplama araçları tahmini sonuç üretebilir; resmi beyanname veya kesin hesap yerine geçmez.",
    "",
    "## 3. Kullanıcı yükümlülükleri",
    "- Siteyi hukuka aykırı, zararlı veya kötüye kullanıma yol açacak şekilde kullanmamak",
    "- İletişim formuna özel nitelikli kişisel veri, kimlik/banka bilgisi yazmamak",
    "- Başkalarının haklarını ihlal eden içerik göndermemek",
    "",
    "## 4. Fikri haklar",
    "Site tasarımı, metinler ve marka unsurları ilgili hak sahiplerine aittir. İzinsiz kopyalama, çoğaltma veya ticari kullanım yasaktır.",
    "",
    "## 5. Dış bağlantılar",
    "Sitede üçüncü taraf sitelere (ör. hesaplama araçları, resmi kurumlar) bağlantı bulunabilir. Bu sitelerin içeriğinden Site işletmecisi sorumlu değildir.",
    "",
    "## 6. Sorumluluğun sınırları",
    "Site “olduğu gibi” sunulur. Kesintisiz veya hatasız çalışma garanti edilmez. Site kullanımından doğan dolaylı zararlardan, yürürlükteki zorunlu hükümler saklı kalmak kaydıyla, sorumluluk kabul edilmez.",
    "",
    "## 7. Değişiklikler",
    "Bu koşullar güncellenebilir. Güncel metin bu sayfada yayımlanır.",
    "",
    "## 8. İletişim",
    `- ${c.siteTitle}`,
    `- ${c.email} · ${c.phone}`,
    `- ${c.address}`,
  ].join("\n");
}

export function buildLegalDefaults(ctx: TemplateCtx): LegalPagesContent {
  return {
    gizlilik: defaultGizlilik(ctx),
    cerez: defaultCerez(ctx),
    kullanim: defaultKullanim(ctx),
  };
}

export function emptyLegalPages(): LegalPagesContent {
  return { gizlilik: "", cerez: "", kullanim: "" };
}

export function parseLegalPages(raw: string | null | undefined): LegalPagesContent {
  const empty = emptyLegalPages();
  if (!raw?.trim()) return empty;
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) return empty;
    const record = data as Record<string, unknown>;
    const out = emptyLegalPages();
    for (const key of ["gizlilik", "cerez", "kullanim"] as const) {
      const value = record[key];
      if (typeof value === "string") {
        out[key] = value.trim().slice(0, LEGAL_TEXT_MAX);
      }
    }
    return out;
  } catch {
    return empty;
  }
}

export function resolveLegalText(
  key: LegalPageKey,
  stored: LegalPagesContent,
  ctx: TemplateCtx,
): { text: string; isCustom: boolean } {
  const custom = stored[key]?.trim() ?? "";
  if (custom) return { text: custom, isCustom: true };
  return { text: buildLegalDefaults(ctx)[key], isCustom: false };
}

export async function getLegalPages(): Promise<LegalPagesContent> {
  try {
    const rows = await prisma.$queryRaw<{ legalPages: string | null }[]>`
      SELECT "legalPages" FROM "Setting" WHERE "id" = 'main' LIMIT 1
    `;
    return parseLegalPages(rows[0]?.legalPages);
  } catch {
    return emptyLegalPages();
  }
}

export async function saveLegalPages(content: LegalPagesContent): Promise<void> {
  const payload: LegalPagesContent = {
    gizlilik: content.gizlilik.trim().slice(0, LEGAL_TEXT_MAX),
    cerez: content.cerez.trim().slice(0, LEGAL_TEXT_MAX),
    kullanim: content.kullanim.trim().slice(0, LEGAL_TEXT_MAX),
  };
  const json = JSON.stringify(payload);

  await prisma.setting.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", siteTitle: "Mali Müşavirlik" },
  });

  await prisma.$executeRaw`
    UPDATE "Setting" SET "legalPages" = ${json} WHERE "id" = 'main'
  `;
}

export function legalPageByPath(path: string): LegalPageDef | undefined {
  return LEGAL_PAGE_DEFS.find((item) => item.path === path);
}
