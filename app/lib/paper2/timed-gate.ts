import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export type Paper2TimedGateStatus = "active" | "submitted";

export interface Paper2TimedGate {
  readonly gateVersion: 1;
  readonly paperId: string;
  readonly paperVersion: string;
  readonly publicHash: string;
  readonly attemptId: string;
  readonly startedAtEpochMs: number;
  readonly deadlineEpochMs: number;
  readonly status: Paper2TimedGateStatus;
  readonly terminalReason?: "on_time" | "expired";
}

export function paper2TimedGateCookieName(paperId: string) {
  return `algocore_p2_gate_${paperId.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 64)}`;
}

export function createPaper2TimedGate({ paperId, paperVersion, publicHash, now = Date.now() }: { readonly paperId: string; readonly paperVersion: string; readonly publicHash: string; readonly now?: number }): Paper2TimedGate {
  return {
    gateVersion: 1,
    paperId,
    paperVersion,
    publicHash,
    attemptId: `attempt:${randomUUID()}`,
    startedAtEpochMs: now,
    deadlineEpochMs: now + 7_200_000,
    status: "active",
  };
}

export function encodePaper2TimedGate(gate: Paper2TimedGate) {
  const payload = Buffer.from(JSON.stringify(gate), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodePaper2TimedGate(token: string | undefined): Paper2TimedGate | null {
  if (!token) return null;
  const [payload, suppliedSignature, ...extra] = token.split(".");
  if (!payload || !suppliedSignature || extra.length > 0) return null;
  const expected = sign(payload);
  const supplied = Buffer.from(suppliedSignature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (supplied.length !== expectedBuffer.length || !timingSafeEqual(supplied, expectedBuffer)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<Paper2TimedGate>;
    if (value.gateVersion !== 1 || typeof value.paperId !== "string" || typeof value.paperVersion !== "string" || !/^[a-f0-9]{64}$/i.test(value.publicHash ?? "") || typeof value.attemptId !== "string" || typeof value.startedAtEpochMs !== "number" || typeof value.deadlineEpochMs !== "number" || value.deadlineEpochMs <= value.startedAtEpochMs || !["active", "submitted"].includes(value.status ?? "")) return null;
    return value as Paper2TimedGate;
  } catch {
    return null;
  }
}

export function submitPaper2TimedGate(gate: Paper2TimedGate, now = Date.now()): Paper2TimedGate {
  return { ...gate, status: "submitted", terminalReason: now > gate.deadlineEpochMs ? "expired" : "on_time" };
}

export function paper2TimedGateCookieOptions(paperId: string) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production" && process.env.ALGOCORE_COOKIE_SECURE !== "false",
    path: `/api/paper2/timed/${paperId}`,
    maxAge: 60 * 60 * 3,
  };
}

function sign(payload: string) {
  const secret = process.env.ALGOCORE_SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) throw new Error("Paper 2 timed attempts require ALGOCORE_SESSION_SECRET with at least 32 bytes.");
  return createHmac("sha256", secret).update(`paper2-timed-v1.${payload}`, "utf8").digest("base64url");
}
