import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 }
      );
    }

    const result = await tvly.search(query, {
      maxResults: 5,
      searchDepth: "advanced",
      includeAnswer: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Search failed." },
      { status: 500 }
    );
  }
}