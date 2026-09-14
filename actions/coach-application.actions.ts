"use server";

import { db } from "@/lib/db";
import { PrismaClient } from "@prisma/client";
import { storageProvider } from "@/lib/storage";

function getPrisma() {
  if (db && "coachApplication" in db && (db as any).coachApplication) {
    return db as any;
  }
  return new PrismaClient();
}

export interface CoachApplicationInput {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  phone: string;
  countryCallingCode: string;
  email: string;
  location: string;
  beltLevel: string;
  yearsOfExperience: string;
  instagramUrl?: string;
  resumeUrl: string;
}

/**
 * Handle direct Resume file upload to /public/uploads/resumes/
 */
export async function uploadCoachResumeAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file || typeof file === "string") {
      return { success: false, error: "Please select a valid resume file." };
    }

    // Validate file extension
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return { success: false, error: "Resume file must be a PDF, DOC, or DOCX document." };
    }

    // Max file size 10MB
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Resume file size must be less than 10 MB." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await storageProvider.uploadFile(buffer, file.name, "resumes");
    return { success: true, url: uploaded.publicUrl };
  } catch (err: any) {
    console.error("uploadCoachResumeAction error:", err);
    return { success: false, error: "Failed to upload resume file. Please try again." };
  }
}

/**
 * Submit Coach Lead Application to database
 */
export async function submitCoachApplicationAction(data: CoachApplicationInput) {
  try {
    // 1. Full Name Validation (MANDATORY)
    if (!data.fullName || !data.fullName.trim()) {
      return { success: false, error: "Full Name is required." };
    }
    if (data.fullName.trim().length < 2) {
      return { success: false, error: "Full Name must be at least 2 characters long." };
    }

    // 2. Date of Birth Validation (MANDATORY)
    if (!data.dateOfBirth || !data.dateOfBirth.trim()) {
      return { success: false, error: "Date of Birth is required." };
    }
    const dobDate = new Date(data.dateOfBirth.trim());
    const today = new Date();
    if (isNaN(dobDate.getTime()) || dobDate >= today) {
      return { success: false, error: "Please select a valid past Date of Birth." };
    }

    // 3. Gender Validation (MANDATORY)
    if (!data.gender || !data.gender.trim()) {
      return { success: false, error: "Gender is required." };
    }

    // 4. Nationality Validation (MANDATORY)
    if (!data.nationality || !data.nationality.trim()) {
      return { success: false, error: "Nationality is required." };
    }

    // 5. Phone / WhatsApp & Calling Code Validation (MANDATORY)
    if (!data.phone || !data.phone.trim()) {
      return { success: false, error: "Phone / WhatsApp number is required." };
    }
    const digitsOnly = data.phone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { success: false, error: "Please enter a valid Phone / WhatsApp number (7 to 15 digits)." };
    }
    const callingCode = data.countryCallingCode ? data.countryCallingCode.trim() : "";

    // 6. Email Address Validation (MANDATORY)
    if (!data.email || !data.email.trim()) {
      return { success: false, error: "Email Address is required." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // 7. Current Location / Country Validation (MANDATORY)
    if (!data.location || !data.location.trim()) {
      return { success: false, error: "Current Location / Country is required." };
    }

    // 8. Belt Level Validation (MANDATORY)
    if (!data.beltLevel || !data.beltLevel.trim()) {
      return { success: false, error: "Belt Level is required. Please type your belt/rank." };
    }

    // 9. Years of Experience Validation (MANDATORY)
    if (!data.yearsOfExperience || !data.yearsOfExperience.trim()) {
      return { success: false, error: "Years of Experience is required." };
    }

    // 10. Instagram Link (OPTIONAL - Validate format if provided)
    let instagramUrl: string | null = null;
    if (data.instagramUrl && data.instagramUrl.trim()) {
      const trimmedInsta = data.instagramUrl.trim();
      if (!trimmedInsta.startsWith("http://") && !trimmedInsta.startsWith("https://")) {
        instagramUrl = `https://${trimmedInsta}`;
      } else {
        instagramUrl = trimmedInsta;
      }
    }

    // 11. Resume Upload Validation (MANDATORY)
    if (!data.resumeUrl || !data.resumeUrl.trim()) {
      return { success: false, error: "Resume upload is mandatory. Please attach your resume." };
    }

    const prisma = getPrisma();

    // Format full phone string e.g. "+91 9847012345" or store phone digits
    const fullPhoneFormatted = callingCode
      ? `${callingCode} ${data.phone.trim()}`
      : data.phone.trim();

    const application = await prisma.coachApplication.create({
      data: {
        fullName: data.fullName.trim(),
        dateOfBirth: data.dateOfBirth.trim(),
        gender: data.gender.trim(),
        nationality: data.nationality.trim(),
        phone: fullPhoneFormatted,
        countryCallingCode: callingCode || null,
        email: data.email.trim().toLowerCase(),
        location: data.location.trim(),
        beltLevel: data.beltLevel.trim(),
        highestRank: data.beltLevel.trim(), // Storing belt level in highestRank for backward compatibility
        yearsOfExperience: data.yearsOfExperience.trim(),
        totalExperience: data.yearsOfExperience.trim(), // Storing experience in totalExperience for backward compatibility
        instagramUrl: instagramUrl,
        resumeUrl: data.resumeUrl.trim(),
        disciplines: [],
        targetAgeGroups: [],
        specializations: [],
        availability: {},
        agreedDeclaration: true,
        status: "PENDING",
      },
    });

    return { success: true, applicationId: application.id };
  } catch (error: any) {
    console.error("submitCoachApplicationAction error:", error);
    const detailMsg = error?.message || "Internal database submission error";
    return {
      success: false,
      error: `Failed to save application: ${detailMsg.slice(0, 150)}`,
    };
  }
}
