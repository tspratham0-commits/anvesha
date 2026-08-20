import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const response = await tvly.search(query, {
      maxResults: 5,
      searchDepth: "advanced",
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Research failed." },
      { status: 500 }
    );
  }
}