if (!process.env.PAPER2_EXPECTED_BUILD_ID?.trim() || !process.env.PAPER2_BUILD_DIST_DIR?.trim()) {
  console.error("Paper 2 postbuild readiness requires PAPER2_EXPECTED_BUILD_ID and PAPER2_BUILD_DIST_DIR.");
  process.exit(1);
}

await import("./check-paper2-readiness.mjs");
