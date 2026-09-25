import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import { App } from "./App";
import "./style.css";

Sentry.init({
  dsn: "https://dummy@o0.ingest.sentry.io/0",
  beforeSend(event) {
    const body = JSON.stringify(event);
    const sent = navigator.sendBeacon?.(
      "/api/errors",
      new Blob([body], { type: "application/json" }),
    );
    if (!sent) {
      fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
    return null;
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <main className="app app--crashed">
          <h1>Everything broke.</h1>
          <p>We already told a robot about it. It's probably fine.</p>
        </main>
      }
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
