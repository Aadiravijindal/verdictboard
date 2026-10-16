import { prisma } from "./db";
import { keyedHash } from "./crypto";

export interface Limit {
  /** Logical bucket name, e.g. "vote" or "login". */
  name: string;
  max: number;
  windowSeconds: number;
}

/**
 * Fixed-window rate limiter backed by Postgres so it works across serverless
 * instances. Returns true when the request is allowed.
 */
export async function rateLimit(limit: Limit, identity: string): Promise<boolean> {
  const windowMs = limit.windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const key = `${limit.name}:${keyedHash(identity).slice(0, 32)}`;
  const row = await prisma.rateLimit.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });
  if (Math.random() < 0.01) {
    await prisma.rateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 2 * 86400_000) } } });
  }
  return row.count <= limit.max;
}

export const LIMITS = {
  loginPerEmail: { name: "login-email", max: 5, windowSeconds: 3600 },
  loginPerIp: { name: "login-ip", max: 20, windowSeconds: 3600 },
  votePerUser: { name: "vote-user", max: 120, windowSeconds: 3600 },
  votePerIp: { name: "vote-ip", max: 300, windowSeconds: 3600 },
  reportPerUser: { name: "report-user", max: 10, windowSeconds: 3600 },
  decomposePerUser: { name: "decompose-user", max: 20, windowSeconds: 86400 },
  researchPerUser: { name: "research-user", max: 30, windowSeconds: 86400 },
} satisfies Record<string, Limit>;
