"use server";

import { db } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

function getPrisma() {
  if (db && "coachApplication" in db && (db as any).coachApplication) {
    return db as any;
  }
  return new PrismaClient();
}

export interface CoachApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  location?: string;
  profilePhotoUrl?: string;

  disciplines?: string[];

  highestRank?: string;
  certificationName?: string;
  issuingOrganization?: string;
  yearObtained?: string;
  certificateNumber?: string;
  certificateUploadUrl?: string;

  totalExperience?: string;
  previousAcademy?: string;
  coachingBio?: string;
  targetAgeGroups?: string[];

  specializations?: string[];

  hasOnlineExperience?: string;
  preferredPlatform?: string;
  isLiveClassAvailable?: string;

  availability?: Record<string, string[]>;

  aboutSelf?: string;
  whyJoinSelffits?: string;
  whatMakesGoodCoach?: string;

  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
  trainingVideoUrl?: string;

  resumeUrl?: string;
  qualificationCertsUrl?: string;
  licenseUrl?: string;
  idPassportUrl?: string;

  agreedDeclaration?: boolean;
}

export async function submitCoachApplicationAction(data: CoachApplicationInput) {
  try {
    // 1. Full Name Validation (MANDATORY)
    if (!data.fullName || !data.fullName.trim()) {
      return { success: false, error: "Full Name is required." };
    }
    if (data.fullName.trim().length < 2) {
      return { success: false, error: "Full Name must be at least 2 characters long." };
    }

    // 2. Email Address Validation (MANDATORY)
    if (!data.email || !data.email.trim()) {
      return { success: false, error: "Email Address is required." };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // 3. Phone / WhatsApp Validation (MANDATORY)
    if (!data.phone || !data.phone.trim()) {
      return { success: false, error: "Phone / WhatsApp number is required." };
    }
    const digitsOnly = data.phone.replace(/\D/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { success: false, error: "Please enter a valid Phone / WhatsApp number (7 to 15 digits)." };
    }

    // Date of Birth (Optional check if provided)
    if (data.dateOfBirth && data.dateOfBirth.trim()) {
      const dobDate = new Date(data.dateOfBirth.trim());
      const today = new Date();
      if (isNaN(dobDate.getTime()) || dobDate >= today) {
        return { success: false, error: "Please select a valid past Date of Birth." };
      }
    }

    // Safe JSON Serialization for Prisma Optional Fields
    const safeDisciplines = JSON.parse(JSON.stringify(data.disciplines || []));
    const safeTargetAgeGroups = JSON.parse(JSON.stringify(data.targetAgeGroups || []));
    const safeSpecializations = JSON.parse(JSON.stringify(data.specializations || []));
    const safeAvailability = JSON.parse(JSON.stringify(data.availability || {}));

    const prisma = getPrisma();

    const application = await prisma.coachApplication.create({
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.trim() : null,
        gender: data.gender || null,
        nationality: data.nationality ? data.nationality.trim() : null,
        location: data.location ? data.location.trim() : null,
        profilePhotoUrl: data.profilePhotoUrl || null,

        disciplines: safeDisciplines,

        highestRank: data.highestRank || null,
        certificationName: data.certificationName || null,
        issuingOrganization: data.issuingOrganization || null,
        yearObtained: data.yearObtained || null,
        certificateNumber: data.certificateNumber || null,
        certificateUploadUrl: data.certificateUploadUrl || null,

        totalExperience: data.totalExperience || null,
        previousAcademy: data.previousAcademy || null,
        coachingBio: data.coachingBio || null,
        targetAgeGroups: safeTargetAgeGroups,

        availability: safeAvailability,

        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        websiteUrl: data.websiteUrl || null,
        trainingVideoUrl: data.trainingVideoUrl || null,

        resumeUrl: data.resumeUrl || null,
        qualificationCertsUrl: data.qualificationCertsUrl || null,
        licenseUrl: data.licenseUrl || null,
        idPassportUrl: data.idPassportUrl || null,

        agreedDeclaration: data.agreedDeclaration ?? true,
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
