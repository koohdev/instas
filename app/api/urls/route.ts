import { NextRequest, NextResponse } from "next/server";
import { loadUrlLibrary, saveUrlLibrary, SavedUrlItem } from "@/lib/urlLibraryStore";

export async function GET() {
  const items = await loadUrlLibrary();
  return NextResponse.json({ urls: items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.urls && Array.isArray(body.urls)) {
      await saveUrlLibrary(body.urls as SavedUrlItem[]);
    }
    const updatedUrls = await loadUrlLibrary();
    return NextResponse.json({ success: true, urls: updatedUrls });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
