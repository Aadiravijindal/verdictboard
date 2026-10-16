import type { EvidenceRelation, Source } from "@prisma/client";
import { groupByOrigin } from "@/lib/graph";
import { RELATION_LABEL, SOURCE_TYPE_LABEL } from "@/lib/labels";

interface Item {
  relation: EvidenceRelation;
  source: Source & { derivedFrom: Source | null };
}

const EDGE: Record<EvidenceRelation, string> = {
  SUPPORTS: "#0F8A4A",
  PARTIALLY_SUPPORTS: "#7BA05B",
  CONTRADICTS: "#B45F06",
  CONTEXT: "#9AA0AB",
};

/** Draws cited sources grouped by origin, with edges to the claim coloured by relation. */
export function SourceGraph({ items, claimCode }: { items: Item[]; claimCode: string }) {
  const sources = items.map((i) => i.source);
  const ancestors = sources.flatMap((s) => (s.derivedFrom ? [s.derivedFrom] : []));
  const groups = groupByOrigin(sources, [...sources, ...ancestors]);
  const relationOf = new Map(items.map((i) => [i.source.id, i.relation]));
  const rowH = 46;
  const height = Math.max(groups.length * rowH + 20, 120);
  const claimY = height / 2;

  return (
    <figure>
      <svg viewBox={`0 0 760 ${height}`} className="w-full" role="img" aria-labelledby="graph-title">
        <title id="graph-title">{`Source graph: ${groups.length} independent origins for ${claimCode}`}</title>
        {groups.map((g, i) => {
          const y = 20 + i * rowH + rowH / 2 - 10;
          const rel = relationOf.get(g.origin.id) ?? relationOf.get(g.repeats[0]?.id ?? "") ?? "CONTEXT";
          return (
            <g key={g.origin.id}>
              <path d={`M 400 ${y} C 520 ${y}, 560 ${claimY}, 640 ${claimY}`} fill="none" stroke={EDGE[rel]} strokeWidth={g.repeats.length + 1.5} opacity={0.9} />
              <rect x={150} y={y - 15} width={250} height={30} rx={10} fill={g.origin.isPrimary ? "#EAF2FF" : "#F4F5F7"} stroke={g.origin.isPrimary ? "#0666EB" : "#E7E8EC"} />
              <text x={160} y={y + 4} fill="#0A0B0D" fontSize={12} fontWeight={500} fontFamily="Inter, sans-serif">
                {g.origin.publisher.length > 34 ? `${g.origin.publisher.slice(0, 33)}…` : g.origin.publisher}
              </text>
              {g.repeats.map((r, j) => (
                <g key={r.id}>
                  <line x1={130 - j * 36} y1={y} x2={150 - j * 36} y2={y} stroke="#E7E8EC" />
                  <rect x={100 - j * 36} y={y - 10} width={30} height={20} rx={6} fill="#FFFFFF" stroke="#9AA0AB" strokeDasharray="3 2" />
                  <text x={115 - j * 36} y={y + 4} fill="#6A6F7A" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono, monospace">REP</text>
                </g>
              ))}
            </g>
          );
        })}
        <rect x={640} y={claimY - 22} width={110} height={44} rx={22} fill="#0A0B0D" />
        <text x={695} y={claimY + 5} fill="#FFFFFF" fontSize={13} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={700}>{claimCode}</text>
      </svg>
      <figcaption className="mt-3 text-sm text-muted">
        <strong className="text-ink">{groups.length} independent origin{groups.length === 1 ? "" : "s"}</strong> across {sources.length} cited source{sources.length === 1 ? "" : "s"}. Blue boxes mark primary records; dashed boxes are reports that repeat an origin and are not counted as independent confirmation. Edge colour shows the relation:
        {(Object.keys(EDGE) as EvidenceRelation[]).map((r) => (
          <span key={r} className="ml-2 whitespace-nowrap"><span className="inline-block h-2 w-3 rounded-full align-middle" style={{ background: EDGE[r] }} /> {RELATION_LABEL[r]}</span>
        ))}
      </figcaption>
      <ul className="sr-only">
        {groups.map((g) => (
          <li key={g.origin.id}>{g.origin.publisher} ({SOURCE_TYPE_LABEL[g.origin.sourceType]}){g.repeats.length ? `, repeated by ${g.repeats.map((r) => r.publisher).join(", ")}` : ""}</li>
        ))}
      </ul>
    </figure>
  );
}
