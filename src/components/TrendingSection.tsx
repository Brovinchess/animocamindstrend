"use client";

import type { NewsItem } from "@/lib/fetch-news";
import { formatDistanceToNow } from "date-fns";
import { SourceLogo } from "./SourceLogo";

interface TrendingSectionProps {
  items: NewsItem[];
  onSelect: (item: NewsItem) => void;
}

export function TrendingSection({ items, onSelect }: TrendingSectionProps) {
  // Get HIGH salience items from last 48h, fall back to newest
  const now = Date.now();
  const cutoff = now - 48 * 60 * 60 * 1000;

  let trending = items.filter(
    (i) => i.salienceScore === "HIGH" && new Date(i.pubDate).getTime() > cutoff
  );

  if (trending.length < 3) {
    trending = items.slice(0, 5);
  } else {
    trending = trending.slice(0, 5);
  }

  if (trending.length === 0) return null;

  const [featured, ...rest] = trending;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-4 w-4 text-teal" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
        </svg>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Trending
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Featured large card */}
        <button
          onClick={() => onSelect(featured)}
          className="group text-left rounded-xl border p-6 transition-all duration-200 hover:shadow-md"
          style={{
            background: "var(--surface-card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <SourceLogo slug={featured.source.slug} size="md" />
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {featured.source.name}
            </span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {safeTimeAgo(featured.pubDate)}
            </span>
            <span className="ml-auto rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal-dark">
              TRENDING
            </span>
          </div>
          <h3
            className="text-lg font-semibold leading-snug mb-2 group-hover:text-teal-dark transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            {featured.title}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>
            {featured.description}
          </p>
        </button>

        {/* Smaller trending cards */}
        <div className="flex flex-col gap-3">
          {rest.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="group flex items-start gap-3 text-left rounded-lg border p-3 transition-all hover:shadow-sm"
              style={{
                background: "var(--surface-card)",
                borderColor: "var(--border)",
              }}
            >
              <SourceLogo slug={item.source.slug} size="md" />
              <div className="min-w-0 flex-1">
                <h4
                  className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-teal-dark transition-colors"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {item.source.name}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {safeTimeAgo(item.pubDate)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function safeTimeAgo(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}
