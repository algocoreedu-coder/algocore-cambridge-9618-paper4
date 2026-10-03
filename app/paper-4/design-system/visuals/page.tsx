import type { Metadata } from "next";
import { DocsBody, DocsPage } from "fumadocs-ui/page";

import { LocaleBoundary } from "@/app/components/paper4-learning";
import { VisualFamilyGallery } from "@/app/components/paper4-visual/families";

export const metadata: Metadata = { title: "Paper 4 dynamic visual family gallery" };

export default async function DynamicVisualGalleryPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = await searchParams;
  const lang = query.lang === "vi" ? "vi" : "en";

  return <>
    <LocaleBoundary locale={lang} />
    <DocsPage full tableOfContent={{ enabled: false }} tableOfContentPopover={{ enabled: false }} footer={{ enabled: false }}>
      <DocsBody>
        <VisualFamilyGallery initialLocale={lang} />
      </DocsBody>
    </DocsPage>
  </>;
}
