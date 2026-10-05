import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isSameOriginPost, STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/app/lib/auth";
import { getPaper2Mock } from "@/app/lib/paper2/assessment-registry";
import { decodePaper2TimedGate, paper2TimedGateCookieName } from "@/app/lib/paper2/timed-gate";

export async function POST(request: Request, { params }: Readonly<{ params: Promise<{ paperId: string }> }>) {
  if (!isSameOriginPost(request)) return privateJson({ error: "Invalid request origin." }, 403);
  const cookieStore = await cookies();
  if (!verifyStudentSessionToken(cookieStore.get(STUDENT_SESSION_COOKIE)?.value)) return privateJson({ error: "Authentication required." }, 401);
  const { paperId } = await params;
  const mock = getPaper2Mock(paperId);
  if (!mock) return privateJson({ error: "Unknown mock." }, 404);
  const gate = decodePaper2TimedGate(cookieStore.get(paper2TimedGateCookieName(paperId))?.value);
  if (!gate || gate.paperId !== paperId || gate.paperVersion !== mock.paperVersion || gate.publicHash !== mock.publicHash) return privateJson({ error: "No resumable attempt." }, 404);
  return privateJson({ attemptId: gate.attemptId, status: gate.status, serverNowEpochMs: Date.now(), startedAtEpochMs: gate.startedAtEpochMs, deadlineEpochMs: gate.deadlineEpochMs, policyVersion: "paper2-wall-clock-v1", terminalReason: gate.terminalReason });
}

function privateJson(body: unknown, status = 200) { return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "same-origin" } }); }
