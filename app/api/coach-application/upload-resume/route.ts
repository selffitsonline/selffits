import { NextRequest, NextResponse } from "next/server";
import { storageProvider } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "Please select a valid resume file." },
        { status: 400 }
      );
    }

    // Validate file extension
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, error: "Resume file must be a PDF, DOC, or DOCX document." },
        { status: 400 }
      );
    }

    // Max file size 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Resume file size must be less than 10 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await storageProvider.uploadFile(buffer, file.name, "resumes");

    return NextResponse.json({
      success: true,
      url: uploaded.publicUrl,
    });
  } catch (err: any) {
    console.error("upload-resume API route error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to upload resume file. Please try again." },
      { status: 500 }
    );
  }
}
