import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { storageProvider } from "@/lib/storage";
import { revalidatePath } from "next/cache";

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

    if (!file || typeof file === "string" || !userId) {
      return NextResponse.json({ success: false, error: "Missing or invalid certificate file or student ID." }, { status: 400 });
    }

    const fileExt = file.name ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : ".pdf";
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
    if (!allowedExtensions.includes(fileExt)) {
      return NextResponse.json({ success: false, error: "Invalid file format. Allowed documents: PDF, PNG, JPG, WEBP." }, { status: 400 });
    }

    // Verify student exists in PostgreSQL
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
      return NextResponse.json({ success: false, error: "Target student record not found in database." }, { status: 404 });
    }

    // Resolve Program ID to ensure valid relation
    let programId = student.enrollments[0]?.membershipPlan?.programId;
    if (!programId || !(await db.program.findUnique({ where: { id: programId } }))) {
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

    // Resolve valid Admin Issuer User ID in PostgreSQL (prevents P2003 foreign key constraint error when using demo/fallback admin sessions)
    let issuerUserId = session.user.id;
    const validIssuer = await db.user.findUnique({ where: { id: issuerUserId } });
    if (!validIssuer) {
      const dbAdmin = await db.user.findFirst({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      });
      if (dbAdmin) {
        issuerUserId = dbAdmin.id;
      } else {
        issuerUserId = userId; // fallback to target student ID if no admin user record exists in DB
      }
    }

    // Save physical file via StorageProvider
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploaded = await storageProvider.uploadFile(buffer, file.name, "certificates");
    const fileKey = uploaded.fileKey;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificateNumber = `SELFFITS-${beltName.replace(/\s+/g, "").toUpperCase()}-${Date.now().toString().slice(-4)}-${randomSuffix}`;

    // Query for existing certificate matching exact userId and beltName
    const existingCerts = await db.certificate.findMany({
      where: {
        userId,
        beltName,
      },
      select: { id: true, fileKey: true, beltName: true },
      orderBy: { issuedDate: "desc" },
    });

    let cert;
    if (existingCerts.length > 0) {
      const primaryCert = existingCerts[0];
      // Update primary existing certificate with newly uploaded file & details
      cert = await db.certificate.update({
        where: { id: primaryCert.id },
        data: {
          programId,
          title: titleInput,
          certificateNumber,
          fileKey,
          issuedDate: new Date(),
          issuedByUserId: issuerUserId,
        },
        select: {
          id: true,
          userId: true,
          programId: true,
          title: true,
          certificateNumber: true,
          fileKey: true,
          issuedDate: true,
          beltName: true,
        },
      });

      // Remove any extra duplicate certificate records for this exact belt if any exist
      if (existingCerts.length > 1) {
        const duplicateIds = existingCerts.slice(1).map((c) => c.id);
        await db.certificate.deleteMany({
          where: { id: { in: duplicateIds } },
        });
      }
    } else {
      // Create single new Certificate record for this student + belt
      cert = await db.certificate.create({
        data: {
          userId,
          programId,
          title: titleInput,
          certificateNumber,
          fileKey,
          beltName,
          issuedByUserId: issuerUserId,
        },
        select: {
          id: true,
          userId: true,
          programId: true,
          title: true,
          certificateNumber: true,
          fileKey: true,
          issuedDate: true,
          beltName: true,
        },
      });
    }

    // Synchronize Student Profile Current Belt & Award Date
    await db.studentProfile.upsert({
      where: { userId },
      update: {
        currentBelt: beltName,
        beltAwardedAt: new Date(),
      },
      create: {
        userId,
        currentBelt: beltName,
        beltAwardedAt: new Date(),
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
