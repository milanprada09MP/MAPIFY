
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

const SESSION_DURATION = 60 * 60 * 8;

export const ADMIN_COOKIE_NAME =
  "mapify_admin_session";

export function verifyAdminSession(
  session: string | undefined
): boolean {
  const password =
    process.env.MAPIFY_ADMIN_PASSWORD;

  if (!password || password.length < 20 || !session) {
    return false;
  }

  const parts = session.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [timestampText, nonce, signature] = parts;

  if (!/^\d+$/.test(timestampText)) {
    return false;
  }

  if (!/^[a-f0-9]{32}$/.test(nonce)) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }

  const timestamp = Number(timestampText);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(timestamp) ||
    timestamp > now ||
    now - timestamp > SESSION_DURATION
  ) {
    return false;
  }

  const payload = `${timestampText}.${nonce}`;

  const expectedSignature = createHmac(
    "sha256",
    password
  )
    .update(payload)
    .digest("hex");

  return timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
}
