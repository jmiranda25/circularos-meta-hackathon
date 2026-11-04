# New hackathon work — November 4, 2026

## Baseline verified

- Public GitHub repository `jmiranda25/circularos-meta-hackathon`, default `main`, initial commit `a3f5d3a`.
- Only README and MIT license existed; no application code.
- Issue #3, first Muse Spark request, was closed; Issue #1, credential setup, remained open.
- User confirmed the previously exposed key was revoked. Revocation itself was not independently audited.
- New key loaded from the user-designated local file without printing it or committing it. Hosted value configured as a secret.

## Implemented today

- React/TypeScript application with Next.js App Router conventions and Vinext/Cloudflare deployment.
- Photo resize/upload, real server-side Muse Spark inference with validated structured output.
- Human correction, per-object confirmation, manual additions/removals.
- Real SAM 3.1 object segmentation, official parser, box and mask overlay.
- Household/business context, declared receiving channels, reuse/compost availability.
- Deterministic versioned policy with rule IDs, evidence, reasons, pending checks and responsibility.
- Self-reported action tracking and JSON export; edits invalidate a plan.
- Explicit prepared example, no silent model fallback, no fabricated recycling or carbon outcomes.
- Architecture, README, agent guidance, CI and demo/submission preparation.

## Model evidence

Test image: a public photograph of plastic bottles from Northwestern Now, downloaded only for local testing, not committed or redistributed: https://news.northwestern.edu/stories/2022/04/metal-organic-framework-breaks-down-plastic-bottles

- New credential check: HTTP 200; 112 total tokens. Deliberately small output budget exhausted during reasoning, so no text response was produced.
- Real photo inference: `muse-spark-1.3`, request `chatcmpl-01a1a6c3-8e15-7379-844d-559cfdaa8a65`; 6 object proposals; 808 prompt + 798 completion = 1606 tokens; 11,680 ms.
- SAM real photo: `sam-3.1`, prompt `plastic bottle`; 28 boxes and 28 non-empty mask paths decoded successfully. A count of regions is not a validated object-count accuracy metric.

## Verification

- 18 tests passed (policy, durable quotas and mask placement), including incorrect/unknown input, human confirmation, safety precedence, contamination, missing channel, compost and business responsibility.
- Browser: prepared example → reviewed objects → business context → plan; expected RECYCLE-01, PREP-01 and SAFE-01 appeared. Traceability expanded and completion toggle updated 0/3 to 1/3.
- Production build succeeded. Final TypeScript check and production build passed. Sites versions 1–3 deployed successfully; version 3 contains corrected source-pixel mask placement, English grounding prompts and a CC0 live-test photo. Public access was enabled at the user’s request.
- Cursor Agent was invoked for read-only review, but authentication was absent. No Cursor review is claimed; Codex performed implementation and verification. Claude Code was not required.

## Outstanding delivery checks

Official submission portal was opened in authenticated Chrome. Startups Track and Build for Your World are selected; technical copy and user-supplied required opinions are populated. The final video URL and the user-reviewed promotional permission / final Submit action remain pending.

## Public demo hardening

Anonymous global D1 counters cap inference attempts at 6 per minute and 120 per UTC day, using atomic SQL updates. Missing quota storage fails closed. No user IP, photo or plan is stored in the quota table. Browser QA discovered zero matches for a Spanish SAM concept; Muse now supplies an English grounding phrase while the UI stays Spanish. Visual QA also found crop-local mask paths; source-pixel translation and scaling are now applied and regression-tested.

Demo: https://circularos-jmiranda-hackathon.adaptableeasel.chatgpt.site

PR: https://github.com/jmiranda25/circularos-meta-hackathon/pull/6
