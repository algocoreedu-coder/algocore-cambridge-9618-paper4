import { NextResponse } from "next/server";
import { getRunningPaper2BuildId } from "@/app/lib/paper2/build-identity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  const buildId = getRunningPaper2BuildId();
  return NextResponse.json({ buildId }, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
