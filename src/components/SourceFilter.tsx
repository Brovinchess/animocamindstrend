"use client";

import { NEWS_SOURCES, CATEGORY_LABELS, type CategoryType } from "@/lib/news-sources";
import { SourceLogo } from "./SourceLogo";

interface SourceFilterProps {
  activeSource: string | null;
  activeCategory: CategoryType | null;
  showBookmarks: boolean;
  bookmarkCount: number;
  sourceHealth: Record<string, "ok" | "error">;
  onSourceChange: (slug: string | null) => void;
  onCategoryChange: (category: CategoryType | null) => void;
  onToggleBookmarks: () => void;
  onExportBookmarks: () => void;
}

export function SourceFilter({
  activeSource,
  activeCategory,
  showBookmarks,
  bookmarkCount,
  sourceHealth,
  onSourceChange,
  onCategoryChange,
  onToggleBookmarks,
  onExportBookmarks,
}: SourceFilterProps) {
  return (
    <div className="space-y-3">
      {/* Categories */}
      <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Pill
          active={!activeCategory && !activeSource && !showBookmarks}
          onClick={() => {
            onCategoryChange(null);
            onSourceChange(null);
          }}
        >
          All
        </Pill>
        {(Object.entries(CATEGORY_LABELS) as [CategoryType, string][]).map(
          ([key, label]) => (
            <Pill
              key={key}
              active={activeCategory === key && !showBookmarks}
              onClick={() => {
                onCategoryChange(activeCategory === key ? null : key);
                onSourceChange(null);
              }}
            >
              {label}
            </Pill>
          )
        )}
        <Pill active={showBookmarks} onClick={onToggleBookmarks} accent>
          Saved {bookmarkCount > 0 && `(${bookmarkCount})`}
        </Pill>
        {bookmarkCount > 0 && (
          <button
            onClick={onExportBookmarks}
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--surface-hover)]"
            style={{ color: "var(--text-muted)" }}
            title="Export bookmarks as JSON"
          >
            <svg className="h-3.5 w-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        )}
      </div>

      {/* Source pills */}
      {!showBookmarks && (
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {NEWS_SOURCES.filter(
            (s) => !activeCategory || s.category === activeCategory
          ).map((source) => {
            const health = sourceHealth[source.slug];
            return (
              <button
                key={source.slug}
                onClick={() =>
                  onSourceChange(activeSource === source.slug ? null : source.slug)
                }
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all ${
                  activeSource === source.slug
                    ? "bg-teal-dark text-white border-teal-dark"
                    : "border-[var(--border)] hover:border-teal/40"
                }`}
                style={
                  activeSource !== source.slug
                    ? { background: "var(--surface-card)", color: "var(--text-secondary)" }
                    : undefined
                }
              >
                <SourceLogo slug={source.slug} size="sm" />
                {source.name}
                {health && (
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      health === "ok" ? "bg-green-500" : "bg-red-400"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
        active
          ? accent
            ? "bg-amber-500 text-white"
            : "bg-teal text-white"
          : "hover:bg-[var(--surface-hover)]"
      }`}
      style={!active ? { background: "var(--surface-muted)", color: "var(--text-secondary)" } : undefined}
    >
      {children}
    </button>
  );
}
