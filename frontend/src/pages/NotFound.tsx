import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./landing.css";

export default function NotFound() {
  useEffect(() => {
    document.title = "Not found · drawr";
  }, []);

  return (
    <main className="nf">
      <div className="nf-cell" aria-hidden><span /></div>
      <h1>This cell is empty.</h1>
      <p>The page you're looking for isn't in this drawer.</p>
      <Link className="btn btn-primary btn-lg" to="/">Back to drawr</Link>
      <span className="num">404</span>
    </main>
  );
}
