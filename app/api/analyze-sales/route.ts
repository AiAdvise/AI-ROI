import { NextRequest, NextResponse } from "next/server";
import { analyzeSalesData, type SalesFileInput } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
// See app/api/analyze/route.ts - 60s was observed too tight for at least one
// real upload on the agency-report pipeline; this pipeline makes the same
// kind of model call, so it gets the same headroom.
export const maxDuration = 120;

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const CSV_TYPES = new Set(["text/csv", "application/vnd.ms-excel"]);

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You need to be signed in to upload sales data." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  const notes = formData.get("notes");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File is too large. Max size is 20MB." }, { status: 400 });
  }

  // Browsers are inconsistent about the .csv MIME type (some send "", some
  // send "application/vnd.ms-excel") - the extension is the reliable signal.
  const isCsv = CSV_TYPES.has(file.type) || file.name.toLowerCase().endsWith(".csv");

  let fileInput: SalesFileInput;
  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    fileInput = { kind: "pdf", base64Data: Buffer.from(arrayBuffer).toString("base64") };
  } else if (IMAGE_TYPES.has(file.type)) {
    const arrayBuffer = await file.arrayBuffer();
    fileInput = {
      kind: "image",
      base64Data: Buffer.from(arrayBuffer).toString("base64"),
      mediaType: file.type as "image/png" | "image/jpeg" | "image/webp",
    };
  } else if (isCsv) {
    const text = await file.text();
    fileInput = { kind: "csv", text };
  } else {
    return NextResponse.json(
      { error: "Unsupported file type. Please upload a PDF, PNG, JPEG, WEBP, or CSV." },
      { status: 400 },
    );
  }

  try {
    const result = await analyzeSalesData(
      fileInput,
      typeof notes === "string" && notes.trim() ? notes.trim().slice(0, 500) : null,
    );

    const { data: saved, error: saveError } = await supabase
      .from("sales_reports")
      .insert({
        user_id: user.id,
        reporting_period: result.reportingPeriod,
        reporting_period_start: result.reportingPeriodStart,
        result,
      })
      .select("id")
      .single();

    if (saveError) {
      console.error("Failed to save sales report:", saveError);
    }

    return NextResponse.json({ result, reportId: saved?.id ?? null });
  } catch (err) {
    console.error("Sales data extraction failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Extraction failed: ${message}` }, { status: 500 });
  }
}
