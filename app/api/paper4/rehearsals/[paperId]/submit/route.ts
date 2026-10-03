import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isSameOriginPost, STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/app/lib/auth";
import { isRehearsalPaperId } from "@/app/lib/paper4/rehearsals";
import { getRehearsalSolution } from "@/app/lib/paper4/rehearsal-solutions";

export async function POST(request: Request, { params }: Readonly<{ params: Promise<{ paperId: string }> }>) {
  if (!isSameOriginPost(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const sessionToken = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  if (!verifyStudentSessionToken(sessionToken)) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { paperId } = await params;
  if (!isRehearsalPaperId(paperId)) return NextResponse.json({ error: "Unknown rehearsal." }, { status: 404 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object" || (body as { action?: unknown }).action !== "reveal_after_submit") return NextResponse.json({ error: "Submission confirmation required." }, { status: 400 });
  const solution = getRehearsalSolution(paperId);
  if (!solution) return NextResponse.json({ error: "Rubric unavailable." }, { status: 404 });
  return NextResponse.json({ solution }, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
