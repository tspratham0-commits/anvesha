"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Report = {
  id: number;
  title: string;
  summary: string;
  score: number;
  createdAt: string;
};

type Filter = "all" | "90" | "80";

type SortOption =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<Filter>("all");

  const [sort, setSort] =
    useState<SortOption>("newest");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const res = await fetch(
        "/api/reports"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Failed to load reports."
        );
      }

      setReports(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = useMemo(() => {
    const searchTerm =
      search.toLowerCase().trim();

    const result = reports.filter(
      (report) => {
        const matchesSearch =
          !searchTerm ||
          report.title
            .toLowerCase()
            .includes(searchTerm) ||
          report.summary
            .toLowerCase()
            .includes(searchTerm);

        const matchesFilter =
          filter === "all" ||
          (filter === "90" &&
            report.score >= 90) ||
          (filter === "80" &&
            report.score >= 80);

        return (
          matchesSearch &&
          matchesFilter
        );
      }
    );

    return [...result].sort(
      (a, b) => {
        if (sort === "newest") {
          return (
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
          );
        }

        if (sort === "oldest") {
          return (
            new Date(
              a.createdAt
            ).getTime() -
            new Date(
              b.createdAt
            ).getTime()
          );
        }

        if (sort === "highest") {
          return b.score - a.score;
        }

        if (sort === "lowest") {
          return a.score - b.score;
        }

        return 0;
      }
    );
  }, [
    reports,
    search,
    filter,
    sort,
  ]);

  function clearFilters() {
    setSearch("");
    setFilter("all");
    setSort("newest");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-12">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

          <div>

            <Link
              href="/"
              className="text-green-400 transition hover:text-green-300"
            >
              ← Back to Anvesha AI
            </Link>

            <h1 className="mt-8 text-5xl font-bold">
              📚 Saved Reports
            </h1>

            <p className="mt-4 text-lg text-neutral-400">
              Your saved startup opportunity reports.
            </p>

          </div>

          <Link
            href="/discover"
            className="rounded-xl bg-green-500 px-6 py-4 font-bold text-black transition hover:bg-green-400"
          >
            💡 New Discovery
          </Link>

        </div>

        {/* SEARCH + FILTERS */}

        {!loading &&
          reports.length > 0 && (

            <div className="mt-10 grid gap-4 md:grid-cols-3">

              {/* SEARCH */}

              <div className="relative md:col-span-1">

                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-xl text-neutral-500">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search reports..."
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-900 py-4 pl-14 pr-5 text-white outline-none transition placeholder:text-neutral-500 focus:border-green-500"
                />

              </div>

              {/* SCORE FILTER */}

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(
                    e.target.value as Filter
                  )
                }
                className="rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-4 text-white outline-none focus:border-green-500"
              >

                <option value="all">
                  All Scores
                </option>

                <option value="90">
                  Score 90+
                </option>

                <option value="80">
                  Score 80+
                </option>

              </select>

              {/* SORT */}

              <select
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target.value as SortOption
                  )
                }
                className="rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-4 text-white outline-none focus:border-green-500"
              >

                <option value="newest">
                  🆕 Newest First
                </option>

                <option value="oldest">
                  🕒 Oldest First
                </option>

                <option value="highest">
                  🔥 Highest Score
                </option>

                <option value="lowest">
                  📉 Lowest Score
                </option>

              </select>

            </div>
          )}

        {/* LOADING */}

        {loading && (

          <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-10 text-center">

            <div className="text-4xl">
              📚
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              Loading reports...
            </h2>

          </div>
        )}

        {/* ERROR */}

        {error && (

          <div className="mt-12 rounded-xl border border-red-700 bg-red-950 p-6 text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          reports.length === 0 && (

            <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-12 text-center">

              <div className="text-6xl">
                📄
              </div>

              <h2 className="mt-6 text-3xl font-bold">
                No saved reports yet
              </h2>

              <p className="mt-3 text-neutral-400">
                Generate your first startup opportunity report.
              </p>

              <Link
                href="/discover"
                className="mt-8 inline-block rounded-xl bg-green-500 px-6 py-4 font-bold text-black transition hover:bg-green-400"
              >
                Create First Report
              </Link>

            </div>
          )}

        {/* NO RESULTS */}

        {!loading &&
          !error &&
          reports.length > 0 &&
          filteredReports.length === 0 && (

            <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-12 text-center">

              <div className="text-5xl">
                🔍
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                No reports found
              </h2>

              <p className="mt-3 text-neutral-400">
                Try a different search term or filter.
              </p>

              <button
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400"
              >
                Clear Filters
              </button>

            </div>
          )}

        {/* REPORT COUNT */}

        {!loading &&
          !error &&
          reports.length > 0 &&
          filteredReports.length > 0 && (

            <p className="mt-8 text-sm text-neutral-500">
              Showing{" "}
              {filteredReports.length}{" "}
              of {reports.length} reports
            </p>
          )}

        {/* REPORTS */}

        {!loading &&
          filteredReports.length > 0 && (

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filteredReports.map(
                (report) => (

                  <div
                    key={report.id}
                    className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-7 transition hover:border-green-500"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <h2 className="text-2xl font-bold">
                        {report.title}
                      </h2>

                      <div className="shrink-0 rounded-lg bg-green-950 px-3 py-2 text-center">

                        <div className="text-2xl font-bold text-green-400">
                          {report.score}
                        </div>

                        <div className="text-xs text-neutral-400">
                          /100
                        </div>

                      </div>

                    </div>

                    <p className="mt-5 line-clamp-4 leading-7 text-neutral-400">
                      {report.summary}
                    </p>

                    <div className="mt-auto pt-8">

                      <p className="mb-4 text-sm text-neutral-500">
                        {formatDate(
                          report.createdAt
                        )}
                      </p>

                      <Link
                        href={`/reports/${report.id}`}
                        className="block rounded-xl border border-neutral-700 py-3 text-center font-semibold transition hover:border-green-500 hover:text-green-400"
                      >
                        Open Report →
                      </Link>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

      </div>

    </main>
  );
}

function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}