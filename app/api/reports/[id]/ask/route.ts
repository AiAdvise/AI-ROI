import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AnalysisResultSchema } from "@/lib/types";
import { answerFollowUpQuestion } from "@/lib/anthropic";

export const runtime = "nodejs";
export const maxDuration = 30;

// The actual question text sent to the model is always one of these - never
// taken from client-supplied free text - so there's no open-ended prompt
// surface here even though the button labels look conversational.
const CANNED_QUESTIONS: Record<string, string> = {
  next_step:
    "Of everything in this report - the findings, the benchmark comparisons, and the recommendations - what is the single most important thing I should do first, and why that one over everything else?",
  overcharged:
    "Based on what this report actually shows, does it look like I'm getting fair value for what I'm spending, or does something here suggest I might be overpaying? Give me a direct, honest take, not a hedge.",
  proof_it_works:
    "Does anything in this report actually prove I'm getting more real customers or jobs booked, or is it mostly showing ad-platform activity (impressions, clicks, views) without proof of business impact? Be direct about which one it is.",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You need to be signed in." }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const questionKey = typeof body?.questionKey === "string" ? body.questionKey : null;
  const question = questionKey ? CANNED_QUESTIONS[questionKey] : undefined;

  if (!question) {
    return NextResponse.json({ error: "Unknown question." }, { status: 400 });
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("result")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  const parsed = AnalysisResultSchema.safeParse(report.result);
  if (!parsed.success) {
    return NextResponse.json({ error: "Couldn't read that report." }, { status: 500 });
  }

  try {
    const answer = await answerFollowUpQuestion(parsed.data, question);
    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Ask failed:", err);
    return NextResponse.json({ error: "Couldn't get an answer. Please try again." }, { status: 500 });
  }
}
