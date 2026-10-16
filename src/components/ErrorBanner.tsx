export function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return <p role="alert" className="mb-6 rounded-2xl bg-[#FDECEA] px-4 py-3 text-sm font-medium text-danger">{error}</p>;
}
