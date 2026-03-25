"use client";

import { useState, useRef, useEffect } from "react";

export type SortOption = "newest" | "oldest" | "source" | "relevance";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  source: "By source",
  relevance: "By relevance",
};

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors hover:bg-[var(--surface-hover)]"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        {SORT_LABELS[value]}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border shadow-lg animate-scale-in"
          style={{
            background: "var(--surface-card)",
            borderColor: "var(--border)",
          }}
        >
          {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              className={`flex w-full items-center px-3 py-2 text-xs transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-[var(--surface-hover)] ${
                value === key ? "text-teal-dark font-medium" : ""
              }`}
              style={value !== key ? { color: "var(--text-secondary)" } : undefined}
            >
              {label}
              {value === key && (
                <svg className="ml-auto h-3.5 w-3.5 text-teal" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
