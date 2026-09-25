import { describe, expect, it } from "vitest";
import { computeFingerprint } from "../src/fingerprint.js";
import type { SentryEvent } from "../src/types.js";

function buildEvent(overrides: Partial<SentryEvent> = {}): SentryEvent {
  return {
    exception: {
      values: [
        {
          type: "TypeError",
          value: "Cannot read properties of null (reading 'trim')",
          stacktrace: {
            frames: [
              { filename: "src/api.ts", function: "fetchTodos", in_app: true },
              {
                filename: "src/sortByUrgency.ts",
                function: "isUrgent",
                in_app: true,
              },
            ],
          },
        },
      ],
    },
    ...overrides,
  };
}

describe("computeFingerprint", () => {
  it("is stable for the same event", () => {
    const event = buildEvent();
    expect(computeFingerprint(event)).toBe(computeFingerprint(buildEvent()));
  });

  it("differs when the exception type differs", () => {
    const a = buildEvent();
    const b = buildEvent();
    b.exception!.values![0]!.type = "RangeError";
    expect(computeFingerprint(a)).not.toBe(computeFingerprint(b));
  });

  it("normalizes numbers in the message so similar errors collide", () => {
    const a = buildEvent();
    const b = buildEvent();
    a.exception!.values![0]!.value = "todo 42 is invalid";
    b.exception!.values![0]!.value = "todo 99 is invalid";
    expect(computeFingerprint(a)).toBe(computeFingerprint(b));
  });

  it("prefers the first in-app frame for the location", () => {
    const withLibFrame = buildEvent();
    withLibFrame.exception!.values![0]!.stacktrace!.frames = [
      { filename: "node_modules/react-dom/index.js", function: "render", in_app: false },
      { filename: "src/sortByUrgency.ts", function: "isUrgent", in_app: true },
    ];
    const withoutLibFrame = buildEvent();
    withoutLibFrame.exception!.values![0]!.stacktrace!.frames = [
      { filename: "src/sortByUrgency.ts", function: "isUrgent", in_app: true },
    ];
    expect(computeFingerprint(withLibFrame)).toBe(computeFingerprint(withoutLibFrame));
  });
});
