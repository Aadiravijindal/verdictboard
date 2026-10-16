import { prisma } from "@/lib/db";

export default async function AuditLogPage() {
  const rows = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { actor: { select: { email: true } } } });
  return (
    <table className="w-full text-left text-sm">
      <thead><tr className="label"><th className="py-2">When</th><th>Who</th><th>Action</th><th>Entity</th><th>Detail</th></tr></thead>
      <tbody className="divide-y divide-line">
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="py-2 pr-3 font-mono text-xs">{r.createdAt.toISOString().replace("T", " ").slice(0, 19)}</td>
            <td className="pr-3">{r.actor?.email ?? "system"}</td>
            <td className="pr-3 font-mono text-xs">{r.action}</td>
            <td className="pr-3 font-mono text-xs">{r.entityType}:{r.entityId.slice(0, 8)}</td>
            <td className="max-w-md truncate font-mono text-xs text-muted">{r.detail ? JSON.stringify(r.detail) : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
