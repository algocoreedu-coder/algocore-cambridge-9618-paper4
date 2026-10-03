const requestedBuildId = process.env.ALGOCORE_BUILD_ID?.trim();
if (requestedBuildId && !/^[A-Za-z0-9_-]{8,128}$/.test(requestedBuildId)) {
  throw new Error("ALGOCORE_BUILD_ID must contain 8-128 URL-safe characters.");
}

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Review builds use a named output directory so another local task cannot
  // replace the candidate while browser evidence is being collected.
  distDir: process.env.ALGOCORE_NEXT_DIST_DIR || ".next",
  ...(requestedBuildId ? { generateBuildId: async () => requestedBuildId } : {}),
  // Next replaces this reference at build time. The running server therefore
  // reports the ID baked into the artifact, not a mutable runtime env value.
  env: { ALGOCORE_EMBEDDED_BUILD_ID: requestedBuildId || "" },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
export default config;
