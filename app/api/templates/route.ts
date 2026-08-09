import { NextResponse } from "next/server";
import { loadTemplates, saveTemplates } from "@/lib/templateStore";

export async function GET() {
  try {
    const templates = loadTemplates();
    return NextResponse.json({ templates });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.templates) {
      saveTemplates(body.templates);
    }
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
