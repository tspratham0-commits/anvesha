import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const reportId = Number(id);

    if (Number.isNaN(reportId)) {
      return NextResponse.json(
        {
          error: "Invalid report ID.",
        },
        {
          status: 400,
        }
      );
    }

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      return NextResponse.json(
        {
          error: "Report not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Load Single Report Error:", error);

    return NextResponse.json(
      {
        error: "Failed to load report.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  req: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const reportId = Number(id);

    if (Number.isNaN(reportId)) {
      return NextResponse.json(
        {
          error: "Invalid report ID.",
        },
        {
          status: 400,
        }
      );
    }

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
    });

    if (!report) {
      return NextResponse.json(
        {
          error: "Report not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.report.delete({
      where: {
        id: reportId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Report Error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete report.",
      },
      {
        status: 500,
      }
    );
  }
}
