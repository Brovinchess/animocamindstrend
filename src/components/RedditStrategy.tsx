"use client";

import { useState, useEffect, useCallback } from "react";
import type { RedditPost, HotTopic } from "@/lib/reddit";
import {
  analyzeTopicPosts,
  getTimingInsights,
  type TopicBreakdown,
  type TimingInsight,
} from "@/lib/reddit-analytics";
import { generateDrafts, type DraftTemplate } from "@/lib/draft-generator";
import { draftSimilarPost, buildRedditSubmitUrl } from "@/lib/draft-from-post";
import { scoreDraft, generateTitleVariations, suggestSubreddits, generateCommentDrafts, type DraftScore } from "@/lib/draft-scorer";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ProfileData {
  profile: {
    username: string;
    totalKarma: number;
    linkKarma: number;
    commentKarma: number;
    accountAge: number;
  };
  topSubreddits: { name: string; posts: number; totalScore: number; avgScore: number }[];
  hotFromYourSubs: { title: string; score: number; comments: number; subreddit: string; link: string; author: string; pubDate: string }[];
  topicAffinity: { topic: string; count: number }[];
  recommendations: string[];
}

export function RedditStrategy() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<TopicBreakdown | null>(null);
  const [timing, setTiming] = useState<TimingInsight[]>([]);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftSub, setDraftSub] = useState("");
  const [drafts, setDrafts] = useState<DraftTemplate[]>([]);
  const [activeDraft, setActiveDraft] = useState<string | null>(null);

  // Profile
  const [savedUsername, setSavedUsername] = useLocalStorage<string>("redditUsername", "");
  const [usernameInput, setUsernameInput] = useState("");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [draftScoreData, setDraftScoreData] = useState<DraftScore | null>(null);
  const [titleVariations, setTitleVariations] = useState<string[]>([]);
  const [showTitleGen, setShowTitleGen] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<{ postTitle: string; drafts: { angle: string; comment: string }[] } | null>(null);

  // Load Reddit trends
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reddit");
        const data = await res.json();
        if (data.success) {
          setPosts(data.posts);
          setHotTopics(data.hotTopics);
          setTiming(getTimingInsights(data.posts));
        }
      } catch {}
      setLoading(false);
    }
    load();
    const handleRefresh = () => { setLoading(true); load(); };
    window.addEventListener("reddit-refresh", handleRefresh);
    return () => window.removeEventListener("reddit-refresh", handleRefresh);
  }, []);

  // Auto-load saved profile
  useEffect(() => {
    if (savedUsername) {
      setUsernameInput(savedUsername);
      fetchProfile(savedUsername);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = useCallback(async (input: string) => {
    if (!input) return;
    // Extract username from various formats:
    // "https://www.reddit.com/user/username" or "u/username" or just "username"
    const username = input
      .replace(/https?:\/\/(www\.)?reddit\.com\/u(ser)?\//, "")
      .replace(/^u\//, "")
      .replace(/\/.*$/, "")
      .trim();
    if (!username) return;
    setProfileLoading(true);
    setProfileError("");
    try {
      const res = await fetch(`/api/reddit/profile?username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.success) {
        setProfileData(data);
        setSavedUsername(username);
        setUsernameInput(username);
      } else {
        setProfileData(null);
        setProfileError(data.error || "Could not load profile. Reddit may be rate-limiting — try again in a minute.");
      }
    } catch {
      setProfileData(null);
      setProfileError("Network error — Reddit may be rate-limiting. Try again in a minute.");
    }
    setProfileLoading(false);
  }, [setSavedUsername]);

  const handleSelectTopic = useCallback(
    (keyword: string) => {
      setSelectedTopic(keyword);
      const topic = hotTopics.find((t) => t.keyword === keyword);
      if (topic) {
        const bd = analyzeTopicPosts(topic, posts);
        setBreakdown(bd);
        const generated = generateDrafts(bd);
        setDrafts(generated);
        if (generated.length > 0) {
          const first = generated[0];
          setActiveDraft(first.id);
          setDraftTitle(first.title);
          setDraftBody(first.body);
          setDraftSub(first.targetSub);
        }
      }
    },
    [hotTopics, posts]
  );

  const handleSelectDraft = useCallback((draft: DraftTemplate) => {
    setActiveDraft(draft.id);
    setDraftTitle(draft.title);
    setDraftBody(draft.body);
    setDraftSub(draft.targetSub);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${draftTitle}\n\n${draftBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [draftTitle, draftBody]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FF4500] border-t-transparent" />
          <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>Loading Reddit analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Analyzer */}
      <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Your Reddit Profile
        </h3>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProfile(usernameInput)}
            placeholder="Paste Reddit profile link or username (e.g. reddit.com/user/yourname)"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500]/20"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
          />
          <button
            onClick={() => fetchProfile(usernameInput)}
            disabled={profileLoading || !usernameInput}
            className="rounded-lg bg-[#FF4500] px-4 py-2 text-xs font-medium text-white hover:bg-[#e03d00] disabled:opacity-50"
          >
            {profileLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {profileError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
            {profileError}
          </div>
        )}

        {profileData && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <Stat label="Username" value={`u/${profileData.profile.username}`} />
              <Stat label="Total Karma" value={profileData.profile.totalKarma.toLocaleString()} />
              <Stat label="Post Karma" value={profileData.profile.linkKarma.toLocaleString()} />
              <Stat label="Comment Karma" value={profileData.profile.commentKarma.toLocaleString()} />
              <Stat label="Account Age" value={`${Math.floor(profileData.profile.accountAge / 365)}y ${profileData.profile.accountAge % 365}d`} />
            </div>

            {/* Top subreddits */}
            {profileData.topSubreddits.length > 0 && (
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Your Top Subreddits
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profileData.topSubreddits.map((s) => (
                    <span
                      key={s.name}
                      className="rounded-full border px-2.5 py-1 text-[11px] font-medium"
                      style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      r/{s.name} <span style={{ color: "var(--text-muted)" }}>· {s.posts} posts · avg {s.avgScore} pts</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="rounded-lg p-4" style={{ background: "var(--surface-muted)" }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-teal-dark mb-2">
                Recommendations for you
              </p>
              {profileData.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                  <span className="text-teal mt-0.5 text-xs">→</span>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{rec}</p>
                </div>
              ))}
            </div>

            {/* Split trending topics into two sections */}
            {hotTopics.length > 0 && (() => {
              const userSubs = profileData.topSubreddits.map((s) => s.name.toLowerCase());
              const userTopics = profileData.topicAffinity.map((t) => t.topic.toLowerCase());

              // Related subs map — if user is in chess, also match gaming, strategy etc.
              const RELATED_SUBS: Record<string, string[]> = {
                chesscom: ["gaming", "chess", "boardgames"],
                chessvariants: ["gaming", "chess", "boardgames"],
                chessbeginners: ["gaming", "chess", "boardgames"],
                gaming: ["technology", "pcgaming", "games"],
                technology: ["gadgets", "Futurology", "science"],
                programming: ["coding", "technology", "learnprogramming"],
              };

              const expandedSubs = new Set(userSubs);
              for (const sub of userSubs) {
                const related = RELATED_SUBS[sub];
                if (related) related.forEach((r) => expandedSubs.add(r.toLowerCase()));
              }

              const forYou = hotTopics.filter((topic) => {
                const topicSubs = topic.subreddits.map((s) => s.toLowerCase());
                return (
                  topicSubs.some((s) => expandedSubs.has(s)) ||
                  userTopics.some((t) => topic.keyword.includes(t) || t.includes(topic.keyword))
                );
              });

              const otherTrending = hotTopics.filter((topic) => !forYou.includes(topic));

              return (
                <>
                  {/* Section 1: Hot from YOUR subs */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-teal-dark">
                      Hot in Your Subreddits — draft a similar post to ride the wave
                    </p>
                    {profileData.hotFromYourSubs && profileData.hotFromYourSubs.length > 0 ? (
                      <div className="rounded-xl border overflow-hidden divide-y" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
                        {profileData.hotFromYourSubs.slice(0, 8).map((post, i) => {
                          const draft = draftSimilarPost(post);
                          const draftUrl = buildRedditSubmitUrl(post.subreddit, draft.title, draft.body);

                          return (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 group" style={{ borderColor: "var(--border)" }}>
                              <div className="flex flex-col items-center shrink-0 w-10">
                                <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                                  {post.score > 999 ? `${(post.score / 1000).toFixed(1)}k` : post.score}
                                </span>
                                <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>pts</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium leading-snug hover:text-[#FF4500] transition-colors" style={{ color: "var(--text-primary)" }}>
                                  {post.title}
                                </a>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-[#FF4500]">r/{post.subreddit}</span>
                                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>· {post.comments} comments</span>
                                </div>
                              </div>
                              <a
                                href={draftUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-md bg-[#FF4500] px-2.5 py-1.5 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#e03d00] shrink-0"
                              >
                                Draft Similar
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs rounded-lg border p-3" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                        Could not load hot posts from your subs — Reddit may be rate-limiting. Try again in a minute.
                      </p>
                    )}
                  </div>

                  {/* Matched trending topics */}
                  {forYou.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-teal-dark">
                        Trending in Related Communities
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {forYou.map((topic) => (
                          <TopicDraftCard key={topic.keyword} topic={topic} highlight />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 2: All Trending */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                      All Trending Topics — hop on any wave
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {otherTrending.map((topic) => (
                        <TopicDraftCard key={topic.keyword} topic={topic} />
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Topic selection */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
          Select a trending topic to draft a post
        </h3>
        <div className="flex flex-wrap gap-2">
          {hotTopics.map((topic) => (
            <button
              key={topic.keyword}
              onClick={() => handleSelectTopic(topic.keyword)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all ${
                selectedTopic === topic.keyword ? "border-[#FF4500] bg-[#FF4500]/5" : "hover:bg-[var(--surface-hover)]"
              }`}
              style={{
                borderColor: selectedTopic === topic.keyword ? "#FF4500" : "var(--border)",
                color: selectedTopic === topic.keyword ? "#FF4500" : "var(--text-secondary)",
              }}
            >
              <span>{topic.signal === "fire" ? "🔥" : topic.signal === "rising" ? "📈" : "🌡️"}</span>
              <span className="font-medium">{topic.keyword}</span>
              <span className="text-[10px] opacity-60">{topic.count} posts</span>
            </button>
          ))}
        </div>
      </div>

      {/* Topic Breakdown */}
      {breakdown && (
        <div className="space-y-6">
          {/* Strategy cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard label="Best Subreddit" value={`r/${breakdown.bestSubreddit.name}`} detail={`avg ${breakdown.bestSubreddit.avgScore} pts`} />
            <InfoCard label="Best Time to Post" value={breakdown.bestTimeWindow} detail="Based on top posts" />
            <InfoCard label="Top Format" value={breakdown.patterns[0]?.pattern || "Mixed"} detail={breakdown.patterns[0] ? `avg ${breakdown.patterns[0].avgScore} pts` : ""} />
          </div>

          {/* Suggested angles */}
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Suggested Angles for &quot;{breakdown.topic.keyword}&quot;
            </h3>
            <div className="space-y-2">
              {breakdown.suggestedAngles.map((angle, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-teal mt-0.5">→</span>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{angle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-generated draft templates */}
          {drafts.length > 0 && (
            <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Pick a Draft — auto-filled, ready to customize
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {drafts.map((draft) => (
                  <button
                    key={draft.id}
                    onClick={() => handleSelectDraft(draft)}
                    className={`text-left rounded-lg border p-3 transition-all ${
                      activeDraft === draft.id ? "border-[#FF4500] bg-[#FF4500]/5" : "hover:bg-[var(--surface-hover)]"
                    }`}
                    style={{ borderColor: activeDraft === draft.id ? "#FF4500" : "var(--border)" }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#FF4500" }}>
                      {draft.angle}
                    </p>
                    <p className="text-[12px] font-medium leading-snug line-clamp-2" style={{ color: "var(--text-primary)" }}>
                      {draft.title}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>→ r/{draft.targetSub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Edit & Post — Enhanced */}
          <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Edit & Post</h3>
              {draftScoreData && (
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${draftScoreData.overall >= 70 ? "text-green-600" : draftScoreData.overall >= 50 ? "text-amber-500" : "text-red-500"}`}>
                    {draftScoreData.grade}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{draftScoreData.overall}/100</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {/* Subreddit */}
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider mb-1 block" style={{ color: "var(--text-tertiary)" }}>Subreddit</label>
                <select
                  value={draftSub}
                  onChange={(e) => setDraftSub(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
                >
                  <option value="">Select subreddit...</option>
                  {breakdown.topic.subreddits.map((s) => (
                    <option key={s} value={s}>r/{s}</option>
                  ))}
                </select>
              </div>

              {/* Title + Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Title</label>
                  <button
                    onClick={() => {
                      setTitleVariations(generateTitleVariations(breakdown.topic.keyword));
                      setShowTitleGen(!showTitleGen);
                    }}
                    className="text-[10px] font-medium text-[#FF4500] hover:underline"
                  >
                    {showTitleGen ? "Hide" : "Generate"} title ideas
                  </button>
                </div>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => { setDraftTitle(e.target.value); setDraftScoreData(null); }}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500]/20"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
                />

                {/* Title variations */}
                {showTitleGen && titleVariations.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {titleVariations.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => { setDraftTitle(v); setDraftScoreData(null); }}
                        className="w-full text-left rounded-md border px-3 py-1.5 text-[12px] transition-colors hover:bg-[var(--surface-hover)] hover:border-[#FF4500]/30"
                        style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Body */}
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider mb-1 block" style={{ color: "var(--text-tertiary)" }}>Body</label>
                <textarea
                  value={draftBody}
                  onChange={(e) => { setDraftBody(e.target.value); setDraftScoreData(null); }}
                  rows={6}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-y focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500]/20 font-mono text-[12px]"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Score button + results */}
              {draftTitle && (
                <button
                  onClick={() => setDraftScoreData(scoreDraft(draftTitle, draftBody, draftSub))}
                  className="w-full rounded-lg border py-2 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  Score My Draft
                </button>
              )}

              {/* Score breakdown */}
              {draftScoreData && (
                <div className="rounded-lg p-4 space-y-3" style={{ background: "var(--surface-muted)" }}>
                  {/* Score bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>Engagement Score</span>
                      <span className={`text-sm font-bold ${draftScoreData.overall >= 70 ? "text-green-600" : draftScoreData.overall >= 50 ? "text-amber-500" : "text-red-500"}`}>
                        {draftScoreData.overall}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "var(--border)" }}>
                      <div
                        className={`h-2 rounded-full transition-all ${draftScoreData.overall >= 70 ? "bg-green-500" : draftScoreData.overall >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${draftScoreData.overall}%` }}
                      />
                    </div>
                  </div>

                  {/* Factor breakdown */}
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {draftScoreData.breakdown.map((f) => (
                      <div key={f.name} className="flex items-center justify-between text-[11px]">
                        <span style={{ color: "var(--text-tertiary)" }}>{f.name}</span>
                        <span className={`font-medium ${f.score >= 70 ? "text-green-600" : f.score >= 50 ? "text-amber-500" : "text-red-500"}`}>
                          {f.score}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  {draftScoreData.suggestions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-tertiary)" }}>
                        Top improvements
                      </p>
                      {draftScoreData.suggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-1">
                          <span className="text-amber-500 text-[11px]">!</span>
                          <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              {draftTitle && draftSub && (
                <div className="flex gap-2">
                  <a
                    href={`https://old.reddit.com/r/${draftSub}/submit?selftext=true&title=${encodeURIComponent(draftTitle)}&text=${encodeURIComponent(draftBody)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#FF4500] py-3 text-sm font-medium text-white transition-colors hover:bg-[#e03d00]"
                  >
                    Post to r/{draftSub}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-1.5 rounded-lg border px-4 py-3 text-xs font-medium transition-colors hover:bg-[var(--surface-hover)]"
                    style={{ borderColor: "var(--border)", color: copied ? "#0d9488" : "var(--text-secondary)" }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comment Drafter — for easy karma */}
          {breakdown.topPosts.length > 0 && (
            <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Comment Drafter</h3>
              <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>
                Commenting on hot posts is the fastest way to build karma. Pick a post below.
              </p>
              <div className="space-y-2 mb-4">
                {breakdown.topPosts.slice(0, 5).map((a) => (
                  <button
                    key={a.post.id}
                    onClick={() => setCommentDrafts({ postTitle: a.post.title, drafts: generateCommentDrafts(a.post.title) })}
                    className={`w-full text-left flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] transition-colors hover:bg-[var(--surface-hover)] ${
                      commentDrafts?.postTitle === a.post.title ? "border-[#FF4500] bg-[#FF4500]/5" : ""
                    }`}
                    style={{ borderColor: commentDrafts?.postTitle === a.post.title ? "#FF4500" : "var(--border)", color: "var(--text-secondary)" }}
                  >
                    <span className="font-bold text-[11px] shrink-0" style={{ color: "var(--text-primary)" }}>
                      {a.post.score > 999 ? `${(a.post.score / 1000).toFixed(1)}k` : a.post.score}
                    </span>
                    <span className="truncate">{a.post.title}</span>
                  </button>
                ))}
              </div>

              {commentDrafts && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    Comment drafts — click to copy
                  </p>
                  {commentDrafts.drafts.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        navigator.clipboard.writeText(d.comment);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-full text-left rounded-lg border p-3 transition-colors hover:bg-[var(--surface-hover)] hover:border-[#FF4500]/30 group"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#FF4500" }}>{d.angle}</p>
                      <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{d.comment}</p>
                      <p className="text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }}>Click to copy</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subreddit Discovery */}
          {profileData && (
            <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Subreddit Discovery</h3>
              <p className="text-[11px] mb-3" style={{ color: "var(--text-muted)" }}>
                Expand your reach — these subs are related to yours or great for AI karma.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestSubreddits(profileData.topSubreddits.map((s) => s.name)).map((sub) => (
                  <a
                    key={sub.name}
                    href={`https://reddit.com/r/${sub.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-[var(--surface-hover)] hover:border-[#FF4500]/30"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#FF4500]">r/{sub.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{sub.reason}</p>
                    </div>
                    <span className="text-[10px] shrink-0 rounded-full px-2 py-0.5" style={{ background: "var(--surface-muted)", color: "var(--text-muted)" }}>
                      {sub.size}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Top posts for reference */}
          <div>
            <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Top Posts About &quot;{breakdown.topic.keyword}&quot; — Reference
            </h3>
            <div className="rounded-xl border overflow-hidden divide-y" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
              {breakdown.topPosts.slice(0, 5).map((analysis) => (
                <a
                  key={analysis.post.id}
                  href={analysis.post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex flex-col items-center shrink-0 w-10 pt-0.5">
                    <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {analysis.post.score > 999 ? `${(analysis.post.score / 1000).toFixed(1)}k` : analysis.post.score}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-snug" style={{ color: "var(--text-primary)" }}>{analysis.post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-[#FF4500]">r/{analysis.post.subreddit}</span>
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-medium" style={{ background: "var(--surface-muted)", color: "var(--text-tertiary)" }}>
                        {analysis.titlePattern}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{analysis.post.comments} comments</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timing insights */}
      {timing.length > 0 && (
        <div className="rounded-xl border p-5" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Best Posting Times</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {timing.map((t) => (
              <div key={t.subreddit} className="rounded-lg p-3" style={{ background: "var(--surface-muted)" }}>
                <p className="text-xs font-medium text-[#FF4500] mb-1">r/{t.subreddit}</p>
                <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>Peak: {t.peakHours.map((h) => `${h}:00`).join(", ")} UTC</p>
                <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Best day: {t.bestDay} · avg {t.avgScoreAtPeak} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

function TopicDraftCard({ topic, highlight }: { topic: HotTopic; highlight?: boolean }) {
  const draftTitle = `What's everyone's take on the recent ${topic.keyword} developments?`;
  const draftBody = `Seeing a lot of discussion around ${topic.keyword} lately.\n\nCurious what this community thinks about where this is headed. Is this overhyped or genuinely significant?\n\nWhat's been your experience so far?`;
  const bestSub = topic.subreddits[0] || "artificial";
  const draftUrl = `https://old.reddit.com/r/${bestSub}/submit?selftext=true&title=${encodeURIComponent(draftTitle)}&text=${encodeURIComponent(draftBody)}`;

  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 ${highlight ? "ring-1 ring-teal/30" : ""}`}
      style={{ borderColor: highlight ? "var(--border-hover)" : "var(--border)", background: "var(--surface-card)" }}
    >
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span>{topic.signal === "fire" ? "🔥" : topic.signal === "rising" ? "📈" : "🌡️"}</span>
          <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>{topic.keyword}</span>
          {highlight && (
            <span className="rounded-full bg-teal/10 px-1.5 py-0.5 text-[9px] font-semibold text-teal-dark">FOR YOU</span>
          )}
        </div>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {topic.count} posts · avg {topic.avgScore} pts · r/{topic.subreddits[0]}
        </p>
      </div>
      <a
        href={draftUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 rounded-md bg-[#FF4500] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-[#e03d00] shrink-0"
      >
        Draft Post
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

function InfoCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-card)" }}>
      <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>{label}</p>
      <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{detail}</p>
    </div>
  );
}
