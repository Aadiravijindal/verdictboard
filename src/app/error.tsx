"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <h1 className="h-display text-[44px] sm:text-6xl">Something went wrong.</h1>
      <p className="mt-4 text-muted">The error has been logged. Please try again.</p>
      <button className="btn-primary mt-8" onClick={reset}>Try again</button>
    </div>
  );
}
