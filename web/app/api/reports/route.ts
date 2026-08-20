import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const report = await req.json();

    if (!report.title) {
      return NextResponse.json(
        {
          error: "Report title is required.",
        },
        {
          status: 400,
        }
      );
    }

    const savedReport = await prisma.report.create({
      data: {
        title: String(report.title ?? ""),
        summary: String(report.summary ?? ""),
        problem: String(report.problem ?? ""),
        solution: String(report.solution ?? ""),
        market: String(report.market ?? ""),
        advantage: String(report.advantage ?? ""),
        businessModel: String(
          report.businessModel ?? ""
        ),
        revenue: String(report.revenue ?? ""),
        score: Number(report.score ?? 0),

        customers: JSON.stringify(
          report.customers ?? []
        ),

        competitors: JSON.stringify(
          report.competitors ?? []
        ),

        marketing: JSON.stringify(
          report.marketing ?? []
        ),

        risks: JSON.stringify(
          report.risks ?? []
        ),

        techStack: JSON.stringify(
          report.techStack ?? []
        ),

        mvp: JSON.stringify(
          report.mvp ?? []
        ),

        sources: JSON.stringify(
          report.sources ?? []
        ),
      },
    });

    return NextResponse.json(savedReport);
  } catch (error) {
    console.error("Save Report Error:", error);

    return NextResponse.json(
      {
        error: "Failed to save report.",
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

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Load Reports Error:", error);

    return NextResponse.json(
      {
        error: "Failed to load reports.",
      },
      {
        status: 500,
      }
    );
  }
}
