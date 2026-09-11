import Anthropic from "@anthropic-ai/sdk";
import { DIAGNOSTIC_FRAMEWORK } from "./framework";
import { AnalysisResultSchema, type AnalysisResult } from "./types";

const MODEL = "claude-opus-5";

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

You will be given:
1. A reference diagnostic framework (your source of judgment - channel-by-channel red flags, benchmark ranges, and standard questions).
2. An uploaded document (PDF or image) that is an agency's ad report or media plan.

Your job:
- Extract the channel mix, spend, targeting details, and reported KPIs/attribution claims from the document.
- Apply the diagnostic framework to those specific numbers - do not give generic advice. Reference the business's actual figures.
- Distinguish between a genuine red flag and a metric that's simply a known limitation of the buy type (see the framework's completeness checklist).
- Where the framework has no benchmark for a given channel (e.g. most CTV/DOOH/programmatic metrics), say so explicitly rather than inventing a number - use "no_benchmark_available" rather than fabricating a range.
- Be specific and grounded. Never invent numbers that are not in the document or the framework.
- Write in plain English a business owner with no ad-industry background can understand. Avoid jargon unless you define it inline.

Reference diagnostic framework:
<framework>
${DIAGNOSTIC_FRAMEWORK}
</framework>

Respond with ONLY a single JSON object - no markdown fences, no commentary before or after - matching exactly this shape:

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
  "benchmarkComparisons": [ { "metric": string, "reportedValue": string, "benchmarkRange": string, "assessment": "above" | "within" | "below" | "no_benchmark_available", "commentary": string } ],
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

  const instructionText = input.trade
    ? `The business owner identifies their trade as: ${input.trade}. Use this to select the most relevant benchmarks from the framework. Analyze the attached agency report/media plan now and return the JSON object described in your instructions.`
    : `Analyze the attached agency report/media plan now and return the JSON object described in your instructions.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [documentBlock, { type: "text", text: instructionText }],
      },
    ],
  });

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
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Could not locate JSON in model response");
  }
}
