import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TIME_ZONE = "Asia/Kolkata";

function getDailyTime(schedule: string) {
  const match = schedule.match(
    /^DAILY@([01]\d|2[0-3]):([0-5]\d)$/
  );

  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

function getIndiaTime() {
  const formatter = new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );

  const parts = formatter.formatToParts(
    new Date()
  );

  const hour = Number(
    parts.find(
      (part) => part.type === "hour"
    )?.value ?? 0
  );

  const minute = Number(
    parts.find(
      (part) => part.type === "minute"
    )?.value ?? 0
  );

  return {
    hour,
    minute,
  };
}

function getIndiaDateKey() {
  const formatter = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );

  return formatter.format(new Date());
}

export async function POST() {
  try {
    const now = new Date();

    const indiaTime = getIndiaTime();
    const indiaDateKey = getIndiaDateKey();

    const currentMinutes =
      indiaTime.hour * 60 +
      indiaTime.minute;

    const jobs =
      await prisma.researchJob.findMany({
        where: {
          schedule: {
            not: null,
          },
          status: {
            not: "RUNNING",
          },
        },
        include: {
          runs: {
            orderBy: {
              startedAt: "desc",
            },
            take: 1,
          },
        },
      });

    const dueJobs = jobs.filter((job) => {
      if (!job.schedule) {
        return false;
      }

      const dailyTime = getDailyTime(
        job.schedule
      );

      if (!dailyTime) {
        return false;
      }

      const scheduledMinutes =
        dailyTime.hour * 60 +
        dailyTime.minute;

      if (
        currentMinutes <
        scheduledMinutes
      ) {
        return false;
      }

      const lastRun = job.runs[0];

      if (lastRun?.startedAt) {
        const lastRunDateKey =
          new Intl.DateTimeFormat(
            "en-CA",
            {
              timeZone: TIME_ZONE,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }
          ).format(
            new Date(lastRun.startedAt)
          );

        if (
          lastRunDateKey ===
          indiaDateKey
        ) {
          return false;
        }
      }

      return true;
    });

    const results = [];

    for (const job of dueJobs) {
      try {
        await prisma.researchJob.update({
          where: {
            id: job.id,
          },
          data: {
            status: "QUEUED",
          },
        });

        const response = await fetch(
          `http://localhost:3000/api/projects/${job.projectId}/research/run`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jobId: job.id,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Research run failed."
          );
        }

        results.push({
          jobId: job.id,
          title: job.title,
          success: true,
          runId:
            data.run?.id ?? null,
        });
      } catch (error) {
        console.error(
          `Scheduler failed for job ${job.id}:`,
          error
        );

        await prisma.researchJob.update({
          where: {
            id: job.id,
          },
          data: {
            status: "FAILED",
          },
        });

        results.push({
          jobId: job.id,
          title: job.title,
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      timeZone: TIME_ZONE,
      indiaTime: `${String(
        indiaTime.hour
      ).padStart(2, "0")}:${String(
        indiaTime.minute
      ).padStart(2, "0")}`,
      checkedAt: now.toISOString(),
      found: dueJobs.length,
      results,
    });
  } catch (error) {
    console.error(
      "Research Scheduler Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Scheduler failed.",
      },
      {
        status: 500,
      }
    );
  }
}