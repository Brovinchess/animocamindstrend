import OAuth from "oauth-1.0a";
import crypto from "crypto";

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || "";
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || "http://localhost:3000/api/twitter/callback";

const oauth = new OAuth({
  consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
  signature_method: "HMAC-SHA1",
  hash_function(baseString, key) {
    return crypto.createHmac("sha1", key).update(baseString).digest("base64");
  },
});

// Temp token store (in-memory, resets on restart)
interface TokenData {
  accessToken: string;
  accessSecret: string;
  userId: string;
  screenName: string;
}

const requestTokens: Map<string, string> = new Map(); // token -> secret
const userTokens: Map<string, TokenData> = new Map(); // screenName -> tokens

export function isConfigured(): boolean {
  return !!CONSUMER_KEY && !!CONSUMER_SECRET;
}

export async function getRequestToken(): Promise<{ token: string; url: string }> {
  const requestData = {
    url: "https://api.twitter.com/oauth/request_token",
    method: "POST",
    data: { oauth_callback: CALLBACK_URL },
  };

  const headers = oauth.toHeader(oauth.authorize(requestData));

  const res = await fetch(requestData.url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
    body: `oauth_callback=${encodeURIComponent(CALLBACK_URL)}`,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request token failed: ${res.status} ${text}`);
  }

  const body = await res.text();
  const params = new URLSearchParams(body);
  const token = params.get("oauth_token") || "";
  const secret = params.get("oauth_token_secret") || "";

  requestTokens.set(token, secret);

  return {
    token,
    url: `https://api.twitter.com/oauth/authorize?oauth_token=${token}`,
  };
}

export async function exchangeToken(
  oauthToken: string,
  oauthVerifier: string
): Promise<TokenData> {
  const tokenSecret = requestTokens.get(oauthToken);
  if (!tokenSecret) throw new Error("Unknown request token");

  const requestData = {
    url: "https://api.twitter.com/oauth/access_token",
    method: "POST",
    data: { oauth_verifier: oauthVerifier },
  };

  const token = { key: oauthToken, secret: tokenSecret };
  const headers = oauth.toHeader(oauth.authorize(requestData, token));

  const res = await fetch(requestData.url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
    body: `oauth_verifier=${encodeURIComponent(oauthVerifier)}`,
  });

  if (!res.ok) throw new Error(`Access token failed: ${res.status}`);

  const body = await res.text();
  const params = new URLSearchParams(body);

  const data: TokenData = {
    accessToken: params.get("oauth_token") || "",
    accessSecret: params.get("oauth_token_secret") || "",
    userId: params.get("user_id") || "",
    screenName: params.get("screen_name") || "",
  };

  userTokens.set(data.screenName, data);
  requestTokens.delete(oauthToken);

  return data;
}

export async function postTweet(
  screenName: string,
  text: string
): Promise<{ success: boolean; tweetUrl?: string; error?: string }> {
  const tokens = userTokens.get(screenName);
  if (!tokens) return { success: false, error: "Not authenticated" };

  const requestData = {
    url: "https://api.twitter.com/2/tweets",
    method: "POST",
  };

  const token = { key: tokens.accessToken, secret: tokens.accessSecret };
  const headers = oauth.toHeader(oauth.authorize(requestData, token));

  const res = await fetch(requestData.url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: `Tweet failed: ${res.status} ${err}` };
  }

  const data = await res.json();
  const tweetId = data?.data?.id;

  return {
    success: true,
    tweetUrl: tweetId
      ? `https://x.com/${screenName}/status/${tweetId}`
      : `https://x.com/${screenName}`,
  };
}

export function getConnectedAccounts(): string[] {
  return [...userTokens.keys()];
}

export function isConnected(screenName: string): boolean {
  return userTokens.has(screenName);
}
