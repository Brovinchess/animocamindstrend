"use client";

import { useState, useEffect, useCallback } from "react";
import type { NewsItem } from "@/lib/fetch-news";
import { draftTweetsFromArticle, type TweetDraft } from "@/lib/tweet-drafter";

export function TweetFromNews() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [xAccounts, setXAccounts] = useState<string[]>([]);
  const [xConfigured, setXConfigured] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [drafts, setDrafts] = useState<TweetDraft[]>([]);
  const [activeDraft, setActiveDraft] = useState<string | null>(null);
  const [tweetText, setTweetText] = useState("");
  const [posting, setPosting] = useState(false);
  const [postResult, setPostResult] = useState<{ success: boolean; tweetUrl?: string; error?: string } | null>(null);

  useEffect(() => {
    async function checkStatus() {
      // Fetch articles
      try {
        const newsRes = await fetch("/api/news?limit=30");
        const newsData = await newsRes.json();
        if (newsData.success) setArticles(newsData.items);
      } catch {}

      // Check Twitter status
      try {
        const res = await fetch("/api/twitter/status");
        const data = await res.json();
        setXConfigured(data.configured);
        setXAccounts(data.accounts || []);
      } catch {}

      // Check URL params for callback
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

  // Top 15 articles sorted by salience
  const topArticles = articles
    .filter((a) => a.salienceScore !== "LOW")
    .slice(0, 15);

  return (
    <div className="space-y-6">
      {/* X Account */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" style={{ color: "var(--text-primary)" }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Post to X</h3>
          </div>
          {xAccounts.length === 0 && xConfigured && (
            <a
              href="/api/twitter/auth"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "var(--text-primary)" }}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Login with X
            </a>
          )}
        </div>

        {xAccounts.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>@{xAccounts[0]}</span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>connected</span>
          </div>
        ) : !xConfigured ? (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Twitter API keys detected. Click &quot;Login with X&quot; to connect your account.
          </p>
        ) : (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Connect your X account to tweet AI news directly from here.
          </p>
        )}
      </div>

      {/* Article picker */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
          Pick an article to tweet about
        </h3>
        <div className="rounded-xl border overflow-hidden divide-y" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
          {topArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => handleSelectArticle(article)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)] ${
                selectedArticle?.id === article.id ? "bg-[var(--surface-hover)]" : ""
              }`}
              style={{ borderColor: "var(--border)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-snug truncate" style={{ color: "var(--text-primary)" }}>
                  {article.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{article.source.name}</span>
                  {article.salienceScore === "HIGH" && (
                    <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal-dark">HOT</span>
                  )}
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0" style={{ color: selectedArticle?.id === article.id ? "#1DA1F2" : "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Tweet drafts */}
      {selectedArticle && drafts.length > 0 && (
        <div className="space-y-4">
          {/* Draft style picker */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
              Pick a tweet style
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {drafts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSelectDraft(d)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                    activeDraft === d.id ? "text-white" : "hover:bg-[var(--surface-hover)]"
                  }`}
                  style={
                    activeDraft === d.id
                      ? { background: "var(--text-primary)" }
                      : { background: "var(--surface-muted)", color: "var(--text-secondary)" }
                  }
                >
                  {d.style}
                </button>
              ))}
            </div>
          </div>

          {/* Tweet editor */}
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
            <textarea
              value={tweetText}
              onChange={(e) => { setTweetText(e.target.value); setPostResult(null); }}
              rows={5}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-y focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className={`text-[11px] font-medium ${tweetText.length > 280 ? "text-red-500" : tweetText.length > 250 ? "text-amber-500" : ""}`} style={tweetText.length <= 250 ? { color: "var(--text-muted)" } : undefined}>
                {tweetText.length}/280
              </span>

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
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--text-primary)" }}
                >
                  {posting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Posting...
                    </>
                  ) : (
                    <>
                      Post to X as @{xAccounts[0]}
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <a
                  href="/api/twitter/auth"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ background: "var(--text-primary)" }}
                >
                  Login with X to post
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tweetText);
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
