import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // Load fake-indexeddb so the real LocalStorage class works without a browser.
    setupFiles: ["./src/test-setup.ts"],
  },
});
