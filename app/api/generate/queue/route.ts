import { NextRequest, NextResponse } from "next/server";
import { enqueueJob, getJob, getAllJobs, triggerQueueProcessing } from "@/lib/queue-manager";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { batchName, urls, ...settings } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    const host = req.headers.get("host") || `localhost:${process.env.PORT || 3000}`;
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const job = enqueueJob(batchName, urls, settings);
    triggerQueueProcessing(baseUrl);

    return NextResponse.json({
      success: true,
      message: "Batch enqueued successfully in background queue",
      job,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (jobId) {
    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  }

  const jobs = getAllJobs();
  return NextResponse.json({ jobs });
}
