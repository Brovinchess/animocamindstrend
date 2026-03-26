"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { NewsItem } from "@/lib/fetch-news";
import { AI_CATEGORIES } from "@/lib/news-sources";
import { draftTweetsFromArticle, type TweetDraft } from "@/lib/tweet-drafter";
import { buildThreadFromContent, type ThreadResult } from "@/lib/thread-builder";
import { formatDistanceToNow } from "date-fns";
import { SourceLogo } from "./SourceLogo";

type TopicFilter = "all" | "ai" | "web3" | "finance";

export function TweetFromNews() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [xAccounts, setXAccounts] = useState<string[]>([]);
  const [xConfigured, setXConfigured] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [drafts, setDrafts] = useState<TweetDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<string | null>(null);
  const [tweetText, setTweetText] = useState("");
  const [copied, setCopied] = useState(false);
  const [postingThread, setPostingThread] = useState(false);
  const [threadResult, setThreadResult] = useState<{ success: boolean; threadUrl?: string; error?: string; postedCount?: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");
  const [threadMode, setThreadMode] = useState(false);
  const [articleContent, setArticleContent] = useState<string | null>(null);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [contentThread, setContentThread] = useState<ThreadResult | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const newsRes = await fetch("/api/news?limit=200");
        const newsData = await newsRes.json();
        if (newsData.success) setArticles(newsData.items);
      } catch {}

      try {
        const res = await fetch("/api/twitter/status");
        const data = await res.json();
        setXConfigured(data.configured);
        setXAccounts(data.accounts || []);
      } catch {}

      const params = new URLSearchParams(window.location.search);
      const connected = params.get("twitter_connected");
      if (connected) {
        setXAccounts((prev) => prev.includes(connected) ? prev : [...prev, connected]);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    checkStatus();
  }, []);

  const handleSelectArticle = useCallback((article: NewsItem) => {
    setSelectedArticle(article);
    const generated = draftTweetsFromArticle(article);
    setDrafts(generated);
    if (generated.length > 0) {
      setActiveDraft(generated[0].id);
      setTweetText(generated[0].text);
    }
    setArticleContent(null);
    setContentThread(null);

    // Fetch full article content in background
    setFetchingContent(true);
    fetch("/api/fetch-article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: article.link }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.content) {
          setArticleContent(data.content);
          const thread = buildThreadFromContent(article.title, data.content, article.link, article.source.name);
          setContentThread(thread);
        }
      })
      .catch(() => {})
      .finally(() => setFetchingContent(false));
  }, []);

  const handleSelectDraft = useCallback((draft: TweetDraft) => {
    setActiveDraft(draft.id);
    setTweetText(draft.text);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(tweetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tweetText]);

  // Topic counts for badges
  const topicCounts = useMemo(() => {
    const ai = articles.filter((a) => AI_CATEGORIES.includes(a.source.category)).length;
    const web3 = articles.filter((a) => a.source.category === "web3").length;
    const finance = articles.filter((a) => a.source.category === "finance").length;
    return { all: articles.length, ai, web3, finance };
  }, [articles]);

  // Articles filtered by topic + search, sorted by salience then date
  const topArticles = articles
    .filter((a) => {
      if (topicFilter === "ai") return AI_CATEGORIES.includes(a.source.category);
      if (topicFilter === "web3") return a.source.category === "web3";
      if (topicFilter === "finance") return a.source.category === "finance";
      return true;
    })
    .filter((a) => !searchQuery.trim() || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.source.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return rank[a.salienceScore] - rank[b.salienceScore] || new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    })
    .slice(0, 50);

  // Thread tweets: use full article content thread if available, else split manually
  const threadTweets = useMemo(() => {
    if (!threadMode) return [tweetText];
    // If we have a content-based thread from the article fetcher, use it
    if (contentThread && contentThread.tweets.length > 1) {
      return contentThread.tweets;
    }
    // Fallback: manual split for edited text
    if (tweetText.length <= 280) return [tweetText];
    const words = tweetText.split(" ");
    const tweets: string[] = [];
    let current = "";
    for (const word of words) {
      if (current && (current + " " + word).length > 260) {
        tweets.push(current);
        current = word;
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
    if (current) tweets.push(current);
    return tweets.map((t, i) => `${t}\n\n${i + 1}/${tweets.length}`);
  }, [tweetText, threadMode, contentThread]);

  const currentTweetLen = threadMode ? Math.max(...threadTweets.map((t) => t.length)) : tweetText.length;
  const charPercent = Math.min((currentTweetLen / 280) * 100, 100);
  const charColor = currentTweetLen > 280 ? "#ef4444" : currentTweetLen > 250 ? "#f59e0b" : "#14b8a6";

  return (
    <div className="space-y-6">
      {/* X Account Connection Card */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--surface-muted)" }}>
              <svg className="h-5 w-5" style={{ color: "var(--text-primary)" }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Post to X</h3>
              {xAccounts.length > 0 ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>@{xAccounts[0]}</span>
                  <span className="text-[10px] rounded-full px-1.5 py-0.5" style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>connected</span>
                </div>
              ) : (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Connect your X account to post directly
                </p>
              )}
            </div>
          </div>
          {xAccounts.length === 0 && xConfigured && (
            <a
              href="/api/twitter/auth"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "#1d9bf0", color: "#ffffff" }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Connect X
            </a>
          )}
        </div>
      </div>

      {/* Topic Category Selector */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
          Choose a topic
        </h3>
        <div className="flex gap-1.5 mb-4">
          {([
            { id: "all" as TopicFilter, label: "All", count: topicCounts.all, color: "#14b8a6" },
            { id: "ai" as TopicFilter, label: "AI", count: topicCounts.ai, color: "#14b8a6" },
            { id: "web3" as TopicFilter, label: "Web3", count: topicCounts.web3, color: "#8b5cf6" },
            { id: "finance" as TopicFilter, label: "Finance", count: topicCounts.finance, color: "#10b981" },
          ]).map((topic) => (
            <button
              key={topic.id}
              onClick={() => { setTopicFilter(topic.id); setSelectedArticle(null); setSearchQuery(""); }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all active:scale-[0.97] ${
                topicFilter === topic.id ? "text-white shadow-sm" : "hover:bg-[var(--surface-hover)]"
              }`}
              style={
                topicFilter === topic.id
                  ? { background: topic.color }
                  : { background: "var(--surface-muted)", color: "var(--text-secondary)" }
              }
            >
              {topic.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                topicFilter === topic.id ? "bg-white/20" : ""
              }`}
              style={topicFilter !== topic.id ? { background: "var(--surface-hover)", color: "var(--text-muted)" } : undefined}
              >
                {topic.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Article Picker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Select an article to tweet
          </h3>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{topArticles.length} articles</span>
        </div>
        {/* Search within articles */}
        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter articles..."
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-xs outline-none transition-all focus:border-teal focus:ring-1 focus:ring-teal/20"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          />
        </div>
        <div className="rounded-xl border overflow-hidden divide-y max-h-[500px] overflow-y-auto scrollbar-none" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
          {topArticles.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No articles match your search</p>
            </div>
          ) : topArticles.map((article) => {
            const timeAgo = (() => { try { return formatDistanceToNow(new Date(article.pubDate), { addSuffix: true }); } catch { return ""; } })();
            return (
              <button
                key={article.id}
                onClick={() => handleSelectArticle(article)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-all ${
                  selectedArticle?.id === article.id
                    ? "bg-teal/5 border-l-2 border-l-teal"
                    : "hover:bg-[var(--surface-hover)] border-l-2 border-l-transparent"
                }`}
                style={{ borderBottomColor: "var(--border)" }}
              >
                <SourceLogo slug={article.source.slug} size="sm" />
              <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug truncate" style={{ color: "var(--text-primary)" }}>
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>{article.source.name}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{timeAgo}</span>
                    {article.salienceScore === "HIGH" && (
                      <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal-dark">HOT</span>
                    )}
                  </div>
                </div>
                <svg className="h-4 w-4 shrink-0 transition-transform" style={{ color: selectedArticle?.id === article.id ? "#14b8a6" : "var(--text-muted)", transform: selectedArticle?.id === article.id ? "translateX(2px)" : "" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tweet Composer */}
      {selectedArticle && drafts.length > 0 && (
        <div className="space-y-4 animate-fade-in-up">
          {/* Article Context Preview */}
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-dark">Source Article</span>
                  {selectedArticle.salienceScore === "HIGH" && (
                    <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal-dark">HIGH RELEVANCE</span>
                  )}
                </div>
                <h4 className="text-[13px] font-semibold leading-snug mb-1.5" style={{ color: "var(--text-primary)" }}>{selectedArticle.title}</h4>
                <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>{selectedArticle.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>{selectedArticle.source.name}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{selectedArticle.readingTime} min read</span>
                </div>
              </div>
              <a
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors hover:bg-[var(--surface-hover)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Open
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Draft Style Picker */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
              Tweet Style
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {drafts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSelectDraft(d)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                    activeDraft === d.id ? "" : "hover:bg-[var(--surface-hover)]"
                  }`}
                  style={
                    activeDraft === d.id
                      ? { background: "#14b8a6", color: "#ffffff" }
                      : { background: "var(--surface-muted)", color: "var(--text-secondary)" }
                  }
                >
                  {d.style}
                </button>
              ))}
            </div>
          </div>

          {/* Tweet Editor */}
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
            {/* Thread mode toggle */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                {threadMode
                  ? contentThread
                    ? `Article thread — ${contentThread.tweets.length} tweets`
                    : fetchingContent
                    ? "Reading article..."
                    : `Thread mode — ${threadTweets.length} tweets`
                  : "Single tweet"}
              </span>
              <button
                onClick={() => setThreadMode(!threadMode)}
                disabled={fetchingContent}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all disabled:opacity-50 ${threadMode ? "text-white" : ""}`}
                style={threadMode ? { background: "#1d9bf0" } : { background: "var(--surface-muted)", color: "var(--text-secondary)" }}
              >
                {fetchingContent ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Reading...
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    {contentThread ? `Thread (${contentThread.tweets.length})` : "Thread"}
                  </>
                )}
              </button>
            </div>

            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              rows={threadMode ? 8 : 6}
              className="w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed outline-none resize-y focus:border-teal focus:ring-1 focus:ring-teal/20"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
              placeholder={threadMode ? "Write your thread... text will be auto-split into tweets." : "Compose your tweet..."}
            />

            {/* Thread preview */}
            {threadMode && threadTweets.length > 1 && (
              <div className="mt-3 space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Thread Preview</span>
                {threadTweets.map((tweet, i) => (
                  <div key={i} className="rounded-lg border p-3 relative" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="h-5 w-5 rounded-full" style={{ background: "#1d9bf0" }} />
                      <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        {xAccounts[0] ? `@${xAccounts[0]}` : "You"}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Tweet {i + 1}/{threadTweets.length}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{tweet}</p>
                    <span className={`absolute top-2 right-2 text-[10px] font-medium ${tweet.length > 280 ? "text-red-500" : ""}`} style={tweet.length <= 280 ? { color: "var(--text-muted)" } : undefined}>
                      {tweet.length}/280
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Character count */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="relative h-1.5 w-24 rounded-full overflow-hidden" style={{ background: "var(--surface-muted)" }}>
                <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-300" style={{ width: `${charPercent}%`, background: charColor }} />
              </div>
              <span className="text-[11px] font-medium" style={{ color: charColor }}>
                {threadMode ? `${currentTweetLen}/280 (longest)` : `${tweetText.length}/280`}
              </span>
            </div>

            {/* One-Click Actions */}
            <div className="mt-4 space-y-2">
              {!threadMode ? (
                /* SINGLE TWEET — one button opens Twitter with text pre-filled */
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.98]"
                  style={{ background: "#1d9bf0", color: "#ffffff" }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Post on X — opens Twitter, just hit Post
                </a>
              ) : (
                /* THREAD — one-click post or fallback options */
                <div className="space-y-2">
                  {/* Primary: One-click post entire thread via API (if connected) */}
                  {xAccounts.length > 0 ? (
                    <button
                      onClick={async () => {
                        setPostingThread(true);
                        setThreadResult(null);
                        try {
                          const res = await fetch("/api/twitter/thread", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ screenName: xAccounts[0], tweets: threadTweets }),
                          });
                          const result = await res.json();
                          setThreadResult(result);
                        } catch {
                          setThreadResult({ success: false, error: "Network error" });
                        }
                        setPostingThread(false);
                      }}
                      disabled={postingThread || threadTweets.some((t) => t.length > 280)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                      style={{ background: "#1d9bf0", color: "#ffffff" }}
                    >
                      {postingThread ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Posting {threadTweets.length} tweets...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          Post entire thread ({threadTweets.length} tweets) as @{xAccounts[0]}
                        </>
                      )}
                    </button>
                  ) : (
                    /* Not connected: connect prompt */
                    <a
                      href="/api/twitter/auth"
                      className="flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.98]"
                      style={{ background: "#1d9bf0", color: "#ffffff" }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Connect X to post entire thread in one click
                    </a>
                  )}

                  {/* Thread result feedback */}
                  {threadResult && (
                    <div className={`rounded-lg p-3 text-center text-sm font-medium ${threadResult.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
                      {threadResult.success ? (
                        <a href={threadResult.threadUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          Thread posted! ({threadResult.postedCount} tweets) — View on X →
                        </a>
                      ) : (
                        threadResult.error
                      )}
                    </div>
                  )}

                  {/* Secondary: Copy all tweets */}
                  <button
                    onClick={() => {
                      const fullThread = threadTweets.map((t, i) => `--- Tweet ${i + 1}/${threadTweets.length} ---\n${t}`).join("\n\n");
                      navigator.clipboard.writeText(fullThread);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-all hover:bg-[var(--surface-hover)] active:scale-[0.98]"
                    style={{ borderColor: "var(--border)", color: copied ? "#16a34a" : "var(--text-secondary)" }}
                  >
                    {copied ? (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        All {threadTweets.length} tweets copied!
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Copy all {threadTweets.length} tweets
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Copy single tweet (non-thread) */}
              {!threadMode && (
                <button
                  onClick={handleCopy}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-medium transition-all hover:bg-[var(--surface-hover)] active:scale-[0.98]"
                  style={{ borderColor: "var(--border)", color: copied ? "#16a34a" : "var(--text-secondary)" }}
                >
                  {copied ? (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      Copy tweet
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no article selected */}
      {!selectedArticle && topArticles.length > 0 && (
        <div className="rounded-xl border-2 border-dashed p-8 text-center" style={{ borderColor: "var(--border)" }}>
          <svg className="mx-auto h-8 w-8 mb-3" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Select an article above</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Choose an article to generate tweet drafts with multiple styles</p>
        </div>
      )}
    </div>
  );
}
