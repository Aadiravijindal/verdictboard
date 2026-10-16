export function ErrorBanner({ error }: { error?: string }) {
  if (!error) return null;
  return <p role="alert" className="mb-6 border border-danger p-3 text-sm text-danger">{error}</p>;
}
