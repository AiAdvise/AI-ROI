import { NextRequest, NextResponse } from "next/server";
import { analyzeMediaPlan } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ACCEPTED_TYPES: Record<string, { mediaType: string; isPdf: boolean }> = {
  "application/pdf": { mediaType: "application/pdf", isPdf: true },
  "image/png": { mediaType: "image/png", isPdf: false },
  "image/jpeg": { mediaType: "image/jpeg", isPdf: false },
  "image/webp": { mediaType: "image/webp", isPdf: false },
};

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You need to be signed in to run a diagnostic." }, {
      status: 401,
    });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const trade = formData.get("trade");
  const spendNotes = formData.get("spendNotes");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const accepted = ACCEPTED_TYPES[file.type];
  if (!accepted) {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a PDF, PNG, JPEG, or WEBP." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large. Max size is 20MB." }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const result = await analyzeMediaPlan({
      base64Data,
      mediaType: accepted.mediaType,
      isPdf: accepted.isPdf,
      trade: typeof trade === "string" && trade.trim() ? trade.trim() : null,
      spendNotes:
        typeof spendNotes === "string" && spendNotes.trim()
          ? spendNotes.trim().slice(0, 500)
          : null,
    });

    const { data: saved, error: saveError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        business_type: result.documentSummary.businessType,
        trade: typeof trade === "string" && trade.trim() ? trade.trim() : null,
        reporting_period: result.documentSummary.reportingPeriod,
        reporting_period_start: result.documentSummary.reportingPeriodStart,
        overall_assessment: result.overallAssessment,
        result,
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Failed to save report:", saveError);
    }

    return NextResponse.json({ result, reportId: saved?.id ?? null });
  } catch (err) {
    console.error("Analysis failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 });
  }
}
