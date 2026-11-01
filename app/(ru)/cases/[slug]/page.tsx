import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { STUDIO_CASES, caseBySlug } from "@/components/studio/studio-cases";
import { STUDIO_SITE_URL } from "@/components/studio/studio-content";
import { StudioCasePage } from "@/components/studio/studio-page";

export const dynamicParams = false;

export function generateStaticParams() {
  return STUDIO_CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const study = caseBySlug((await params).slug);
  if (!study) return {};
  const title = `${study.title} — кейс Студии Лемнити`;
  const url = `${STUDIO_SITE_URL}/cases/${study.slug}/`;
  return {
    title,
    description: study.lead,
    alternates: { canonical: url },
    openGraph: { type: "article", locale: "ru_RU", url, title, description: study.lead, images: [study.shots.hero] },
  };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!caseBySlug(slug)) notFound();
  return <StudioCasePage slug={slug} />;
}
