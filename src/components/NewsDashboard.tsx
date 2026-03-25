"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import type { NewsItem } from "@/lib/fetch-news";
import type { CategoryType } from "@/lib/news-sources";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useReadArticles } from "@/hooks/useReadArticles";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { NewsCard } from "./NewsCard";
import { NewsListItem } from "./NewsListItem";
import { DigestView } from "./DigestView";
import { SourceFilter } from "./SourceFilter";
import { TagFilter } from "./TagFilter";
import { SearchBar } from "./SearchBar";
import { StatsBar } from "./StatsBar";
import { ArticleModal } from "./ArticleModal";
import { TrendingSection } from "./TrendingSection";
import { ViewToggle, type ViewMode } from "./ViewToggle";
import { SortSelect, type SortOption } from "./SortSelect";
import { Toast } from "./Toast";
import { MobileNav } from "./MobileNav";
import { SkeletonGrid } from "./Skeleton";

export function NewsDashboard() {
  // Core data
  const [items, setItems] = useState<NewsItem[]>([]);
  const [sourceHealth, setSourceHealth] = useState<Record<string, "ok" | "error">>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  // Preferences
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("viewMode", "grid");
  const [sortBy, setSortBy] = useLocalStorage<SortOption>("sortBy", "newest");

  // Hooks
  const { bookmarkedIds, toggleBookmark, isBookmarked, count: bookmarkCount } = useBookmarks();
  const { markAsRead, isRead, readIds } = useReadArticles();
  const { isDark, cycleTheme } = useDarkMode();

  // Toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // Refs
  const searchRef = useRef<HTMLInputElement>(null);

  // Data fetching
  const load = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setSourceHealth(data.sourceHealth || {});
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError("Failed to load news");
      }
    } catch {
      setError("Failed to connect to news API");
    } finally {
      setLoading(false);
      setRefreshing(false);
      // Also trigger Reddit sections to refresh
      if (isManual) {
        window.dispatchEvent(new CustomEvent("reddit-refresh"));
      }
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 30 * 60 * 1000); // 30 min
    return () => clearInterval(interval);
  }, [load]);

  // Filtering + sorting
  const filtered = useMemo(() => {
    let result = items;

    if (showBookmarks) {
      result = result.filter((i) => bookmarkedIds.includes(i.id));
    }
    if (activeSource) {
      result = result.filter((i) => i.source.slug === activeSource);
    }
    if (activeCategory) {
      result = result.filter((i) => i.source.category === activeCategory);
    }
    if (activeTags.length > 0) {
      result = result.filter((i) =>
        activeTags.some((tag) => i.tags.includes(tag))
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.source.name.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.pubDate).getTime() - new Date(b.pubDate).getTime());
        break;
      case "source":
        sorted.sort((a, b) => a.source.name.localeCompare(b.source.name));
        break;
      case "relevance": {
        const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        sorted.sort((a, b) => rank[a.salienceScore] - rank[b.salienceScore] || new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        break;
      }
      default:
        sorted.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }

    return sorted;
  }, [items, activeSource, activeCategory, activeTags, search, showBookmarks, bookmarkedIds, sortBy]);

  // Unread count
  const unreadCount = useMemo(
    () => items.filter((i) => !readIds.includes(i.id)).length,
    [items, readIds]
  );

  // Handlers
  const handleSelectItem = useCallback(
    (item: NewsItem) => {
      setSelectedItem(item);
      markAsRead(item.id);
    },
    [markAsRead]
  );

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  const handleShare = useCallback(
    (item: NewsItem) => {
      navigator.clipboard.writeText(item.link).then(() => showToast("Link copied!"));
    },
    [showToast]
  );

  const handleCloseModal = useCallback(() => setSelectedItem(null), []);

  const handleToggleTag = useCallback((tagId: string) => {
    setActiveTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }, []);

  const handleExportBookmarks = useCallback(() => {
    const bookmarked = items.filter((i) => bookmarkedIds.includes(i.id));
    const data = {
      exported: new Date().toISOString(),
      count: bookmarked.length,
      articles: bookmarked.map((i) => ({
        title: i.title,
        link: i.link,
        source: i.source.name,
        date: i.pubDate,
        tags: i.tags,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `animocaminds-bookmarks-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Bookmarks exported!");
  }, [items, bookmarkedIds, showToast]);

  const isHomeView = !activeSource && !activeCategory && !search.trim() && !showBookmarks && activeTags.length === 0;

  // Keyboard nav
  const { focusedIndex } = useKeyboardNav({
    itemCount: filtered.length,
    onSelect: (idx) => handleSelectItem(filtered[idx]),
    onBookmark: (idx) => toggleBookmark(filtered[idx].id),
    onShare: (idx) => handleShare(filtered[idx]),
    searchRef,
    enabled: !selectedItem,
  });

  return (
    <div className="space-y-5 pb-20 md:pb-0">
      <StatsBar
        items={items}
        unreadCount={unreadCount}
        lastUpdated={lastUpdated}
        isRefreshing={refreshing}
        onRefresh={() => load(true)}
      />

      {/* Toolbar: search + view toggle + sort */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SearchBar ref={searchRef} value={search} onChange={setSearch} />
        </div>
        <ViewToggle view={viewMode} onChange={setViewMode} />
        <SortSelect value={sortBy} onChange={setSortBy} />
      </div>

      <SourceFilter
        activeSource={activeSource}
        activeCategory={activeCategory}
        showBookmarks={showBookmarks}
        bookmarkCount={bookmarkCount}
        sourceHealth={sourceHealth}
        onSourceChange={(s) => { setActiveSource(s); setShowBookmarks(false); }}
        onCategoryChange={(c) => { setActiveCategory(c); setShowBookmarks(false); }}
        onToggleBookmarks={() => {
          setShowBookmarks(!showBookmarks);
          setActiveSource(null);
          setActiveCategory(null);
        }}
        onExportBookmarks={handleExportBookmarks}
      />

      {/* Topic tags */}
      <TagFilter
        activeTags={activeTags}
        onToggleTag={handleToggleTag}
        items={items}
      />

      {/* Trending section — only on home view */}
      {isHomeView && !loading && items.length > 0 && viewMode !== "digest" && (
        <TrendingSection items={items} onSelect={handleSelectItem} />
      )}

      {loading && <SkeletonGrid />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-20 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
          {showBookmarks ? "No bookmarked articles yet." : "No articles match your filters."}
        </div>
      )}

      {/* Articles: Grid, List, or Digest */}
      {viewMode === "digest" ? (
        <DigestView
          items={filtered}
          onSelect={handleSelectItem}
          isBookmarked={isBookmarked}
          isRead={isRead}
          onToggleBookmark={toggleBookmark}
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, idx) => (
            <NewsCard
              key={item.id}
              item={item}
              index={idx}
              onClick={() => handleSelectItem(item)}
              isBookmarked={isBookmarked(item.id)}
              isRead={isRead(item.id)}
              isFocused={focusedIndex === idx}
              onToggleBookmark={() => toggleBookmark(item.id)}
              onShare={() => handleShare(item)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
          {filtered.map((item, idx) => (
            <NewsListItem
              key={item.id}
              item={item}
              index={idx}
              onClick={() => handleSelectItem(item)}
              isBookmarked={isBookmarked(item.id)}
              isRead={isRead(item.id)}
              isFocused={focusedIndex === idx}
              onToggleBookmark={() => toggleBookmark(item.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <ArticleModal
        item={selectedItem}
        onClose={handleCloseModal}
        isBookmarked={selectedItem ? isBookmarked(selectedItem.id) : false}
        onToggleBookmark={() => selectedItem && toggleBookmark(selectedItem.id)}
        onShare={() => selectedItem && handleShare(selectedItem)}
      />

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} onHide={() => setToastVisible(false)} />

      {/* Mobile nav */}
      <MobileNav
        showBookmarks={showBookmarks}
        bookmarkCount={bookmarkCount}
        onToggleBookmarks={() => {
          setShowBookmarks(!showBookmarks);
          setActiveSource(null);
          setActiveCategory(null);
        }}
        onFocusSearch={() => searchRef.current?.focus()}
        onToggleTheme={cycleTheme}
        isDark={isDark}
      />
    </div>
  );
}
