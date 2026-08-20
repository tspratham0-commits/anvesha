import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function getProjectId(id: string) {
  const projectId = Number(id);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return null;
  }

  return projectId;
}

export async function GET(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const projectId = getProjectId(id);

    if (!projectId) {
      return NextResponse.json(
        { error: "Invalid project ID." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Load Tasks Error:", error);

    return NextResponse.json(
      { error: "Failed to load tasks." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const projectId = getProjectId(id);

    if (!projectId) {
      return NextResponse.json(
        { error: "Invalid project ID." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const body = await req.json();

    const title = String(body.title ?? "").trim();
    const description = String(
      body.description ?? ""
    ).trim();

    const allowedPriorities = [
      "LOW",
      "MEDIUM",
      "HIGH",
    ];

    const priority = allowedPriorities.includes(
      String(body.priority)
    )
      ? String(body.priority)
      : "MEDIUM";

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required." },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status: "TODO",
        projectId,
      },
    });

    return NextResponse.json(task, {
      status: 201,
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    return NextResponse.json(
      { error: "Failed to create task." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const projectId = getProjectId(id);

    if (!projectId) {
      return NextResponse.json(
        { error: "Invalid project ID." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const taskId = Number(body.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json(
        { error: "Invalid task ID." },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    const data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
    } = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();

      if (!title) {
        return NextResponse.json(
          { error: "Task title is required." },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (body.description !== undefined) {
      data.description = String(
        body.description
      ).trim();
    }

    if (body.status !== undefined) {
      const allowedStatuses = [
        "TODO",
        "IN_PROGRESS",
        "DONE",
      ];

      if (
        !allowedStatuses.includes(
          String(body.status)
        )
      ) {
        return NextResponse.json(
          { error: "Invalid task status." },
          { status: 400 }
        );
      }

      data.status = String(body.status);
    }

    if (body.priority !== undefined) {
      const allowedPriorities = [
        "LOW",
        "MEDIUM",
        "HIGH",
      ];

      if (
        !allowedPriorities.includes(
          String(body.priority)
        )
      ) {
        return NextResponse.json(
          { error: "Invalid task priority." },
          { status: 400 }
        );
      }

      data.priority = String(
        body.priority
      );
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: task.id,
      },
      data,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Update Task Error:", error);

    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const projectId = getProjectId(id);

    if (!projectId) {
      return NextResponse.json(
        { error: "Invalid project ID." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const taskId = Number(body.taskId);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return NextResponse.json(
        { error: "Invalid task ID." },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: {
        id: task.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}
