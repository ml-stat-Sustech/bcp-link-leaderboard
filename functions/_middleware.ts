export interface AuthEnvironment {
  SITE_USERNAME?: string;
  SITE_PASSWORD?: string;
  AUTH_DISABLED?: string;
}

export interface PagesRequestContext {
  request: Request;
  env: AuthEnvironment;
  next: () => Promise<Response>;
}

function constantTimeEqual(left: string, right: string): boolean {
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function protectedResponse(status: 401 | 503, message: string): Response {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=UTF-8",
  };
  if (status === 401) {
    headers["WWW-Authenticate"] = 'Basic realm="BCP-Link Leaderboard", charset="UTF-8"';
  }
  return new Response(message, { status, headers });
}

export async function onRequest(context: PagesRequestContext): Promise<Response> {
  if (context.env.AUTH_DISABLED === "true") return context.next();

  const username = context.env.SITE_USERNAME;
  const password = context.env.SITE_PASSWORD;
  if (!username || !password) {
    return protectedResponse(503, "Site access is not configured.");
  }

  const expectedAuthorization = `Basic ${btoa(`${username}:${password}`)}`;
  const authorization = context.request.headers.get("Authorization") ?? "";
  if (!constantTimeEqual(authorization, expectedAuthorization)) {
    return protectedResponse(401, "Authentication required.");
  }

  return context.next();
}
