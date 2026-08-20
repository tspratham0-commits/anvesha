"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Report = {
  id: number;
  title: string;
  summary: string;
  score: number;
  createdAt: string;
};

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const response = await fetch("/api/reports");

      if (!response.ok) {
        throw new Error("Failed to load reports");
      }

      const data = await response.json();

      setReports(data);
    } catch (error) {
      console.error("Dashboard reports error:", error);
    } finally {
      setLoading(false);
    }
  }

  const averageScore =
    reports.length > 0
      ? Math.round(
          reports.reduce(
            (total, report) => total + report.score,
            0
          ) / reports.length
        )
      : 0;

  const recentReports = reports.slice(0, 3);

  return (
    <main className="mx-auto max-w-7xl">

      {/* HEADER */}

      <div className="mb-12">

        <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
          Anvesha Intelligence
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight">
          Good to see you, Pratham 👋
        </h1>

        <p className="mt-4 text-lg text-neutral-400">
          Your personal AI startup intelligence workspace.
        </p>

      </div>

      {/* MAIN ACTIONS */}

      <div className="grid gap-6 md:grid-cols-2">

        <Link
          href="/chat"
          className="group rounded-2xl border border-green-500 bg-neutral-900 p-7 transition hover:bg-neutral-800"
        >

          <div className="text-4xl">
            💬
          </div>

          <h2 className="mt-6 text-2xl font-bold">
            Talk to Anvesha
          </h2>

          <p className="mt-3 leading-7 text-neutral-400">
            Ask questions, research ideas, analyze problems, and think with your AI assistant.
          </p>

          <p className="mt-6 font-semibold text-green-400">
            Open AI Chat →
          </p>

        </Link>

        <Link
          href="/discover"
          className="group rounded-2xl border border-neutral-800 bg-neutral-900 p-7 transition hover:border-green-500 hover:bg-neutral-800"
        >

          <div className="text-4xl">
            💡
          </div>

          <h2 className="mt-6 text-2xl font-bold">
            Discover a Startup
          </h2>

          <p className="mt-3 leading-7 text-neutral-400">
            Research an idea with live web data and generate a complete startup opportunity report.
          </p>

          <p className="mt-6 font-semibold text-green-400">
            Start Discovery →
          </p>

        </Link>

      </div>

      {/* STATISTICS */}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <div className="text-3xl">
            📚
          </div>

          <p className="mt-6 text-neutral-400">
            Saved Reports
          </p>

          <p className="mt-2 text-3xl font-bold">
            {loading ? "..." : reports.length}
          </p>

        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <div className="text-3xl">
            ⭐
          </div>

          <p className="mt-6 text-neutral-400">
            Average Score
          </p>

          <p className="mt-2 text-3xl font-bold">
            {loading ? "..." : `${averageScore}/100`}
          </p>

        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <div className="text-3xl">
            🔬
          </div>

          <p className="mt-6 text-neutral-400">
            Research Engine
          </p>

          <p className="mt-2 text-3xl font-bold">
            Tavily
          </p>

        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">

          <div className="text-3xl">
            🧠
          </div>

          <p className="mt-6 text-neutral-400">
            AI Engine
          </p>

          <p className="mt-2 text-3xl font-bold">
            Ollama
          </p>

        </div>

      </div>

      {/* RECENT REPORTS */}

      <div className="mt-16">

        <div className="flex items-end justify-between">

          <div>

            <h2 className="text-3xl font-bold">
              Recent Reports
            </h2>

            <p className="mt-2 text-neutral-400">
              Your latest startup research.
            </p>

          </div>

          <Link
            href="/reports"
            className="font-semibold text-green-400 transition hover:text-green-300"
          >
            View All →
          </Link>

        </div>

        {loading ? (

          <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-neutral-400">
            Loading reports...
          </div>

        ) : recentReports.length === 0 ? (

          <div className="mt-8 rounded-2xl border border-dashed border-neutral-700 bg-neutral-900 p-10 text-center">

            <div className="text-5xl">
              📄
            </div>

            <h3 className="mt-5 text-2xl font-bold">
              No reports yet
            </h3>

            <p className="mt-3 text-neutral-400">
              Generate your first startup opportunity report.
            </p>

            <Link
              href="/discover"
              className="mt-6 inline-block rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400"
            >
              Start Discovery
            </Link>

          </div>

        ) : (

          <div className="mt-8 space-y-4">

            {recentReports.map((report) => (

              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="flex flex-col justify-between gap-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition hover:border-green-500 md:flex-row md:items-center"
              >

                <div className="min-w-0">

                  <h3 className="truncate text-xl font-bold">
                    {report.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-neutral-400">
                    {report.summary}
                  </p>

                  <p className="mt-3 text-sm text-neutral-500">
                    {formatDate(report.createdAt)}
                  </p>

                </div>

                <div className="flex shrink-0 items-center gap-5">

                  <div className="rounded-xl bg-green-950 px-5 py-3 text-center">

                    <p className="text-2xl font-bold text-green-400">
                      {report.score}
                    </p>

                    <p className="text-xs text-neutral-400">
                      /100
                    </p>

                  </div>

                  <span className="text-xl text-neutral-500">
                    →
                  </span>

                </div>

              </Link>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}
