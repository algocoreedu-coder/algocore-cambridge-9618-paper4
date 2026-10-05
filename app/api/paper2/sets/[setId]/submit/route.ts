import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { isSameOriginPost, STUDENT_SESSION_COOKIE, verifyStudentSessionToken } from "@/app/lib/auth";
import { getPaper2PracticeSet } from "@/app/lib/paper2/assessment-registry";
import { resolvePaper2PrivateSolutions } from "@/app/lib/paper2/assessment-private-registry";

export async function POST(request: Request, { params }: Readonly<{ params: Promise<{ setId: string }> }>) {
  if (!isSameOriginPost(request)) return privateJson({ error: "Invalid request origin." }, 403);
  if (!verifyStudentSessionToken((await cookies()).get(STUDENT_SESSION_COOKIE)?.value)) return privateJson({ error: "Authentication required." }, 401);
  const { setId } = await params;
  const set = getPaper2PracticeSet(setId);
  if (!set || set.solutionDisclosure !== "after_explicit_submit" || set.rightsStatus !== "approved" || set.review.decision !== "approved") return privateJson({ error: "Unknown or non-closed practice set." }, 404);
  const body = await readObject(request);
  if (!body || body.action !== "confirmed_submit" || body.setVersion !== set.setVersion || typeof body.attemptId !== "string" || Object.keys(body).some((key) => !["action", "attemptId", "setVersion"].includes(key))) return privateJson({ error: "Invalid submission confirmation." }, 400);
  const solutions = resolvePaper2PrivateSolutions(set.questionRefs);
  if (solutions.length !== set.questionRefs.length) return privateJson({ error: "Rubric pack is incomplete." }, 503);
  const rubricHash = createHash("sha256").update(solutions.map((solution) => solution.privateHash).join(":"), "utf8").digest("hex");
  return privateJson({ receipt: { receiptId: `receipt:${randomUUID()}`, terminalReason: "submitted", rubricVersion: set.setVersion, rubricHash }, solutions });
}

async function readObject(request: Request): Promise<Record<string, unknown> | null> { try { const value: unknown = await request.json(); return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null; } catch { return null; } }
function privateJson(body: unknown, status = 200) { return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "same-origin" } }); }
