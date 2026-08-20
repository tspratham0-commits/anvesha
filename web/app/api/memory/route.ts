import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(memories);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load memories.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        {
          error: "Memory content is required.",
        },
        {
          status: 400,
        }
      );
    }

    const memory = await prisma.memory.create({
      data: {
        content: content.trim(),
      },
    });

    return NextResponse.json(memory);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to save memory.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await prisma.memory.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to delete memory.",
      },
      {
        status: 500,
      }
    );
  }
}