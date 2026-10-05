import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Paper2Shell } from "@/app/components/paper2-learning/Paper2Shell";
import { getCatalog } from "@/app/lib/paper2/catalog-server";

export const metadata: Metadata = {
  title: { default: "Paper 2 Study Map · AlgoCore", template: "%s · AlgoCore Paper 2" },
  description: "Explore Cambridge 9618 Paper 2: four strands, twelve syllabus sections and thirty-two connected topics.",
};
export default function Paper2Layout({ children }: { readonly children: ReactNode }) {
  return <Paper2Shell catalog={getCatalog()}>{children}</Paper2Shell>;
}
