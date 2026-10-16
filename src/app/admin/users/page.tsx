import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/labels";
import { setUserBan, setUserRole } from "../actions";
import { ErrorBanner } from "@/components/ErrorBanner";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string; q?: string }> }) {
  await requireRole("ADMIN");
  const { error, q } = await searchParams;
  const users = await prisma.user.findMany({
    where: q ? { email: { contains: q, mode: "insensitive" } } : { role: { not: "USER" } },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { votes: true, reports: true } } },
  });
  return (
    <div>
      <ErrorBanner error={error} />
      <form className="flex max-w-md gap-2"><input name="q" defaultValue={q} className="input" placeholder="Search by email" /><button className="btn-ghost">Search</button></form>
      <p className="mt-2 text-xs text-muted">Without a search, staff accounts are listed.</p>
      <table className="mt-6 w-full text-left text-sm">
        <thead><tr className="label"><th className="py-2">Email</th><th>Joined</th><th>Votes</th><th>Reports</th><th>Role</th><th></th></tr></thead>
        <tbody className="divide-y divide-line">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="py-2 pr-3">{u.email}{u.banned && <span className="ml-2 text-danger">banned</span>}</td>
              <td className="text-muted">{formatDate(u.createdAt)}</td>
              <td>{u._count.votes}</td>
              <td>{u._count.reports}</td>
              <td>
                <form action={setUserRole} className="flex gap-1">
                  <input type="hidden" name="email" value={u.email} />
                  <select name="role" defaultValue={u.role} className="input w-32 py-1 text-xs">
                    {["USER", "REVIEWER", "EDITOR", "ADMIN"].map((r) => <option key={r}>{r}</option>)}
                  </select>
                  <button className="btn-ghost px-2 py-1">Set</button>
                </form>
              </td>
              <td>
                <form action={setUserBan}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="banned" value={String(!u.banned)} /><button className="btn-ghost px-2 py-1">{u.banned ? "Unban" : "Ban"}</button></form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
