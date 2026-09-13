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
- Why it's weak on its own: CTV ads are typically non-skippable, so 90%+ completion is the default outcome regardless of creative quality or targeting. A high number here reflects the ad format, not campaign effectiveness - it is the expected result, not an impressive one.
- Not a red flag on its own: for many CTV/programmatic buys, completion rate is genuinely the only metric the platform provides (see Section 2's completeness checklist) - an agency simply listing it as a line item, with no other channels or metrics available for that placement, is reporting what it has, not spinning. Never flag a report as a red flag merely because completion rate is present, is high, or is the only CTV metric shown.
- Red flag - only when the report's own language actively frames VTR as evidence the campaign is working (e.g. calling it out as a "win," using it to justify the spend or a renewal, or headlining it in a results/summary section) while omitting a metric that actually exists elsewhere for that same channel. The red flag is the misrepresentation, never the metric's mere presence.
- The exception in the other direction: a completion rate meaningfully below the healthy range in Section 3 (CTV/OTT under ~90%, Pre-Roll/OLV under ~50%) IS diagnostic on its own, unlike a high one - it points to creative/targeting mismatch or an unexpectedly skippable placement, and is worth a red flag or benchmark comparison even without any spin in the report's language.
- Ask (default to this instead of a red flag whenever VTR is simply the only CTV metric available and within the healthy range, which is the common case): "Beyond completion rate, what evidence do we have that this reached the right audience and drove a business outcome?"

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

### Search Clicks vs. Calls - don't assume a shared funnel
- What it measures: many search reports show both a "Clicks" KPI and a "Calls" KPI for the same channel, which invites dividing one by the other - but they are only the same funnel when the call actually happened *because of* a site visit from that click.
- Why the connection is often wrong: search ads commonly offer a call button or phone number directly in the ad itself (call extensions, call-only ads, a tap-to-call icon in mobile search results). A call placed this way never lands on the website and is not counted among the report's "Clicks" - it is a parallel conversion path, not a downstream step of it. Dividing that channel's calls by its clicks in this case produces a number that looks like a landing-page conversion rate but isn't measuring the landing page at all.
- How to tell which case you're in: look for the report's own language describing how the call happened (e.g. "call extension," "click-to-call," "tap-to-call," "call-only ad") versus language indicating the call was logged from a landing-page visit (e.g. a call-tracking number displayed only on that page). If the document doesn't say, don't default to assuming a shared funnel - say so explicitly rather than presenting a computed rate as settled fact.
- Also keep in mind even when the lineage is a landing-page call: the reported calls figure only counts what the report's own tracking captured. A phone number listed elsewhere on the site (or found via search, review sites, etc.) can generate real calls that never show up in this number - so a low reported call count is a tracking-coverage question worth asking, not proof the phone isn't ringing.
- Ask (whenever a channel shows both clicks and calls without a stated connection between them): "Is [the call count] tracked from landing-page visits, or does it include calls from a click-to-call button/extension in the ad itself? And is every call to our business line - not just ones through this report's tracking - being counted anywhere?"

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

## Section 3: Home Services Benchmark Reference
Use the table for the business's stated trade. If the trade is unstated or doesn't match Plumbing/Roofing/HVAC/Siding & Window Replacement, fall back to the broadest range across all four rather than picking one trade's numbers arbitrarily, and note in the commentary that the benchmark is a general home-services approximation, not trade-specific.

### Plumbing
| Metric | Benchmark |
|---|---|
| Search Cost Per Lead (CPL) | $120-$170+ (non-branded PPC); LSA averages $45-$85 |
| Search Click-Through Rate (CTR) | 4.97%-5.50% |
| Search Click-to-Call Conversion Rate | 7.63%-15.00% |
| Search Cost Per Click (CPC) | ~$10.49 national average (spikes for emergency/water-heater terms) |
| CTV/OTT Completion Rate | 90.00%-97.00% |
| Pre-Roll/OLV Completion Rate | 50.00%-70.00% |

### Roofing
| Metric | Benchmark |
|---|---|
| Search Cost Per Lead (CPL) | $100-$228 (Google Search PPC); LSA averages $75-$150 |
| Search Click-Through Rate (CTR) | 3.00%-5.00% |
| Search Click-to-Call Conversion Rate | 3.70%-11.00% (dedicated landing pages hit 8%-15%) |
| Search Cost Per Click (CPC) | $6.00-$15.00 national average (storm/emergency terms can hit $25-$35+) |
| CTV/OTT Completion Rate | 90.00%-98.00% |
| Pre-Roll/OLV Completion Rate | 50.00%-70.00% |

### HVAC
| Metric | Benchmark |
|---|---|
| Search Cost Per Lead (CPL) | $45-$149 (Search PPC); LSA averages $42-$55 |
| Search Click-Through Rate (CTR) | 3.00%-6.00% (up to 6.5%-12% for emergency AC repair terms) |
| Search Click-to-Call Conversion Rate | 6.50%-12.00% (emergency repair terms range 10%-25%) - HVAC holds the highest overall conversion rate of any home trade, so a low number here is a stronger signal than it would be for another trade |
| Search Cost Per Click (CPC) | $8.00-$15.00 standard average (spikes to $20-$32+ in peak heating/cooling seasons) |
| CTV/OTT Completion Rate | 90.00%-97.00% |
| Pre-Roll/OLV Completion Rate | 50.00%-70.00% |

### Siding & Window Replacement
| Metric | Benchmark |
|---|---|
| Search Cost Per Lead (CPL) | $150-$200+ (Google Search PPC); windows average ~$200, siding ~$160-$210 |
| Search Click-Through Rate (CTR) | 3.50%-5.50% |
| Search Click-to-Call Conversion Rate | 3.00%-6.00% (dedicated quote/estimate landing pages hit 6%-10%) |
| Search Cost Per Click (CPC) | $8.00-$16.00 national average |
| CTV/OTT Completion Rate | 90.00%-98.00% |
| Pre-Roll/OLV Completion Rate | 50.00%-70.00% |

Additional cross-trade figures:
- Average home services ticket size: $9,500-$18,000 (varies by trade).
- Healthy HVAC ROAS: 4x+ (median ~4.37x); below ~2.77x is bottom-quartile.

**How to use the click-to-call conversion rate:** this benchmark specifically measures the landing-page step - a person who clicked the search ad, reached the website, and called from there. Before comparing a report's numbers to this benchmark, apply the "Search Clicks vs. Calls" check from Section 1: only compute and present this rate when the document indicates the calls are actually attributed to landing-page visits, not to a call extension/call-only ad button that bypasses the site. When that lineage does hold, this is a genuinely powerful diagnostic most reports never surface on their own, because it isolates the landing-page/call-routing step from the ad-targeting step. A CTR at or above benchmark combined with a click-to-call rate well below benchmark (e.g. reported data showing 10%+ CTR against a 4-6% benchmark, but under 2% click-to-call against a 7-15% benchmark) is a strong, specific signal: the ads are earning clicks fine, but something between the click and the phone ringing is broken - almost always the landing page, the click-to-call setup, or a landing page that doesn't match the ad's promise. Flag this pattern by name when you see it, and always pair it with the landing-page friction question from Section 4. When the lineage is unclear or the calls are attributed to an ad-level call button instead, do not compute this rate against site clicks - use "insufficient_data" for the benchmark comparison, say plainly why, and ask the agency to clarify how the calls are tracked.

**How to use the completion-rate ranges:** Section 1 already covers why a high completion rate is the expected outcome for non-skippable CTV, not proof of a strong campaign - these ranges add the other direction. A completion rate meaningfully BELOW its benchmark (especially Pre-Roll/OLV under ~50%) is a real signal worth flagging: high skip/drop-off, a creative or targeting mismatch, or a skippable placement running where non-skippable was expected - unlike a high completion rate, a genuinely low one is diagnostic on its own, not something that needs to be "spun" to become a concern.

**Coverage caveat:** these ranges cover Search (SEM/LSA) efficiency and video completion rates. No comparable public benchmark culture exists yet for CTV/DOOH/streaming spend levels themselves (cost per impression, etc.) or for Performance Max as its own line item - when a report's numbers fall outside a covered range, say so explicitly; when the metric or buy type isn't covered here at all, say that too rather than forcing a comparison that doesn't exist.

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
These are illustrative categories and phrasing to draw from, not a fixed script - never output these verbatim or unchanged. Every question you actually ask must be rewritten against the specific report in front of you: name the metric, channel, or number that's actually missing, off, or unclear in this document.

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
