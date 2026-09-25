import type { FastifyInstance } from "fastify";
import type Database from "better-sqlite3";
import { sanitizeEvent } from "../sanitizeEvent.js";
import { computeFingerprint } from "../fingerprint.js";
import { onNewError } from "../onNewError.js";

export function registerErrorRoutes(app: FastifyInstance, db: Database.Database): void {
  app.post("/errors", async (request, reply) => {
    reply.code(202).send();

    const event = sanitizeEvent(request.body);
    const fingerprint = computeFingerprint(event);
    const message = event.exception?.values?.[0]?.value ?? event.message ?? "";
    const payload = JSON.stringify(event);

    const existing = db
      .prepare("SELECT id FROM error_events WHERE fingerprint = ?")
      .get(fingerprint);

    if (existing) {
      db.prepare(
        `UPDATE error_events SET count = count + 1, last_seen = datetime('now')
         WHERE fingerprint = ?`,
      ).run(fingerprint);
    } else {
      db.prepare(
        "INSERT INTO error_events (fingerprint, message, payload) VALUES (?, ?, ?)",
      ).run(fingerprint, message, payload);
      void onNewError(db, fingerprint, event);
    }
  });
}
