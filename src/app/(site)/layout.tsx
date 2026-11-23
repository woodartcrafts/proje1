import { Ga4 } from "@/components/Ga4";
import { JsonLd } from "@/components/JsonLd";
import { SiteEffects } from "@/components/SiteEffects";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { isPortalEnabled } from "@/lib/portal-db";
import { buildSiteGraph } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
import { getSiteLogo, siteLogoSource } from "@/lib/site-logo";
import { titleCssVars } from "@/lib/title-fonts";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, portalEnabled, logo] = await Promise.all([
    getSiteSettings(),
    isPortalEnabled(),
    getSiteLogo(),
  ]);

  // Ayarlar'dan seçilen başlık yazı tipi/boyutu; header ve footer bu değişkenleri CSS'te okur.
  const title = titleCssVars(settings.titleFont, settings.titleScale);
  const { src: logoSrc } = siteLogoSource(logo);

  return (
    <div
      className="min-h-full flex flex-col"
      style={title.style}
      data-title-custom={title.custom ? "" : undefined}
    >
      <Ga4 measurementId={settings.ga4MeasurementId} />
      <JsonLd data={buildSiteGraph(settings, logoSrc)} />
      <SiteEffects />
      <SiteHeader
        settings={settings}
        logoSrc={logoSrc}
        portalEnabled={portalEnabled}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        settings={settings}
        logoSrc={logoSrc}
        portalEnabled={portalEnabled}
      />
      <WhatsAppFloat
        href={settings.whatsapp}
        message={settings.whatsappMessage}
        enabled={settings.whatsappFloat}
      />
    </div>
  );
}
