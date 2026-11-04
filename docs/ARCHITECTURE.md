# CircularOS MVP architecture — November 4, 2026

## Scope

One complete session, from photo to reviewed action plan. Household and business share the same policy; business adds an accountable role and a request to record delivery. No speculative industrial product or city-specific acceptance claims.

```text
Photo (browser, resized, session memory)
  → POST /api/perceive → Muse Spark 1.3 → validated object hypotheses
  → human edits / adds / confirms materials and condition
  → optional SAM 3.1 per-object request → official parser → mask + box overlay
  → declared context and receiving channels
  → POST /api/plan → schema validation → deterministic decision engine
  → versioned reasons + pending checks + actions → JSON export
```

## Components

| Layer | Implementation | Responsibility |
|---|---|---|
| Interface | React client in `app/page.tsx` | Upload, edit, confirm, context, plan, export |
| Contract | Zod in `lib/circular/domain.ts` | Bounded objects, enumerated materials/conditions, valid context |
| Perception | Server-only `lib/circular/perception.ts` | Fixed Meta endpoint, Muse Spark structured JSON, SAM stream/parser |
| API | `app/api/perceive`, `app/api/plan` | Input validation, errors, no-store responses |
| Policy | Pure `decide()` | Same input and rule version → same recommendation |
| Hosting | Vinext + Sites + Cloudflare Workers | Server secret binding, private initial audience |

## Decision precedence

| Rule | Trigger | Result |
|---|---|---|
| SAFE-01 | Hazardous or electronic | Specialized handling; never common recycling |
| VERIFY-01 | Unknown material or no human review | Request confirmation |
| VERIFY-02 | Unknown condition | Request condition review |
| REUSE-01 | Reusable and reuse available | Keep in use first |
| BIO-01/02 | Organic, with/without compost | Conditional compost acceptance / seek organics channel |
| CHANNEL-01 | No declared receiving channel | Confirm a channel before delivery |
| PREP-01 | Dirty packaging with channel | Preparation and acceptance review |
| RECYCLE-01 | Reviewed, suitable state, declared channel | Separate; verify operator acceptance before handoff |

Model confidence is uncalibrated and cannot establish material composition. Human review is mandatory for ordinary ready-to-act paths. Safety routing takes precedence even before confirmation. No numeric confidence is represented as a scientific accuracy claim.

## Traceability

Exports include original model proposals and request metadata when live perception was used, final corrected items, context, rule version, decision IDs/reasons/steps, generated timestamp and self-reported completed actions. No photo or credentials are exported. New edits invalidate the old plan; the user regenerates it. The MVP has no permanent edit-history database.

## Security and limitations

Meta credentials never enter the client bundle. Fixed upstream API origin prevents credential forwarding to arbitrary hosts. Photo inputs are inline images, not arbitrary URLs. Requests are bounded and provider timeouts have no retries. Errors do not forward provider bodies. No silent fixture fallback. Secrets are ignored by Git and stored as hosted runtime secrets. Initial hosted access is private; before a public live endpoint, add durable per-user quotas/rate limiting. A private prototype is not a production multi-tenant platform.

## Delivery order

1. Reproducible policy and manual/sample full flow.
2. Real Muse Spark call and human correction.
3. SAM image grounding and visible overlay.
4. Browser QA, policy tests, typecheck, production build.
5. GitHub branch and PR; deployed demo; README and evidence.
6. Three-minute recording, judge access check, final submission.
