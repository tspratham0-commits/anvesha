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
      where: {
        id: projectId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const jobs = await prisma.researchJob.findMany({
      where: {
        projectId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        runs: {
          orderBy: {
            startedAt: "desc",
          },
          take: 5,
          include: {
            findings: {
              orderBy: {
                opportunityScore: "desc",
              },
            },
          },
        },
      },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Load Research Jobs Error:", error);

    return NextResponse.json(
      {
        error: "Failed to load research jobs.",
      },
      {
        status: 500,
      }
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
      where: {
        id: projectId,
      },
      select: {
        id: true,
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

    const body = await req.json();

    const title = String(
      body.title ?? ""
    ).trim();

    const topic = String(
      body.topic ?? ""
    ).trim();

    const instructions = String(
      body.instructions ?? ""
    ).trim();

    const schedule =
      body.schedule === null ||
      body.schedule === undefined ||
      String(body.schedule).trim() === ""
        ? null
        : String(body.schedule).trim();

    if (!title) {
      return NextResponse.json(
        {
          error: "Research title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!topic) {
      return NextResponse.json(
        {
          error: "Research topic is required.",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.researchJob.create({
      data: {
        title,
        topic,
        instructions,
        schedule,
        status: "PENDING",
        projectId,
      },
      include: {
        runs: true,
      },
    });

    return NextResponse.json(job, {
      status: 201,
    });
  } catch (error) {
    console.error("Create Research Job Error:", error);

    return NextResponse.json(
      {
        error: "Failed to create research job.",
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
    const projectId = getProjectId(id);

    if (!projectId) {
      return NextResponse.json(
        { error: "Invalid project ID." },
        { status: 400 }
      );
    }

    const body = await req.json();

    const jobId = Number(body.jobId);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid research job ID.",
        },
        {
          status: 400,
        }
      );
    }

    const job = await prisma.researchJob.findFirst({
      where: {
        id: jobId,
        projectId,
      },
    });

    if (!job) {
      return NextResponse.json(
        {
          error: "Research job not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.researchJob.delete({
      where: {
        id: job.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete Research Job Error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete research job.",
      },
      {
        status: 500,
      }
    );
  }
}
