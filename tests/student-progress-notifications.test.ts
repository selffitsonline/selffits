/**
 * SELFFITS Student Progress Notifications Test Suite (Step 7A)
 *
 * Verifies that:
 * 1. updateExaminationStatusAction / evaluateExaminationAction dispatches push on PASSED / FAILED.
 * 2. assignStudentBeltAction dispatches push on belt promotion.
 * 3. assignStudentBeltDirectAction dispatches push on direct belt assignment.
 * 4. issueBeltCertificateAction dispatches push on certificate issuance.
 * 5. POST /api/admin/upload-certificate dispatches push on certificate upload.
 * 6. In-app notifications (db.notification.create) are strictly preserved across all actions.
 * 7. pushNotificationService.sendToUser is called with persistInApp: false to prevent duplicate DB records.
 * 8. All push calls include a deterministic deduplicationKey for in-memory deduplication.
 * 9. Push dispatch failures (thrown exceptions) are safely caught and never fail the business operation.
 * 10. Recipient is strictly the target student's userId.
 */

// Mock next/cache before loading actions
const nextCache = require("next/cache");
nextCache.revalidatePath = () => {};

import { db } from "../lib/db";
import * as authModule from "../lib/auth";
import { pushNotificationService } from "../lib/push-notification-service";
import { storageProvider } from "../lib/storage";
import {
  updateExaminationStatusAction,
  evaluateExaminationAction,
  assignStudentBeltAction,
  assignStudentBeltDirectAction,
  issueBeltCertificateAction,
} from "../actions/student-progress.actions";
import { POST as uploadCertificatePost } from "../app/api/admin/upload-certificate/route";
import { NextRequest } from "next/server";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
    failedCount++;
  }
}

