"use client";

import { useState, useEffect, useCallback } from "react";
import type { NewsItem } from "@/lib/fetch-news";
import { draftTweetsFromArticle, type TweetDraft } from "@/lib/tweet-drafter";
import { formatDistanceToNow } from "date-fns";

export function TweetFromNews() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [xAccounts, setXAccounts] = useState<string[]>([]);
  const [xConfigured, setXConfigured] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [drafts, setDrafts] = useState<TweetDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<string | null>(null);
  const [tweetText, setTweetText] = useState("");
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [postResult, setPostResult] = useState<{ success: boolean; tweetUrl?: string; error?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function checkStatus() {
      try {
        const newsRes = await fetch("/api/news?limit=30");
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
    setPostResult(null);
  }, []);

  const handleSelectDraft = useCallback((draft: TweetDraft) => {
    setActiveDraft(draft.id);
    setTweetText(draft.text);
    setPostResult(null);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(tweetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tweetText]);

  const handleTweet = useCallback(async () => {
    if (!xAccounts[0] || !tweetText) return;
    setPosting(true);
    setPostResult(null);
    try {
      const res = await fetch("/api/twitter/tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenName: xAccounts[0], text: tweetText }),
      });
      const result = await res.json();
      setPostResult(result);
    } catch {
      setPostResult({ success: false, error: "Network error" });
    }
    setPosting(false);
  }, [xAccounts, tweetText]);

  // Top articles sorted by salience, with search filter
  const topArticles = articles
    .filter((a) => a.salienceScore !== "LOW")
    .filter((a) => !searchQuery.trim() || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.source.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 15);

  const charPercent = Math.min((tweetText.length / 280) * 100, 100);
  const charColor = tweetText.length > 280 ? "#ef4444" : tweetText.length > 250 ? "#f59e0b" : "#14b8a6";

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
        <div className="rounded-xl border overflow-hidden divide-y max-h-[400px] overflow-y-auto scrollbar-none" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
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
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-snug truncate" style={{ color: selectedArticle?.id === article.id ? "var(--text-primary)" : "var(--text-primary)" }}>
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
            <textarea
              value={tweetText}
              onChange={(e) => { setTweetText(e.target.value); setPostResult(null); }}
              rows={6}
              className="w-full rounded-lg border px-3 py-2.5 text-sm leading-relaxed outline-none resize-y focus:border-teal focus:ring-1 focus:ring-teal/20"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
              placeholder="Compose your tweet..."
            />

            {/* Character count with visual progress */}
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-2">
                <div className="relative h-1.5 w-24 rounded-full overflow-hidden" style={{ background: "var(--surface-muted)" }}>
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                    style={{ width: `${charPercent}%`, background: charColor }}
                  />
                </div>
                <span className="text-[11px] font-medium" style={{ color: charColor }}>
                  {tweetText.length}/280
                </span>
              </div>

              {postResult && (
                <span className={`text-[11px] font-medium ${postResult.success ? "text-green-600" : "text-red-500"}`}>
                  {postResult.success ? (
                    <a href={postResult.tweetUrl} target="_blank" rel="noopener noreferrer" className="underline">
                      Posted! View tweet →
                    </a>
                  ) : (
                    postResult.error
                  )}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {xAccounts.length > 0 ? (
                <button
                  onClick={handleTweet}
                  disabled={posting || tweetText.length === 0 || tweetText.length > 280}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: "#1d9bf0", color: "#ffffff" }}
                >
                  {posting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Post as @{xAccounts[0]}
                    </>
                  )}
                </button>
              ) : (
                <a
                  href="/api/twitter/auth"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{ background: "#1d9bf0", color: "#ffffff" }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Connect X to post
                </a>
              )}
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-medium transition-all hover:bg-[var(--surface-hover)]"
                style={{ borderColor: "var(--border)", color: copied ? "#16a34a" : "var(--text-secondary)" }}
              >
                {copied ? (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
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
