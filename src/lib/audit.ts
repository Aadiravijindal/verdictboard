import type { Prisma } from "@prisma/client";
import { prisma } from "./db";

export async function audit(actorId: string | null, action: string, entityType: string, entityId: string, detail?: Prisma.InputJsonValue) {
  await prisma.auditLog.create({ data: { actorId, action, entityType, entityId, detail } });
}
