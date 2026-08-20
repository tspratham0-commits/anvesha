"use client";

import { useEffect, useMemo, useState } from "react";

type Finding = {
  id: number;
  title: string;
  description: string;
  evidence: string;
  sourceUrl: string;
  sourceName: string;
  opportunityScore: number;
};

type ResearchRun = {
  id: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  summary: string;
  report: string;
  error: string;
  findings: Finding[];
};

type ResearchJob = {
  id: number;
  title: string;
  topic: string;
  status: string;
  schedule: string | null;
  runs: ResearchRun[];
};

type ResearchReportSectionProps = {
  projectId: number;
};

export default function ResearchReportSection({
  projectId,
}: ResearchReportSectionProps) {
  const [jobs, setJobs] = useState<ResearchJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResearch();
  }, [projectId]);

  async function loadResearch() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/research`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load research."
        );
      }

      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load research."
      );
    } finally {
      setLoading(false);
    }
  }

  const latestRun = useMemo(() => {
    const runs = jobs.flatMap((job) =>
      job.runs.map((run) => ({
        ...run,
        jobTitle: job.title,
        jobTopic: job.topic,
        schedule: job.schedule,
      }))
    );

    runs.sort((a, b) => {
      const aTime = a.completedAt
        ? new Date(a.completedAt).getTime()
        : 0;

      const bTime = b.completedAt
        ? new Date(b.completedAt).getTime()
        : 0;

      return bTime - aTime;
    });

    return runs[0] ?? null;
  }, [jobs]);

  const sourceCount = latestRun
    ? new Set(
        latestRun.findings
          .map((finding) => finding.sourceUrl)
          .filter(Boolean)
      ).size
    : 0;

  const verifiedFindings = latestRun
    ? latestRun.findings.filter(
        (finding) => Boolean(finding.sourceUrl)
      ).length
    : 0;

  const bestOpportunity =
    latestRun && latestRun.findings.length > 0
      ? [...latestRun.findings].sort(
          (a, b) =>
            b.opportunityScore -
            a.opportunityScore
        )[0]
      : null;

  return (
    <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="text-4xl">🌅</div>

          <h2 className="mt-5 text-2xl font-bold">
            Overnight Research
          </h2>

          <p className="mt-2 max-w-3xl text-neutral-400">
            Review the latest research Anvesha completed
            automatically for this project.
          </p>
        </div>

        <button
          onClick={loadResearch}
          className="rounded-xl border border-neutral-700 px-5 py-3 text-sm font-semibold transition hover:border-green-500 hover:text-green-400"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-400">
          Loading research...
        </div>
      ) : !latestRun ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-700 p-8 text-center">
          <div className="text-4xl">🌙</div>

          <h3 className="mt-4 text-xl font-bold">
            No overnight research yet
          </h3>

          <p className="mt-2 text-neutral-400">
            When a scheduled research job finishes,
            the morning report will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon="🔎"
              title="Sources"
              value={sourceCount}
            />

            <StatCard
              icon="✅"
              title="Verified Findings"
              value={verifiedFindings}
            />

            <StatCard
              icon="⭐"
              title="Best Score"
              value={
                bestOpportunity
                  ? `${bestOpportunity.opportunityScore}/100`
                  : "—"
              }
            />

            <StatCard
              icon="🧠"
              title="Research Run"
              value={`#${latestRun.id}`}
            />
          </div>

          <div className="mt-7 rounded-xl border border-neutral-700 bg-neutral-950 p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="text-xs uppercase tracking-wide text-green-400">
                  Latest research
                </div>

                <h3 className="mt-2 text-2xl font-bold">
                  {latestRun.jobTitle}
                </h3>

                <p className="mt-2 text-sm text-neutral-500">
                  {latestRun.jobTopic}
                </p>
              </div>

              <div className="rounded-lg border border-green-900 bg-green-950 px-3 py-2 text-xs text-green-400">
                {latestRun.status}
              </div>
            </div>

            {latestRun.completedAt && (
              <p className="mt-4 text-xs text-neutral-600">
                Completed{" "}
                {formatDateTime(
                  latestRun.completedAt
                )}
              </p>
            )}

            <div className="mt-6">
              <h4 className="font-semibold">
                Executive Summary
              </h4>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-300">
                {latestRun.summary ||
                  "No summary available."}
              </p>
            </div>

            <div className="mt-7">
              <h4 className="font-semibold">
                Research Report
              </h4>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-400">
                {latestRun.report ||
                  "No detailed report available."}
              </p>
            </div>
          </div>

          {bestOpportunity && (
            <div className="mt-6 rounded-xl border border-green-900 bg-green-950/30 p-6">
              <div className="text-sm font-semibold text-green-400">
                Highest Opportunity
              </div>

              <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-xl font-bold">
                    {bestOpportunity.title}
                  </h3>

                  <p className="mt-2 leading-7 text-neutral-300">
                    {bestOpportunity.description}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl border border-green-800 bg-green-950 px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {bestOpportunity.opportunityScore}
                  </div>

                  <div className="text-xs text-neutral-500">
                    /100
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold">
                Research Findings
              </h4>

              <span className="text-sm text-neutral-500">
                {latestRun.findings.length} findings
              </span>
            </div>

            {latestRun.findings.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-neutral-700 p-6 text-center text-neutral-500">
                No findings were saved.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {latestRun.findings.map(
                  (finding) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                    />
                  )
                )}
              </div>
            )}
          </div>

          {latestRun.error && (
            <div className="mt-6 rounded-xl border border-yellow-800 bg-yellow-950 p-4 text-yellow-300">
              {latestRun.error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-5">
      <div className="text-3xl">{icon}</div>

      <div className="mt-4 text-2xl font-bold">
        {value}
      </div>

      <div className="mt-1 text-sm text-neutral-400">
        {title}
      </div>
    </div>
  );
}

function FindingCard({
  finding,
}: {
  finding: Finding;
}) {
  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h5 className="text-lg font-bold">
            {finding.title}
          </h5>

          <p className="mt-2 leading-7 text-neutral-400">
            {finding.description}
          </p>
        </div>

        <div className="shrink-0 rounded-lg border border-green-900 bg-green-950 px-3 py-2 text-center">
          <div className="font-bold text-green-400">
            {finding.opportunityScore}
          </div>

          <div className="text-xs text-neutral-500">
            /100
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Evidence
        </div>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-300">
          {cleanEvidence(
            finding.evidence
          )}
        </p>
      </div>

      {finding.sourceUrl ? (
        <a
          href={finding.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 block rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition hover:border-green-500"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Source
          </div>

          <div className="mt-1 font-medium text-green-400">
            {finding.sourceName ||
              "Open source"}
          </div>

          <div className="mt-1 break-all text-xs text-neutral-600">
            {finding.sourceUrl}
          </div>
        </a>
      ) : (
        <div className="mt-4 rounded-lg border border-yellow-900 bg-yellow-950/40 p-4 text-sm text-yellow-300">
          No source URL is attached to this finding.
        </div>
      )}
    </div>
  );
}

function cleanEvidence(
  evidence: string
) {
  if (!evidence) {
    return "No evidence text available.";
  }

  try {
    const parsed = JSON.parse(evidence);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (
            item &&
            typeof item === "object" &&
            "text" in item
          ) {
            return String(item.text);
          }

          return String(item);
        })
        .filter(Boolean)
        .join("\n");
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "text" in parsed
    ) {
      return String(parsed.text);
    }

    return JSON.stringify(
      parsed,
      null,
      2
    );
  } catch {
    return evidence;
  }
}

function formatDateTime(
  date: string
) {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}
