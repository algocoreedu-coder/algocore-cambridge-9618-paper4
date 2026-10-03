import { NextResponse } from "next/server";
import {
  isSameOriginPost,
  STUDENT_SESSION_COOKIE,
  studentSessionCookieOptions,
} from "@/app/lib/auth";

export async function POST(request: Request) {
  if (!isSameOriginPost(request)) {
    return new Response(null, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  let locale = "en";
  try {
    const formData = await request.formData();
    if (formData.get("lang") === "vi") locale = "vi";
  } catch {
    // A missing form body still logs the student out safely.
  }

  const response = NextResponse.redirect(new URL(`/login?lang=${locale}`, request.url), { status: 303 });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(STUDENT_SESSION_COOKIE, "", { ...studentSessionCookieOptions, maxAge: 0 });
  return response;
}
