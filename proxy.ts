import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const locale = request.nextUrl.searchParams.get("lang") === "vi" ? "vi" : "en";
  requestHeaders.set("x-algocore-locale", locale);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/paper-4/:path*"],
};
