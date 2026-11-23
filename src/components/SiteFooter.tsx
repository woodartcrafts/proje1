import Image from "next/image";
import Link from "next/link";
import {
  IconArrowUp,
  IconCalendarCheck,
  IconChevron,
  IconClock,
  IconLock,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@/components/Icons";
import type { SiteSettings } from "@/lib/settings";
import { SocialLinks } from "./SocialLinks";

const footerLinks = [
  { href: "/hakkimizda", label: "Hakkımda" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/blog", label: "Blog" },
  { href: "/yararli-linkler", label: "Yararlı Linkler" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
];

export function SiteFooter({
  settings,
  logoSrc,
  portalEnabled = false,
}: {
  settings: SiteSettings;
  /** Alt bilgi logosu (`/logo?v=` veya varsayılan `/smmm.png`). */
  logoSrc: string;
  portalEnabled?: boolean;
}) {
  const phoneHref = `tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`;

  return (
    <footer className="site-footer sc-footer">
      <div className="container">
        <div className="sc-footer-cta" data-reveal>
          <div>
            <h2>{settings.footerCtaTitle}</h2>
            <p>{settings.footerCtaText}</p>
          </div>
          <div className="sc-footer-cta-actions">
            <Link href="/iletisim" className="btn btn-primary sc-shine">
              <IconCalendarCheck size={18} />
              {settings.footerCtaButton}
            </Link>
            {portalEnabled ? (
              <Link href="/mukellef" className="btn btn-ghost">
                <IconLock size={17} />
                Mükellef Girişi
              </Link>
            ) : null}
          </div>
        </div>

        <div className="footer-grid sc-footer-grid">
          <div>
            <div className="sc-footer-brand">
              <span className="brand-mark" aria-hidden="true">
                <Image
                  src={logoSrc}
                  alt=""
                  width={40}
                  height={40}
                  className="brand-logo"
                  unoptimized={logoSrc.startsWith("/logo")}
                />
              </span>
              <p className="footer-brand">{settings.siteTitle}</p>
            </div>
            <p className="footer-text">
              Şirketlerin ve serbest meslek sahiplerinin vergi, muhasebe ve
              danışmanlık ihtiyaçları için güvenilir çözüm ortağı.
            </p>
            <SocialLinks settings={settings} variant="light" />
          </div>

          <nav aria-label="Alt menü">
            <p className="footer-heading">Keşfet</p>
            <div className="footer-links">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <IconChevron size={14} />
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div>
            <p className="footer-heading">İletişim</p>
            <ul className="sc-contact-list">
              <li>
                <span className="sc-tile sc-tile-sm tone-blue" aria-hidden="true">
                  <IconMail size={17} />
                </span>
                <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              </li>
              <li>
                <span className="sc-tile sc-tile-sm tone-green" aria-hidden="true">
                  <IconPhone size={17} />
                </span>
                <a href={phoneHref}>{settings.contactPhone}</a>
              </li>
              <li>
                <span className="sc-tile sc-tile-sm tone-amber" aria-hidden="true">
                  <IconMapPin size={17} />
                </span>
                <span>{settings.contactAddress}</span>
              </li>
              <li>
                <span className="sc-tile sc-tile-sm tone-red" aria-hidden="true">
                  <IconClock size={17} />
                </span>
                <span>{settings.contactHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container footer-bottom sc-footer-bottom">
        <p>
          © {new Date().getFullYear()} {settings.siteTitle}. Tüm hakları
          saklıdır.
        </p>
        <a href="#" className="sc-top" aria-label="Sayfanın başına dön">
          <IconArrowUp size={18} />
        </a>
      </div>
    </footer>
  );
}
