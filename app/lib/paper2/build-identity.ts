import "server-only";

const BUILD_ID = /^[A-Za-z0-9_-]{8,128}$/;
const embeddedBuildId = process.env.ALGOCORE_EMBEDDED_BUILD_ID ?? "";

export function getRunningPaper2BuildId(): string {
  if (!BUILD_ID.test(embeddedBuildId) && process.env.NODE_ENV !== "production") return "paper2-dev-local";
  if (!BUILD_ID.test(embeddedBuildId)) throw new Error("This Paper 2 artifact was not built with a valid embedded BUILD_ID.");
  return embeddedBuildId;
}
