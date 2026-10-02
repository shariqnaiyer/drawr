import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App.tsx";
import { initSentry, Sentry } from "./lib/sentry";

initSentry();

function Fallback() {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 40, background: "var(--bg)", color: "var(--ink)", textAlign: "center" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}>Something went wrong.</h2>
      <p style={{ color: "var(--ink-3)" }}>The error has been reported. Reload the page to keep working.</p>
      <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<Fallback />}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Analytics />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
