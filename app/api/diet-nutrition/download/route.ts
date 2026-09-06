import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to download Diet & Nutrition Program." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Check purchase authorization in database
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

    let hasPurchased = false;
    if (isAdmin) {
      hasPurchased = true;
    } else {
      const validEnrollment = await db.enrollment.findFirst({
        where: {
          userId: userId,
          includeDietNutrition: true,
          status: { in: ["ACTIVE", "COMPLETED"] },
        },
      });

      if (validEnrollment) {
        hasPurchased = true;
      }
    }

    if (!hasPurchased) {
      return NextResponse.json(
        {
          success: false,
          error: "Access Denied: You have not purchased the Diet & Nutrition Program add-on. Please upgrade your enrollment to access this document.",
        },
        { status: 403 }
      );
    }

    // Serve protected PDF file from server disk
    const pdfPath = path.join(process.cwd(), "uploads", "protected", "diet_nutrition_plan.pdf");

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        {
          success: false,
          error: "The Diet & Nutrition PDF guide has not been uploaded by academy administration yet. Please check back shortly.",
        },
        { status: 444 }
      );
    }

    const fileBuffer = fs.readFileSync(pdfPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="SELFFITS-Diet-And-Nutrition-Guide.pdf"',
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("PDF Download Route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error processing PDF download." },
      { status: 500 }
    );
  }
}
