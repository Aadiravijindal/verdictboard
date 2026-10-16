import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <p className="label">404</p>
      <h1 className="h-display mt-2 text-6xl">No record here.</h1>
      <p className="mt-4 text-muted">This page doesn&apos;t exist, or the dossier is not published. Withdrawn dossiers are listed in the <Link href="/corrections">corrections log</Link>.</p>
      <Link href="/" className="btn-primary mt-8">Back to the evidence room</Link>
    </div>
  );
}
