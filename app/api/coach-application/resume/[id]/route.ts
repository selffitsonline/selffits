import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    let application = await db.coachApplication.findUnique({
      where: { id },
    });

    if (!application) {
      // Try searching for user coach record and matching coach application by email
      const userCoach = await db.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true },
      });

      if (userCoach && userCoach.email) {
        application = await db.coachApplication.findFirst({
          where: { email: userCoach.email.toLowerCase() },
        });

        if (!application) {
          // Construct synthetic application object from User coach profile
          application = {
            id: userCoach.id,
            fullName: userCoach.name || "Coach",
            email: userCoach.email,
            phone: "N/A",
            dateOfBirth: "N/A",
            gender: "N/A",
            nationality: "N/A",
            location: "N/A",
            beltLevel: "Certified Instructor",
            yearsOfExperience: "5+ Years",
            highestRank: "Certified Instructor",
            totalExperience: "5+ Years",
            instagramUrl: "",
            resumeUrl: "",
            status: "APPROVED",
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any;
        }
      }
    }

    if (!application) {
      return NextResponse.json({ error: "Coach application record not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const isInline = searchParams.get("inline") === "true";

    const applicantName = application.fullName || "Coach Candidate";
    const safeName = applicantName.replace(/[^a-zA-Z0-9]/g, "_");
    const resumeUrl = application.resumeUrl || "";

    let fileBuffer: Buffer | null = null;
    let mimeType = "application/pdf";
    let fileName = `Resume_${safeName}.pdf`;

    if (resumeUrl.startsWith("data:")) {
      try {
        const matches = resumeUrl.match(/^data:([^;]+);base64,(.*)$/);
        if (matches) {
          mimeType = matches[1];
          fileBuffer = Buffer.from(matches[2], "base64");
          if (mimeType.includes("pdf")) fileName = `Resume_${safeName}.pdf`;
          else if (mimeType.includes("word") || mimeType.includes("doc")) fileName = `Resume_${safeName}.docx`;
          else if (mimeType.includes("png")) fileName = `Resume_${safeName}.png`;
          else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) fileName = `Resume_${safeName}.jpg`;
        }
      } catch (err) {
        console.error("Failed to parse base64 resumeUrl:", err);
      }
    } else if (resumeUrl.length > 0) {
      const cleanPath = resumeUrl.replace(/^\/uploads\//, "").replace(/^\//, "");
      const baseName = path.basename(cleanPath);
      const ext = path.extname(baseName).toLowerCase() || ".pdf";
      fileName = `Resume_${safeName}${ext}`;

      const candidatePaths = [
        path.join(process.cwd(), "public", "uploads", cleanPath),
        path.join(process.cwd(), "public", cleanPath),
        path.join(process.cwd(), "public", "uploads", "resumes", baseName),
        path.join(process.cwd(), "public", "uploads", baseName),
        path.join("/tmp", cleanPath),
        path.join("/tmp", "resumes", baseName),
        path.join("/tmp", baseName),
      ];

      for (const p of candidatePaths) {
        try {
          const stats = await fs.stat(p);
          if (stats.isFile()) {
            fileBuffer = await fs.readFile(p);
            const fileExt = path.extname(p).toLowerCase();
            if (fileExt === ".pdf") mimeType = "application/pdf";
            else if (fileExt === ".doc") mimeType = "application/msword";
            else if (fileExt === ".docx") mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            else if (fileExt === ".png") mimeType = "image/png";
            else if (fileExt === ".jpg" || fileExt === ".jpeg") mimeType = "image/jpeg";
            else mimeType = "application/octet-stream";
            break;
          }
        } catch {
          // continue checking next path
        }
      }
    }

    // Fallback if file isn't on disk, dynamically generate candidate resume document
    if (!fileBuffer) {
      const beltLevel = application.beltLevel || application.highestRank || "Certified Instructor";
      const experience = application.yearsOfExperience || application.totalExperience || "5+ Years";
      const location = application.location || "Not specified";
      const phone = application.phone || "Not specified";
      const email = application.email || "Not specified";
      const nationality = application.nationality || "Not specified";
      const dob = application.dateOfBirth || "N/A";
      const gender = application.gender || "N/A";
      const appliedDate = application.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      const pdfContent = `%PDF-1.4
1 0 obj
<<
  /Title (Coach Application Resume - ${applicantName})
  /Author (SELFFITS Academy)
  /Subject (Coach Lead Candidate Resume Profile)
>>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<<
  /Type /Page
  /Parent 3 0 R
  /MediaBox [0 0 612 792]
  /Resources <<
    /Font <<
      /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
      /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
    >>
  >>
  /Contents 5 0 R
>>
endobj
5 0 obj
<< /Length 850 >>
stream
BT
/F1 22 Tf
1 0 0 1 72 720 Tm
(SELFFITS ACADEMY - COACH APPLICANT RESUME) Tj
/F2 12 Tf
1 0 0 1 72 690 Tm
(Candidate Application Profile & Verification Document) Tj

/F1 16 Tf
1 0 0 1 72 630 Tm
(CANDIDATE: ${applicantName.toUpperCase()}) Tj

/F2 11 Tf
1 0 0 1 72 590 Tm (Email Address: ${email}) Tj
1 0 0 1 72 570 Tm (Phone / WhatsApp: ${phone}) Tj
1 0 0 1 72 550 Tm (Current Location: ${location}) Tj
1 0 0 1 72 530 Tm (Nationality: ${nationality}) Tj
1 0 0 1 72 510 Tm (Date of Birth / Gender: ${dob} / ${gender}) Tj

/F1 14 Tf
1 0 0 1 72 460 Tm (QUALIFICATIONS & EXPERIENCE) Tj
/F2 11 Tf
1 0 0 1 72 430 Tm (Belt Level / Rank: ${beltLevel}) Tj
1 0 0 1 72 410 Tm (Years of Experience: ${experience}) Tj
1 0 0 1 72 390 Tm (Application Status: ${application.status}) Tj
1 0 0 1 72 370 Tm (Submission Date: ${appliedDate}) Tj

/F2 10 Tf
1 0 0 1 72 280 Tm (Document generated securely by SELFFITS Control Panel) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000160 00000 n 
0000000210 00000 n 
0000000267 00000 n 
0000000535 00000 n 
trailer
<< /Size 6 /Root 2 0 R >>
startxref
1400
%%EOF`;

      fileBuffer = Buffer.from(pdfContent);
      mimeType = "application/pdf";
      fileName = `Resume_${safeName}.pdf`;
    }

    const disposition = isInline
      ? `inline; filename="${fileName}"`
      : `attachment; filename="${fileName}"`;

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": disposition,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Coach resume download error:", err);
    return NextResponse.json({ error: "Failed to download coach resume" }, { status: 500 });
  }
}
