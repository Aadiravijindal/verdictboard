import type { EvidenceRelation, Source } from "@prisma/client";
import { groupByOrigin } from "@/lib/graph";
import { RELATION_LABEL, SOURCE_TYPE_LABEL } from "@/lib/labels";

interface Item {
  relation: EvidenceRelation;
  source: Source & { derivedFrom: Source | null };
}

const EDGE: Record<EvidenceRelation, string> = {
  SUPPORTS: "#91CFA0",
  PARTIALLY_SUPPORTS: "#C9D58F",
  CONTRADICTS: "#E6C27A",
  CONTEXT: "#6B7380",
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
              <rect x={150} y={y - 15} width={250} height={30} fill="#15181B" stroke={g.origin.isPrimary ? "#B8F36B" : "#2A2F35"} />
              <text x={160} y={y + 4} fill="#E8EAED" fontSize={12} fontFamily="Space Grotesk, sans-serif">
                {g.origin.publisher.length > 34 ? `${g.origin.publisher.slice(0, 33)}…` : g.origin.publisher}
              </text>
              {g.repeats.map((r, j) => (
                <g key={r.id}>
                  <line x1={130 - j * 36} y1={y} x2={150 - j * 36} y2={y} stroke="#2A2F35" />
                  <rect x={100 - j * 36} y={y - 10} width={30} height={20} fill="#0B0C0E" stroke="#6B7380" strokeDasharray="3 2" />
                  <text x={115 - j * 36} y={y + 4} fill="#9AA1AB" fontSize={9} textAnchor="middle" fontFamily="JetBrains Mono, monospace">REP</text>
                </g>
              ))}
            </g>
          );
        })}
        <rect x={640} y={claimY - 22} width={110} height={44} fill="#B8F36B" />
        <text x={695} y={claimY + 5} fill="#0B0C0E" fontSize={13} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight={600}>{claimCode}</text>
      </svg>
      <figcaption className="mt-3 text-sm text-muted">
        <strong className="text-ink">{groups.length} independent origin{groups.length === 1 ? "" : "s"}</strong> across {sources.length} cited source{sources.length === 1 ? "" : "s"}. Lime borders mark primary records; dashed boxes are reports that repeat an origin and are not counted as independent confirmation. Edge colour shows the relation:
        {(Object.keys(EDGE) as EvidenceRelation[]).map((r) => (
          <span key={r} className="ml-2 whitespace-nowrap"><span className="inline-block h-2 w-3 align-middle" style={{ background: EDGE[r] }} /> {RELATION_LABEL[r]}</span>
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
