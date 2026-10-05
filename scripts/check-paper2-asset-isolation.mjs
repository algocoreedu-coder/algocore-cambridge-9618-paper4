import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [proxySource, configSource, explorerSource, rendererSource, registrySource, buildIdentitySource, buildRouteSource, topicRouteSource, reviewRouteSource, publicEntries] = await Promise.all([
  readFile(path.join(root, "proxy.ts"), "utf8"),
  readFile(path.join(root, "next.config.mjs"), "utf8"),
  readFile(path.join(root, "app/components/paper2-learning/lessons/Paper2VisualExplorer.tsx"), "utf8"),
  readFile(path.join(root, "app/components/paper2-learning/lessons/Paper2SceneRenderer.tsx"), "utf8"),
  readFile(path.join(root, "app/lib/paper2/server-visual-registry.ts"), "utf8"),
  readFile(path.join(root, "app/lib/paper2/build-identity.ts"), "utf8"),
  readFile(path.join(root, "app/paper-2/build-id/route.ts"), "utf8"),
  readFile(path.join(root, "app/paper-2/topics/[slug]/page.tsx"), "utf8"),
  readFile(path.join(root, "app/paper-2/review/visuals/[assetId]/page.tsx"), "utf8"),
  readdir(path.join(root, "public/paper2-visuals")).catch(() => []),
]);

const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

check(publicEntries.every((entry) => !entry.toLowerCase().endsWith(".html")), "public/paper2-visuals must not contain exported HTML players");
check(
  proxySource.includes('request.nextUrl.pathname.startsWith("/paper2-visuals/")')
    && proxySource.includes("status: 404")
    && proxySource.includes('"Cache-Control": "private, no-store, max-age=0"'),
  "proxy must return a no-store 404 for every /paper2-visuals/* request before authentication",
);
check(
  !configSource.includes("SAMEORIGIN")
    && !configSource.includes("frame-ancestors 'self'")
    && configSource.includes("frame-ancestors 'none'")
    && configSource.includes('value: "DENY"'),
  "global response headers must deny framing and must not carry a Paper 2 framing exception",
);
check(
  !explorerSource.includes("/paper2-visuals/") && !/<iframe\b/i.test(explorerSource),
  "native Paper 2 runtime must not reference or embed the standalone HTML library",
);
check(
  !explorerSource.includes("canonical-visuals.json")
    && explorerSource.includes("selection: Paper2VisualSelection")
    && registrySource.includes('import "server-only"')
    && registrySource.includes("canonical-visuals.json"),
  "the client explorer must receive a server-selected visual payload and must never import the canonical registry",
);
check(
  topicRouteSource.includes("getPaper2VisualSelection(lesson.visual.assetIds)")
    && reviewRouteSource.includes("getPaper2VisualSelection([assetId])"),
  "authorized server routes must select only the visual assets needed by the rendered lesson or review route",
);
check(
  rendererSource.includes('scene.type === "table"')
    && rendererSource.includes('role="region" tabIndex={0} aria-label='),
  "every focusable table visual region must expose an accessible name",
);
check(
  configSource.includes('env: { ALGOCORE_EMBEDDED_BUILD_ID: requestedBuildId || "" }')
    && configSource.includes("generateBuildId: async () => requestedBuildId")
    && buildIdentitySource.includes("process.env.ALGOCORE_EMBEDDED_BUILD_ID")
    && !buildIdentitySource.includes("node:fs")
    && !buildIdentitySource.includes("node:path")
    && buildRouteSource.includes("getRunningPaper2BuildId()"),
  "the build identity route must return the build-time embedded ID without tracing or reading the filesystem",
);

const result = {
  schema_version: "paper2-asset-isolation-v1",
  decision: failures.length ? "FAIL" : "PASS",
  checks: 8,
  failures,
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
