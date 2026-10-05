import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isSameOriginPost, STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/app/lib/auth";
import { getPaper2Mock } from "@/app/lib/paper2/assessment-registry";
import { resolvePaper2PrivateSolutions } from "@/app/lib/paper2/assessment-private-registry";
import { decodePaper2TimedGate, encodePaper2TimedGate, paper2TimedGateCookieName, paper2TimedGateCookieOptions, submitPaper2TimedGate } from "@/app/lib/paper2/timed-gate";

export async function POST(request: Request, { params }: Readonly<{ params: Promise<{ paperId: string }> }>) {
  if (!isSameOriginPost(request)) return privateJson({ error: "Invalid request origin." }, 403);
  const cookieStore = await cookies();
  if (!verifyStudentSessionToken(cookieStore.get(STUDENT_SESSION_COOKIE)?.value)) return privateJson({ error: "Authentication required." }, 401);
  const { paperId } = await params;
  const mock = getPaper2Mock(paperId);
  if (!mock) return privateJson({ error: "Unknown mock." }, 404);
  const body = await readObject(request);
  if (!body || body.action !== "confirmed_submit" || typeof body.attemptId !== "string" || body.paperVersion !== mock.paperVersion || body.publicHash !== mock.publicHash || Object.keys(body).some((key) => !["action", "attemptId", "paperVersion", "publicHash"].includes(key))) return privateJson({ error: "Invalid submission confirmation." }, 400);
  const cookieName = paper2TimedGateCookieName(paperId);
  const gate = decodePaper2TimedGate(cookieStore.get(cookieName)?.value);
  if (!gate || gate.paperId !== paperId || gate.attemptId !== body.attemptId || gate.paperVersion !== mock.paperVersion || gate.publicHash !== mock.publicHash) return privateJson({ error: "Attempt gate is missing or does not match." }, 409);
  const terminalGate = gate.status === "submitted" ? gate : submitPaper2TimedGate(gate);
  const solutions = resolvePaper2PrivateSolutions(mock.questionRefs);
  if (solutions.length !== mock.questionRefs.length) return privateJson({ error: "Rubric pack is incomplete." }, 503);
  const receiptId = gate.status === "submitted" ? `receipt:resume-${gate.attemptId.replace(/[^A-Za-z0-9_-]/g, "-")}` : `receipt:${randomUUID()}`;
  const rubricHash = createHash("sha256").update(solutions.map((solution) => solution.privateHash).join(":"), "utf8").digest("hex");
  const response = privateJson({ receipt: { receiptId, terminalReason: terminalGate.terminalReason, submittedAtEpochMs: Date.now(), rubricVersion: mock.paperVersion, rubricHash }, solutions });
  response.cookies.set(cookieName, encodePaper2TimedGate(terminalGate), paper2TimedGateCookieOptions(paperId));
  return response;
}

async function readObject(request: Request): Promise<Record<string, unknown> | null> { try { const value: unknown = await request.json(); return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; } catch { return null; } }
function privateJson(body: unknown, status = 200) { return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "same-origin" } }); }
