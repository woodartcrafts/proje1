import type { MetadataRoute } from "next";
import { listPublishedPosts, modifiedDate } from "@/lib/posts";
import { getSiteUrl } from "@/lib/seo";

// Yeni blog yazıları sitemap'e build beklemeden girsin diye her istekte üretilir.
export const dynamic = "force-dynamic";

const staticPages = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/hizmetler", changeFrequency: "monthly", priority: 0.9 },
  { path: "/hakkimizda", changeFrequency: "yearly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/iletisim", changeFrequency: "yearly", priority: 0.6 },
  { path: "/yararli-linkler", changeFrequency: "monthly", priority: 0.4 },
  { path: "/kvkk", changeFrequency: "yearly", priority: 0.3 },
  { path: "/gizlilik", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cerez", changeFrequency: "yearly", priority: 0.3 },
  { path: "/kullanim-kosullari", changeFrequency: "yearly", priority: 0.3 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  if (!base) return [];

  const posts = (await listPublishedPosts()).map((post) => ({
    slug: post.slug,
    updatedAt: modifiedDate(post),
  }));

  const newest = posts.reduce<Date | undefined>(
    (latest, post) =>
      !latest || post.updatedAt > latest ? post.updatedAt : latest,
    undefined,
  );

  return [
    // lastModified yalnızca gerçek bir tarih varsa yazılır (uydurma tarih verilmez).
    ...staticPages.map((page) => ({
      url: `${base}${page.path === "/" ? "" : page.path}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      ...(page.path === "/blog" && newest ? { lastModified: newest } : {}),
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
