import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { IconCompass, IconLayers, IconShieldCheck, IconUsers } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import { ProfessionalInfoSection } from "@/components/ProfessionalInfo";
import { aboutPhotoSource, getAboutPhoto } from "@/lib/about-photo";
import { getProfessionalInfo } from "@/lib/professional-info";
import { pageMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return pageMetadata(settings, {
    title: "Hakkımda",
    description: settings.aboutIntro,
    path: "/hakkimizda",
  });
}

export default async function AboutPage() {
  const [settings, professional, photo] = await Promise.all([
    getSiteSettings(),
    getProfessionalInfo(),
    getAboutPhoto(),
  ]);
  const { src, isSample } = aboutPhotoSource(photo);

  const cards = [
    {
      tone: "blue",
      icon: <IconCompass size={26} />,
      title: settings.aboutApproachTitle,
      text: settings.aboutApproachText,
    },
    {
      tone: "green",
      icon: <IconLayers size={26} />,
      title: settings.aboutScopeTitle,
      text: settings.aboutScopeText,
    },
    {
      tone: "red",
      icon: <IconShieldCheck size={26} />,
      title: settings.aboutPromiseTitle,
      text: settings.aboutPromiseText,
      accent: true,
    },
  ];

  const cardNodes = cards.map((card, index) => (
    <article
      key={card.title}
      className={`sc-card about-card tone-${card.tone}${card.accent ? " is-accent" : ""}`}
      data-tilt
      data-reveal
      style={{ "--i": index } as CSSProperties}
    >
      <span className="sc-tile sc-tile-lg" aria-hidden="true">
        {card.icon}
      </span>
      <h2>{card.title}</h2>
      <p>{card.text}</p>
    </article>
  ));

  return (
    <>
      <PageHero
        title="Hakkımda"
        description={settings.aboutIntro}
        icon={IconUsers}
      />

      <section className="section">
        {photo.show ? (
          <div className="container about-split">
            <figure className="about-photo" data-reveal>
              <div className="about-photo-stage">
                <div className="about-photo-frame" data-tilt>
                  <Image
                    src={src}
                    alt={settings.siteTitle}
                    fill
                    sizes="(max-width: 860px) 80vw, 368px"
                    // Yüklenen fotoğraf kendi rotamızdan gelir (sürüm parametreli); örnek görsel public'ten.
                    unoptimized={!isSample}
                    priority
                    className="about-photo-img"
                  />
                </div>
              </div>
              <figcaption>{settings.siteTitle}</figcaption>
            </figure>
            <div className="about-stack">{cardNodes}</div>
          </div>
        ) : (
          <div className="container sc-grid sc-grid-3">{cardNodes}</div>
        )}
      </section>

      <ProfessionalInfoSection info={professional} />
    </>
  );
}
