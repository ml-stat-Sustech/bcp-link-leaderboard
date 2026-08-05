// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { onRequest, type AuthEnvironment, type PagesRequestContext } from "./_middleware";

function context(
  path: string,
  env: AuthEnvironment,
  authorization?: string,
): PagesRequestContext & { next: ReturnType<typeof vi.fn> } {
  const next = vi.fn(async () => new Response(`served:${path}`, { status: 200 }));
  return {
    request: new Request(`https://leaderboard.pages.dev${path}`, {
      headers: authorization ? { Authorization: authorization } : undefined,
    }),
    env,
    next,
  };
}

describe("Cloudflare Pages authentication middleware", () => {
  const env = { SITE_USERNAME: "bcp-team", SITE_PASSWORD: "test-password" };
  const correctAuthorization = `Basic ${btoa("bcp-team:test-password")}`;

  it("fails closed when credentials are not configured", async () => {
    const requestContext = context("/", {});
    const response = await onRequest(requestContext);
    expect(response.status).toBe(503);
    expect(requestContext.next).not.toHaveBeenCalled();
  });

  it("challenges missing or incorrect credentials", async () => {
    for (const authorization of [undefined, `Basic ${btoa("bcp-team:wrong")}`]) {
      const requestContext = context("/", env, authorization);
      const response = await onRequest(requestContext);
      expect(response.status).toBe(401);
      expect(response.headers.get("WWW-Authenticate")).toContain("BCP-Link Leaderboard");
      expect(requestContext.next).not.toHaveBeenCalled();
    }
  });

  it("protects and serves HTML, scripts, and data-bearing assets", async () => {
    for (const path of ["/", "/assets/index.js", "/data/bcp-link-results.csv"]) {
      const requestContext = context(path, env, correctAuthorization);
      const response = await onRequest(requestContext);
      expect(response.status).toBe(200);
      expect(requestContext.next).toHaveBeenCalledOnce();
    }
  });

  it("supports an explicit public release mode", async () => {
    const requestContext = context("/", { AUTH_DISABLED: "true" });
    const response = await onRequest(requestContext);
    expect(response.status).toBe(200);
    expect(requestContext.next).toHaveBeenCalledOnce();
  });
});
