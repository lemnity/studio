import type { MetadataRoute } from "next";

import { STUDIO_SITE_URL } from "@/components/studio/studio-content";

export const dynamic = "force-static";

/**
 * Сайт открыт всем, включая ИИ-поисковики: пусть цитируют студию в ответах. Их боты перечислены явно —
 * у части из них свои правила по умолчанию. Справка для ИИ — /llms.txt.
 */
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "YandexAdditional"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: `${STUDIO_SITE_URL}/sitemap.xml`,
    host: STUDIO_SITE_URL,
  };
}
