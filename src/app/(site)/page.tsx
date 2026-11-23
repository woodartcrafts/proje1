import type { Metadata } from "next";
import Link from "next/link";
import { HeroDocs } from "@/components/HeroDocs";
import { PostCard, ServiceCard, ToolCard } from "@/components/Cards";
import { MaliGelismelerSlider } from "@/components/MaliGelismelerSlider";
import { PortalScene } from "@/components/PortalScene";
import {
  IconBook,
  IconBriefcase,
  IconCalculator,
  IconChecklist,
  IconDownload,
  IconLock,
  IconStatement,
  IconUpload,
} from "@/components/Icons";
import { SectionHeading } from "@/components/SectionHeading";
import { calculatorLinks, type CalculatorLink } from "@/data/calculators";
import { prisma } from "@/lib/db";
import { fetchExternalNews } from "@/lib/external-news";
import { isPortalEnabled } from "@/lib/portal-db";
import { formatPostDate, listPublishedPosts, publishDate } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";

export const revalidate = 1800;

export function generateMetadata(): Metadata {
  const url = absoluteUrl("/");
  return url ? { alternates: { canonical: url } } : {};
}

// Ana sayfada gösterilen hesaplama araçları (tümü için "Tüm araçlar" bağlantısı var).
const featuredCalculatorTitles = [
  "Brüt-Net Bordro",
  "İşveren Maliyeti",
  "Kıdem Tazminatı",
  "KDV Tevkifatı",
  "Vergi Gecikme Faizi",
  "Şahıs vs Limited Vergi",
  "Serbest Meslek Makbuzu",
  "Kredi Hesaplama",
];

const featuredCalculators = featuredCalculatorTitles
  .map((title) => calculatorLinks.find((tool) => tool.title === title))
  .filter((tool): tool is CalculatorLink => Boolean(tool));

const portalFeatures = [
  {
    Icon: IconUpload,
    tone: "blue",
    title: "Belge ve mesaj gönderin",
    text: "Başlık yazın, dosya eklemek isteğe bağlı. PDF, Excel, Word, görsel ve ZIP kabul edilir.",
  },
  {
    Icon: IconDownload,
    tone: "green",
    title: "Ofisten gelenleri indirin",
    text: "Tahakkuk, beyanname ve diğer dosyalar sizin sayfanızda durur.",
  },
  {
    Icon: IconChecklist,
    tone: "amber",
    title: "Eksik belgelerinizi görün",
    text: "Ofisin beklediği belgeler listelenir; dosyayı gönderince talep kapanır.",
  },
  {
    Icon: IconStatement,
    tone: "red",
    title: "Hesap ekstrenize bakın",
    text: "Borç ve ödeme hareketlerinizi bakiyesiyle birlikte izleyin.",
  },
] as const;

export default async function HomePage() {
  const settings = await getSiteSettings();
  const [posts, externalNews, homeServices, portalEnabled] = await Promise.all([
    listPublishedPosts({ take: 3 }),
    settings.externalNewsEnabled
      ? fetchExternalNews(settings.externalNewsUrl, 15)
      : Promise.resolve([]),
    prisma.service.findMany({
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
    isPortalEnabled(),
  ]);

  return (
    <>
      <section className="hero">
        <div className="container hero-shell">
          <div className="hero-content">
            <h1 className="hero-title">{settings.homeHeroTitle}</h1>
            <p className="hero-text">{settings.homeHeroText}</p>
            <div className="hero-actions">
              <Link href="/iletisim" className="btn btn-primary">
                {settings.homeHeroPrimaryCta}
              </Link>
              <Link href="/hizmetler" className="btn btn-ghost">
                {settings.homeHeroSecondaryCta}
              </Link>
            </div>
            {portalEnabled ? (
              <div className="hero-portal">
                <span className="mk-tile mk-tile-sm" aria-hidden="true">
                  <IconLock size={18} />
                </span>
                <p>
                  Mevcut mükellefimiz misiniz?
                  <br />
                  <Link href="/mukellef">Mükellef Köşesi’ne giriş</Link>
                </p>
              </div>
            ) : null}
          </div>
          <HeroDocs />
        </div>
      </section>

      {settings.externalNewsEnabled && externalNews.length > 0 ? (
        <section className="mg-wrap">
          <MaliGelismelerSlider
            items={externalNews}
            label={settings.externalNewsLabel}
          />
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <SectionHeading
            title="Hizmetler"
            icon={IconBriefcase}
            action={
              <Link href="/hizmetler" className="btn btn-secondary">
                Tüm hizmetler
              </Link>
            }
          />
          <div className={`sc-grid ${homeServices.length === 3 ? "sc-grid-3" : "sc-grid-4"}`}>
            {homeServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {portalEnabled ? (
        <section className="mk-band" aria-labelledby="mk-title">
          <div className="container mk-shell">
            <div className="mk-intro">
              <h2 id="mk-title" className="mk-title">
                Mükellef Köşesi
              </h2>
              <p className="mk-lead">
                Ofisle yazışmanız ve belge alışverişiniz tek yerde toplanır;
                dosyalar mesaj trafiğinde kaybolmaz.
              </p>

              <ul className="mk-features">
                {portalFeatures.map(({ Icon, tone, title, text }) => (
                  <li key={title} className="mk-feature">
                    <span className={`mk-tile is-${tone}`} aria-hidden="true">
                      <Icon size={24} />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mk-actions">
                <Link href="/mukellef" className="btn btn-primary mk-cta">
                  <IconLock size={18} />
                  Mükellef Girişi
                </Link>
                <p className="mk-note">
                  Hesabınızı ofisimiz açar; giriş davetiniz size iletilir.
                </p>
              </div>
            </div>

            <PortalScene />
          </div>
        </section>
      ) : null}

      <section className="section band-section">
        <div className="container">
          <SectionHeading
            title="Blog"
            icon={IconBook}
            action={
              <Link href="/blog" className="btn btn-secondary">
                Tüm yazılar
              </Link>
            }
          />
          {posts.length === 0 ? (
            <div className="sc-grid sc-grid-3">
              <article className="sc-card tone-blue" data-reveal>
                <h3>Yazılar yakında</h3>
                <p>Vergi ve muhasebe gündemine dair yazılarımız burada yayımlanacak.</p>
              </article>
            </div>
          ) : (
            <div className="sc-grid sc-grid-3">
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  title={post.title}
                  excerpt={post.excerpt}
                  dateISO={publishDate(post).toISOString()}
                  dateLabel={formatPostDate(publishDate(post))}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section band-section" id="hesaplamalar">
        <div className="container">
          <SectionHeading
            title="Hesaplama araçları"
            icon={IconCalculator}
            action={
              <a
                href="https://www.ozcankutlu.com/tr"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Tüm araçlar
              </a>
            }
          />

          <div className="sc-grid sc-grid-4">
            {featuredCalculators.map((tool, index) => (
              <ToolCard
                key={`${tool.href}-${tool.title}`}
                href={tool.href}
                title={tool.title}
                description={tool.description}
                index={index}
                cta="Aracı aç"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
