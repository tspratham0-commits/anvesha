"use client";

import { useEffect, useState } from "react";

type Memory = {
  id: number;
  content: string;
  createdAt: string;
};

type MemorySectionProps = {
  projectId: number;
};

export default function MemorySection({
  projectId,
}: MemorySectionProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [content, setContent] = useState("");
  const [editingMemory, setEditingMemory] =
    useState<Memory | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMemories();
  }, [projectId]);

  async function loadMemories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/memories`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load memories."
        );
      }

      setMemories(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load memories."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createMemory() {
    const value = content.trim();

    if (!value) {
      setError("Memory content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/memories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: value,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create memory."
        );
      }

      setMemories((current) => [
        data,
        ...current,
      ]);

      setContent("");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create memory."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateMemory(
    memoryId: number,
    value: string
  ) {
    const trimmed = value.trim();

    if (!trimmed) {
      setError("Memory content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/memories`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memoryId,
            content: trimmed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update memory."
        );
      }

      setMemories((current) =>
        current.map((memory) =>
          memory.id === memoryId
            ? data
            : memory
        )
      );

      setEditingMemory(null);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update memory."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteMemory(memoryId: number) {
    const confirmed = window.confirm(
      "Delete this project memory?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/memories`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memoryId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete memory."
        );
      }

      setMemories((current) =>
        current.filter(
          (memory) => memory.id !== memoryId
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete memory."
      );
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="text-4xl">🧠</div>

          <h2 className="mt-5 text-2xl font-bold">
            Project Memory
          </h2>

          <p className="mt-2 max-w-2xl text-neutral-400">
            Store important facts, decisions,
            assumptions, customer details, and
            other information Anvesha should remember
            about this project.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-400">
          {memories.length}{" "}
          {memories.length === 1
            ? "memory"
            : "memories"}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* ADD MEMORY */}

      <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-950 p-5">
        <h3 className="font-semibold">
          Add Memory
        </h3>

        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          rows={4}
          placeholder="Example: Target customers are small healthcare clinics in Karnataka."
          className="mt-4 w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white outline-none placeholder:text-neutral-500 focus:border-green-500"
        />

        <button
          onClick={createMemory}
          disabled={saving}
          className="mt-4 rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "+ Add Memory"}
        </button>
      </div>

      {/* MEMORY LIST */}

      {loading ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-400">
          Loading memories...
        </div>
      ) : memories.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-700 p-8 text-center">
          <div className="text-4xl">🧠</div>

          <h3 className="mt-4 text-xl font-bold">
            No project memories yet
          </h3>

          <p className="mt-2 text-neutral-400">
            Add important information that
            Anvesha should remember.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="rounded-xl border border-neutral-700 bg-neutral-950 p-5"
            >
              {editingMemory?.id ===
              memory.id ? (
                <EditMemory
                  memory={memory}
                  saving={saving}
                  onCancel={() =>
                    setEditingMemory(null)
                  }
                  onSave={updateMemory}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <p className="whitespace-pre-wrap leading-7 text-neutral-300">
                      {memory.content}
                    </p>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() =>
                          setEditingMemory(
                            memory
                          )
                        }
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-xs text-neutral-300 transition hover:border-green-500 hover:text-green-400"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteMemory(
                            memory.id
                          )
                        }
                        className="rounded-lg border border-red-900 px-3 py-2 text-xs text-red-400 transition hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-neutral-600">
                    Added{" "}
                    {formatDate(
                      memory.createdAt
                    )}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditMemory({
  memory,
  saving,
  onCancel,
  onSave,
}: {
  memory: Memory;
  saving: boolean;
  onCancel: () => void;
  onSave: (
    memoryId: number,
    content: string
  ) => void;
}) {
  const [value, setValue] =
    useState(memory.content);

  return (
    <div>
      <textarea
        value={value}
        onChange={(event) =>
          setValue(event.target.value)
        }
        rows={5}
        className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-green-500"
      />

      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-xl border border-neutral-700 px-5 py-3 text-neutral-300 transition hover:bg-neutral-800"
        >
          Cancel
        </button>

        <button
          onClick={() =>
            onSave(memory.id, value)
          }
          disabled={
            saving || !value.trim()
          }
          className="rounded-xl bg-green-500 px-5 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
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
