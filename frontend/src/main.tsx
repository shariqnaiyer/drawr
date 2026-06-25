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
    <div style={{ padding: 40, fontFamily: "system-ui", color: "#15181c" }}>
      <h2>Something went wrong.</h2>
      <p style={{ color: "#6b727a" }}>The error has been reported. Try reloading the page.</p>
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
