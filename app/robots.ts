import type { MetadataRoute } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${STUDIO_SITE_URL}/sitemap.xml` };
}
