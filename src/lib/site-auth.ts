export const AUTH_COOKIE_NAME = "invoice_site_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function isAuthEnabled(): boolean {
  return Boolean(process.env.SITE_PASSWORD);
}

function getSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.SITE_PASSWORD ?? "";
}

function getPassword(): string {
  return process.env.SITE_PASSWORD ?? "";
}

async function signToken(): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(getPassword()));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAuthToken(): Promise<string> {
  return signToken();
}

export async function isValidAuthCookie(
  value: string | undefined,
): Promise<boolean> {
  if (!isAuthEnabled()) return true;
  if (!value) return false;
  const expected = await signToken();
  if (value.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < value.length; i++) {
    mismatch |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}
