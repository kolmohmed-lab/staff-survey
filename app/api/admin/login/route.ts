import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, createAdminSession } from "../../../../lib/admin-session";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const expectedUsername = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!expectedUsername || !passwordHash) {
      return NextResponse.json({ error: "Admin login is not configured." }, { status: 500 });
    }

    const validUser = typeof username === "string" && username === expectedUsername;
    const validPassword = typeof password === "string" && await bcrypt.compare(password, passwordHash);

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
