// Reddit OAuth2 helper functions

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID || "";
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET || "";
const REDDIT_REDIRECT_URI =
  process.env.REDDIT_REDIRECT_URI || "http://localhost:3000/api/reddit/callback";

const SCOPES = ["submit", "identity", "read"].join(" ");

// In-memory token store (per-server session — resets on restart)
// For production, use a database or encrypted cookie
interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  username: string;
}

const tokenStore: Map<string, TokenData> = new Map();

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: REDDIT_CLIENT_ID,
    response_type: "code",
    state,
    redirect_uri: REDDIT_REDIRECT_URI,
    duration: "permanent",
    scope: SCOPES,
  });
  return `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<TokenData> {
  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "animocaminds:v1.0 (by /u/animocaminds)",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDDIT_REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status}`);
  }

  const data = await res.json();

  // Get username
  const meRes = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      "User-Agent": "animocaminds:v1.0 (by /u/animocaminds)",
    },
  });
  const me = await meRes.json();

  const tokenData: TokenData = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    username: me.name || "unknown",
  };

  // Store by username
  tokenStore.set(tokenData.username, tokenData);

  return tokenData;
}

export async function refreshAccessToken(username: string): Promise<TokenData | null> {
  const existing = tokenStore.get(username);
  if (!existing?.refreshToken) return null;

  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64");

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "animocaminds:v1.0 (by /u/animocaminds)",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: existing.refreshToken,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const updated: TokenData = {
    ...existing,
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  tokenStore.set(username, updated);
  return updated;
}

export async function getValidToken(username: string): Promise<string | null> {
  const data = tokenStore.get(username);
  if (!data) return null;

  // Refresh if expired or close to expiring (1 min buffer)
  if (Date.now() > data.expiresAt - 60000) {
    const refreshed = await refreshAccessToken(username);
    return refreshed?.accessToken || null;
  }

  return data.accessToken;
}

export function getStoredAccounts(): string[] {
  return [...tokenStore.keys()];
}

export function isConnected(username: string): boolean {
  return tokenStore.has(username);
}

export function isConfigured(): boolean {
  return !!REDDIT_CLIENT_ID && !!REDDIT_CLIENT_SECRET;
}

export interface SubmitResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function submitPost(
  username: string,
  subreddit: string,
  title: string,
  body: string
): Promise<SubmitResult> {
  const token = await getValidToken(username);
  if (!token) {
    return { success: false, error: "Not authenticated. Please login again." };
  }

  const res = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "animocaminds:v1.0 (by /u/animocaminds)",
    },
    body: new URLSearchParams({
      api_type: "json",
      kind: "self",
      sr: subreddit,
      title,
      text: body,
    }),
  });

  const data = await res.json();

  if (data?.json?.errors?.length > 0) {
    return {
      success: false,
      error: data.json.errors.map((e: string[]) => e.join(": ")).join(", "),
    };
  }

  return {
    success: true,
    url: data?.json?.data?.url || `https://reddit.com/r/${subreddit}`,
  };
}
