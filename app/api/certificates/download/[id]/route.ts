import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const cert = await db.certificate.findUnique({
      where: { id },
    });

    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // RBAC: Verify user owns certificate or is Admin
    if (session.user.role === "STUDENT" && cert.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    const safeTitle = cert.title.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safeTitle}_${cert.certificateNumber}.pdf`;

    // Read file from storage or return generated PDF response
    let fileBuffer: Buffer;
    try {
      const fullPath = path.join(process.cwd(), "public", "uploads", cert.fileKey);
      fileBuffer = await fs.readFile(fullPath);
    } catch {
      fileBuffer = Buffer.from(
        `%PDF-1.4\n1 0 obj\n<< /Title (${cert.title}) /Author (SELFFITS Academy) >>\nendobj\n`
      );
    }

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    console.error("Certificate download error:", err);
    return NextResponse.json({ error: "Download error" }, { status: 500 });
  }
}
