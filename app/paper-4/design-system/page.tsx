import type { Metadata } from "next";
import { DocsBody, DocsPage } from "fumadocs-ui/page";

import { LocaleBoundary } from "@/app/components/paper4-learning";
import { DS2Gallery } from "./DS2Gallery";

export const metadata: Metadata = { title: "AlgoCore DS2 component gallery" };

export default async function DesignSystemGalleryPage({ searchParams }: Readonly<{ searchParams: Promise<Record<string, string | string[] | undefined>> }>) {
  const query = await searchParams;
  const lang = query.lang === "vi" ? "vi" : "en";
  return <>
    <LocaleBoundary locale={lang} />
    <DocsPage full tableOfContent={{ enabled: false }} tableOfContentPopover={{ enabled: false }} footer={{ enabled: false }}>
      <DocsBody>
        <DS2Gallery initialLocale={lang} />
      </DocsBody>
    </DocsPage>
  </>;
}
