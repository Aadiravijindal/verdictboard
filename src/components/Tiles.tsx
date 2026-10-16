// Decorative tile backgrounds. Deliberately cool, desaturated hues assigned by
// position, so no topic or side is ever associated with a "team" colour.
export const TILE_GRADIENTS = [
  "linear-gradient(135deg,#0B1D3A 0%,#0666EB 100%)",
  "linear-gradient(135deg,#1B1036 0%,#6D4AE0 100%)",
  "linear-gradient(135deg,#06262B 0%,#0E8A8A 100%)",
  "linear-gradient(135deg,#14161C 0%,#4A5468 100%)",
  "linear-gradient(135deg,#0F2140 0%,#3B82C4 100%)",
  "linear-gradient(135deg,#1A1530 0%,#5B5BD6 100%)",
];

export function tileGradient(i: number) {
  return TILE_GRADIENTS[i % TILE_GRADIENTS.length];
}

export function TopicGlyph({ category }: { category: string }) {
  const c = category.toLowerCase();
  const path = c.includes("conflict")
    ? "M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7l8-4z"
    : c.includes("election")
      ? "M4 10h16v10H4zM8 10V6a4 4 0 018 0v4M10 15h4"
      : c.includes("econom")
        ? "M4 19V9M10 19V5M16 19v-7M22 19H2"
        : c.includes("science")
          ? "M9 3h6M10 3v6L4 19a1 1 0 001 1.5h14a1 1 0 001-1.5L14 9V3"
          : c.includes("human")
            ? "M12 21s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.6-7 10-7 10z"
            : c.includes("migration")
              ? "M3 12h14M13 6l6 6-6 6"
              : "M5 4h10l4 4v12H5zM9 12h6M9 16h6";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}
