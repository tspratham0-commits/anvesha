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

    const memories = await prisma.memory.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(memories);
  } catch (error) {
    console.error("Load Project Memories Error:", error);

    return NextResponse.json(
      { error: "Failed to load project memories." },
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

    const content = String(
      body.content ?? ""
    ).trim();

    if (!content) {
      return NextResponse.json(
        { error: "Memory content is required." },
        { status: 400 }
      );
    }

    const memory = await prisma.memory.create({
      data: {
        content,
        projectId,
      },
    });

    return NextResponse.json(memory, {
      status: 201,
    });
  } catch (error) {
    console.error("Create Project Memory Error:", error);

    return NextResponse.json(
      { error: "Failed to create project memory." },
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

    const memoryId = Number(body.memoryId);

    if (!Number.isInteger(memoryId) || memoryId <= 0) {
      return NextResponse.json(
        { error: "Invalid memory ID." },
        { status: 400 }
      );
    }

    const memory = await prisma.memory.findFirst({
      where: {
        id: memoryId,
        projectId,
      },
    });

    if (!memory) {
      return NextResponse.json(
        { error: "Memory not found." },
        { status: 404 }
      );
    }

    const content = String(
      body.content ?? ""
    ).trim();

    if (!content) {
      return NextResponse.json(
        { error: "Memory content is required." },
        { status: 400 }
      );
    }

    const updatedMemory =
      await prisma.memory.update({
        where: {
          id: memory.id,
        },
        data: {
          content,
        },
      });

    return NextResponse.json(updatedMemory);
  } catch (error) {
    console.error("Update Project Memory Error:", error);

    return NextResponse.json(
      { error: "Failed to update project memory." },
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

    const memoryId = Number(body.memoryId);

    if (!Number.isInteger(memoryId) || memoryId <= 0) {
      return NextResponse.json(
        { error: "Invalid memory ID." },
        { status: 400 }
      );
    }

    const memory = await prisma.memory.findFirst({
      where: {
        id: memoryId,
        projectId,
      },
    });

    if (!memory) {
      return NextResponse.json(
        { error: "Memory not found." },
        { status: 404 }
      );
    }

    await prisma.memory.delete({
      where: {
        id: memory.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete Project Memory Error:", error);

    return NextResponse.json(
      { error: "Failed to delete project memory." },
      { status: 500 }
    );
  }
}
