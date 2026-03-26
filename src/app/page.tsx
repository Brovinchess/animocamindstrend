"use client";

import Image from "next/image";
import { useState } from "react";
import { NewsDashboard } from "@/components/NewsDashboard";
import { RedditTrends } from "@/components/RedditTrends";
import { RedditStrategy } from "@/components/RedditStrategy";
import { HackerNewsFeed } from "@/components/HackerNewsFeed";
import { Web3Feed } from "@/components/Web3Feed";
import { FinanceFeed } from "@/components/FinanceFeed";
import { TweetFromNews } from "@/components/TweetFromNews";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TabNav, type TabId } from "@/components/TabNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NEWS_SOURCES } from "@/lib/news-sources";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("news");

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* Header */}
        <header className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
              <Image
                src="/ablogo.svg"
                alt="Animoca Brands"
                width={24}
                height={14}
                className="shrink-0"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Animocaminds
                <span className="text-teal ml-1.5 font-semibold">Trends</span>
              </h1>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                AI, Web3 & Finance — {NEWS_SOURCES.length} sources live
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Tab Navigation */}
        <TabNav
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Tab Content — all tabs stay mounted, hidden with CSS to preserve cache */}
        <div className={`min-h-[60vh] ${activeTab === "news" ? "animate-tab-in" : "hidden"}`}>
          <NewsDashboard />
        </div>
        <div className={`min-h-[60vh] ${activeTab === "web3" ? "animate-tab-in" : "hidden"}`}>
          <Web3Feed />
        </div>
        <div className={`min-h-[60vh] ${activeTab === "finance" ? "animate-tab-in" : "hidden"}`}>
          <FinanceFeed />
        </div>
        <div className={`min-h-[60vh] ${activeTab === "hackernews" ? "animate-tab-in" : "hidden"}`}>
          <HackerNewsFeed />
        </div>
        <div className={`min-h-[60vh] ${activeTab === "reddit" ? "animate-tab-in" : "hidden"}`}>
          <RedditTrends />
        </div>
        <div className={`min-h-[60vh] ${activeTab === "strategy" ? "animate-tab-in" : "hidden"}`}>
          <RedditStrategy />
        </div>
        <div className={`min-h-[60vh] ${activeTab === "tweet" ? "animate-tab-in" : "hidden"}`}>
          <TweetFromNews />
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t pt-6 pb-8" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                Agent API
              </p>
              <div className="flex flex-wrap gap-2">
                <code
                  className="rounded-md border px-3 py-1.5 text-xs font-mono"
                  style={{ background: "var(--surface-muted)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
                >
                  GET /api/agent?limit=20
                </code>
                <code
                  className="rounded-md border px-3 py-1.5 text-xs font-mono"
                  style={{ background: "var(--surface-muted)", color: "var(--text-secondary)", borderColor: "var(--border)" }}
                >
                  POST /api/agent
                </code>
              </div>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Animocaminds Trend Analysis
            </p>
          </div>
        </footer>
      </div>

      <ScrollToTop />
    </div>
  );
}
