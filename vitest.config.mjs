import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The ported reconstitution suite uses bare describe/test/expect, matching
    // the Jest setup it came from in peptora-android.
    globals: true,
    environment: "node",
    include: ["lib/**/*.test.js", "components/**/*.test.js"],
  },
});
