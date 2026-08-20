import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";
import { generateAIText } from "@/lib/ai";

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json(
        {
          error: "Startup idea is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // 1. SEARCH THE WEB USING TAVILY
    // ========================================

    const research = await tvly.search(query, {
      maxResults: 5,
      searchDepth: "advanced",
      includeAnswer: true,
    });

    const webContext = research.results
      .map(
        (item) => `
Title: ${item.title}

URL: ${item.url}

Content:
${item.content}
`
      )
      .join("\n\n----------------------\n\n");

    // ========================================
    // 2. ASK PRODUCTION AI TO ANALYZE
    // ========================================

    const aiResponse = await generateAIText(
      [
        {
          role: "system",
          content: `You are Anvesha AI.

You are an experienced:

- Startup Founder
- Venture Capital Partner
- Product Manager
- AI Engineer
- Market Researcher

Your task is to analyze a startup idea using the web research provided.

Return ONLY valid JSON.
Do not return Markdown.
Do not include explanations outside the JSON.
Never leave fields empty.
Think like an investor.
Be realistic.
Use the web research to understand the market.
Do not invent obviously false market information.

Competitors must be real companies or products when possible.
The startup title must be ORIGINAL.
Never use an existing company name as the startup title.
Never use competitor names in the startup title.
Do not copy an existing company's product directly.
The startup should have a clear unique advantage.
The MVP must contain development milestones, not company names.
Score the opportunity between 1 and 100.

Required JSON structure:

{
  "title": "",
  "summary": "",
  "problem": "",
  "solution": "",
  "customers": [],
  "market": "",
  "competitors": [],
  "advantage": "",
  "businessModel": "",
  "marketing": [],
  "score": 75,
  "risks": [],
  "revenue": "",
  "techStack": [],
  "mvp": []
}

title:
Create a professional and ORIGINAL startup name.

Do NOT use:
- Existing company names
- Existing product names
- Competitor names

summary:
Write a 3-5 sentence executive summary.

problem:
Describe a real customer problem.

solution:
Explain how the proposed startup solves the problem.

customers:
Array of target customer segments.

market:
Describe the market size and opportunity.

competitors:
Array of real competitor company or product names.

advantage:
Explain why this startup could win.

businessModel:
Explain the pricing and monetization strategy.

marketing:
Array of realistic go-to-market strategies.

score:
Integer between 1 and 100.

risks:
Array of realistic business risks.

revenue:
Estimated Year-1 revenue with assumptions where possible.

techStack:
Array of technologies required to build the product.

mvp:
Exactly 3 product development milestones.

Example MVP:
[
  "User authentication and profile creation",
  "AI recommendation and personalization engine",
  "Progress tracking and analytics dashboard"
]

Return ONLY JSON.`,
        },
        {
          role: "user",
          content: `
Startup idea:
${query}

Web research:
${webContext}
`,
        },
      ],
      {
        model: "gpt-5-mini",
        temperature: 0.2,
        maxTokens: 4000,
      }
    );

    // ========================================
    // 3. PARSE AI RESPONSE
    // ========================================

    let report;

    try {
      report = JSON.parse(aiResponse);
    } catch {
      return NextResponse.json(
        {
          error: "AI returned invalid JSON.",
          raw: aiResponse,
        },
        {
          status: 500,
        }
      );
    }

    // ========================================
    // 4. NORMALIZE ARRAY FIELDS
    // ========================================

    report.customers = toArray(report.customers);

    report.competitors = toArray(
      report.competitors
    );

    report.marketing = toArray(
      report.marketing
    );

    report.risks = toArray(
      report.risks
    );

    report.techStack = toArray(
      report.techStack
    );

    report.mvp = toArray(
      report.mvp
    );

    // ========================================
    // 5. NORMALIZE OBJECT FIELDS
    // ========================================

    if (
      typeof report.market === "object" &&
      report.market !== null
    ) {
      const market = report.market as {
        size?: string;
        opportunity?: string;
      };

      report.market = [
        market.size,
        market.opportunity,
      ]
        .filter(Boolean)
        .join(" • ");
    }

    if (
      typeof report.businessModel === "object" &&
      report.businessModel !== null
    ) {
      report.businessModel = Object.entries(
        report.businessModel
      )
        .map(
          ([key, value]) =>
            `${key}: ${String(value)}`
        )
        .join(" • ");
    }

    if (
      typeof report.revenue === "object" &&
      report.revenue !== null
    ) {
      report.revenue = Object.entries(
        report.revenue
      )
        .map(
          ([key, value]) =>
            `${key}: ${String(value)}`
        )
        .join(" • ");
    }

    // ========================================
    // 6. DEFAULT VALUES
    // ========================================

    report.title ??= "Untitled Startup";

    report.summary ??=
      "No summary available.";

    report.problem ??=
      "No problem identified.";

    report.solution ??=
      "No solution generated.";

    report.market ??=
      "Market information unavailable.";

    report.advantage ??=
      "No competitive advantage provided.";

    report.businessModel ??=
      "Business model unavailable.";

    report.revenue ??=
      "Revenue estimate unavailable.";

    report.score ??= 75;

    // ========================================
    // 7. ADD TAVILY RESEARCH SOURCES
    // ========================================

    report.sources = research.results.map(
      (item) => ({
        title: item.title,
        url: item.url,
      })
    );

    // ========================================
    // 8. RETURN COMPLETE REPORT
    // ========================================

    return NextResponse.json(report);
  } catch (error) {
    console.error(
      "Discover API Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to generate report.",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
