import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.JWT_SECRET || "moneyquest-secret-key-2024";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHmac("sha256", SECRET).update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const computed = createHmac("sha256", SECRET).update(password + salt).digest("hex");
  return computed === hash;
}

export function createToken(userId: number): string {
  const payload = { userId, iat: Date.now() };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    const [data, sig] = token.split(".");
    const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
