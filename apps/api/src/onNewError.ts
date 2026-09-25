import type Database from "better-sqlite3";
import type { SentryEvent } from "./types.js";
import { reportErrorToGithub } from "./github.js";

export async function onNewError(
  db: Database.Database,
  fingerprint: string,
  event: SentryEvent,
): Promise<void> {
  console.log(
    "[onNewError] new error fingerprinted:",
    event.exception?.values?.[0]?.value ?? event.message,
  );

  try {
    const issueNumber = await reportErrorToGithub(event, fingerprint);
    if (issueNumber !== null) {
      db.prepare(
        "UPDATE error_events SET github_issue_number = ? WHERE fingerprint = ?",
      ).run(issueNumber, fingerprint);
    }
  } catch (err) {
    console.error("[onNewError] failed to report error to GitHub:", err);
  }
}
