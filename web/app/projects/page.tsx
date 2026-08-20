"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  id: number;
  name: string;
  description: string;
  createdAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load projects."
        );
      }

      setProjects(data);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description:
            description.trim() ||
            "No description added yet.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create project."
        );
      }

      setProjects((current) => [data, ...current]);

      setName("");
      setDescription("");
      setShowForm(false);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create project."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/projects/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete project."
        );
      }

      setProjects((current) =>
        current.filter((project) => project.id !== id)
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete project."
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
            Workspace
          </p>

          <h1 className="mt-3 text-5xl font-bold">
            Projects
          </h1>

          <p className="mt-4 text-lg text-neutral-400">
            Organize your startup ideas, research, conversations, and reports.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setError("");
          }}
          className="rounded-xl bg-green-500 px-6 py-4 font-bold text-black transition hover:bg-green-400"
        >
          + New Project
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-8 rounded-xl border border-red-800 bg-red-950 px-5 py-4 text-red-300">
          {error}
        </div>
      )}

      {/* CREATE FORM */}

      {showForm && (

        <div className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-8">

          <h2 className="text-2xl font-bold">
            Create New Project
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Project Name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Example: AI Healthcare Startup"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="What are you building?"
                rows={4}
                className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
              />
            </div>

            <div className="flex gap-3">

              <button
                onClick={createProject}
                disabled={saving}
                className="rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "Create Project"}
              </button>

              <button
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setDescription("");
                  setError("");
                }}
                className="rounded-xl border border-neutral-700 px-6 py-3 font-semibold text-neutral-300 transition hover:border-neutral-500"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

      {/* LOADING */}

      {loading && (

        <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900 p-12 text-center">

          <div className="text-5xl">
            📁
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Loading projects...
          </h2>

        </div>

      )}

      {/* EMPTY STATE */}

      {!loading && projects.length === 0 && (

        <div className="mt-12 rounded-2xl border border-dashed border-neutral-700 bg-neutral-900 p-12 text-center">

          <div className="text-6xl">
            📁
          </div>

          <h2 className="mt-6 text-3xl font-bold">
            No projects yet
          </h2>

          <p className="mt-3 text-neutral-400">
            Create a project to organize your startup research.
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="mt-8 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400"
          >
            Create Your First Project
          </button>

        </div>

      )}

      {/* PROJECTS */}

      {!loading && projects.length > 0 && (

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {projects.map((project) => (

            <div
              key={project.id}
              className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-7 transition hover:border-green-500"
            >

              <div className="flex items-start justify-between">

                <div className="text-4xl">
                  📁
                </div>

                <button
                  onClick={() =>
                    deleteProject(project.id)
                  }
                  className="text-sm text-neutral-500 transition hover:text-red-400"
                >
                  Delete
                </button>

              </div>

              <h2 className="mt-6 text-2xl font-bold">
                {project.name}
              </h2>

              <p className="mt-3 flex-1 leading-7 text-neutral-400">
                {project.description}
              </p>

              <div className="mt-6 border-t border-neutral-800 pt-5">

                <p className="text-sm text-neutral-500">
                  Created{" "}
                  {formatDate(project.createdAt)}
                </p>

                <Link
                  href={`/projects/${project.id}`}
                  className="mt-4 block w-full rounded-xl border border-neutral-700 py-3 text-center font-semibold transition hover:border-green-500 hover:text-green-400"
                >
                  Open Project →
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
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