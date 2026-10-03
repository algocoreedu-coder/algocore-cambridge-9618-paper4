import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  STUDENT_SESSION_COOKIE,
  verifyStudentSessionToken,
} from "@/app/lib/auth";

import { Paper4DocsLayout } from "./Paper4DocsLayout";

export default async function Paper4Layout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const sessionToken = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (!verifyStudentSessionToken(sessionToken)) {
    const language = requestHeaders.get("x-algocore-locale") === "vi" ? "vi" : "en";
    const next = encodeURIComponent(`/paper-4?lang=${language}`);
    redirect(`/login?lang=${language}&next=${next}`);
  }

  return <Paper4DocsLayout>{children}</Paper4DocsLayout>;
}
