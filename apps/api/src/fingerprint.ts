import { createHash } from "node:crypto";
import type { SentryEvent, StackFrame } from "./types.js";

function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .replace(/\d+/g, "#")
    .trim();
}

function pickFrame(frames: StackFrame[]): StackFrame | undefined {
  return frames.find((frame) => frame.in_app) ?? frames.at(-1);
}

export function computeFingerprint(event: SentryEvent): string {
  const exceptionValue = event.exception?.values?.[0];
  const type = exceptionValue?.type ?? "Error";
  const message = normalizeMessage(exceptionValue?.value ?? event.message ?? "");
  const frames = exceptionValue?.stacktrace?.frames ?? [];
  const frame = pickFrame(frames);
  const location = frame ? `${frame.filename ?? "?"}:${frame.function ?? "?"}` : "?:?";

  return createHash("sha256").update(`${type}|${message}|${location}`).digest("hex");
}
