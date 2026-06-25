import * as Sentry from "@sentry/react";

// Initialise Sentry only when a DSN is configured (so local dev and CI are no-ops).
// Set VITE_SENTRY_DSN in the Vercel project to enable error tracking in production.
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}

export { Sentry };
