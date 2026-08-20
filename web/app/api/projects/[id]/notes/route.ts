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

    const notes = await prisma.note.findMany({
      where: {
        projectId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Load Notes Error:", error);

    return NextResponse.json(
      { error: "Failed to load notes." },
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
    const content = String(body.content ?? "").trim();

    if (!title) {
      return NextResponse.json(
        { error: "Note title is required." },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        projectId,
      },
    });

    return NextResponse.json(note, {
      status: 201,
    });
  } catch (error) {
    console.error("Create Note Error:", error);

    return NextResponse.json(
      { error: "Failed to create note." },
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
    const noteId = Number(body.noteId);

    if (!Number.isInteger(noteId) || noteId <= 0) {
      return NextResponse.json(
        { error: "Invalid note ID." },
        { status: 400 }
      );
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        projectId,
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found." },
        { status: 404 }
      );
    }

    const data: {
      title?: string;
      content?: string;
    } = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();

      if (!title) {
        return NextResponse.json(
          { error: "Note title is required." },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (body.content !== undefined) {
      data.content = String(body.content).trim();
    }

    const updatedNote = await prisma.note.update({
      where: {
        id: note.id,
      },
      data,
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error("Update Note Error:", error);

    return NextResponse.json(
      { error: "Failed to update note." },
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
    const noteId = Number(body.noteId);

    if (!Number.isInteger(noteId) || noteId <= 0) {
      return NextResponse.json(
        { error: "Invalid note ID." },
        { status: 400 }
      );
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        projectId,
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found." },
        { status: 404 }
      );
    }

    await prisma.note.delete({
      where: {
        id: note.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete Note Error:", error);

    return NextResponse.json(
      { error: "Failed to delete note." },
      { status: 500 }
    );
  }
}
