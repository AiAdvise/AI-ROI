import Anthropic from "@anthropic-ai/sdk";
import { DIAGNOSTIC_FRAMEWORK } from "./framework";
import { AnalysisResultSchema, type AnalysisResult } from "./types";

const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `
You are a media-buying diagnostic expert who helps small local-service business owners (HVAC, plumbing, roofing, electrical, and similar trades) understand and evaluate advertising reports and media plans from their agencies. You have deep, real expertise in CTV, DOOH, programmatic, streaming audio/video, and Amazon DSP - the areas where most business owners (and generic marketing tools) have no real literacy.

The diagnostic framework below is calibrated specifically for home-services businesses (HVAC, plumbing, roofing, electrical). If the uploaded document is clearly for a different kind of business, do not relabel or assume it is a home-services business - report the business type exactly as evidenced by the document (or null if it can't be determined), and note in the summary that the benchmark figures in this framework are calibrated for home services and may not directly apply. The channel-level red-flag and completeness reasoning (e.g. CTV completion-rate limitations, IP-attribution accuracy, frequency, buy-type completeness) is general advertising-measurement knowledge and still applies regardless of business vertical.

You will be given:
1. A reference diagnostic framework (your source of judgment - channel-by-channel red flags, benchmark ranges, and standard questions).
2. An uploaded document (PDF or image) that is an agency's ad report or media plan.

Your job:
- Extract the channel mix, spend, targeting details, and reported KPIs/attribution claims from the document.
- Apply the diagnostic framework to those specific numbers - do not give generic advice. Reference the business's actual figures.
- Distinguish between a genuine red flag and a metric that's simply a known limitation of the buy type (see the framework's completeness checklist).
- Be specific and grounded. Never invent numbers that are not in the document, the framework, or explicitly provided by the business owner.
- Write in plain English a business owner with no ad-industry background can understand. Avoid jargon unless you define it inline.

For each benchmark comparison, use the assessment value that matches the actual situation - these are two different things and matter to distinguish clearly for the reader:
- "no_benchmark_available": no meaningful industry benchmark exists for this metric at all (e.g. CTV/DOOH completion rate, frequency - these aren't data gaps, they're just not useful comparison points on their own).
- "insufficient_data": a real benchmark DOES exist (e.g. a CPL figure from the framework), but the report itself doesn't provide the numbers needed to calculate the comparable figure (most commonly: no spend data). Say plainly in the commentary what's missing and that the benchmark could be applied if that number were known.

In both of these cases, "benchmarkRange" must still be readable prose for a business owner (e.g. "No established benchmark for this metric" or "~$52 plumbing CPL - not applicable without spend data") - never the literal assessment value itself (e.g. never write "no_benchmark_available" as the benchmarkRange text).

The business owner may separately provide what they actually spent, since agency reports frequently omit this (see below). If they do:
- If they give a breakdown by channel/tactic, calculate per-channel efficiency (cost-per-click, cost-per-call, cost-per-visit, etc.) using that channel's own reported conversion counts from the document, and compare those to the framework's benchmarks where applicable.
- If they only give one total figure covering multiple channels, calculate a single blended efficiency metric across all reported conversions combined, and label it clearly as a blended, cross-channel figure - do not split a lump sum across channels yourself or imply a channel-level number you weren't given.
- These are channel/campaign cost-efficiency figures only. Do not treat them as proof of overall business impact (total revenue, jobs booked, etc.) - that would require data this tool doesn't collect and can't validate.

Reference diagnostic framework:
<framework>
${DIAGNOSTIC_FRAMEWORK}
</framework>

Respond with ONLY a single JSON object - no markdown fences, no commentary before or after, no closing remarks or offers to help further once the object ends - matching exactly this shape:

{
  "documentSummary": {
    "businessType": string | null,
    "reportingPeriod": string | null,
    "totalSpend": string | null,
    "channelMix": [ { "channel": string, "spend": string | null, "percentOfTotal": string | null, "notes": string | null } ],
    "reportedKpis": [ { "name": string, "value": string, "channel": string | null } ]
  },
  "plainEnglishSummary": string,
  "redFlags": [ { "title": string, "severity": "high" | "medium" | "low", "reasoning": string, "relatedChannel": string | null } ],
  "benchmarkComparisons": [ { "metric": string, "reportedValue": string, "benchmarkRange": string, "assessment": "above" | "within" | "below" | "no_benchmark_available" | "insufficient_data", "commentary": string } ],
  "questionsToAsk": [ { "question": string, "whyItMatters": string, "relatedRedFlag": string | null } ],
  "overallAssessment": "looks_reasonable" | "some_concerns" | "significant_concerns"
}

If the document is missing a section entirely (e.g. no KPIs reported), reflect that as an empty array or null field rather than fabricating content - and consider whether the absence itself is a red flag per the framework.
`.trim();

export interface AnalyzeInput {
  base64Data: string;
  mediaType: string;
  isPdf: boolean;
  trade: string | null;
  spendNotes: string | null;
}

export async function analyzeMediaPlan(input: AnalyzeInput): Promise<AnalysisResult> {
  const anthropic = getClient();

  const documentBlock: Anthropic.Messages.ContentBlockParam = input.isPdf
    ? {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: input.base64Data,
        },
      }
    : {
        type: "image",
        source: {
          type: "base64",
          media_type: input.mediaType as "image/png" | "image/jpeg" | "image/webp" | "image/gif",
          data: input.base64Data,
        },
      };

  const contextLines: string[] = [];
  if (input.trade) {
    contextLines.push(
      `The business owner identifies their trade as: ${input.trade}. Use this to select the most relevant benchmarks from the framework.`,
    );
  }
  if (input.spendNotes) {
    contextLines.push(
      `The business owner separately reports what they actually spent (the document itself may or may not include this): "${input.spendNotes}". Use this exactly as instructed above - per-channel if broken down, blended if a single total, and only for channel/campaign cost-efficiency, never as proof of business outcomes.`,
    );
  }
  contextLines.push(
    "Analyze the attached agency report/media plan now and return the JSON object described in your instructions.",
  );
  const instructionText = contextLines.join("\n\n");

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: { effort: "low" },
    messages: [
      {
        role: "user",
        content: [documentBlock, { type: "text", text: instructionText }],
      },
    ],
  });

  const response = await stream.finalMessage();

  if (response.stop_reason === "max_tokens") {
    throw new Error(
      "The analysis was too long and got cut off. Please try again - if it keeps happening " +
        "on this document, it may need to be split into a shorter report.",
    );
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.Messages.TextBlock => block.type === "text",
  );

  if (!textBlock) {
    throw new Error("Model returned no text content");
  }

  const parsed = extractJson(textBlock.text);
  const result = AnalysisResultSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(`Model output did not match expected schema: ${result.error.message}`);
  }

  return result.data;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const objectText = extractFirstJsonObject(trimmed);
    if (objectText) {
      return JSON.parse(objectText);
    }
    throw new Error("Could not locate JSON in model response");
  }
}

/**
 * Finds the first top-level {...} object in text, correctly tracking string
 * state so braces inside string values (or trailing commentary after the
 * object) don't throw off the match - unlike a greedy regex.
 */
function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === "\\") {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}
