import { afterEach, describe, expect, it, vi } from "vitest";
import { reportErrorToGithub } from "../src/github.js";
import type { SentryEvent } from "../src/types.js";

const sampleEvent: SentryEvent = { message: "boom" };
const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("reportErrorToGithub", () => {
  it("skips the network call when GitHub is not configured", async () => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_REPOSITORY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await reportErrorToGithub(sampleEvent, "abc123");

    expect(result).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates an issue and fires a repository_dispatch when configured", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.GITHUB_REPOSITORY = "someone/some-repo";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ number: 42 }), { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const issueNumber = await reportErrorToGithub(sampleEvent, "abc123");

    expect(issueNumber).toBe(42);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
    const issueCall = calls[0]!;
    const dispatchCall = calls[1]!;
    expect(issueCall[0]).toBe("https://api.github.com/repos/someone/some-repo/issues");
    expect(dispatchCall[0]).toBe("https://api.github.com/repos/someone/some-repo/dispatches");

    const dispatchBody = JSON.parse(dispatchCall[1].body as string);
    expect(dispatchBody.event_type).toBe("frontend-error");
    expect(dispatchBody.client_payload.fingerprint).toBe("abc123");
    expect(dispatchBody.client_payload.issueNumber).toBe(42);
  });

  it("throws when the GitHub API responds with an error", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    process.env.GITHUB_REPOSITORY = "someone/some-repo";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 401 })));

    await expect(reportErrorToGithub(sampleEvent, "abc123")).rejects.toThrow();
  });
});