// Mock Admin Session
const mockAdminSession = {
  user: {
    id: "admin_user_001",
    email: "admin@selffits.com",
    name: "Admin User",
    role: "ADMIN",
  },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

// Spies and Trackers
let capturedPushCalls: Array<{
  userId: string;
  payload: any;
  options?: any;
}> = [];

let capturedDbNotifications: Array<any> = [];

let shouldPushThrow = false;

// Back up original methods
const originalAuth = authModule.auth;
const originalPushSendToUser = pushNotificationService.sendToUser.bind(pushNotificationService);
const originalDbNotificationCreate = db.notification.create.bind(db.notification);
const originalExamFindUnique = db.examination.findUnique.bind(db.examination);
const originalExamUpdate = db.examination.update.bind(db.examination);
const originalStudentProfileFindUnique = db.studentProfile.findUnique.bind(db.studentProfile);
const originalStudentProfileUpdate = db.studentProfile.update.bind(db.studentProfile);
const originalStudentProfileCreate = db.studentProfile.create.bind(db.studentProfile);
const originalStudentProfileUpsert = db.studentProfile.upsert.bind(db.studentProfile);
const originalBeltProgressionCreate = db.beltProgression.create.bind(db.beltProgression);
const originalUserFindUnique = db.user.findUnique.bind(db.user);
const originalUserFindFirst = db.user.findFirst.bind(db.user);
const originalCertificateCreate = db.certificate.create.bind(db.certificate);
const originalCertificateUpdate = db.certificate.update.bind(db.certificate);
const originalCertificateFindMany = db.certificate.findMany.bind(db.certificate);
const originalCertificateDeleteMany = db.certificate.deleteMany.bind(db.certificate);
const originalProgramFindFirst = db.program.findFirst.bind(db.program);
const originalProgramFindUnique = db.program.findUnique.bind(db.program);
const originalEnrollmentFindFirst = db.enrollment.findFirst.bind(db.enrollment);
const originalStorageUpload = storageProvider.uploadFile.bind(storageProvider);
const originalWebsiteSettingsFindUnique = (db.websiteSettings as any)?.findUnique
  ? (db.websiteSettings as any).findUnique.bind(db.websiteSettings)
  : null;

function resetMocks() {
  capturedPushCalls = [];
  capturedDbNotifications = [];
  shouldPushThrow = false;

  // Intercept pushNotificationService.sendToUser
  pushNotificationService.sendToUser = async (userId: string, payload: any, options?: any) => {
    capturedPushCalls.push({ userId, payload, options });
    if (shouldPushThrow) {
      throw new Error("Simulated FCM push dispatch network timeout");
    }
    return {
      success: true,
      successCount: 1,
      failureCount: 0,
      invalidTokens: [],
      errors: [],
    };
  };

  // Intercept db.notification.create
  (db.notification as any).create = async (args: any) => {
    capturedDbNotifications.push(args.data);
    return { id: `notif_${Date.now()}`, ...args.data, isRead: false, createdAt: new Date() };
  };

  // Mock session auth to admin
  (authModule as any).auth = async () => mockAdminSession;

  // Mock storage upload
  storageProvider.uploadFile = async (buf: Buffer, name: string) => ({
    fileKey: `certificates/mock-${name}`,
    publicUrl: `/uploads/certificates/mock-${name}`,
  });

  // Mock device-token-store websiteSettings to avoid database access
  if ((db.websiteSettings as any)) {
    (db.websiteSettings as any).findUnique = async () => null;
  }
}

function restoreAll() {
  (authModule as any).auth = originalAuth;
  pushNotificationService.sendToUser = originalPushSendToUser;
  (db.notification as any).create = originalDbNotificationCreate;
  (db.examination as any).findUnique = originalExamFindUnique;
  (db.examination as any).update = originalExamUpdate;
  (db.studentProfile as any).findUnique = originalStudentProfileFindUnique;
  (db.studentProfile as any).update = originalStudentProfileUpdate;
  (db.studentProfile as any).create = originalStudentProfileCreate;
  (db.studentProfile as any).upsert = originalStudentProfileUpsert;
  (db.beltProgression as any).create = originalBeltProgressionCreate;
  (db.user as any).findUnique = originalUserFindUnique;
  (db.user as any).findFirst = originalUserFindFirst;
  (db.certificate as any).create = originalCertificateCreate;
  (db.certificate as any).update = originalCertificateUpdate;
  (db.certificate as any).findMany = originalCertificateFindMany;
  (db.certificate as any).deleteMany = originalCertificateDeleteMany;
  (db.program as any).findFirst = originalProgramFindFirst;
  (db.program as any).findUnique = originalProgramFindUnique;
  (db.enrollment as any).findFirst = originalEnrollmentFindFirst;
  storageProvider.uploadFile = originalStorageUpload;
  if (originalWebsiteSettingsFindUnique && (db.websiteSettings as any)) {
    (db.websiteSettings as any).findUnique = originalWebsiteSettingsFindUnique;
  }
}

async function runStudentProgressNotificationTests() {
  console.log("=================================================================");
  console.log(" SELFFITS Student Progress Notifications — Automated Test Suite");
  console.log("=================================================================\n");

  try {
    // -------------------------------------------------------------
    // Section 1: Examination Evaluation Notifications
    // -------------------------------------------------------------
    console.log("Section 1: Examination Evaluation Notifications (PASSED / FAILED)");
    resetMocks();

    const mockExam = {
      id: "exam_101",
      userId: "student_usr_456",
      targetBelt: "Yellow Belt",
      status: "SCHEDULED",
    };

    (db.examination as any).findUnique = async () => mockExam;
    (db.examination as any).update = async (args: any) => ({ ...mockExam, ...args.data });

    // Test 1.1: updateExaminationStatusAction with PASSED
    const passResult = await updateExaminationStatusAction({
      examinationId: "exam_101",
      status: "PASSED" as any,
      remarks: "Great technique and discipline.",
    });

    assert(passResult.success === true, "updateExaminationStatusAction succeeds for PASSED status");
    assert(capturedDbNotifications.length === 1, "In-app database notification was created for PASSED");
    assert(capturedDbNotifications[0]?.userId === "student_usr_456", "In-app notification userId matches target student");
    assert(capturedDbNotifications[0]?.title === "Examination Passed! 🎉", "In-app notification title is 'Examination Passed! 🎉'");
    assert(capturedPushCalls.length === 1, "Push notification was dispatched for PASSED examination");
    assert(capturedPushCalls[0]?.userId === "student_usr_456", "Push recipient matches target student");
    assert(capturedPushCalls[0]?.payload?.title === "Examination Passed! 🎉", "Push payload title is 'Examination Passed! 🎉'");
    assert(capturedPushCalls[0]?.payload?.data?.type === "ENROLLMENT_UPDATE", "Push payload data.type is 'ENROLLMENT_UPDATE'");
    assert(capturedPushCalls[0]?.payload?.data?.deepLink === "selffits://dashboard/student", "Push payload deepLink is 'selffits://dashboard/student'");
    assert(capturedPushCalls[0]?.payload?.data?.status === "PASSED", "Push payload data.status is 'PASSED'");
    assert(capturedPushCalls[0]?.payload?.data?.examinationId === "exam_101", "Push payload data.examinationId matches exam.id");
    assert(capturedPushCalls[0]?.options?.persistInApp === false, "Push options has persistInApp: false to prevent duplicate DB records");
    assert(capturedPushCalls[0]?.options?.deduplicationKey === "exam:exam_101:PASSED", "Push options includes deterministic deduplicationKey 'exam:exam_101:PASSED'");

    // Test 1.2: evaluateExaminationAction alias function with FAILED
    resetMocks();
    (db.examination as any).findUnique = async () => mockExam;
    (db.examination as any).update = async (args: any) => ({ ...mockExam, ...args.data });

    assert(typeof evaluateExaminationAction === "function", "evaluateExaminationAction is exported as a function alias");

    const failResult = await evaluateExaminationAction({
      examinationId: "exam_101",
      status: "FAILED" as any,
      remarks: "Needs improvement in kata form.",
    });

    assert(failResult.success === true, "evaluateExaminationAction succeeds for FAILED status");
    assert(capturedDbNotifications.length === 1, "In-app database notification was created for FAILED");
    assert(capturedDbNotifications[0]?.title === "Examination Result Updated", "In-app notification title is 'Examination Result Updated'");
    assert(capturedPushCalls.length === 1, "Push notification was dispatched for FAILED examination");
    assert(capturedPushCalls[0]?.userId === "student_usr_456", "Push recipient matches target student");
    assert(capturedPushCalls[0]?.payload?.title === "Examination Result Updated", "Push payload title is 'Examination Result Updated'");
    assert(capturedPushCalls[0]?.payload?.data?.type === "ENROLLMENT_UPDATE", "Push payload data.type is 'ENROLLMENT_UPDATE'");
    assert(capturedPushCalls[0]?.payload?.data?.deepLink === "selffits://dashboard/student", "Push payload deepLink is 'selffits://dashboard/student'");
    assert(capturedPushCalls[0]?.payload?.data?.status === "FAILED", "Push payload data.status is 'FAILED'");
    assert(capturedPushCalls[0]?.options?.persistInApp === false, "Push options has persistInApp: false");
    assert(capturedPushCalls[0]?.options?.deduplicationKey === "exam:exam_101:FAILED", "Push options includes deduplicationKey 'exam:exam_101:FAILED'");

    // Test 1.3: Non-terminal status (SCHEDULED) does NOT send notifications
    resetMocks();
    (db.examination as any).findUnique = async () => mockExam;
    (db.examination as any).update = async (args: any) => ({ ...mockExam, ...args.data });

    await updateExaminationStatusAction({
      examinationId: "exam_101",
      status: "SCHEDULED" as any,
    });
    assert(capturedDbNotifications.length === 0, "No in-app notification sent for SCHEDULED status");
    assert(capturedPushCalls.length === 0, "No push notification dispatched for SCHEDULED status");

    // Test 1.4: Push exception resilience (fail-open)
    resetMocks();
    (db.examination as any).findUnique = async () => mockExam;
    (db.examination as any).update = async (args: any) => ({ ...mockExam, ...args.data });
    shouldPushThrow = true;

    const resilientResult = await updateExaminationStatusAction({
      examinationId: "exam_101",
      status: "PASSED" as any,
    });
    assert(resilientResult.success === true, "Action returns success: true even when push service throws an exception");
    assert(capturedDbNotifications.length === 1, "In-app DB notification was preserved despite push exception");

    console.log();

    // -------------------------------------------------------------
    // Section 2: Belt Promotion Notifications (assignStudentBeltAction)
    // -------------------------------------------------------------
    console.log("Section 2: Belt Promotion Notifications (assignStudentBeltAction)");
    resetMocks();

    const mockPassedExam = {
      id: "exam_passed_202",
      userId: "student_usr_789",
      targetBelt: "Orange Belt",
      status: "PASSED",
    };

    (db.examination as any).findUnique = async () => mockPassedExam;
    (db.studentProfile as any).findUnique = async () => ({
      userId: "student_usr_789",
      currentBelt: "Yellow Belt",
      beltAwardedAt: new Date("2026-01-01"),
    });
    (db.studentProfile as any).update = async (args: any) => args.data;
    (db.beltProgression as any).create = async (args: any) => ({
      id: "belt_prog_303",
      ...args.data,
    });

    const beltResult = await assignStudentBeltAction({
      userId: "student_usr_789",
      examinationId: "exam_passed_202",
      targetBelt: "Orange Belt",
      notes: "Outstanding performance during promotion.",
    });

    assert(beltResult.success === true, "assignStudentBeltAction succeeds");
    assert(beltResult.beltProgressionId === "belt_prog_303", "Returns valid beltProgressionId");
    assert(capturedDbNotifications.length === 1, "In-app database notification was created for belt promotion");
    assert(capturedDbNotifications[0]?.userId === "student_usr_789", "In-app notification targets student");
    assert(capturedDbNotifications[0]?.title === "New Belt Awarded! 🥋", "In-app notification title is 'New Belt Awarded! 🥋'");
    assert(capturedPushCalls.length === 1, "Push notification was dispatched for belt promotion");
    assert(capturedPushCalls[0]?.userId === "student_usr_789", "Push recipient is strictly the target student");
    assert(capturedPushCalls[0]?.payload?.title === "New Belt Awarded! 🥋", "Push title is 'New Belt Awarded! 🥋'");
    assert(capturedPushCalls[0]?.payload?.data?.type === "ENROLLMENT_UPDATE", "Push data.type is 'ENROLLMENT_UPDATE'");
    assert(capturedPushCalls[0]?.payload?.data?.deepLink === "selffits://dashboard/student", "Push deepLink is 'selffits://dashboard/student'");
    assert(capturedPushCalls[0]?.payload?.data?.targetBelt === "Orange Belt", "Push data.targetBelt is 'Orange Belt'");
    assert(capturedPushCalls[0]?.payload?.data?.previousBelt === "Yellow Belt", "Push data.previousBelt is 'Yellow Belt'");
    assert(capturedPushCalls[0]?.payload?.data?.beltProgressionId === "belt_prog_303", "Push data.beltProgressionId matches created progression");
    assert(capturedPushCalls[0]?.options?.persistInApp === false, "Push options has persistInApp: false");
    assert(capturedPushCalls[0]?.options?.deduplicationKey === "belt_promotion:student_usr_789:exam_passed_202:Orange Belt", "Push deduplicationKey is deterministic");

    // Test 2.2: Push failure resilience
    resetMocks();
    (db.examination as any).findUnique = async () => mockPassedExam;
    (db.studentProfile as any).findUnique = async () => ({ userId: "student_usr_789", currentBelt: "Yellow Belt" });
    (db.studentProfile as any).update = async (args: any) => args.data;
    (db.beltProgression as any).create = async (args: any) => ({ id: "belt_prog_303", ...args.data });
    shouldPushThrow = true;

    const beltResilientResult = await assignStudentBeltAction({
      userId: "student_usr_789",
      examinationId: "exam_passed_202",
      targetBelt: "Orange Belt",
    });
    assert(beltResilientResult.success === true, "assignStudentBeltAction succeeds even if push dispatch throws");

    console.log();

    // -------------------------------------------------------------
    // Section 3: Direct Belt Assignment Notifications (assignStudentBeltDirectAction)
    // -------------------------------------------------------------
    console.log("Section 3: Direct Belt Assignment Notifications (assignStudentBeltDirectAction)");
    resetMocks();

    (db.studentProfile as any).findUnique = async () => ({
      userId: "student_usr_888",
      currentBelt: "Green Belt",
    });
    (db.studentProfile as any).update = async (args: any) => args.data;

    const directBeltResult = await assignStudentBeltDirectAction({
      userId: "student_usr_888",
      targetBelt: "Blue Belt",
    });

    assert(directBeltResult.success === true, "assignStudentBeltDirectAction succeeds");
    assert(capturedDbNotifications.length === 1, "In-app database notification was created for direct belt assignment");
    assert(capturedDbNotifications[0]?.title === "New Belt Rank Assigned! 🥋", "In-app notification title is 'New Belt Rank Assigned! 🥋'");
    assert(capturedPushCalls.length === 1, "Push notification was dispatched for direct belt assignment");
    assert(capturedPushCalls[0]?.userId === "student_usr_888", "Push recipient is target student");
    assert(capturedPushCalls[0]?.payload?.title === "New Belt Rank Assigned! 🥋", "Push title is 'New Belt Rank Assigned! 🥋'");
    assert(capturedPushCalls[0]?.payload?.data?.type === "ENROLLMENT_UPDATE", "Push data.type is 'ENROLLMENT_UPDATE'");
    assert(capturedPushCalls[0]?.payload?.data?.deepLink === "selffits://dashboard/student", "Push deepLink is 'selffits://dashboard/student'");
    assert(capturedPushCalls[0]?.payload?.data?.targetBelt === "Blue Belt", "Push data.targetBelt is 'Blue Belt'");
    assert(capturedPushCalls[0]?.payload?.data?.previousBelt === "Green Belt", "Push data.previousBelt is 'Green Belt'");
    assert(capturedPushCalls[0]?.options?.persistInApp === false, "Push options has persistInApp: false");
    assert(capturedPushCalls[0]?.options?.deduplicationKey === "belt_direct:student_usr_888:Blue Belt", "Push deduplicationKey is deterministic");

    // Test 3.2: Push failure resilience
    resetMocks();
    (db.studentProfile as any).findUnique = async () => ({ userId: "student_usr_888", currentBelt: "Green Belt" });
    (db.studentProfile as any).update = async (args: any) => args.data;
    shouldPushThrow = true;

    const directResilientResult = await assignStudentBeltDirectAction({
      userId: "student_usr_888",
      targetBelt: "Blue Belt",
    });
    assert(directResilientResult.success === true, "assignStudentBeltDirectAction succeeds even if push dispatch throws");

    console.log();

    // -------------------------------------------------------------
    // Section 4: Certificate Issuance Notifications (issueBeltCertificateAction)
    // -------------------------------------------------------------
    console.log("Section 4: Certificate Issuance Notifications (issueBeltCertificateAction)");
    resetMocks();

    (db.user as any).findUnique = async () => ({
      id: "student_usr_999",
      name: "Sam Student",
      email: "sam@selffits.com",
    });
    (db.program as any).findFirst = async () => ({
      id: "program_mma_001",
      title: "Martial Arts Academy",
    });
    (db.enrollment as any).findFirst = async () => null;
    (db.certificate as any).create = async (args: any) => ({
      id: "cert_dyn_505",
      ...args.data,
    });

    const certResult = await issueBeltCertificateAction({
      userId: "student_usr_999",
      beltName: "Purple Belt",
      title: "Purple Belt Master Certificate",
    });

    assert(certResult.success === true, "issueBeltCertificateAction succeeds");
    assert(certResult.certificateId === "cert_dyn_505", "Returns generated certificateId");
    assert(capturedDbNotifications.length === 1, "In-app database notification was created for certificate issuance");
    assert(capturedDbNotifications[0]?.title === "Official Certificate Issued! 📜", "In-app notification title is 'Official Certificate Issued! 📜'");
    assert(capturedPushCalls.length === 1, "Push notification was dispatched for certificate issuance");
    assert(capturedPushCalls[0]?.userId === "student_usr_999", "Push recipient is target student");
    assert(capturedPushCalls[0]?.payload?.title === "Official Certificate Issued! 📜", "Push title is 'Official Certificate Issued! 📜'");
    assert(capturedPushCalls[0]?.payload?.data?.type === "CERTIFICATE_AWARDED", "Push data.type is 'CERTIFICATE_AWARDED'");
    assert(capturedPushCalls[0]?.payload?.data?.deepLink === "selffits://dashboard/student", "Push deepLink is 'selffits://dashboard/student'");
    assert(capturedPushCalls[0]?.payload?.data?.certificateId === "cert_dyn_505", "Push data.certificateId matches issued certificate");
    assert(capturedPushCalls[0]?.options?.persistInApp === false, "Push options has persistInApp: false");
    assert(capturedPushCalls[0]?.options?.deduplicationKey === "cert_issued:cert_dyn_505", "Push deduplicationKey is deterministic 'cert_issued:cert_dyn_505'");

    // Test 4.2: Push failure resilience
    resetMocks();
    (db.user as any).findUnique = async () => ({ id: "student_usr_999", name: "Sam Student" });
    (db.program as any).findFirst = async () => ({ id: "program_mma_001" });
    (db.enrollment as any).findFirst = async () => null;
    (db.certificate as any).create = async (args: any) => ({ id: "cert_dyn_505", ...args.data });
    shouldPushThrow = true;

    const certResilientResult = await issueBeltCertificateAction({
      userId: "student_usr_999",
      beltName: "Purple Belt",
    });
    assert(certResilientResult.success === true, "issueBeltCertificateAction succeeds even if push dispatch throws");

    console.log();

    // -------------------------------------------------------------
    // Section 5: Certificate Upload Notifications (POST /api/admin/upload-certificate)
    // -------------------------------------------------------------
    console.log("Section 5: Certificate Upload Notifications (POST /api/admin/upload-certificate)");
    resetMocks();

    const mockUploadedStudent = {
      id: "student_usr_111",
      name: "Uploaded Student",
      email: "uploaded@selffits.com",
      enrollments: [
        {
          id: "enr_001",
          membershipPlan: {
            id: "plan_001",
            programId: "program_mma_001",
          },
        },
      ],
    };

    (db.user as any).findUnique = async (args: any) => {
      if (args.where?.id === "student_usr_111") return mockUploadedStudent;
      if (args.where?.id === "admin_user_001") return mockAdminSession.user;
      return null;
    };
    (db.user as any).findFirst = async () => mockAdminSession.user;
    (db.program as any).findFirst = async () => ({
      id: "program_mma_001",
      title: "Martial Arts Academy",
    });
    (db.program as any).findUnique = async () => ({
      id: "program_mma_001",
      title: "Martial Arts Academy",
    });

    const mockUploadCert = {
      id: "cert_upload_707",
      userId: "student_usr_111",
      programId: "program_mma_001",
      title: "Brown Belt Certificate",
      certificateNumber: "SELFFITS-BROWN-001",
      fileKey: "certificates/test.pdf",
      issuedDate: new Date(),
      beltName: "Brown Belt",
    };
    (db.certificate as any).create = async () => mockUploadCert;
    (db.certificate as any).findMany = async () => [];
    (db.certificate as any).update = async () => mockUploadCert;
    (db.studentProfile as any).upsert = async () => ({
      userId: "student_usr_111",
      currentBelt: "Brown Belt",
    });

    // Create a mock NextRequest with multipart form data
    const formData = new FormData();
    const fakeFile = new File(["dummy pdf content"], "certificate.pdf", { type: "application/pdf" });
    formData.append("file", fakeFile);
    formData.append("userId", "student_usr_111");
    formData.append("beltName", "Brown Belt");
    formData.append("title", "Brown Belt Certificate");

    const mockReq = new NextRequest("http://localhost:3000/api/admin/upload-certificate", {
      method: "POST",
      body: formData,
    });

    const uploadResponse = await uploadCertificatePost(mockReq);
    const uploadJson = await uploadResponse.json();

    assert(uploadResponse.status === 200, "POST /api/admin/upload-certificate returns HTTP 200");
    assert(uploadJson.success === true, "Response JSON has success: true");
    assert(uploadJson.certificateId === "cert_upload_707", "Response contains certificateId");
    assert(capturedDbNotifications.length === 1, "In-app database notification was created for certificate upload");
    assert(capturedDbNotifications[0]?.title === "Official Certificate Uploaded! 📜", "In-app notification title is 'Official Certificate Uploaded! 📜'");
    assert(capturedPushCalls.length === 1, "Push notification was dispatched for certificate upload");
    assert(capturedPushCalls[0]?.userId === "student_usr_111", "Push recipient is target student");
    assert(capturedPushCalls[0]?.payload?.title === "Official Certificate Uploaded! 📜", "Push title is 'Official Certificate Uploaded! 📜'");
    assert(capturedPushCalls[0]?.payload?.data?.type === "CERTIFICATE_AWARDED", "Push data.type is 'CERTIFICATE_AWARDED'");
    assert(capturedPushCalls[0]?.payload?.data?.deepLink === "selffits://dashboard/student", "Push deepLink is 'selffits://dashboard/student'");
    assert(capturedPushCalls[0]?.payload?.data?.certificateId === "cert_upload_707", "Push data.certificateId matches uploaded certificate");
    assert(capturedPushCalls[0]?.options?.persistInApp === false, "Push options has persistInApp: false");
    assert(capturedPushCalls[0]?.options?.deduplicationKey === "cert_uploaded:cert_upload_707", "Push deduplicationKey is deterministic 'cert_uploaded:cert_upload_707'");

    // Test 5.2: Push failure resilience in upload route
    resetMocks();
    (db.user as any).findUnique = async (args: any) => {
      if (args.where?.id === "student_usr_111") return mockUploadedStudent;
      if (args.where?.id === "admin_user_001") return mockAdminSession.user;
      return null;
    };
    (db.user as any).findFirst = async () => mockAdminSession.user;
    (db.program as any).findFirst = async () => ({ id: "program_mma_001" });
    (db.program as any).findUnique = async () => ({ id: "program_mma_001" });
    (db.certificate as any).create = async () => mockUploadCert;
    (db.certificate as any).findMany = async () => [];
    (db.studentProfile as any).upsert = async () => ({ userId: "student_usr_111", currentBelt: "Brown Belt" });
    shouldPushThrow = true;

    const resilientUploadReq = new NextRequest("http://localhost:3000/api/admin/upload-certificate", {
      method: "POST",
      body: formData,
    });
    const resilientUploadResponse = await uploadCertificatePost(resilientUploadReq);
    const resilientUploadJson = await resilientUploadResponse.json();

    assert(resilientUploadResponse.status === 200, "upload-certificate route returns HTTP 200 even if push fails");
    assert(resilientUploadJson.success === true, "upload-certificate returns success: true even if push fails");

    console.log();

    // -------------------------------------------------------------
    // Section 6: In-Memory Deduplication Verification with pushNotificationService
    // -------------------------------------------------------------
    console.log("Section 6: In-Memory Deduplication Verification");
    // Restore real pushNotificationService.sendToUser to test actual deduplicationKey caching
    pushNotificationService.sendToUser = originalPushSendToUser;

    const dedupKey = `test_dedup_exam:${Date.now()}`;
    const firstSend = await pushNotificationService.sendToUser(
      "student_mock_user",
      {
        title: "Test Belt Award",
        body: "Test belt promotion body",
        data: { type: "ENROLLMENT_UPDATE", deepLink: "selffits://dashboard/student" },
      },
      { persistInApp: false, deduplicationKey: dedupKey }
    );

    // Second call with same key should be deduplicated
    const secondSend = await pushNotificationService.sendToUser(
      "student_mock_user",
      {
        title: "Test Belt Award",
        body: "Test belt promotion body",
        data: { type: "ENROLLMENT_UPDATE", deepLink: "selffits://dashboard/student" },
      },
      { persistInApp: false, deduplicationKey: dedupKey }
    );

    assert((secondSend as any).deduplicated === true, "Second call with identical deduplicationKey is deduplicated");
    assert(secondSend.successCount === 0, "Deduplicated call has successCount: 0");

    console.log();
  } finally {
    restoreAll();
  }

  console.log("=================================================================");
  console.log(` Student Progress Notifications Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runStudentProgressNotificationTests().catch((err) => {
  console.error("Test runner encountered unhandled error:", err);
  process.exit(1);
});
