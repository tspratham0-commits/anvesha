import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ----------------------------
// Save a new message
// ----------------------------
export async function POST(req: Request) {
  try {
    const { chatId, role, content } = await req.json();

    const message = await prisma.message.create({
      data: {
        chatId,
        role,
        content,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to save message.",
      },
      {
        status: 500,
      }
    );
  }
}

// ----------------------------
// Load all messages of a chat
// ----------------------------
export async function GET(req: NextRequest) {
  try {
    const chatId = Number(req.nextUrl.searchParams.get("chatId"));

    const messages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to load messages.",
      },
      {
        status: 500,
      }
    );
  }
}