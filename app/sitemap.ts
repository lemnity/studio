import type { MetadataRoute } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${STUDIO_SITE_URL}/`, changeFrequency: "monthly", priority: 1 }];
}
