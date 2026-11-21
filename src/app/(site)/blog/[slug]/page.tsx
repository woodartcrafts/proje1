import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { BlogViewBeacon } from "@/components/BlogViewBeacon";
import { IconArrow, IconBook, IconCalendarCheck, IconChevron } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { PostContent } from "@/components/PostContent";
import { countWords, parsePostContent } from "@/lib/post-content";
import {
  findPostBySlug,
  formatPostDate,
  listPublishedPosts,
  modifiedDate,
  publishDate,
} from "@/lib/posts";
import {
  absoluteUrl,
  clip,
  getSiteUrl,
  organizationRef,
  pageMetadata,
} from "@/lib/seo";
import { getSiteSettings } from "@/lib/settings";

type Props = {
  params: Promise<{ slug: string }>;
};

// generateMetadata ve sayfa aynı sorguyu paylaşsın.
const getPost = cache(findPostBySlug);

/** Görsel adresine değişiklik damgası eklenir; başlık değişince paylaşım önbelleği yenilensin. */
function ogImageUrl(slug: string, updatedAt: Date): string | null {
  return absoluteUrl(`/blog/${slug}/og?v=${updatedAt.getTime()}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPost(slug);
  if (result.kind === "moved") return {}; // sayfa yönlendirilecek
  if (result.kind === "missing") return { title: "Yazı bulunamadı" };

  const { post } = result;
  const settings = await getSiteSettings();
  return pageMetadata(settings, {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    article: {
      publishedTime: publishDate(post).toISOString(),
      modifiedTime: modifiedDate(post).toISOString(),
    },
    image: ogImageUrl(post.slug, modifiedDate(post)),
    feed: true,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPost(slug);

  if (result.kind === "moved") permanentRedirect(`/blog/${result.slug}`);
  if (result.kind === "missing") notFound();

  const { post } = result;
  const [settings, others] = await Promise.all([
    getSiteSettings(),
    listPublishedPosts({ take: 3, excludeId: post.id }),
  ]);

  const blocks = parsePostContent(post.content);
  const published = publishDate(post);
  const modified = modifiedDate(post);
  const postUrl = absoluteUrl(`/blog/${post.slug}`);
  const homeUrl = absoluteUrl("/");
  const blogUrl = absoluteUrl("/blog");
  const image = ogImageUrl(post.slug, modified);
  const organization = organizationRef(settings);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        ...(postUrl ? { "@id": `${postUrl}#article`, url: postUrl, mainEntityOfPage: postUrl } : {}),
        headline: clip(post.title, 110),
        description: clip(post.seoDescription || post.excerpt, 300),
        ...(image ? { image: [image] } : {}),
        datePublished: published.toISOString(),
        dateModified: modified.toISOString(),
        wordCount: countWords(blocks),
        inLanguage: "tr",
        author: post.authorName
          ? { "@type": "Person", name: post.authorName, worksFor: organization }
          : organization,
        publisher: organization,
      },
      ...(homeUrl && blogUrl && postUrl
        ? [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: homeUrl },
                { "@type": "ListItem", position: 2, name: "Blog", item: blogUrl },
                { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
              ],
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <BlogViewBeacon slug={post.slug} />
      <JsonLd data={structuredData} />
      <PageHero
        kicker={
          <time dateTime={published.toISOString()}>{formatPostDate(published)}</time>
        }
        title={post.title}
        description={post.excerpt}
        icon={IconBook}
      />
      <section className="section">
        <div className="container article-shell">
          <article className="content-block article-body">
            {post.authorName ? (
              <p className="post-byline">
                Yazan: <strong>{post.authorName}</strong>
              </p>
            ) : null}
            <PostContent blocks={blocks} siteOrigin={getSiteUrl()} />
          </article>

          <aside className="post-cta" aria-label="Görüşme talebi">
            <span className="sc-tile sc-tile-lg tone-red" aria-hidden="true">
              <IconCalendarCheck size={26} />
            </span>
            <p>
              Bu konuda sorularınız varsa görüşme talep edebilirsiniz; talebinize
              en kısa sürede dönüş yapılır.
            </p>
            <Link href="/iletisim" className="btn btn-primary sc-shine">
              {settings.homeHeroPrimaryCta}
            </Link>
          </aside>

          {others.length > 0 ? (
            <section className="related-posts" aria-labelledby="related-title">
              <h2 id="related-title">Diğer yazılar</h2>
              <ul>
                {others.map((other) => {
                  const date = publishDate(other);
                  return (
                    <li key={other.id}>
                      <Link href={`/blog/${other.slug}`}>
                        <span className="related-text">
                          <span className="related-title">{other.title}</span>
                          <time className="post-meta" dateTime={date.toISOString()}>
                            {formatPostDate(date)}
                          </time>
                        </span>
                        <IconChevron size={18} className="related-go" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <Link href="/blog" className="btn btn-secondary back-link">
            <IconArrow size={16} className="back-arrow" />
            Tüm yazılara dön
          </Link>
        </div>
      </section>
    </>
  );
}
