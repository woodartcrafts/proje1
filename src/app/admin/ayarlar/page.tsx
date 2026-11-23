import { redirect } from "next/navigation";
import { HeroDocsForm } from "@/components/admin/HeroDocsForm";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { SiteLogoForm } from "@/components/admin/SiteLogoForm";
import { getSession } from "@/lib/auth";
import { getHeroDocs } from "@/lib/hero-docs";
import { getSiteSettings } from "@/lib/settings";
import {
  DEFAULT_LOGO_SRC,
  PHOTO_MAX_BYTES,
  getSiteLogo,
} from "@/lib/site-logo";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/giris");

  const [settings, logo, heroDocs] = await Promise.all([
    getSiteSettings(),
    getSiteLogo(),
    getHeroDocs(),
  ]);

  return (
    <>
      <div className="admin-top">
        <h2>Site Ayarları</h2>
      </div>

      <div className="admin-panel" style={{ maxWidth: 760, marginBottom: "1.25rem" }}>
        <h3 className="admin-subtitle" style={{ marginTop: 0 }}>
          Logo
        </h3>
        <p className="form-hint">
          Üst menüdeki ve sayfa altındaki kare logo. Yüklemezseniz varsayılan
          logo kullanılır.
        </p>
        <SiteLogoForm
          hasUpload={Boolean(logo.ext)}
          version={logo.version}
          defaultSrc={DEFAULT_LOGO_SRC}
          maxMb={PHOTO_MAX_BYTES / 1024 / 1024}
        />
      </div>

      <div className="admin-panel" style={{ maxWidth: 760, marginBottom: "1.25rem" }}>
        <h3 className="admin-subtitle" style={{ marginTop: 0 }}>
          Ana sayfa evrak görseli
        </h3>
        <HeroDocsForm sheets={heroDocs} />
      </div>

      <div className="admin-panel" style={{ maxWidth: 760 }}>
        <SettingsForm settings={settings} />
      </div>
    </>
  );
}
