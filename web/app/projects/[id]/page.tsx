"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import TaskBoard from "./components/TaskBoard";
import NotesSection from "./components/NotesSection";
import MemorySection from "./components/MemorySection";
import ResearchReportSection from "./components/ResearchReportSection";

type Report = {
  id: number;
  title: string;
  summary: string;
  score: number;
  createdAt: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  reports: Report[];
};

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const [project, setProject] =
    useState<Project | null>(null);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [tasksLoading, setTasksLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!id) return;

    loadProject();
    loadTasks();
  }, [id]);

  async function loadProject() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/projects/${id}`,
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load project."
        );
      }

      setProject(data);
    } catch (error) {
      console.error(
        "Load Project Error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load project."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks() {
    try {
      setTasksLoading(true);

      const response = await fetch(
        `/api/projects/${id}/tasks`,
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load tasks."
        );
      }

      setTasks(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Load Tasks Error:",
        error
      );

      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }

  async function deleteProject() {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this project?"
      );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/projects/${id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to delete project."
        );
      }

      router.push("/projects");
    } catch (error) {
      console.error(
        "Delete Project Error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete project."
      );
    }
  }

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status === "DONE"
    ).length;

  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "IN_PROGRESS"
    ).length;

  const todoTasks =
    tasks.filter(
      (task) =>
        task.status === "TODO"
    ).length;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round(
          (completedTasks /
            totalTasks) *
            100
        );

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-12 text-center">
          <div className="text-5xl">
            📁
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Loading project...
          </h1>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-6xl">
        <Link
          href="/projects"
          className="text-green-400 transition hover:text-green-300"
        >
          ← Back to Projects
        </Link>

        <div className="mt-8 rounded-2xl border border-red-800 bg-red-950 p-8 text-red-300">
          {error ||
            "Project not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-12">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <Link
          href="/projects"
          className="text-green-400 transition hover:text-green-300"
        >
          ← Back to Projects
        </Link>

        <button
          onClick={deleteProject}
          className="rounded-xl border border-red-800 px-5 py-3 text-red-400 transition hover:bg-red-950"
        >
          Delete Project
        </button>

      </div>

      {/* PROJECT HEADER */}

      <div className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-8">

        <div className="text-6xl">
          📁
        </div>

        <h1 className="mt-6 text-4xl font-bold sm:text-5xl">
          {project.name}
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-400">
          {project.description}
        </p>

        <p className="mt-6 text-sm text-neutral-500">
          Created{" "}
          {formatDate(
            project.createdAt
          )}
        </p>

      </div>

      {/* PROJECT DASHBOARD */}

      <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-7">

        <div>
          <div className="text-4xl">
            📈
          </div>

          <h2 className="mt-4 text-2xl font-bold">
            Project Dashboard
          </h2>

          <p className="mt-2 text-neutral-400">
            Quick overview of your startup workspace.
          </p>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardCard
            icon="📊"
            title="Reports"
            value={
              project.reports.length
            }
          />

          <DashboardCard
            icon="✅"
            title="Tasks"
            value={
              tasksLoading
                ? "..."
                : totalTasks
            }
          />

          <DashboardCard
            icon="🏆"
            title="Completed"
            value={
              tasksLoading
                ? "..."
                : completedTasks
            }
          />

          <DashboardCard
            icon="🚀"
            title="Progress"
            value={`${progress}%`}
          />

        </div>

        <div className="mt-7">

          <div className="flex items-center justify-between text-sm">

            <span className="text-neutral-400">
              Task Progress
            </span>

            <span className="font-semibold text-green-400">
              {progress}%
            </span>

          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-800">

            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-neutral-500">

            <span>
              TODO: {todoTasks}
            </span>

            <span>
              In Progress:{" "}
              {inProgressTasks}
            </span>

            <span>
              Done: {completedTasks}
            </span>

          </div>

        </div>

      </div>

      {/* OVERNIGHT RESEARCH */}

      <ResearchReportSection
        projectId={project.id}
      />

      {/* REPORTS */}

      <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-7">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <div className="text-4xl">
              📊
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              Project Reports
            </h2>

          </div>

          <Link
            href="/reports"
            className="rounded-xl border border-neutral-700 px-5 py-3 text-center transition hover:border-green-500 hover:text-green-400"
          >
            View All
          </Link>

        </div>

        <p className="mt-3 text-neutral-400">
          Reports connected to this project.
        </p>

        {project.reports.length === 0 ? (

          <div className="mt-6 rounded-xl border border-dashed border-neutral-700 p-8 text-center">

            <div className="text-4xl">
              📄
            </div>

            <h3 className="mt-4 text-xl font-bold">
              No Reports Yet
            </h3>

            <p className="mt-2 text-neutral-400">
              AI reports connected to this project will appear here.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {project.reports.map(
              (report) => (

                <Link
                  key={report.id}
                  href={`/reports/${report.id}`}
                  className="block rounded-xl border border-neutral-700 p-5 transition hover:border-green-500"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <h3 className="text-xl font-bold">
                        {report.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-neutral-400">
                        {report.summary}
                      </p>

                      <p className="mt-3 text-xs text-neutral-500">
                        {formatDate(
                          report.createdAt
                        )}
                      </p>

                    </div>

                    <div className="shrink-0 rounded-lg bg-green-950 px-4 py-2 text-center">

                      <div className="text-xl font-bold text-green-400">
                        {report.score}
                      </div>

                      <div className="text-xs text-neutral-400">
                        /100
                      </div>

                    </div>

                  </div>

                </Link>

              )
            )}

          </div>

        )}

      </div>

      {/* TASK BOARD */}

      <TaskBoard
        projectId={project.id}
      />

      {/* NOTES */}

      <NotesSection
        projectId={project.id}
      />

      {/* PROJECT MEMORY */}

      <MemorySection
        projectId={project.id}
      />

      {/* AI RESEARCH */}

      <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-7">

        <div className="text-4xl">
          💬
        </div>

        <h2 className="mt-5 text-2xl font-bold">
          AI Research
        </h2>

        <p className="mt-3 leading-7 text-neutral-400">
          Continue researching this startup idea with Anvesha AI.
        </p>

        <Link
          href="/chat"
          className="mt-6 inline-block rounded-xl border border-neutral-700 px-6 py-3 font-semibold transition hover:border-green-500 hover:text-green-400"
        >
          Open AI Chat →
        </Link>

      </div>

      {/* WORKSPACE */}

      <div className="mt-8 rounded-2xl border border-dashed border-neutral-700 bg-neutral-900 p-8">

        <h2 className="text-2xl font-bold">
          🚀 Project Workspace
        </h2>

        <p className="mt-3 leading-7 text-neutral-400">
          This workspace combines reports, AI research, notes, memory, overnight research, and task management into one place to help you build your startup from idea to launch.
        </p>

      </div>

    </div>
  );
}

function DashboardCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-6">

      <div className="text-3xl">
        {icon}
      </div>

      <div className="mt-5 text-3xl font-bold">
        {value}
      </div>

      <div className="mt-2 text-sm text-neutral-400">
        {title}
      </div>

    </div>
  );
}

function formatDate(date: string) {
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