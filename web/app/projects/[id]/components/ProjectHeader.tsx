"use client";

import Link from "next/link";

type Props = {
  name: string;
  description: string;
  createdAt: string;
  onDelete: () => void;
};

export default function ProjectHeader({
  name,
  description,
  createdAt,
  onDelete,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between">

        <Link
          href="/projects"
          className="text-green-400 transition hover:text-green-300"
        >
          ← Back to Projects
        </Link>

        <button
          onClick={onDelete}
          className="rounded-xl border border-red-800 px-5 py-3 text-red-400 transition hover:bg-red-950"
        >
          Delete Project
        </button>

      </div>

      <div className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-900 p-8">

        <div className="text-6xl">
          📁
        </div>

        <h1 className="mt-6 text-5xl font-bold">
          {name}
        </h1>

        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-400">
          {description}
        </p>

        <p className="mt-6 text-sm text-neutral-500">
          Created{" "}
          {new Date(createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

      </div>
    </>
  );
}
