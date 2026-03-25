"use client";

export function SkeletonCard() {
  return (
    <div
      className="rounded-xl border p-5 animate-pulse"
      style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-5 rounded bg-[var(--surface-muted)]" />
        <div className="h-3 w-20 rounded bg-[var(--surface-muted)]" />
        <div className="h-3 w-16 rounded bg-[var(--surface-muted)]" />
      </div>
      <div className="h-4 w-full rounded bg-[var(--surface-muted)] mb-2" />
      <div className="h-4 w-3/4 rounded bg-[var(--surface-muted)] mb-4" />
      <div className="h-3 w-full rounded bg-[var(--surface-muted)] mb-1.5" />
      <div className="h-3 w-2/3 rounded bg-[var(--surface-muted)] mb-4" />
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 rounded-full bg-[var(--surface-muted)]" />
        <div className="h-3 w-14 rounded bg-[var(--surface-muted)]" />
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div
      className="rounded-xl border overflow-hidden divide-y animate-pulse"
      style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <div className="h-4 w-4 rounded bg-[var(--surface-muted)]" />
          <div className="h-4 flex-1 rounded bg-[var(--surface-muted)]" />
          <div className="h-3 w-20 rounded bg-[var(--surface-muted)]" />
          <div className="h-3 w-14 rounded bg-[var(--surface-muted)]" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonReddit() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-3 flex-1" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
            <div className="h-3 w-16 rounded bg-[var(--surface-muted)] mb-2" />
            <div className="h-2 w-full rounded bg-[var(--surface-muted)]" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border overflow-hidden divide-y" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: "var(--border)" }}>
            <div className="h-8 w-10 rounded bg-[var(--surface-muted)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-full rounded bg-[var(--surface-muted)]" />
              <div className="h-3 w-1/3 rounded bg-[var(--surface-muted)]" />
            </div>
            <div className="h-3 w-10 rounded bg-[var(--surface-muted)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
