"use client";

import { useEffect, useMemo, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
};

type TaskBoardProps = {
  projectId: number;
};

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Priority = "LOW" | "MEDIUM" | "HIGH";

const STATUS_OPTIONS: {
  value: Status;
  label: string;
}[] = [
  {
    value: "TODO",
    label: "TODO",
  },
  {
    value: "IN_PROGRESS",
    label: "IN PROGRESS",
  },
  {
    value: "DONE",
    label: "DONE",
  },
];

const PRIORITY_OPTIONS: Priority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
];

export default function TaskBoard({
  projectId,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [priority, setPriority] =
    useState<Priority>("MEDIUM");

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/tasks`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load tasks."
        );
      }

      setTasks(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createTask() {
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            priority,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create task."
        );
      }

      setTasks((current) => [
        data,
        ...current,
      ]);

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create task."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateTask(
    taskId: number,
    changes: Partial<Task>
  ) {
    try {
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/tasks`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId,
            ...changes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update task."
        );
      }

      setTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? data
            : task
        )
      );

      setEditingTask(null);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update task."
      );
    }
  }

  async function deleteTask(taskId: number) {
    const confirmed = window.confirm(
      "Delete this task?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/projects/${projectId}/tasks`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete task."
        );
      }

      setTasks((current) =>
        current.filter(
          (task) => task.id !== taskId
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete task."
      );
    }
  }

  const todoTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === "TODO"
      ),
    [tasks]
  );

  const inProgressTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.status === "IN_PROGRESS"
      ),
    [tasks]
  );

  const doneTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status === "DONE"
      ),
    [tasks]
  );

  const completedCount = doneTasks.length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedCount / tasks.length) *
            100
        );

  return (
    <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <div className="text-4xl">
            📋
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Task Board
          </h2>

          <p className="mt-2 text-neutral-400">
            Turn startup ideas into actionable
            work.
          </p>
        </div>

        <div className="min-w-56">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">
              Progress
            </span>

            <span className="font-semibold text-green-400">
              {progress}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">
          {error}
        </div>
      )}

      {/* ADD TASK */}

      <div className="mt-7 rounded-xl border border-neutral-700 bg-neutral-950 p-5">
        <h3 className="font-semibold">
          Add a Task
        </h3>

        <div className="mt-4 grid gap-4">
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Task title"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white outline-none placeholder:text-neutral-500 focus:border-green-500"
          />

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Description (optional)"
            rows={3}
            className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white outline-none placeholder:text-neutral-500 focus:border-green-500"
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as Priority
                )
              }
              className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-white outline-none focus:border-green-500"
            >
              {PRIORITY_OPTIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option} Priority
                  </option>
                )
              )}
            </select>

            <button
              onClick={createTask}
              disabled={saving}
              className="rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Adding..."
                : "+ Add Task"}
            </button>
          </div>
        </div>
      </div>

      {/* BOARD */}

      {loading ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-400">
          Loading tasks...
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <TaskColumn
            title="📋 TODO"
            tasks={todoTasks}
            onStatusChange={(
              taskId,
              status
            ) =>
              updateTask(taskId, {
                status,
              })
            }
            onEdit={setEditingTask}
            onDelete={deleteTask}
          />

          <TaskColumn
            title="🚧 IN PROGRESS"
            tasks={inProgressTasks}
            onStatusChange={(
              taskId,
              status
            ) =>
              updateTask(taskId, {
                status,
              })
            }
            onEdit={setEditingTask}
            onDelete={deleteTask}
          />

          <TaskColumn
            title="✅ DONE"
            tasks={doneTasks}
            onStatusChange={(
              taskId,
              status
            ) =>
              updateTask(taskId, {
                status,
              })
            }
            onEdit={setEditingTask}
            onDelete={deleteTask}
          />
        </div>
      )}

      {/* EDIT MODAL */}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() =>
            setEditingTask(null)
          }
          onSave={(changes) =>
            updateTask(
              editingTask.id,
              changes
            )
          }
        />
      )}
    </div>
  );
}

function TaskColumn({
  title,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  title: string;
  tasks: Task[];
  onStatusChange: (
    taskId: number,
    status: Status
  ) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <h3 className="font-bold">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-700 p-5 text-center text-sm text-neutral-500">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={
                onStatusChange
              }
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  task: Task;
  onStatusChange: (
    taskId: number,
    status: Status
  ) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}) {
  const currentStatus =
    task.status as Status;

  return (
    <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="min-w-0 font-semibold">
          {task.title}
        </h4>

        <button
          onClick={() => onEdit(task)}
          className="text-xs text-neutral-500 transition hover:text-green-400"
        >
          Edit
        </button>
      </div>

      {task.description && (
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <PriorityBadge
          priority={task.priority}
        />

        <button
          onClick={() =>
            onDelete(task.id)
          }
          className="text-xs text-red-500 transition hover:text-red-400"
        >
          Delete
        </button>
      </div>

      <select
        value={currentStatus}
        onChange={(event) =>
          onStatusChange(
            task.id,
            event.target.value as Status
          )
        }
        className="mt-4 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-300 outline-none focus:border-green-500"
      >
        {STATUS_OPTIONS.map(
          (option) => (
            <option
              key={option.value}
              value={option.value}
            >
              Move to {option.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function EditTaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (
    changes: Partial<Task>
  ) => void;
}) {
  const [title, setTitle] =
    useState(task.title);

  const [description, setDescription] =
    useState(task.description);

  const [priority, setPriority] =
    useState<Priority>(
      (task.priority as Priority) ||
        "MEDIUM"
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">
            Edit Task
          </h3>

          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white"
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
            placeholder="Task title"
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-green-500"
          />

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            placeholder="Description"
            rows={5}
            className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-green-500"
          />

          <select
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value as Priority
              )
            }
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none focus:border-green-500"
          >
            {PRIORITY_OPTIONS.map(
              (option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option} Priority
                </option>
              )
            )}
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-700 px-5 py-3 text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSave({
                title,
                description,
                priority,
              })
            }
            disabled={!title.trim()}
            className="rounded-xl bg-green-500 px-5 py-3 font-bold text-black hover:bg-green-400 disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: string;
}) {
  let className =
    "inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold";

  if (priority === "HIGH") {
    className +=
      " bg-red-950 text-red-400";
  } else if (priority === "LOW") {
    className +=
      " bg-blue-950 text-blue-400";
  } else {
    className +=
      " bg-yellow-950 text-yellow-400";
  }

  return (
    <span className={className}>
      {priority}
    </span>
  );
}
