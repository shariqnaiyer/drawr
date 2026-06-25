/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api to the FastAPI backend so the frontend is same-origin in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8123",
        changeOrigin: true,
      },
    },
  },
  build: {
    // The lazy-loaded editor chunk includes three.js; it's intentionally large
    // and only fetched on /app, so don't warn about it.
    chunkSizeWarningLimit: 1100,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    // Playwright specs live in e2e/ and must not be picked up by Vitest.
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
