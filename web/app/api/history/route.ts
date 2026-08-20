import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load chats." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    const chat = await prisma.chat.create({
      data: {
        title: title || "New Chat",
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create chat." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, title } = await req.json();

    const chat = await prisma.chat.update({
      where: {
        id,
      },
      data: {
        title,
      },
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update chat." },
      { status: 500 }
    );
  }
}