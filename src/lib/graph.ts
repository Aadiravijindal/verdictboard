// Source provenance: follow each source to its origin so repeated reporting is
// not mistaken for independent corroboration.

export interface GraphSource {
  id: string;
  title: string;
  publisher: string;
  derivedFromId: string | null;
}

export function originOf<T extends GraphSource>(id: string, byId: Map<string, T>): string {
  const seen = new Set<string>();
  let current = byId.get(id);
  while (current?.derivedFromId && byId.has(current.derivedFromId) && !seen.has(current.id)) {
    seen.add(current.id);
    current = byId.get(current.derivedFromId);
  }
  return current?.id ?? id;
}

export interface OriginGroup<T> {
  origin: T;
  repeats: T[];
}

/** Groups cited sources by their ultimate origin. `all` may include uncited ancestors. */
export function groupByOrigin<T extends GraphSource>(cited: T[], all: T[]): OriginGroup<T>[] {
  const byId = new Map(all.map((s) => [s.id, s]));
  for (const s of cited) byId.set(s.id, s);
  const groups = new Map<string, OriginGroup<T>>();
  for (const s of cited) {
    const originId = originOf(s.id, byId);
    const origin = byId.get(originId)!;
    const g = groups.get(originId) ?? { origin, repeats: [] };
    if (s.id !== originId) g.repeats.push(s);
    groups.set(originId, g);
  }
  return [...groups.values()];
}
