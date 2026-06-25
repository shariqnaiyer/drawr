import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background: "radial-gradient(130% 120% at 50% 28%, #1d232c 0%, #15181d 62%, #111418 100%)",
        color: "#fff",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div className="mono" style={{ fontSize: 13, color: "var(--accent)", letterSpacing: ".1em" }}>404</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>This grid cell is empty.</div>
      <div style={{ color: "#9aa3ad", maxWidth: 380 }}>
        The page you're looking for doesn't exist or has been moved.
      </div>
      <Link
        to="/"
        style={{
          marginTop: 8,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          height: 40,
          padding: "0 18px",
          background: "var(--accent)",
          color: "#fff",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Back to home
      </Link>
    </div>
  );
}
