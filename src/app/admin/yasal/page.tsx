import Link from "next/link";
import { redirect } from "next/navigation";
import { LegalPagesForm } from "@/components/admin/LegalPagesForm";
import { getSession } from "@/lib/auth";
import {
  buildLegalDefaults,
  getLegalPages,
  LEGAL_PAGE_DEFS,
  resolveLegalText,
  type LegalPageKey,
  type LegalPagesContent,
} from "@/lib/legal-pages";
import { getSiteSettings } from "@/lib/settings";

export default async function AdminYasalPage() {
  const session = await getSession();
  if (!session) redirect("/admin/giris");

  const [settings, stored] = await Promise.all([
    getSiteSettings(),
    getLegalPages(),
  ]);

  const ctx = {
    siteTitle: settings.siteTitle,
    email: settings.contactEmail,
    phone: settings.contactPhone,
    address: settings.contactAddress,
  };
  const defaults = buildLegalDefaults(ctx);

  const pages = {} as LegalPagesContent;
  const customFlags = {} as Record<LegalPageKey, boolean>;
  for (const def of LEGAL_PAGE_DEFS) {
    const resolved = resolveLegalText(def.key, stored, ctx);
    pages[def.key] = resolved.text;
    customFlags[def.key] = resolved.isCustom;
  }

  return (
    <>
      <div className="admin-top">
        <h2>Yasal Metinler</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {LEGAL_PAGE_DEFS.map((item) => (
            <Link
              key={item.key}
              href={item.path}
              target="_blank"
              className="btn btn-secondary"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="admin-panel" style={{ maxWidth: 820 }}>
        <p style={{ marginTop: 0, color: "var(--ink-soft)" }}>
          Gizlilik politikası, çerez politikası ve kullanım koşulları sayfalarını
          buradan düzenlersiniz. Boş bırakırsanız site unvanı ve iletişim
          bilgilerinden üretilen hazır şablon kullanılır.
        </p>
        <p style={{ color: "var(--ink-soft)" }}>
          <strong>Önemli:</strong> Hazır metinler genel şablondur, hukuki görüş
          değildir. Yayına almadan önce müşterinin gerçek uygulamasıyla
          uyuştuğunu kontrol edin. Analiz veya reklam kodu eklenirse çerez
          metnini güncelleyin.
        </p>
        <p style={{ color: "var(--ink-soft)", marginBottom: 0 }}>
          KVKK aydınlatma metni ayrıdır:{" "}
          <Link href="/admin/kvkk">KVKK Metni</Link>
          {Object.values(customFlags).some(Boolean)
            ? " — yıldız (*) olan sekmelerde özel metin aktif."
            : ""}
        </p>
      </div>

      <div className="admin-panel" style={{ maxWidth: 820, marginTop: "1.5rem" }}>
        <LegalPagesForm pages={pages} customFlags={customFlags} />
      </div>

      {!Object.values(customFlags).some(Boolean) ? (
        <p className="form-hint" style={{ maxWidth: 820 }}>
          Şablon örneği (gizlilik) yaklaşık {defaults.gizlilik.length} karakter.
        </p>
      ) : null}
    </>
  );
}
