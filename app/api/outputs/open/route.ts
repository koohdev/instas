import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { getDesktopPath } from "@/lib/output";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folderName } = body;

    if (!folderName) {
      return NextResponse.json({ success: false, error: "folderName is required" }, { status: 400 });
    }

    const primaryRoot = getDesktopPath(); // INSTAS
    let folderPath = path.join(primaryRoot, folderName);

    if (!fs.existsSync(folderPath)) {
      const legacyRoot = primaryRoot.replace(/INSTAS$/, "InstaScrape");
      const legacyPath = path.join(legacyRoot, folderName);
      if (fs.existsSync(legacyPath)) {
        folderPath = legacyPath;
      }
    }

    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ success: false, error: "Folder does not exist" }, { status: 44 });
    }

    // Windows native explorer command
    const cmd = `explorer "${folderPath.replace(/\//g, "\\")}"`;

    exec(cmd, (error) => {
      if (error) {
        console.error("Failed to open explorer:", error);
      }
    });

    return NextResponse.json({ success: true, message: "Folder opened in Windows Explorer" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
