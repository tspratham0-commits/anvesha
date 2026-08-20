import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Load Projects Error:", error);

    return NextResponse.json(
      {
        error: "Failed to load projects.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();

    const description = String(
      body.description ?? ""
    ).trim();

    if (!name) {
      return NextResponse.json(
        {
          error: "Project name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description:
          description ||
          "No description added yet.",
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Create Project Error:", error);

    return NextResponse.json(
      {
        error: "Failed to create project.",
      },
      {
        status: 500,
      }
    );
  }
}
