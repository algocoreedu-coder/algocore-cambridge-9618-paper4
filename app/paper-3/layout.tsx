import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Paper3Shell } from "@/app/components/paper3-learning/Paper3Shell";
import { getCatalog } from "@/app/lib/paper3/catalog";

export const metadata: Metadata = {
  title: { default: "Paper 3 Study Map · AlgoCore", template: "%s · AlgoCore Paper 3" },
  description: "Explore Cambridge 9618 Paper 3: eight sections, topic connections and a visual learning journey.",
};

export default function Paper3Layout({ children }: { readonly children: ReactNode }) {
  return <Paper3Shell catalog={getCatalog()}>{children}</Paper3Shell>;
}
