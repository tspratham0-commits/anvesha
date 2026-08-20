"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

type Report = {
  id: number;
  title: string;
  summary: string;
  problem: string;
  solution: string;
  market: string;
  advantage: string;
  businessModel: string;
  revenue: string;
  score: number;
  customers: string | string[];
  competitors: string | string[];
  marketing: string | string[];
  risks: string | string[];
  techStack: string | string[];
  mvp: string | string[];
  sources?:
    | string
    | {
        title: string;
        url: string;
      }[];
  createdAt: string;
};

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export default function ReportPage({
  params,
}: Context) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const { id } = await params;

        const res = await fetch(`/api/reports/${id}`);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to load report."
          );
        }

        setReport(data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load report."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [params]);

  async function deleteReport() {
    if (!report || deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this report?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `/api/reports/${report.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to delete report."
        );
      }

      window.location.href = "/reports";
    } catch (error) {
      console.error("Delete report error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete report."
      );

      setDeleting(false);
    }
  }

  function downloadPDF() {
    if (!report) return;

    const pdf = new jsPDF();

    const margin = 15;
    const pageWidth =
      pdf.internal.pageSize.getWidth();
    const pageHeight =
      pdf.internal.pageSize.getHeight();

    let y = 20;

    function addText(
      text: string,
      fontSize = 11,
      bold = false
    ) {
      pdf.setFontSize(fontSize);

      pdf.setFont(
        "helvetica",
        bold ? "bold" : "normal"
      );

      const lines = pdf.splitTextToSize(
        text,
        pageWidth - margin * 2
      );

      if (
        y + lines.length * 6 >
        pageHeight - 20
      ) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(lines, margin, y);

      y += lines.length * 6 + 6;
    }

    function addSection(
      title: string,
      content: unknown
    ) {
      addText(title, 15, true);
      addText(formatValue(content), 10, false);
    }

    addText("ANVESHA AI", 20, true);

    addText(
      "Startup Opportunity Report",
      14,
      true
    );

    y += 4;

    addText(report.title, 18, true);

    addText(report.summary, 11);

    addText(
      `Opportunity Score: ${report.score} / 100`,
      14,
      true
    );

    addSection(
      "🔥 Problem",
      report.problem
    );

    addSection(
      "💡 Solution",
      report.solution
    );

    addSection(
      "📈 Market Opportunity",
      report.market
    );

    addSection(
      "🏆 Competitive Advantage",
      report.advantage
    );

    addSection(
      "💰 Business Model",
      report.businessModel
    );

    addSection(
      "💵 Revenue Estimate",
      report.revenue
    );

    addSection(
      "👥 Target Customers",
      parseList(report.customers).join("\n• ")
    );

    addSection(
      "⚔️ Competitors",
      parseList(report.competitors).join("\n• ")
    );

    addSection(
      "📣 Marketing Strategy",
      parseList(report.marketing).join("\n• ")
    );

    addSection(
      "⚠️ Business Risks",
      parseList(report.risks).join("\n• ")
    );

    addSection(
      "🛠️ Technology Stack",
      parseList(report.techStack).join("\n• ")
    );

    addSection(
      "🚀 MVP Roadmap",
      parseList(report.mvp)
        .map(
          (item, index) =>
            `${index + 1}. ${item}`
        )
        .join("\n")
    );

    const sources = parseSources(
      report.sources
    );

    if (sources.length > 0) {
      addText(
        "🌐 Research Sources",
        15,
        true
      );

      sources.forEach(
        (source, index) => {
          addText(
            `${index + 1}. ${source.title}\n${source.url}`,
            10
          );
        }
      );
    }

    addText(
      `Generated on ${new Date(
        report.createdAt
      ).toLocaleDateString("en-IN")}`,
      9
    );

    pdf.save(
      `${report.title
        .replace(/[^a-z0-9]/gi, "-")
        .toLowerCase()}.pdf`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl text-center">

          <div className="text-5xl">
            📚
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Loading report...
          </h1>

        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">

          <div className="text-6xl">
            ❌
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Report Not Found
          </h1>

          <p className="mt-4 text-neutral-400">
            {error ||
              "This report does not exist."}
          </p>

          <Link
            href="/reports"
            className="mt-8 inline-block rounded-xl bg-green-500 px-6 py-4 font-bold text-black"
          >
            ← Back to Reports
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white md:px-12">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-4">

          <Link
            href="/reports"
            className="text-green-400 transition hover:text-green-300"
          >
            ← Back to Saved Reports
          </Link>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={downloadPDF}
              className="rounded-xl bg-green-500 px-5 py-3 font-bold text-black transition hover:bg-green-400"
            >
              📄 Download PDF
            </button>

            <button
              type="button"
              onClick={deleteReport}
              disabled={deleting}
              className="rounded-xl border border-red-700 px-5 py-3 font-bold text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "🗑️ Delete Report"}
            </button>

            <Link
              href="/discover"
              className="rounded-xl border border-neutral-700 px-5 py-3 transition hover:border-green-500 hover:text-green-400"
            >
              💡 New Discovery
            </Link>

          </div>

        </div>

        {/* HERO */}

        <section className="mt-10 rounded-3xl border border-neutral-800 bg-neutral-900 p-8 md:p-12">

          <div className="flex flex-col justify-between gap-10 md:flex-row">

            <div className="max-w-4xl">

              <p className="text-sm font-bold uppercase tracking-[0.3em] text-green-400">
                Startup Opportunity Report
              </p>

              <h1 className="mt-6 text-4xl font-bold md:text-6xl">
                {report.title}
              </h1>

              <p className="mt-6 text-lg leading-8 text-neutral-300">
                {report.summary}
              </p>

            </div>

            <div className="flex h-fit min-w-52 flex-col items-center rounded-2xl border border-green-700 bg-green-950/30 p-8">

              <p className="text-sm uppercase tracking-widest text-neutral-400">
                Opportunity Score
              </p>

              <div className="mt-4 text-7xl font-bold text-green-400">
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
                        report.score,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* MAIN REPORT */}

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

          <ListSection
            title="👥 Target Customers"
            items={parseList(
              report.customers
            )}
          />

          <ListSection
            title="⚔️ Competitors"
            items={parseList(
              report.competitors
            )}
          />

          <ListSection
            title="📣 Marketing Strategy"
            items={parseList(
              report.marketing
            )}
          />

          <ListSection
            title="⚠️ Business Risks"
            items={parseList(
              report.risks
            )}
          />

          <ListSection
            title="🛠️ Technology Stack"
            items={parseList(
              report.techStack
            )}
          />

          <ListSection
            title="🚀 MVP Roadmap"
            items={parseList(report.mvp)}
            numbered
          />

        </div>

        {/* SOURCES */}

        {parseSources(report.sources).length > 0 && (

          <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8">

            <h2 className="text-2xl font-bold">
              🌐 Research Sources
            </h2>

            <p className="mt-2 text-neutral-400">
              Sources used by Anvesha to research this opportunity.
            </p>

            <div className="mt-6 space-y-3">

              {parseSources(
                report.sources
              ).map(
                (source, index) => (

                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-neutral-800 p-4 text-green-400 transition hover:border-green-500"
                  >
                    {source.title}
                  </a>

                )
              )}

            </div>

          </section>

        )}

        {/* DATE */}

        <p className="mt-8 text-sm text-neutral-500">
          Generated on{" "}
          {new Date(
            report.createdAt
          ).toLocaleDateString(
            "en-IN",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )}
        </p>

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
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-5 leading-8 text-neutral-300">
        {formatValue(content)}
      </p>

    </section>
  );
}

function ListSection({
  title,
  items,
  numbered = false,
}: {
  title: string;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-7">

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <div className="mt-5 space-y-4">

        {items.length === 0 ? (

          <p className="text-neutral-500">
            No information available.
          </p>

        ) : (

          items.map(
            (item, index) => (

              <div
                key={index}
                className="flex gap-4 leading-7 text-neutral-300"
              >

                <span className="font-bold text-green-400">
                  {numbered
                    ? `${index + 1}`
                    : "•"}
                </span>

                <span>
                  {item}
                </span>

              </div>

            )
          )

        )}

      </div>

    </section>
  );
}

function parseList(
  value: unknown
): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function parseSources(
  value: unknown
): {
  title: string;
  url: string;
}[] {
  if (Array.isArray(value)) {
    return value as {
      title: string;
      url: string;
    }[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return [];
    }
  }

  return [];
}

function formatValue(
  value: unknown
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "No information available.";
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return Object.entries(
          parsed
        )
          .map(
            ([key, value]) =>
              `${key}: ${formatValue(value)}`
          )
          .join(" • ");
      }

      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => formatValue(item))
          .join(" • ");
      }

    } catch {
      return value;
    }

    return value;
  }

  if (typeof value === "object") {
    return Object.entries(
      value as Record<string, unknown>
    )
      .map(
        ([key, value]) =>
          `${key}: ${formatValue(value)}`
      )
      .join(" • ");
  }

  return String(value);
}
