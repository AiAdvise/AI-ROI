# Media Plan Diagnostic

A business owner uploads their advertising agency's ad report or media plan (PDF or image). The app extracts the channel mix, spend, and KPIs, analyzes it against a reference diagnostic framework, and returns:

1. A plain-English summary
2. Specific red flags with reasoning
3. Benchmark comparisons
4. A list of questions to ask the agency

This is the MVP flow: upload -> analyze -> results. No accounts yet.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- `@anthropic-ai/sdk` calling the Claude API (`claude-opus-5`), which reads the uploaded PDF/image natively alongside the diagnostic framework as context

## Getting started

```bash
npm install
cp .env.example .env
# add your ANTHROPIC_API_KEY to .env
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/
  page.tsx              # upload -> results single-page flow
  api/analyze/route.ts  # backend route: file -> Claude API -> structured JSON
components/
  UploadForm.tsx         # drag-and-drop upload UI
  ResultsView.tsx         # renders the structured diagnosis
lib/
  framework.ts            # the diagnostic framework (the product's core IP)
  anthropic.ts             # Claude API call, prompt, JSON parsing
  types.ts                  # zod schema for the analysis result
```

## Updating the diagnostic framework

`lib/framework.ts` holds the reference framework the model reasons from - channel-by-channel red flags, benchmark ranges, report-completeness expectations, and standard questions. This is the product's actual IP; keep it current as pilot diagnostics surface new patterns.

## Notes

- Accepted uploads: PDF, PNG, JPEG, WEBP, up to 20MB.
- The model is instructed to flag when no benchmark exists for a metric (common for CTV/DOOH/programmatic) rather than inventing one.
- No database yet - each request is stateless; results are not persisted.
