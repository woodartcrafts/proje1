import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Arama motorları ve yapay zekâ botları (GPTBot, ClaudeBot, PerplexityBot vb.)
// varsayılan olarak "*" kuralına tabidir; yönetim paneli ve mükellef köşesi dışında her şeye izin verilir.
export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/mukellef", "/api"],
    },
    ...(sitemap ? { sitemap } : {}),
  };
}
