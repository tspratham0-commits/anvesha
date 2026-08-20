import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractDocumentText(
  filename: string
): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "uploads",
    filename
  );

  const buffer = await fs.readFile(filePath);

  const ext = path.extname(filename).toLowerCase();

  switch (ext) {
    case ".txt":
      return buffer.toString("utf8");

    case ".pdf": {
      const parser = new PDFParse({
        data: buffer,
      });

      try {
        const result = await parser.getText();

        return result.text;
      } finally {
        await parser.destroy();
      }
    }

    case ".docx": {
      const doc = await mammoth.extractRawText({
        buffer,
      });

      return doc.value;
    }

    case ".csv":
      return buffer.toString("utf8");

    default:
      return "";
  }
}