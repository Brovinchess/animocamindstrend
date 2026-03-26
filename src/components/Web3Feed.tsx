"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { NewsItem } from "@/lib/fetch-news";
import { NEWS_SOURCES } from "@/lib/news-sources";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useReadArticles } from "@/hooks/useReadArticles";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { NewsCard } from "./NewsCard";
import { NewsListItem } from "./NewsListItem";
import { DigestView } from "./DigestView";
import { TagFilter } from "./TagFilter";
import { SearchBar } from "./SearchBar";
import { StatsBar } from "./StatsBar";
import { ArticleModal } from "./ArticleModal";
import { TrendingSection } from "./TrendingSection";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { SortSelect, type SortOption } from "./SortSelect";
import { Toast } from "./Toast";
import { SourceLogo } from "./SourceLogo";
import { SkeletonGrid } from "./Skeleton";

const WEB3_SOURCES = NEWS_SOURCES.filter((s) => s.category === "web3");

export function Web3Feed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [sourceHealth, setSourceHealth] = useState<Record<string, "ok" | "error">>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("web3ViewMode", "grid");
  const [sortBy, setSortBy] = useLocalStorage<SortOption>("web3SortBy", "newest");

  const { bookmarkedIds, toggleBookmark, isBookmarked, count: bookmarkCount } = useBookmarks();
  const { markAsRead, isRead, readIds } = useReadArticles();

  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      const res = await fetch("/api/news?category=web3&limit=80");
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setSourceHealth(data.sourceHealth || {});
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError("Failed to load Web3 news");
      }
    } catch {
      setError("Failed to connect to news API");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = useMemo(() => {
    let result = items;
    if (showBookmarks) result = result.filter((i) => bookmarkedIds.includes(i.id));
    if (activeSource) result = result.filter((i) => i.source.slug === activeSource);
    if (activeTags.length > 0) result = result.filter((i) => activeTags.some((tag) => i.tags.includes(tag)));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.source.name.toLowerCase().includes(q));
    }
    const sorted = [...result];
    switch (sortBy) {
      case "oldest": sorted.sort((a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime()); break;
      case "source": sorted.sort((a, b) => a.source.name.localeCompare(b.source.name)); break;
      case "relevance": { const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 }; sorted.sort((a, b) => rank[a.salienceScore] - rank[b.salienceScore] || new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()); break; }
      default: sorted.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }
    return sorted;
  }, [items, activeSource, activeTags, search, showBookmarks, bookmarkedIds, sortBy]);

  const unreadCount = useMemo(() => items.filter((i) => !readIds.includes(i.id)).length, [items, readIds]);

  const handleSelectItem = useCallback((item: NewsItem) => { setSelectedItem(item); markAsRead(item.id); }, [markAsRead]);
  const showToast = useCallback((msg: string) => { setToastMsg(msg); setToastVisible(true); }, []);
  const handleShare = useCallback((item: NewsItem) => { navigator.clipboard.writeText(item.link).then(() => showToast("Link copied!")); }, [showToast]);
  const handleToggleTag = useCallback((tagId: string) => { setActiveTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]); }, []);

  const isHomeView = !activeSource && !search.trim() && !showBookmarks && activeTags.length === 0;

  const { focusedIndex } = useKeyboardNav({
    itemCount: filtered.length,
    onSelect: (idx) => handleSelectItem(filtered[idx]),
    onBookmark: (idx) => toggleBookmark(filtered[idx].id),
    onShare: (idx) => handleShare(filtered[idx]),
    searchRef,
    enabled: !selectedItem,
  });

  return (
    <div className="space-y-5">
      <StatsBar items={items} unreadCount={unreadCount} lastUpdated={lastUpdated} isRefreshing={refreshing} onRefresh={() => load(true)} />

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchBar ref={searchRef} value={search} onChange={setSearch} />
        </div>
        <ViewToggle view={viewMode} onChange={setViewMode} />
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      {/* Source pills */}
      <div className="flex flex-nowrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => { setActiveSource(null); setShowBookmarks(false); }}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${!activeSource && !showBookmarks ? "text-white" : ""}`}
          style={!activeSource && !showBookmarks ? { background: "#8b5cf6" } : { background: "var(--surface-muted)", color: "var(--text-secondary)" }}
        >All</button>
        {WEB3_SOURCES.map((source) => (
          <button
            key={source.slug}
            onClick={() => { setActiveSource(activeSource === source.slug ? null : source.slug); setShowBookmarks(false); }}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all ${activeSource === source.slug ? "text-white border-[#8b5cf6]" : "border-[var(--border)] hover:border-[#8b5cf6]/40"}`}
            style={activeSource === source.slug ? { background: "#8b5cf6" } : { background: "var(--surface-card)", color: "var(--text-secondary)" }}
          >
            <SourceLogo slug={source.slug} size="sm" />
            {source.name}
            {sourceHealth[source.slug] && <span className={`h-1.5 w-1.5 rounded-full ${sourceHealth[source.slug] === "ok" ? "bg-green-500" : "bg-red-400"}`} />}
          </button>
        ))}
        <button
          onClick={() => { setShowBookmarks(!showBookmarks); setActiveSource(null); }}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${showBookmarks ? "bg-amber-500 text-white" : ""}`}
          style={!showBookmarks ? { background: "var(--surface-muted)", color: "var(--text-secondary)" } : undefined}
        >Saved {bookmarkCount > 0 && `(${bookmarkCount})`}</button>
      </div>

      <TagFilter activeTags={activeTags} onToggleTag={handleToggleTag} items={items} />

      {isHomeView && !loading && items.length > 0 && viewMode !== "digest" && (
        <TrendingSection items={items} onSelect={handleSelectItem} />
      )}

      {loading && <SkeletonGrid />}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="py-20 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
          {showBookmarks ? "No bookmarked Web3 articles yet." : "No articles match your filters."}
        </div>
      )}

      {viewMode === "digest" ? (
        <DigestView items={filtered} onSelect={handleSelectItem} isBookmarked={isBookmarked} isRead={isRead} onToggleBookmark={toggleBookmark} />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, idx) => (
            <NewsCard key={item.id} item={item} index={idx} onClick={() => handleSelectItem(item)} isBookmarked={isBookmarked(item.id)} isRead={isRead(item.id)} isFocused={focusedIndex === idx} onToggleBookmark={() => toggleBookmark(item.id)} onShare={() => handleShare(item)} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
          {filtered.map((item, idx) => (
            <NewsListItem key={item.id} item={item} index={idx} onClick={() => handleSelectItem(item)} isBookmarked={isBookmarked(item.id)} isRead={isRead(item.id)} isFocused={focusedIndex === idx} onToggleBookmark={() => toggleBookmark(item.id)} />
          ))}
        </div>
      )}

      <ArticleModal item={selectedItem} onClose={() => setSelectedItem(null)} isBookmarked={selectedItem ? isBookmarked(selectedItem.id) : false} onToggleBookmark={() => selectedItem && toggleBookmark(selectedItem.id)} onShare={() => selectedItem && handleShare(selectedItem)} />
      <Toast message={toastMsg} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </div>
  );
}
