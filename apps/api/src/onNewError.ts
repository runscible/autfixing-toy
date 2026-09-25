import type { SentryEvent } from "./types.js";

// TODO: create a GitHub issue for this fingerprint and trigger a
// repository_dispatch (type: frontend-error) with the event as client_payload
// so the autofix workflow can pick it up.
export function onNewError(event: SentryEvent): void {
  console.log("[onNewError] new error fingerprinted:", event.message ?? event.exception?.values?.[0]?.value);
}
