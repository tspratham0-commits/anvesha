"use client";

import { useEffect, useState } from "react";

type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type NotesSectionProps = {
  projectId: number;
};

export default function NotesSection({
  projectId,
}: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingNote, setEditingNote] =
    useState<Note | null>(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotes();
  }, [projectId]);

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/notes`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load notes."
        );
      }

      setNotes(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load notes."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createNote() {
    if (!title.trim()) {
      setError("Note title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create note."
        );
      }

      setNotes((current) => [
        data,
        ...current,
      ]);

      setTitle("");
      setContent("");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create note."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateNote(
    noteId: number,
    updatedTitle: string,
    updatedContent: string
  ) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/notes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            noteId,
            title: updatedTitle,
            content: updatedContent,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update note."
        );
      }

      setNotes((current) =>
        current.map((note) =>
          note.id === noteId
            ? data
            : note
        )
      );

      setEditingNote(null);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update note."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(noteId: number) {
    const confirmed = window.confirm(
      "Delete this note?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/notes`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            noteId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete note."
        );
      }

      setNotes((current) =>
        current.filter(
          (note) => note.id !== noteId
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete note."
      );
    }
  }

  const filteredNotes = notes.filter(
    (note) => {
      const query =
        search.trim().toLowerCase();

      if (!query) return true;

      return (
        note.title
          .toLowerCase()
          .includes(query) ||
        note.content
          .toLowerCase()
          .includes(query)
      );
    }
  );

  return (
    <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="text-4xl">
            📝
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Project Notes
          </h2>

          <p className="mt-2 text-neutral-400">
            Store research, ideas, decisions,
            and important project information.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-400">
          {notes.length}{" "}
          {notes.length === 1
            ? "note"
            : "notes"}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* CREATE NOTE */}

      <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-950 p-5">
        <h3 className="font-semibold">
          New Note
        </h3>

        <div className="mt-4 grid gap-4">
          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="Note title"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white outline-none placeholder:text-neutral-500 focus:border-green-500"
          />

          <textarea
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value
              )
            }
            placeholder="Write your note..."
            rows={5}
            className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white outline-none placeholder:text-neutral-500 focus:border-green-500"
          />

          <div>
            <button
              onClick={createNote}
              disabled={saving}
              className="rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "+ Save Note"}
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      {notes.length > 0 && (
        <div className="mt-6">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search notes..."
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none placeholder:text-neutral-500 focus:border-green-500"
          />
        </div>
      )}

      {/* NOTES LIST */}

      {loading ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-400">
          Loading notes...
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-700 p-8 text-center">
          <div className="text-4xl">
            {search ? "🔎" : "📝"}
          </div>

          <h3 className="mt-4 text-xl font-bold">
            {search
              ? "No matching notes"
              : "No notes yet"}
          </h3>

          <p className="mt-2 text-neutral-400">
            {search
              ? "Try a different search."
              : "Create your first project note above."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredNotes.map(
            (note) => (
              <div
                key={note.id}
                className="rounded-xl border border-neutral-700 bg-neutral-950 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold">
                      {note.title}
                    </h3>

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-400">
                      {note.content ||
                        "No content."}
                    </p>

                    <p className="mt-4 text-xs text-neutral-600">
                      Updated{" "}
                      {formatDate(
                        note.updatedAt
                      )}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() =>
                        setEditingNote(
                          note
                        )
                      }
                      className="rounded-lg border border-neutral-700 px-3 py-2 text-xs text-neutral-300 transition hover:border-green-500 hover:text-green-400"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteNote(note.id)
                      }
                      className="rounded-lg border border-red-900 px-3 py-2 text-xs text-red-400 transition hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* EDIT MODAL */}

      {editingNote && (
        <EditNoteModal
          note={editingNote}
          saving={saving}
          onClose={() =>
            setEditingNote(null)
          }
          onSave={updateNote}
        />
      )}
    </div>
  );
}

function EditNoteModal({
  note,
  saving,
  onClose,
  onSave,
}: {
  note: Note;
  saving: boolean;
  onClose: () => void;
  onSave: (
    noteId: number,
    title: string,
    content: string
  ) => void;
}) {
  const [title, setTitle] =
    useState(note.title);

  const [content, setContent] =
    useState(note.content);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">
            Edit Note
          </h3>

          <button
            onClick={onClose}
            className="text-neutral-500 transition hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="Note title"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-green-500"
          />

          <textarea
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value
              )
            }
            rows={10}
            placeholder="Note content"
            className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-green-500"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-700 px-5 py-3 text-neutral-300 transition hover:bg-neutral-800"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSave(
                note.id,
                title,
                content
              )
            }
            disabled={
              saving || !title.trim()
            }
            className="rounded-xl bg-green-500 px-5 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
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
