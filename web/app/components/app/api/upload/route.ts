import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

import { extractDocumentText } from "@/lib/document";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");

    await mkdir(uploadDir, {
      recursive: true,
    });

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const filePath = path.join(uploadDir, file.name);

    await writeFile(filePath, buffer);

    // Extract text
    const text = await extractDocumentText(file.name);

    return NextResponse.json({
      success: true,
      filename: file.name,
      text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Upload failed.",
      },
      {
        status: 500,
      }
    );
  }
}