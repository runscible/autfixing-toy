import type { SentryEvent, StackFrame } from "./types.js";

const MAX_MESSAGE_LENGTH = 500;
const MAX_FRAMES = 20;
const MAX_STRING_LENGTH = 1000;

function truncateString(value: unknown, maxLength: number): string {
  const str = typeof value === "string" ? value : "";
  return str.slice(0, maxLength);
}

function sanitizeFrame(frame: unknown): StackFrame {
  if (typeof frame !== "object" || frame === null) return {};
  const f = frame as Record<string, unknown>;
  return {
    filename:
      typeof f.filename === "string"
        ? truncateString(f.filename, MAX_STRING_LENGTH)
        : undefined,
    function:
      typeof f.function === "string"
        ? truncateString(f.function, MAX_STRING_LENGTH)
        : undefined,
    in_app: typeof f.in_app === "boolean" ? f.in_app : undefined,
  };
}

export function sanitizeEvent(raw: unknown): SentryEvent {
  if (typeof raw !== "object" || raw === null) {
    return {};
  }
  const input = raw as Record<string, unknown>;

  const sanitized: SentryEvent = {
    message:
      typeof input.message === "string"
        ? truncateString(input.message, MAX_MESSAGE_LENGTH)
        : undefined,
  };

  const exception = input.exception;
  if (typeof exception === "object" && exception !== null) {
    const values = (exception as Record<string, unknown>).values;
    if (Array.isArray(values)) {
      sanitized.exception = {
        values: values.slice(0, 5).map((value) => {
          if (typeof value !== "object" || value === null) return {};
          const v = value as Record<string, unknown>;
          const frames = (v.stacktrace as Record<string, unknown> | undefined)
            ?.frames;
          return {
            type:
              typeof v.type === "string"
                ? truncateString(v.type, MAX_STRING_LENGTH)
                : undefined,
            value:
              typeof v.value === "string"
                ? truncateString(v.value, MAX_MESSAGE_LENGTH)
                : undefined,
            stacktrace: Array.isArray(frames)
              ? { frames: frames.slice(0, MAX_FRAMES).map(sanitizeFrame) }
              : undefined,
          };
        }),
      };
    }
  }

  return sanitized;
}
