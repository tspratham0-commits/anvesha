"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Source = {
  title: string;
  url: string;
};

type Report = {
  title: string;
  summary: string;
  problem: string;
  solution: string;
  customers: string[];
  market: string;
  competitors: string[];
  advantage: string;
  businessModel: string;
  marketing: string[];
  score: number;
  risks: string[];
  revenue: string;
  techStack: string[];
  mvp: string[];
  sources: Source[];
};

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const urlQuery = params.get("query");

    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, []);

  async function generate() {
    if (!query.trim() || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);
    setSaved(false);

    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.details ||
            data.error ||
            "Something went wrong."
        );
      } else {
        setReport(data);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to reach AI.");
    } finally {
      setLoading(false);
    }
  }

  async function saveReport() {
    if (!report || saving || saved) {
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.details ||
            data.error ||
            "Failed to save report."
        );

        return;
      }

      setSaved(true);
    } catch (error) {
      console.error(error);
      alert("Failed to save report.");
    } finally {
      setSaving(false);
    }
  }

  function newSearch() {
    setQuery("");
    setReport(null);
    setError("");
    setSaved(false);

    window.history.replaceState(
      {},
      "",
      "/discover"
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-12">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-6">

          <div>
            <Link
              href="/"
              className="text-green-400 transition hover:text-green-300"
            >
              ← Back to Anvesha AI
            </Link>

            <h1 className="mt-8 text-5xl font-bold md:text-6xl">
              💡 Startup Discovery
            </h1>

            <p className="mt-4 text-lg text-neutral-400">
              Anvesha researches the market using Tavily
              and analyzes the opportunity using local AI.
            </p>
          </div>

          <button
            onClick={newSearch}
            className="rounded-xl border border-neutral-700 px-6 py-4 transition hover:border-green-500"
          >
            New Search
          </button>

        </div>

        {/* SEARCH */}

        <div className="mt-12 flex gap-4">

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                generate();
              }
            }}
            placeholder="Example: AI Lawyer for Small Businesses"
            className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-5 text-lg outline-none focus:border-green-500"
          />

          <button
            onClick={generate}
            disabled={loading}
            className="rounded-xl bg-green-500 px-8 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Researching..."
              : "Generate Report"}
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-xl border border-red-700 bg-red-950 p-6 text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center">

            <div className="text-4xl">
              🔎
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              Researching the opportunity...
            </h2>

            <p className="mt-2 text-neutral-400">
              Tavily is searching the web and Ollama
              is analyzing the market.
            </p>

          </div>
        )}

        {/* REPORT */}

        {report && !loading && (

          <div className="mt-12">

            {/* REPORT HEADER */}

            <div className="rounded-3xl border border-neutral-700 bg-neutral-900 p-8 md:p-10">

              <div className="flex flex-col justify-between gap-8 md:flex-row">

                <div className="max-w-4xl">

                  <p className="text-sm font-bold uppercase tracking-[0.25em] text-green-400">
                    Startup Opportunity Report
                  </p>

                  <h2 className="mt-5 text-4xl font-bold md:text-6xl">
                    {report.title}
                  </h2>

                  <p className="mt-6 text-lg leading-8 text-neutral-300">
                    {formatValue(report.summary)}
                  </p>

                  <button
                    onClick={saveReport}
                    disabled={saving || saved}
                    className="mt-6 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saved
                      ? "✅ Report Saved"
                      : saving
                        ? "Saving..."
                        : "💾 Save Report"}
                  </button>

                </div>

                {/* SCORE */}

                <div className="flex min-w-[220px] flex-col items-center justify-center rounded-2xl border border-green-700 bg-green-950/30 p-8">

                  <p className="text-sm uppercase tracking-widest text-neutral-400">
                    Opportunity Score
                  </p>

                  <div className="mt-3 text-7xl font-bold text-green-400">
                    {report.score}
                  </div>

                  <p className="text-neutral-400">
                    / 100
                  </p>

                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-neutral-800">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            Number(report.score) || 0,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* MAIN SECTIONS */}

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <Section
                title="🔥 Problem"
                content={report.problem}
              />

              <Section
                title="💡 Solution"
                content={report.solution}
              />

              <Section
                title="📈 Market Opportunity"
                content={report.market}
              />

              <Section
                title="🏆 Competitive Advantage"
                content={report.advantage}
              />

              <Section
                title="💰 Business Model"
                content={report.businessModel}
              />

              <Section
                title="💵 Revenue Estimate"
                content={report.revenue}
              />

            </div>

            {/* LIST SECTIONS */}

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <ListSection
                title="👥 Target Customers"
                items={report.customers}
              />

              <ListSection
                title="⚔️ Competitors"
                items={report.competitors}
              />

              <ListSection
                title="📣 Marketing Strategy"
                items={report.marketing}
              />

              <ListSection
                title="⚠️ Business Risks"
                items={report.risks}
              />

              <ListSection
                title="🛠️ Technology Stack"
                items={report.techStack}
              />

              <ListSection
                title="🚀 MVP Roadmap"
                items={report.mvp}
                numbered
              />

            </div>

            {/* SOURCES */}

            <div className="mt-8 rounded-2xl border border-neutral-700 bg-neutral-900 p-8">

              <h2 className="text-2xl font-bold">
                🌐 Research Sources
              </h2>

              <p className="mt-2 text-neutral-400">
                Sources used by Anvesha to research this opportunity.
              </p>

              {Array.isArray(report.sources) &&
              report.sources.length > 0 ? (

                <div className="mt-6 space-y-3">

                  {report.sources.map(
                    (source, index) => (

                      <a
                        key={`${source.url}-${index}`}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-neutral-700 bg-black p-4 transition hover:border-green-500"
                      >

                        <p className="font-semibold text-white">
                          {formatValue(source.title)}
                        </p>

                        <p className="mt-2 truncate text-sm text-green-400">
                          {formatValue(source.url)}
                        </p>

                      </a>

                    )
                  )}

                </div>

              ) : (

                <p className="mt-6 text-neutral-500">
                  No research sources available.
                </p>

              )}

            </div>

          </div>

        )}

      </div>
    </main>
  );
}

function Section({
  title,
  content,
}: {
  title: string;
  content: unknown;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">

      <h3 className="mb-4 text-2xl font-bold">
        {title}
      </h3>

      <p className="leading-8 text-neutral-300">
        {formatValue(content)}
      </p>

    </div>
  );
}

function ListSection({
  title,
  items,
  numbered = false,
}: {
  title: string;
  items: unknown;
  numbered?: boolean;
}) {
  const safeItems = Array.isArray(items)
    ? items
    : items
      ? [items]
      : [];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">

      <h3 className="mb-5 text-2xl font-bold">
        {title}
      </h3>

      {safeItems.length > 0 ? (

        <div className="space-y-4">

          {safeItems.map((item, index) => (

            <div
              key={index}
              className="flex gap-4 text-neutral-300"
            >

              {numbered ? (

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-black">
                  {index + 1}
                </div>

              ) : (

                <span className="text-green-400">
                  •
                </span>

              )}

              <span>
                {formatValue(item)}
              </span>

            </div>

          ))}

        </div>

      ) : (

        <p className="text-neutral-500">
          No information available.
        </p>

      )}

    </div>
  );
}

function formatValue(value: unknown): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "Information unavailable.";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .join(" • ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(
        ([key, item]) =>
          `${key}: ${formatValue(item)}`
      )
      .join(" • ");
  }

  return String(value);
}