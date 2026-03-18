import { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: unknown) {
    console.error("[MoneyQuest] Fatal render error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "hsl(240,20%,98%)", padding: "2rem",
          fontFamily: "system-ui, sans-serif", textAlign: "center", gap: "1rem"
        }}>
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(240,10%,10%)" }}>
            Something went wrong
          </h1>
          <p style={{ color: "hsl(240,10%,45%)", maxWidth: 400 }}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "hsl(250,84%,54%)", color: "#fff", border: "none",
              borderRadius: "0.75rem", padding: "0.75rem 2rem",
              fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginTop: "0.5rem"
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log("[MoneyQuest] App bootstrapping...");

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found in DOM.");

createRoot(container).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

console.log("[MoneyQuest] App mounted.");
