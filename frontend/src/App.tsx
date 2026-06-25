import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// The editor pulls in three.js — lazy-load it so the landing page stays light.
const Editor = lazy(() => import("./pages/Editor"));

function RouteFallback() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--canvas)",
        color: "#9aa3ad",
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 13,
      }}
    >
      Loading editor…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Editor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
