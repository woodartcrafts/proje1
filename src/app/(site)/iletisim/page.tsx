import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { ContactMap } from "@/components/ContactMap";
import { IconClock, IconMail, IconMapPin, IconPhone } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import { ProfessionalInfoAside } from "@/components/ProfessionalInfo";
import { prisma } from "@/lib/db";
import { getProfessionalInfo } from "@/lib/professional-info";
import { pageMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
import { buildWhatsAppChatUrl } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata(settings, {
    title: "İletişim",
    description: settings.contactHeroText,
    path: "/iletisim",
  });
}

export default async function ContactPage() {
  const [settings, professional, services] = await Promise.all([
    getSiteSettings(),
    getProfessionalInfo(),
    prisma.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { title: true },
    }),
  ]);
  const whatsappUrl = buildWhatsAppChatUrl(
    settings.whatsapp,
    settings.whatsappMessage,
  );

  return (
    <>
      <PageHero
        title={settings.contactHeroTitle}
        description={settings.contactHeroText}
        icon={IconMail}
      />
      <section className="section">
        <div className="container contact-layout">
          <div className="info-panel contact-form-panel">
            <h2 className="panel-title">Görüşme talebi</h2>
            <ContactForm services={services.map((item) => item.title)} />
          </div>
          <aside className="info-panel contact-aside">
            <h2 className="panel-title">Ofis bilgileri</h2>
            <div className="contact-detail">
              <i className="sc-tile sc-tile-sm tone-blue" aria-hidden="true">
                <IconMail size={17} />
              </i>
              <div>
                <span>E-posta</span>
                <strong>{settings.contactEmail}</strong>
              </div>
            </div>
            <div className="contact-detail">
              <i className="sc-tile sc-tile-sm tone-green" aria-hidden="true">
                <IconPhone size={17} />
              </i>
              <div>
                <span>Telefon</span>
                <strong>{settings.contactPhone}</strong>
              </div>
            </div>
            <div className="contact-detail">
              <i className="sc-tile sc-tile-sm tone-amber" aria-hidden="true">
                <IconMapPin size={17} />
              </i>
              <div>
                <span>Adres</span>
                <strong>{settings.contactAddress}</strong>
              </div>
            </div>
            <div className="contact-detail">
              <i className="sc-tile sc-tile-sm tone-red" aria-hidden="true">
                <IconClock size={17} />
              </i>
              <div>
                <span>Çalışma saatleri</span>
                <strong>{settings.contactHours}</strong>
              </div>
            </div>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                className="btn btn-primary contact-wa-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp ile yazın
              </a>
            ) : null}
            <ProfessionalInfoAside info={professional} />
          </aside>
        </div>
        {settings.contactMapEmbed ? (
          <div className="container contact-map-wrap">
            <ContactMap embedSrc={settings.contactMapEmbed} />
          </div>
        ) : null}
      </section>
    </>
  );
}
