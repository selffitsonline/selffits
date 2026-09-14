import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const { id } = await params;

    const cert = await db.certificate.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true,
        certificateNumber: true,
        beltName: true,
        fileKey: true,
        issuedDate: true,
        user: { select: { id: true, name: true, email: true } },
        program: { select: { id: true, title: true } },
      },
    });

    if (!cert) {
      return NextResponse.json({ error: "Certificate record not found" }, { status: 404 });
    }

    // RBAC: Verify user owns certificate or is Admin / Super Admin
    if (
      session.user.role === "STUDENT" &&
      cert.userId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden access to student certificate" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const isInline = searchParams.get("inline") === "true";

    const studentName = cert.user.name || "Academy Student";
    const programName = cert.program?.title || "Martial Arts & Fitness Program";
    const beltName = cert.beltName || "Graduation Belt";
    const certNumber = cert.certificateNumber;
    const issueDateStr = cert.issuedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Determine extension from fileKey if available
    let ext = cert.fileKey ? path.extname(cert.fileKey).toLowerCase() : ".pdf";
    if (!ext) ext = ".pdf";
    const safeTitle = cert.title.replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `${safeTitle}_${certNumber}${ext}`;

    // 1. Try reading stored physical file from disk if available
    let fileBuffer: Buffer | null = null;
    let mimeType = "application/pdf";

    if (cert.fileKey) {
      if (cert.fileKey.startsWith("data:")) {
        try {
          const matches = cert.fileKey.match(/^data:([^;]+);base64,(.*)$/);
          if (matches) {
            mimeType = matches[1];
            fileBuffer = Buffer.from(matches[2], "base64");
            if (mimeType.includes("png")) ext = ".png";
            else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = ".jpg";
            else if (mimeType.includes("webp")) ext = ".webp";
            else if (mimeType.includes("pdf")) ext = ".pdf";
          }
        } catch (err) {
          console.error("Failed to parse data URL from cert.fileKey:", err);
        }
      } else {
        const candidatePaths = [
          path.join(process.cwd(), "public", "uploads", cert.fileKey),
          path.join(process.cwd(), "public", cert.fileKey),
          path.join(process.cwd(), "public", "uploads", "certificates", path.basename(cert.fileKey)),
          path.join("/tmp", cert.fileKey),
          path.join("/tmp", "certificates", path.basename(cert.fileKey)),
        ];

        for (const p of candidatePaths) {
          try {
            const stats = await fs.stat(p);
            if (stats.isFile()) {
              fileBuffer = await fs.readFile(p);
              const fileExt = path.extname(p).toLowerCase();
              if (fileExt === ".png") mimeType = "image/png";
              else if (fileExt === ".jpg" || fileExt === ".jpeg") mimeType = "image/jpeg";
              else if (fileExt === ".webp") mimeType = "image/webp";
              else if (fileExt === ".svg") mimeType = "image/svg+xml";
              else if (fileExt === ".pdf") mimeType = "application/pdf";
              else mimeType = "application/octet-stream";
              break;
            }
          } catch {
            // try next path
          }
        }
      }
    }

    // Serve physical file if found on storage/disk
    if (fileBuffer) {
      const disposition = isInline
        ? `inline; filename="${fileName}"`
        : `attachment; filename="${fileName}"`;

      return new Response(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": disposition,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // 2. If no disk file, dynamically construct valid PDF document with embedded text content
    if (!fileBuffer) {
      const pdfText = `%PDF-1.4
1 0 obj
<<
  /Title (${cert.title})
  /Author (SELFFITS Academy)
  /Subject (${beltName} - ${programName})
  /Keywords (SELFFITS, Belt, Certification, Martial Arts)
>>
endobj
2 0 obj
<<
  /Type /Catalog
  /Pages 3 0 R
>>
endobj
3 0 obj
<<
  /Type /Pages
  /Kids [4 0 R]
  /Count 1
>>
endobj
4 0 obj
<<
  /Type /Page
  /Parent 3 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font <<
      /F1 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica-Bold
      >>
      /F2 <<
        /Type /Font
        /Subtype /Type1
        /BaseFont /Helvetica
      >>
    >>
  >>
  /Contents 5 0 R
>>
endobj
5 0 obj
<< /Length 850 >>
stream
BT
/F1 26 Tf
1 0 0 1 120 700 Tm
(SELFFITS VIRTUAL ACADEMY) Tj
/F2 14 Tf
1 0 0 1 180 660 Tm
(OFFICIAL BELT & GRADUATION CERTIFICATE) Tj

/F2 12 Tf
1 0 0 1 200 600 Tm
(This is to officially certify that) Tj

/F1 22 Tf
1 0 0 1 150 550 Tm
(${studentName.toUpperCase()}) Tj

/F2 12 Tf
1 0 0 1 140 500 Tm
(has successfully passed the examination for) Tj

/F1 18 Tf
1 0 0 1 180 460 Tm(${beltName.toUpperCase()}) Tj

/F2 12 Tf
1 0 0 1 160 420 Tm
(in ${programName}) Tj

/F2 10 Tf
1 0 0 1 72 320 Tm
(Certificate ID: ${certNumber}) Tj
1 0 0 1 72 300 Tm
(Issue Date: ${issueDateStr}) Tj
1 0 0 1 72 280 Tm
(Academy Name: SELFFITS Virtual Martial Arts & Fitness Academy) Tj

1 0 0 1 380 320 Tm
(Authorized Signatory:) Tj
/F1 11 Tf
1 0 0 1 380 300 Tm
(Sensei Rahul Sharma) Tj
/F2 9 Tf
1 0 0 1 380 285 Tm
(Head of Academic Evaluation, SELFFITS) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000175 00000 n 
0000000225 00000 n 
0000000282 00000 n 
0000000550 00000 n 
trailer
<<
  /Size 6
  /Root 2 0 R
>>
startxref
1450
%%EOF`;
      fileBuffer = Buffer.from(pdfText);
    }

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    console.error("Certificate download error:", err);
    return NextResponse.json({ error: "Failed to download certificate" }, { status: 500 });
  }
}
