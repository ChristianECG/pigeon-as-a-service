"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs text-[var(--muted)] uppercase tracking-widest mb-4">
        SERVFAIL · §7
      </p>
      <h1 className="text-5xl font-bold text-[var(--foreground)] mb-3" style={{ letterSpacing: "-0.03em" }}>
        SERVFAIL
      </h1>
      <p className="text-sm text-[var(--muted)] max-w-sm mb-8">
        An internal error occurred during carrier processing. The loft infrastructure encountered an unexpected condition.
      </p>
      {error.digest && (
        <p className="text-xs text-[var(--border)] font-mono mb-6">digest: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[var(--accent)] text-white font-semibold text-sm rounded hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--muted)] transition-colors text-sm rounded"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
