import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  safeLearningPath,
  STUDENT_SESSION_COOKIE,
  studentSessionCookieOptions,
  verifyStudentSessionToken,
} from "./app/lib/auth";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const locale = request.nextUrl.searchParams.get("lang") === "vi" ? "vi" : "en";
  requestHeaders.set("x-algocore-locale", locale);

  if (request.nextUrl.pathname.startsWith("/paper2-visuals/")) {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "private, no-store, max-age=0" } });
  }

  const sessionToken = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
  const hasValidSession = verifyStudentSessionToken(sessionToken);

  if (request.nextUrl.pathname === "/login") {
    if (hasValidSession) {
      const redirectTo = safeLearningPath(request.nextUrl.searchParams.get("next"), locale);
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!hasValidSession) {
    const loginUrl = new URL("/login", request.url);
    const requestedPath = safeLearningPath(`${request.nextUrl.pathname}${request.nextUrl.search}`, locale);
    loginUrl.searchParams.set("next", requestedPath);
    loginUrl.searchParams.set("lang", locale);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(STUDENT_SESSION_COOKIE, "", { ...studentSessionCookieOptions, maxAge: 0 });
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if ((request.nextUrl.pathname.startsWith("/paper-2/topics/") || request.nextUrl.pathname.startsWith("/paper-2/review/visuals/")) && request.nextUrl.searchParams.has("candidate")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }
  return response;
}

export const config = {
  matcher: ["/", "/docs/:path*", "/login", "/paper-2/:path*", "/paper2-visuals/:path*", "/paper-3/:path*", "/paper-4/:path*"],
};
