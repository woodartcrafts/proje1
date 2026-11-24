import { IconShieldCheck } from "@/components/Icons";
import { PageHero } from "@/components/PageHero";
import {
  getLegalPages,
  LEGAL_PAGE_DEFS,
  parseLegalText,
  resolveLegalText,
  type LegalPageKey,
} from "@/lib/legal-pages";
import { pageMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";

export async function legalPageMetadata(key: LegalPageKey): Promise<Metadata> {
  const def = LEGAL_PAGE_DEFS.find((item) => item.key === key)!;
  const settings = await getSiteSettings();
  return pageMetadata(settings, {
    title: def.title,
    description: def.description,
    path: def.path,
  });
}

export async function LegalDocument({ pageKey }: { pageKey: LegalPageKey }) {
  const def = LEGAL_PAGE_DEFS.find((item) => item.key === pageKey)!;
  const [settings, stored] = await Promise.all([
    getSiteSettings(),
    getLegalPages(),
  ]);
  const { text } = resolveLegalText(pageKey, stored, {
    siteTitle: settings.siteTitle,
    email: settings.contactEmail,
    phone: settings.contactPhone,
    address: settings.contactAddress,
  });
  const blocks = parseLegalText(text);

  return (
    <>
      <PageHero
        title={def.title}
        description={def.description}
        icon={IconShieldCheck}
      />
      <section className="section">
        <div className="container">
          <article className="legal-text">
            {blocks.map((block, index) => {
              if (block.type === "h") return <h2 key={index}>{block.text}</h2>;
              if (block.type === "ul") {
                return (
                  <ul key={index}>
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={index}>{block.text}</p>;
            })}
          </article>
        </div>
      </section>
    </>
  );
}
