import type { SentryEvent } from "./types.js";

interface GithubConfig {
  token: string;
  repo: string;
}

function getConfig(): GithubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) return null;
  return { token, repo };
}

async function githubRequest(config: GithubConfig, path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`https://api.github.com/repos/${config.repo}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`GitHub API ${path} failed: ${res.status} ${await res.text()}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

function buildIssueBody(event: SentryEvent, fingerprint: string): string {
  return [
    "Automatically reported by todo-autofix.",
    "",
    `**Fingerprint:** \`${fingerprint}\``,
    "",
    "```json",
    JSON.stringify(event, null, 2),
    "```",
  ].join("\n");
}

export async function reportErrorToGithub(
  event: SentryEvent,
  fingerprint: string,
): Promise<number | null> {
  const config = getConfig();
  if (!config) {
    console.log(
      "[github] GITHUB_TOKEN/GITHUB_REPOSITORY not set, skipping issue creation",
    );
    return null;
  }

  const summary = event.exception?.values?.[0]?.value ?? event.message ?? "Unknown error";
  const title = `[autofix] ${summary}`.slice(0, 250);

  const issue = (await githubRequest(config, "/issues", {
    title,
    body: buildIssueBody(event, fingerprint),
  })) as { number: number };

  await githubRequest(config, "/dispatches", {
    event_type: "frontend-error",
    client_payload: { fingerprint, issueNumber: issue.number, event },
  });

  return issue.number;
}
