/**
 * Diagnostic Framework v0.1 - the reference knowledge base the model reasons
 * from when analyzing an uploaded media plan / ad report. Keep this in sync
 * with the source framework document; expand it as pilot diagnostics surface
 * new recurring patterns.
 */
export const DIAGNOSTIC_FRAMEWORK = `
# Diagnostic Framework v0.1 - Media Plan / Ad Report Analysis

## How to use this
For each metric or claim in a client's report, evaluate three things:
1. What the number actually means (plain language)
2. Whether it is a strong or weak signal, and why
3. What the business owner should ask if the metric is present, absent, or looks off

## Section 1: Metric-by-Metric Reality Checks

### View-Through Rate (VTR) / Completion Rate
- What it measures: % of viewers who watched a CTV ad to completion.
- Why it's weak on its own: CTV ads are typically non-skippable, so 90%+ completion is the default outcome regardless of creative quality or targeting. High VTR reflects ad format, not campaign effectiveness.
- Red flag: an agency presenting VTR as a primary success metric, especially without other context.
- Ask: "Beyond completion rate, what evidence do we have that this reached the right audience and drove a business outcome?"

### Household Visits / IP-Based Post-View Attribution
- What it measures: a site visit matched back to a household believed to have seen a CTV ad, typically via IP-to-impression matching.
- Why it's weaker than it sounds: independent research (Truthset/CIMM) found raw IP-to-household/postal matching is accurate only 13-16% of the time, with different data providers agreeing with each other only ~7% of the time. IP addresses are shared (apartments, offices, coffee shops) and rotate; if a viewer converts days later their IP may already have changed, breaking the chain.
- Nuance: more sophisticated vendors combine IP with device-graph identity resolution and do meaningfully better than raw IP matching. Usefulness depends entirely on the underlying method.
- Ask: "Is 'household visits' based on raw IP matching or an enhanced identity graph? What's the lookback window? Can you share a match-rate/confidence score, or is this a hard count?"

### DOOH Foot Traffic / Location-Based Attribution
- What it measures: whether someone exposed to a digital out-of-home ad later visited a physical location, usually inferred from mobile location data comparing an "exposed" group to a matched "control" group.
- Why it needs scrutiny: many DOOH impression counts are modeled/estimated, not directly measured, especially for non-programmatic buys. Lift rates under ~3% are often just noise; lift rates above ~30% should prompt scrutiny of whether the control group was matched properly rather than celebration.
- Red flag: a lift number with no description of exposure windows, dwell-time thresholds, or control-group selection.
- Ask: "How was the control group selected? What exposure window and dwell threshold did you use? Is this impression count directly measured or modeled?"

### Frequency (often missing entirely)
- What it measures: how many times the same household/device saw the ad within the campaign period.
- Why its absence matters: without frequency data there's no way to know if budget is being wasted oversaturating a small audience vs. reaching a broad one. Total impressions alone can hide a campaign that hit the same 500 households 40 times each.
- Red flag: no frequency data at all, especially on a campaign running more than a few weeks.
- Ask: "What's our average frequency, and is it in a healthy range for this type of campaign?"

### Amazon DSP - a genuine bright spot
- What it offers: closed-loop attribution - Amazon DSP can natively attribute ad exposure to actual purchases made on Amazon, a rare case of precise first-party attribution without the identity-resolution problems above.
- The gap: most business owners don't know this reporting exists or how to ask for it.
- Ask: "If we're running on Amazon DSP, can you show us the native purchase-attribution report, not just impressions and clicks?"

## Section 2: Report Completeness Checklist, By Buy Type
Not every gap is a red flag - some reflect genuine limitations of the inventory purchased.

| Buy Type | Should Include | Often Missing (ask for it) | Genuinely Limited (don't expect it) |
|---|---|---|---|
| Self-serve DSP / programmatic | Impressions, VTR, frequency, geo delivery, pacing vs. budget | Household visits methodology, viewability, brand-safety report | True 1:1 individual-level attribution |
| Direct publisher deal (e.g. Hulu, YouTube TV direct) | Impressions, completion rate, delivery by placement | Frequency, audience composition | Cross-platform household matching (walled garden) |
| Traditional broadcast/cable insertion order | As-run log (exact air times/dates), gross rating points | Nothing - genuinely limited channel by design | Any individual-level digital attribution |
| Programmatic DOOH | Proof-of-play logs, modeled or measured impressions | Foot-traffic lift methodology, control group description | Individual-level identity (inherently a shared/public medium) |

## Section 3: Home Services Benchmark Reference (directional - expand from real pilot data)
- HVAC search ad CPL: ~$45; Plumbing: ~$52; Roofing: ~$79 (LocaliQ 2025 benchmark)
- Home & Home Improvement average CPL across platforms: ~$91
- Healthy HVAC ROAS: 4x+ (median ~4.37x); below ~2.77x is bottom-quartile
- Average home services ticket size: $9,500-$18,000 (varies by trade)
- Note: these benchmarks are almost entirely search/PPC-derived. No equivalent public benchmark culture exists yet for CTV/DOOH/streaming spend in this vertical. When a report's numbers fall outside these ranges, or when the buy is CTV/DOOH/programmatic (where no public benchmark exists), say so explicitly rather than forcing a comparison - flag it as a directional judgment call, not a hard benchmark violation.

## Section 4: Full-Funnel Coverage Model (Home Services)
A healthy home services media mix covers three funnel stages. Each stage has a different job and should be judged by different metrics - judging an upper-funnel tactic by lower-funnel metrics (or vice versa) is itself a common analysis mistake.

- **Upper funnel (branding/awareness):** CTV, YouTube, Social (awareness placements). Job: reach and frequency with the target audience, build brand recall. Right metrics: reach, frequency, completion rate. Wrong metrics to judge it by: clicks, calls, form fills - these tactics aren't built to drive immediate direct response, and expecting them to is a mismatch, not necessarily a sign the campaign is failing.
- **Mid funnel (consideration):** Social engagement, display retargeting. Job: keep the brand present for people who've shown some interest, nurture them toward action. Right metrics: engagement rate, retargeting reach/frequency, site revisits.
- **Lower funnel (conversion/CTA):** SEM (Search), Performance Max (PMax), Local Services Ads (LSA), direct-response Social, direct-response Display/retargeting. Job: capture people who are ready to buy right now and convert them into a call or form fill. Right metrics: calls, form fills, cost-per-lead - these are the tactics that should be held against the CPL benchmarks in Section 3.

**Diagnostic logic:**
- Classify every channel found in the report into upper/mid/lower funnel (or note if a channel's role is ambiguous from the report alone).
- If the report's spend is concentrated in upper/mid-funnel tactics with little or no lower-funnel presence, and conversions (calls, form fills) are weak or absent, do not conclude the campaign has "no lower-funnel coverage" - the report you're looking at may only be part of the business's full marketing picture. Instead, flag the pattern and ask directly: "Are you running Search (SEM), Performance Max (PMax), or Local Services Ads (LSA) - through this agency or elsewhere - that isn't shown in this report? Those are typically the tactics responsible for actual calls and form fills, and their absence would explain weak direct-response numbers here." Always include a version of this question whenever the report itself shows an upper/mid-funnel-heavy mix without a visible lower-funnel component.
- Separately, whenever the report DOES show real lower-funnel spend or activity (SEM, LSA, PMax, direct-response social/display) but conversions are still weak, ask about the landing experience rather than assuming the targeting is at fault: "Does your website make it fast and easy to call or fill out a form in one or two steps from this ad? A high-friction landing page or contact process can suppress conversions even when lower-funnel targeting itself is working correctly." This is a real, common failure point that has nothing to do with media buying and everything to do with the site the ads point to - don't let it get attributed to the wrong cause.

## Section 5: Master "Questions to Ask Your Agency" List
Measurement & Attribution:
- How exactly is [metric] measured, and what's the underlying methodology?
- What's the match rate or confidence level behind this number?
- Is this figure directly measured or modeled/estimated?

Delivery & Efficiency:
- What's our average frequency, and is it healthy for this campaign type?
- How does our spend compare to typical benchmarks for our trade and channel?
- Are we seeing diminishing returns in any specific channel or placement?

Strategy & Fit:
- Why this channel mix specifically, for this budget and this goal?
- What would you change if the budget were doubled? Halved?
- What's not working, and what have you already adjusted because of it?

## Section 6: Glossary (plain language)
- VTR (View-Through Rate): % of viewers who watched an ad to completion.
- Household Visits: a website visit believed to be linked to a household that saw a CTV ad, usually via IP matching.
- Frequency: average number of times the same viewer/household saw an ad.
- Programmatic: automated, real-time buying of ad inventory across platforms.
- DOOH: Digital Out-of-Home - digital screens in public places (billboards, transit, retail).
- Closed-loop attribution: when the same platform that shows the ad also tracks the purchase (e.g. Amazon DSP), removing most identity-matching uncertainty.
- Walled garden: a platform (e.g. certain streaming services) that restricts what performance data it shares externally.
- Funnel (upper/mid/lower): shorthand for how close a tactic is to driving an immediate action. Upper-funnel (CTV, YouTube, awareness Social) builds awareness; mid-funnel (Social engagement, retargeting) keeps a brand present; lower-funnel (SEM, PMax, LSA, direct-response Social/Display) is built to convert someone into a call or lead right now.
- LSA (Local Services Ads): Google's pay-per-lead ad product built specifically for local service businesses (plumbers, electricians, HVAC, etc.) - appears above regular search results, often billed per qualified lead rather than per click.
- PMax (Performance Max): a Google Ads campaign type that automatically places ads across Search, YouTube, Display, Maps, and Gmail from a single campaign, optimizing toward a stated goal (e.g. leads or calls).
`.trim();
