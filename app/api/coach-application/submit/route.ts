import { NextRequest, NextResponse } from "next/server";
import { submitCoachApplicationAction } from "@/actions/coach-application.actions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await submitCoachApplicationAction(body);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: res.error || "Application submission failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      applicationId: res.applicationId,
    });
  } catch (err: any) {
    console.error("coach-application/submit API route error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal database submission error" },
      { status: 500 }
    );
  }
}
