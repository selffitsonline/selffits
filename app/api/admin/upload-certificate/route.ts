import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ success: false, error: "Unauthorized access to Admin upload endpoint." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;
    const beltName = (formData.get("beltName") as string | null) || "Yellow Belt";
    const titleInput = (formData.get("title") as string | null) || `${beltName} Graduation Certificate`;

    if (!file || !userId) {
      return NextResponse.json({ success: false, error: "Missing required file or student ID." }, { status: 400 });
    }

    // Verify student exists
    const student = await db.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          where: { status: "ACTIVE" },
          include: { membershipPlan: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, error: "Target student record not found." }, { status: 404 });
    }

    // Resolve Program ID
    let programId = student.enrollments[0]?.membershipPlan?.programId;
    if (!programId) {
      let firstProg = await db.program.findFirst();
      if (!firstProg) {
        firstProg = await db.program.create({
          data: {
            title: "Martial Arts Academy",
            slug: "martial-arts-academy",
            category: "MARTIAL_ARTS",
            targetAudience: "ADULTS",
            description: "Official SELFFITS Martial Arts Program",
          },
        });
      }
      programId = firstProg.id;
    }

    // Save physical file to public/uploads/certificates/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "certificates");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitizedOriginalName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const fileKey = `certificates/${uniqueFileName}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificateNumber = `SELFFITS-${beltName.replace(/\s+/g, "").toUpperCase()}-${Date.now().toString().slice(-4)}-${randomSuffix}`;

    // Create Certificate record in PostgreSQL
    const cert = await db.certificate.create({
      data: {
        userId,
        programId,
        title: titleInput,
        certificateNumber,
        fileKey,
        beltName,
        issuedByUserId: session.user.id,
      },
    });

    // Notify Student
    await db.notification.create({
      data: {
        userId,
        title: "Official Certificate Uploaded! 📜",
        message: `Your official ${titleInput} (${certificateNumber}) has been uploaded by the admin and is ready for download!`,
      },
    });

    revalidatePath("/admin/student-progress");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/dashboard/progress");

    return NextResponse.json({
      success: true,
      message: `Certificate "${titleInput}" uploaded successfully!`,
      certificateId: cert.id,
      certificateNumber,
    });
  } catch (err: any) {
    console.error("upload-certificate error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to upload certificate file." },
      { status: 500 }
    );
  }
}
