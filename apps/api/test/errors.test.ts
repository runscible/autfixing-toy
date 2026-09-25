import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

const sampleEvent = {
  message: "boom",
  exception: {
    values: [
      {
        type: "TypeError",
        value: "Cannot read properties of null (reading 'trim')",
        stacktrace: {
          frames: [
            { filename: "src/sortByUrgency.ts", function: "isUrgent", in_app: true },
          ],
        },
      },
    ],
  },
};

describe("POST /errors", () => {
  it("responds 202", async () => {
    const app = buildApp(":memory:");
    const response = await app.inject({ method: "POST", url: "/errors", payload: sampleEvent });
    expect(response.statusCode).toBe(202);
  });

  it("dedupes the same error into a single row with an incrementing count", async () => {
    const app = buildApp(":memory:");

    for (let i = 0; i < 10; i++) {
      await app.inject({ method: "POST", url: "/errors", payload: sampleEvent });
    }

    const rows = app.db
      .prepare("SELECT * FROM error_events")
      .all() as { count: number }[];

    expect(rows).toHaveLength(1);
    expect(rows[0]!.count).toBe(10);
  });

  it("keeps distinct errors as separate rows", async () => {
    const app = buildApp(":memory:");
    const otherEvent = {
      ...sampleEvent,
      exception: { values: [{ ...sampleEvent.exception.values[0], type: "RangeError" }] },
    };

    await app.inject({ method: "POST", url: "/errors", payload: sampleEvent });
    await app.inject({ method: "POST", url: "/errors", payload: otherEvent });

    const rows = app.db.prepare("SELECT * FROM error_events").all();
    expect(rows).toHaveLength(2);
  });
});
