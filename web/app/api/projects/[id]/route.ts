import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const projectId = Number(id);

    if (Number.isNaN(projectId)) {
      return NextResponse.json(
        {
          error: "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        reports: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Load Single Project Error:", error);

    return NextResponse.json(
      {
        error: "Failed to load project.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const projectId = Number(id);

    if (Number.isNaN(projectId)) {
      return NextResponse.json(
        {
          error: "Invalid project ID.",
        },
        {
          status: 400,
        }
      );
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          error: "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Project Error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete project.",
      },
      {
        status: 500,
      }
    );
  }
}
