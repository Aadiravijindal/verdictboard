import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { prisma } from "./db";
import { randomToken, sha256 } from "./crypto";
import { env } from "./env";

export const SESSION_COOKIE = "vb_session";
const SESSION_DAYS = 30;
const LOGIN_TOKEN_MINUTES = 20;

const ROLE_RANK: Record<Role, number> = { USER: 0, REVIEWER: 1, EDITOR: 2, ADMIN: 3 };

export function hasRole(user: Pick<User, "role"> | null | undefined, role: Role): boolean {
  return !!user && ROLE_RANK[user.role] >= ROLE_RANK[role];
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

/** Creates a single-use sign-in token and returns the link to email. */
export async function createLoginLink(email: string, next = "/"): Promise<string> {
  const token = randomToken();
  await prisma.loginToken.create({
    data: { tokenHash: sha256(token), email, expiresAt: new Date(Date.now() + LOGIN_TOKEN_MINUTES * 60_000) },
  });
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return `${env.appUrl}/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext)}`;
}

/** Consumes a token; returns the signed-in user or null if invalid/expired/used. */
export async function consumeLoginToken(token: string): Promise<User | null> {
  const tokenHash = sha256(token);
  const now = new Date();
  // Atomic single use: only one request can flip usedAt from null.
  const res = await prisma.loginToken.updateMany({
    where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
    data: { usedAt: now },
  });
  if (res.count !== 1) return null;
  const row = await prisma.loginToken.findUnique({ where: { tokenHash } });
  if (!row) return null;

  const isAdmin = env.adminEmails.includes(row.email);
  const user = await prisma.user.upsert({
    where: { email: row.email },
    create: { email: row.email, emailVerifiedAt: now, role: isAdmin ? "ADMIN" : "USER" },
    update: { emailVerifiedAt: now, ...(isAdmin ? { role: "ADMIN" } : {}) },
  });
  if (user.banned) return null;

  const sessionToken = randomToken();
  await prisma.session.create({
    data: { tokenHash: sha256(sessionToken), userId: user.id, expiresAt: new Date(Date.now() + SESSION_DAYS * 86400_000) },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return user;
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date() || session.user.banned) return null;
  return session.user;
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

export async function requireUser(next = "/"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireRole(role: Role): Promise<User> {
  const user = await requireUser("/admin");
  if (!hasRole(user, role)) redirect("/");
  return user;
}
