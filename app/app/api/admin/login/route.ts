
import { NextRequest, NextResponse } from "next/server";
import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const runtime = "nodejs";

const COOKIE_NAME = "mapify_admin_session";
const SESSION_DURATION = 60 * 60 * 8;

function secureCompare(a: string, b: string) {
  const salt = "mapify-admin-password-v1";

  const aHash = scryptSync(a, salt, 64);
  const bHash = scryptSync(b, salt, 64);

  return timingSafeEqual(aHash, bHash);
}

function createSession(password: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = randomBytes(16).toString("hex");

  const payload = `${timestamp}.${nonce}`;

  const signature = createHmac("sha256", password)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const adminPassword =
      process.env.MAPIFY_ADMIN_PASSWORD;

    if (!adminPassword || adminPassword.length < 20) {
      console.error(
        "MAPIFY_ADMIN_PASSWORD belum dikonfigurasi dengan benar."
      );

      return NextResponse.json(
        { error: "Konfigurasi admin belum siap." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const password = body?.password;

    if (
      typeof password !== "string" ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: "Password tidak valid." },
        { status: 400 }
      );
    }

    if (!secureCompare(password, adminPassword)) {
      return NextResponse.json(
        { error: "Password admin salah." },
        { status: 401 }
      );
    }

    const session = createSession(adminPassword);

    const response = NextResponse.json({
      success: true,
      message: "Login admin berhasil.",
    });

    response.cookies.set(COOKIE_NAME, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION,
    });

    return response;
  } catch (error) {
    console.error("MAPIFY admin login error:", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
