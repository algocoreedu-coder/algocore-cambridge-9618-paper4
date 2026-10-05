import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isSameOriginPost, STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/app/lib/auth";
import { getPaper2Mock } from "@/app/lib/paper2/assessment-registry";
import { createPaper2TimedGate, encodePaper2TimedGate, paper2TimedGateCookieName, paper2TimedGateCookieOptions } from "@/app/lib/paper2/timed-gate";

export async function POST(request: Request, { params }: Readonly<{ params: Promise<{ paperId: string }> }>) {
  if (!isSameOriginPost(request)) return privateJson({ error: "Invalid request origin." }, 403);
  const sessionToken = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  if (!verifyStudentSessionToken(sessionToken)) return privateJson({ error: "Authentication required." }, 401);
  const { paperId } = await params;
  const mock = getPaper2Mock(paperId);
  if (!mock || mock.independentReviewStatus !== "approved") return privateJson({ error: "Unknown or unavailable mock." }, 404);
  const body = await readObject(request);
  if (!body || body.action !== "confirmed_start" || body.paperVersion !== mock.paperVersion || body.publicHash !== mock.publicHash || Object.keys(body).some((key) => !["action", "paperVersion", "publicHash"].includes(key))) return privateJson({ error: "Start confirmation does not match the published mock." }, 400);
  const gate = createPaper2TimedGate({ paperId, paperVersion: mock.paperVersion, publicHash: mock.publicHash });
  const response = privateJson({ attemptId: gate.attemptId, serverNowEpochMs: gate.startedAtEpochMs, startedAtEpochMs: gate.startedAtEpochMs, deadlineEpochMs: gate.deadlineEpochMs, policyVersion: "paper2-wall-clock-v1" });
  response.cookies.set(paper2TimedGateCookieName(paperId), encodePaper2TimedGate(gate), paper2TimedGateCookieOptions(paperId));
  return response;
}

async function readObject(request: Request): Promise<Record<string, unknown> | null> { try { const value: unknown = await request.json(); return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; } catch { return null; } }
function privateJson(body: unknown, status = 200) { return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "same-origin" } }); }
