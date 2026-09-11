import { pbkdf2 as pbkdf2Callback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, createAdminSession } from "../../../../lib/admin-session";

const pbkdf2 = promisify(pbkdf2Callback);

async function verifyPassword(password: string, stored: string) {
  const [algorithm, iterationsText, saltB64, hashB64] = stored.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterationsText || !saltB64 || !hashB64) return false;

  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100000) return false;

  const decode = (value: string) => Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const salt = decode(saltB64);
  const expected = decode(hashB64);
  const derived = await pbkdf2(password, salt, iterations, expected.length, "sha256");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const expectedUsername = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!expectedUsername || !passwordHash) {
      return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
    }

    const validUser = typeof username === "string" && username === expectedUsername;
    const validPassword = typeof password === "string" && await verifyPassword(password, passwordHash);

    if (!validUser || !validPassword) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const token = await createAdminSession(expectedUsername);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to sign in." }, { status: 400 });
  }
}
