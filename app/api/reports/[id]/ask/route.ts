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
  why: "Looking at this report's findings, why is this happening? Explain the most likely reason in plain, simple terms.",
  normal: "Is this normal for a home services business, or should I be concerned? Answer plainly.",
  ask_agency:
    "What's the single most important question I should ask my agency about this report, and why?",
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
