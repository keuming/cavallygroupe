import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { parse as parseCookieHeader } from "cookie";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  userId: number;
  openId: string;
};

function getSecretKey(): Uint8Array {
  if (!ENV.cookieSecret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return new TextEncoder().encode(ENV.cookieSecret);
}

/**
 * Create a signed session token (JWT) for a given user, stored in a cookie.
 * Verification is fully local — no external OAuth/forge dependency.
 */
export async function createSessionToken(payload: SessionPayload, expiresInMs: number = ONE_YEAR_MS): Promise<string> {
  const secret = getSecretKey();
  const expSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

  return new SignJWT({ userId: payload.userId, openId: payload.openId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expSeconds)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "number" || typeof payload.openId !== "string") {
      return null;
    }
    return { userId: payload.userId, openId: payload.openId };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) return new Map();
  const parsed = parseCookieHeader(cookieHeader);
  return new Map(Object.entries(parsed).filter(([, v]) => typeof v === "string") as [string, string][]);
}

/**
 * Authenticate an incoming request using the local session cookie.
 * Returns the user record, or null if not authenticated.
 */
export async function authenticateRequest(req: Request): Promise<User | null> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.get(COOKIE_NAME);
  if (!token) return null;

  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await db.getUserById(session.userId);
  return user ?? null;
}
