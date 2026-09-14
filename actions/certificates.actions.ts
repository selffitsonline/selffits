"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { storageProvider } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { CertificateGrantedEmail } from "@/emails/certificate-granted.email";

export async function issueCertificateAction(payload: {
  userId: string;
  programId?: string;
  title: string;
  certificateNumber: string;
  fileName?: string;
  fileBase64?: string;
}) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return { success: false, error: "Access Denied: Admin privileges required." };
    }

    const { userId, programId, title, certificateNumber, fileName, fileBase64 } = payload;

    const student = await db.user.findUnique({
      where: { id: userId },
    });

    if (!student) {
      return { success: false, error: "Student account not found." };
    }

    // Default program if not provided
    let targetProgramId = programId;
    if (!targetProgramId) {
      let firstProg = await db.program.findFirst();
      if (!firstProg) {
        firstProg = await db.program.create({
          data: {
            title: "Martial Arts Academy",
            slug: "martial-arts-academy",
            category: "MARTIAL_ARTS",
            targetAudience: "ADULTS",
            description: "General Training Program",
          },
        });
      }
      targetProgramId = firstProg.id;
    }

    // Save File via StorageProvider
    let fileKey = `certificates/${Date.now()}-${certificateNumber}.pdf`;

    if (fileBase64 && fileName) {
      const fileDataClean = fileBase64.split(",")[1] || fileBase64;
      const buffer = Buffer.from(fileDataClean, "base64");
      const uploaded = await storageProvider.uploadFile(buffer, fileName, "certificates");
      fileKey = uploaded.fileKey;
    }

    // Create DB Certificate Record
    const cert = await db.certificate.create({
      data: {
        userId: student.id,
        programId: targetProgramId,
        title,
        certificateNumber,
        fileKey,
        issuedByUserId: session.user.id,
      },
    });

    // Create In-App Notification
    await db.notification.create({
      data: {
        userId: student.id,
        title: "New Certificate Issued!",
        message: `Congratulations! Your ${title} (${certificateNumber}) is now available in your dashboard.`,
      },
    });

    // Send Resend Email Notification
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const downloadUrl = `${baseUrl}/api/certificates/download/${cert.id}`;

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: student.email,
        subject: `Certificate Issued: ${title} - SELFFITS`,
        react: CertificateGrantedEmail({
          name: student.name,
          certTitle: title,
          certNumber: certificateNumber,
          downloadUrl,
        }),
      });
    } catch (mailErr) {
      console.error("Failed to send certificate email:", mailErr);
    }

    revalidatePath("/admin/certificates");
    revalidatePath("/dashboard/certificates");

    return {
      success: true,
      message: `Issued "${title}" to ${student.name} successfully!`,
      certificateId: cert.id,
    };
  } catch (err: any) {
    console.error("issueCertificateAction error:", err);
    return {
      success: false,
      error: "Failed to issue certificate.",
    };
  }
}

export async function getStudentCertificatesAction() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized session." };
    }

    const certificates = await db.certificate.findMany({
      where: { userId: session.user.id },
      include: { program: true },
      orderBy: { issuedDate: "desc" },
    });

    return { success: true, certificates };
  } catch (err: any) {
    console.error("getStudentCertificatesAction error:", err);
    return { success: false, error: "Failed to fetch certificates." };
  }
}

export async function deleteCertificateAction(certId: string) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized." };
    }

    const cert = await db.certificate.findUnique({ where: { id: certId } });
    if (cert) {
      await storageProvider.deleteFile(cert.fileKey);
      await db.certificate.delete({ where: { id: certId } });
    }

    revalidatePath("/admin/certificates");
    return { success: true, message: "Certificate deleted." };
  } catch (err) {
    console.error("deleteCertificateAction error:", err);
    return { success: false, error: "Failed to delete certificate." };
  }
}
