// Edge-compatible signed session token helpers.
// Uses Web Crypto (available in both Node.js and the Next.js Edge runtime)
// so this module can be safely imported from middleware.ts.
//
// Token format: "authenticated.<issuedAtMs>.<base64url HMAC signature>"
// This is NOT a JWT library. It's a deliberately small, auditable
// implementation for a single-user private vault.

export const COOKIE_NAME = "mdl_session";
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET environment variable is not set (or is too short). " +
        "Set a long random string as AUTH_SECRET in your environment."
    );
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return toBase64Url(signature);
}

export async function createSessionToken(): Promise<string> {
  const secret = getSecret();
  const payload = `authenticated.${Date.now()}`;
  const signature = await hmacSign(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [label, issuedAtRaw, signature] = parts;
  if (label !== "authenticated") return false;

  const payload = `${label}.${issuedAtRaw}`;
  const expected = await hmacSign(payload, secret);
  if (expected !== signature) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!issuedAt || Number.isNaN(issuedAt)) return false;
  if (Date.now() - issuedAt > MAX_AGE_SECONDS * 1000) return false;

  return true;
}
