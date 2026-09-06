import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateDietNutritionConfigAction } from "@/actions/diet-nutrition.actions";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No PDF file uploaded." }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ success: false, error: "Uploaded file must be a PDF." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "uploads", "protected");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, "diet_nutrition_plan.pdf");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(filePath, buffer);

    await updateDietNutritionConfigAction({
      pdfUrl: "/uploads/protected/diet_nutrition_plan.pdf",
      pdfFileName: file.name,
    });

    return NextResponse.json({
      success: true,
      message: "PDF uploaded successfully!",
      fileName: file.name,
    });
  } catch (err: any) {
    console.error("PDF Upload Route error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process PDF upload." },
      { status: 500 }
    );
  }
}
