# CircularOS technical handoff

Prepared November 4, 2026. Language: English. This document is intended to let another coding agent understand, run, modify and verify the backend and its product boundaries without reading the full chat.

## 1. Repository, local checkout and delivery status

- Public repository: https://github.com/jmiranda25/circularos-meta-hackathon
- Local checkout: `/Users/jhonmiranda/Documents/Codex/2026-11-04/referenced-chatgpt-conversation-this-is-an/circularos`
- Application root: `circularos/app/`, not the repository root.
- Current extension branch: `feat/accessible-community-pilot`. Inspect `git status` and `git log` before starting; do not assume all work is already merged.
- Hosted app: https://circularos-jmiranda-hackathon.adaptableeasel.chatgpt.site
- Sites project: `appgprj_6aeb2e1bde408191bd4ab8cab47c9fd4`. Identity is tracked in `app/.openai/hosting.json`; preserve it.
- The original MVP was merged through PR #6. This extension adds English UI/model output, camera, accessible review, voice, and a Lince community-pilot proposal.
- Hackathon form: https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/submit
- The user explicitly requested **no submission yet**. Do not click Submit, accept promotional permissions, or silently replace the form's current video link. The existing Chrome draft is prepared for Startups Track / Build for Your World.
- Target deadline supplied and checked against the event: November 4, 2026 at 9 p.m. Lima (UTC−5).

Read repository `AGENTS.md` first. No keys, credentials, user photographs or production secret values belong in source or this document.

## 2. Product definition and scope

CircularOS converts a photo into reviewed objects, user-declared context and a traceable circular action plan. It is not just a classifier: correcting a material, changing its condition, or removing a receiving channel changes the policy result. Human correction is a first-class input, not an override hidden from the audit export.

Two product offers are proposed:

1. **Community, free:** individuals including older adults; accessible guidance, assisted-delivery preferences and partner-agreed compensation.
2. **Business, paid concept:** accountability, material handling and delivery records for operators/companies. No billing or subscription system is implemented.

The first territory is **Lince, Lima, Peru**. Expansion to metropolitan Lima is a future milestone. No CircularOS receiving/paying partners, tariffs, safe routes, pickup capacity or cash offers have been verified. Municipal references establish past/announced programmes only.

Target journey: Identify → review → prepare → choose a receiving point → deliver and weigh → partner verifies receipt → record compensation.

**Implemented operationally:** perception, review, context, versioned policy, plan/action export; request-only camera; fixed voice guidance and bounded command integration; optional browser geolocation and external area map; downloadable non-binding delivery draft.

**Proposed, not operational:** actual partner onboarding, verified destination matching, authenticated receiving staff, measured delivery receipts, payments, redeemable balances, pickup booking and enterprise billing. Do not turn a prototype status into a claim that these work.

## 3. Runtime architecture

```text
React browser application
  photo upload/capture -> resized inline JPEG (max dimension 1600 px)
  POST /api/perceive -> Muse Spark -> Zod-validated proposals
  human review -> corrected Item[] in browser memory
  optional POST /api/perceive mode=segment -> SAM -> parser -> SVG geometry
  user Context -> POST /api/plan -> pure deterministic policy
  plan + original proposals + model metadata -> JSON download

Fixed guide inputs -> POST /api/voice -> ElevenLabs -> MP3
Browser speech recognition -> exact command parser -> bounded UI actions

Community preferences -> schema-validated client-side handoff JSON
Optional geolocation -> browser memory -> Google Maps only when map link clicked

Cloudflare D1: anonymous global inference/voice quota counters only
```

Stack: React 19, TypeScript, Zod, Next.js App Router conventions, Vinext, Vite, Cloudflare Workers, D1/Drizzle. The hosting Vite integration and Worker entrypoint are inherited from the supported Sites starter. Preserve `sites()` in `vite.config.ts` and request-scoped connector handling in `worker/index.ts`; this app does not currently invoke workspace connectors.

## 4. Source map

| File relative to application root | Purpose |
|---|---|
| `app/page.tsx` | Session state, upload, review, context, plan, provenance export and integration of the new UI components |
| `app/layout.tsx` | English document language, metadata, global and pilot styles |
| `app/globals.css`, `app/pilot.css` | Main responsive visual design and accessible/community additions |
| `lib/circular/domain.ts` | Item/Context Zod schemas, material labels, deterministic rules, prepared fixtures, plan factory |
| `lib/circular/perception.ts` | Server-only Muse and SAM calls; validation and geometry conversion |
| `lib/circular/geometry.ts` | Mask-local → source-image SVG transform |
| `lib/circular/quota.ts` | Atomic durable counter reservation; separate Meta and voice namespaces |
| `lib/circular/guidance.ts` | Fixed bilingual guide text, bounded request schema and exact voice-command parser |
| `lib/circular/community.ts` | Public programme references, non-binding draft schema, future settlement-eligibility policy utility |
| `app/api/perceive/route.ts` | Photo/segmentation request validation, secret lookup, quota, sanitized errors |
| `app/api/plan/route.ts` | Plan input validation and deterministic output |
| `app/api/voice/route.ts` | Fixed-guide TTS, secret-selected voice, voice quota, no arbitrary TTS input |
| `components/camera-capture.tsx` | Camera dialog, stream lifecycle, still capture and device-camera file fallback |
| `components/voice-guide.tsx` | User-initiated TTS playback, stop/repeat, bounded audio cache and browser speech commands |
| `components/community-pilot.tsx` | Lince area, public references, geolocation and handoff preferences |
| `db/schema.ts` | `inference_quota` table |
| `drizzle/0000_nappy_patriot.sql` | Initial quota-table migration; applied migrations are immutable |
| `tests/*.test.ts` | Policy, geometry, quota, commands and compensation-boundary tests |
| `public/demo-bottle.jpg` | CC0 live-testing photo, not a cached model answer |
| `public/circularos-demo.mp4`, `public/demo.html` | Published video and player page; verify which video version is current before using it |

## 5. Data contracts

`Item`:

```ts
{
 id: string; name: string;
 material: 'plastic'|'paper'|'glass'|'metal'|'organic'|'electronic'|'hazardous'|'unknown';
 confidence: number; // [0,1], uncalibrated model estimate, never scientific accuracy
 evidence: string;
 condition: 'clean'|'dirty'|'reusable'|'unknown';
 confirmed: boolean; // defaults false; model cannot confirm its own proposal
 groundingPrompt?: string; // short English concept for SAM
}
```

`Context`:

```ts
{
 setting: 'home'|'business'; city: string;
 collection: Material[]; // USER-DECLARED acceptance, not municipality-verified
 compost: boolean; reuse: boolean;
}
```

`Decision`: `itemId`, `name`, `action`, `rule`, `reason`, `steps[]`, `status: ready|review`, `owner`.

`makePlan()` returns an ID, timestamp, rule version, unchanged validated inputs, decisions and a policy disclaimer. Decision contents are deterministic for the same inputs and version; plan UUID/time are intentionally different. The latest English policy version is `circularos-general-2026-11-04.2`.

The client export adds original perception metadata, original proposals, a compact SAM summary, source (`prepared-example`, `meta-live`, `manual`) and self-reported completion IDs. Photos and credentials are excluded. Corrected inputs must remain distinct from the original model evidence.

## 6. Backend API contracts

### POST `/api/perceive`

Input: `{ image: dataURL, mode?: 'segment', label?: string }`.

Only inline JPG/PNG/WebP base64 inputs are accepted. Server request limit: approximately 6 MB. Browser file limit: 10 MB before resize. Client captures are JPEG. Arbitrary remote URLs are not accepted, so credentials cannot be forwarded through a user-selected provider URL. One photo is sent only when Analyze/Locate is explicitly requested.

Normal output: `{ items, model, requestId, usage, latencyMs }`. All returned `confirmed` values are false. Duplicate model object IDs are rejected. Empty/no-object responses and truncated output are rejected; no prepared fixtures replace provider failures.

Segment output: `{ model: 'sam-3.1', boxes, masks: [{objectId,path,transform}] }`. Zero matches is valid and the UI states that nothing matched.

Typical statuses: 400 invalid input; 403 origin mismatch; 413 oversized body; 503 missing provider key or unavailable quota store; 429 local quota; 502 provider/incomplete/validation failure. Provider bodies and credentials are never forwarded to clients. The plan route also bounds its body after reading it; body limits currently are application-level checks, not a streaming upload parser.

### POST `/api/plan`

Input: `{ items: Item[1..12], context: Context }`. Rejects empty input, invalid enums/ranges and duplicate IDs. Output: `makePlan()` result. No provider call and no monetary values. `Cache-Control: no-store`.

### POST `/api/voice`

Input: `{ step: 1|2|3|4, language: 'en'|'es', objectCount: 0..12, reviewCount: 0..12 }`. Request text is bounded to 2,000 characters. The server generates a fixed guide from these structured values; arbitrary client text, voice IDs and provider URLs are not accepted.

Output: `audio/mpeg`. Model: `eleven_multilingual_v2`. Output format: `mp3_44100_128`. Voice ID is selected from server environment, with optional Spanish-specific voice. Selected English voice: Harper Lawson (`c1uwEpPUcC16tq1udqxk`), chosen by the user after two generated previews. Spanish guide uses Alisson (`SmgKjOvC1aIujLWcMzqq`); this is a configured pilot voice, not a claim of a Peruvian accent. Current style settings: stability .55, similarity .75, style .15, speaker boost true, speed .95. Review available account/model capabilities before changing these parameters.

No API key means an explicit 503 and written guidance remains visible. There is **no silent fallback to an OS/robotic voice**. The browser only plays after a user action; if autoplay restrictions block the asynchronous result, native Play controls remain available. Stop cancels pending requests and playback. Audio is cached in browser memory in a bounded 12-entry map to avoid regenerating repeats.

## 7. Meta integrations and geometry pitfalls

Muse: fixed base URL `https://api.meta.ai/v1`; `muse-spark-1.3`; Chat Completions with JSON output, reasoning effort low, 5,000 completion-token cap, 55-second timeout, no SDK retries. Prompt treats image text as untrusted content, requests English labels/evidence, and an English noun phrase for SAM. Never infer resin composition, local acceptance or weight from appearance.

SAM: Responses API, `sam-3.1`, streamed events, `metadata.mask_encoding = one_bit`. `@meta-sam/parser` consumes the stream once. Reject incomplete streams. English concepts are important: an earlier Spanish prompt produced no matches on a bottle photo; the English phrase succeeded.

**Critical geometry regression:** `decodeMaskToSVGPath(record.mask)` yields coordinates in the mask raster, not the full source image. The record's half-open `bounds` give placement in source pixels. Use:

```text
translate(bounds.left, bounds.top)
scale((bounds.right-bounds.left)/mask.width,
      (bounds.bottom-bounds.top)/mask.height)
```

The UI SVG `viewBox` must match the actual resized photo's dimensions. Applying only the path produced a visually wrong mask in the top-left corner while boxes were correct. Regression tests now cover translation, scaling and invalid dimensions.

## 8. Decision-rule precedence

| Order / rule | Trigger | Outcome |
|---|---|---|
| SAFE-01 | Hazardous/electronic | Specialized handling, even before human confirmation |
| VERIFY-01 | Unknown material or unreviewed item | Request human review |
| VERIFY-02 | Unknown condition | Request condition |
| REUSE-01 | Reusable and reuse access declared | Reuse/donate first |
| BIO-01/02 | Organic, compost available/unavailable | Conditional compost acceptance or find organics channel |
| CHANNEL-01 | No declared receiving channel | Check destination before delivery |
| PREP-01 | Dirty object with declared channel | Preparation and acceptance check |
| RECYCLE-01 | Reviewed material/condition plus channel | Separate and verify operator acceptance/hours |

Business output assigns `Waste coordinator` and requests a quantity/delivery record for the ordinary delivery path. Household output assigns `Household member`. Neither role is an authenticated account. A self-reported completion checkbox is not an actual verified recycling outcome.

## 9. D1 quotas, secrets and privacy

Only table: `inference_quota(bucket TEXT PRIMARY KEY, count INTEGER NOT NULL)`.

Atomic SQL:

```sql
INSERT INTO inference_quota (bucket,count) VALUES (?,1)
ON CONFLICT(bucket) DO UPDATE SET count=count+1
WHERE count < ? RETURNING count;
```

Two reservations: minute bucket then UTC-day bucket. A rejected daily attempt may consume a minute slot, but cannot exceed the daily reservation count. Provider failures still consume reservations. Meta: 6 attempts/minute, 120/day. Voice: namespace `voice`, 6/minute, 80/day. Meta uses namespace `meta`. Counters survive Worker restarts; missing/unavailable D1 fails closed before provider calls. This is a global demo budget cap, not a per-user production anti-abuse system. A malicious visitor can exhaust shared availability. Add durable user quotas/authentication before scaling.

Environment names only:

- `MODEL_API_KEY`: Meta credential, server-only.
- `ELEVENLABS_API_KEY`: server-only ElevenLabs credential.
- `ELEVENLABS_VOICE_ID`: English voice selection.
- `ELEVENLABS_VOICE_ID_ES`: optional Spanish voice selection.
- `DB`: D1 binding from the hosting manifest, not a key.

The user confirmed revocation of an earlier exposed Meta key. New Meta and ElevenLabs credentials were tested without printing or committing them. Revocation itself was not independently audited. Do not read Desktop credential files merely to understand this project. Configure hosted secrets through Sites tools; do not store secret values in hosting.json, documentation, client code or tool arguments embedded in shell strings.

Photos/plans are in browser session memory, not persisted by CircularOS. Meta receives photos on explicit analysis/segmentation. ElevenLabs receives fixed guide text and counts, not the photo or arbitrary item labels. Browser speech recognition may use a remote browser-vendor service; the UI discloses this and never starts listening automatically. Geolocation stays in memory; following the explicit external map link shares the selected coordinates with Google Maps.

## 10. Camera and voice-command lifecycle

Camera requests video only, with an ideal rear-facing camera. A native modal is opened from a user action. Capture produces a still; it does **not** analyze or upload it. The original upload pipeline handles resizing/review. Closing/unmounting stops every media track; if permission resolves after close, the newly resolved stream is stopped immediately. The device-camera file input is a fallback. Actual browser/OS media permission UI may be localized independently of the English app.

Speech recognition is feature-detected (`SpeechRecognition`/`webkitSpeechRecognition`), single-command, no interim results, 12-second timeout. Commands are exact normalized phrases: next/continue, back/go back, repeat, stop/pause, analyze/analyze photo, camera/open camera, plus bounded Spanish equivalents. No arbitrary natural-language agent. Phrases like “confirm all objects”, “pay me”, or “do not go next” are rejected. Commands cannot verify materials, create partner receipts or transfer money.

`Next` in guided review advances through objects before context. At the first step, it does not silently submit a photo; Analyze is a separate command. `Next` at context invokes the same validated plan-generation operation as its button. Buttons remain usable if microphone/recognition is unsupported or denied. Real hardware/browser compatibility must be tested independently; a passing parser test does not prove microphone capture works on every device.

## 11. Community draft and compensation boundaries

The handoff draft accepts ordinary plastic/paper/glass/metal, assisted/self/pickup preference, cash/goods preference, and optional positive estimated kg. It excludes hazardous/electronic materials. `createHandoff()` always returns `partner_required` with null verified weight, receipt and monetary amount. It is created/downloaded locally, not stored, booked or sent to a partner.

`compensationStatus()` is a **pure future-policy utility**, not an exposed verification endpoint or payment implementation. It checks verified partner, verified delivery, positive measured weight, receipt and agreed positive rate before reporting eligibility for partner settlement. Even eligible output does not mean money was paid. Unauthenticated browser booleans must never be trusted as real receipt verification.

Next production phase requires partner registry and agreements, authenticated operator roles, server-verified receipt creation, measured kg, agreed tariff/version, duplicate prevention, audit events and a distinction between approved compensation and actual settlement. Food/product canjes need stock, value, terms and redemption responsibility. Do not introduce transferable credits or a wallet without defining those obligations.

## 12. Local development and verification

From application root, Node 22.13+:

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
```

Local server secrets can use an ignored `.dev.vars` file; never commit it. After a fresh local build/database, apply each pending migration once:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nappy_patriot.sql
npm run dev -- --host 127.0.0.1
```

Local URL normally http://127.0.0.1:5173. Without secrets or a migrated D1, live routes explicitly fail; prepared/manual workflows still work. Never remove quota enforcement just to make preview inference succeed.

Tests cover deterministic policy changes, unsafe/invalid input, human review, missing receiving channel, reuse/compost, business responsibility, mask coordinates, durable SQLite quotas, bounded command grammar, and compensation gates. Also verify actual API responses, browser downloads, English UI/model results, mobile overflow, and provider errors. Camera/microphone/GPS hardware tests must be reported separately from code/UI tests.

## 13. Publishing and rollback

Use the installed Sites skill. Preserve the existing public audience; the user authorized public judge access. The repo has an `app/` subdirectory while Sites expects an application-root repository. The working publication checkout is a sanitized app copy at workspace `work/site-checkout/`; it has a separate Sites source Git repository. Do not confuse its commit SHA with the GitHub monorepo SHA.

Sync only changed application source/assets/migrations into that checkout, preserve `.openai/hosting.json`, and exclude credentials, caches and user data. Dependencies may be symlinked locally, but node_modules is ignored and never published as source. Use a fresh short-lived source credential through hidden stdin to `site-workflow.mjs`, which commits/pushes the source, builds and packages it. Save the exact returned commit/archive with `save_site_version`, then deploy the returned version ID with `deploy_site_version` (public audience). Never use the private-only deployment API after public sharing was enabled.

Retain returned saved-version/deployment IDs. Do not create a second Site or fabricate IDs. Rollback should redeploy a known saved version while considering that D1 migrations may already have applied. Do not rewrite applied migrations. Verify public access and provider behavior after publication. GitHub CI is defined in `.github/workflows/ci.yml`; use full commit SHAs when fetching workflow runs.

## 14. Known constraints and next-agent checklist

- No native iOS app; camera is web-based. Test Safari/iPhone and Android devices before claiming broad compatibility.
- No continuous video inference; one still photo per request.
- No general conversational voice agent; only fixed guidance and exact commands.
- English UI/model results, optional Spanish spoken guide. Public source titles may retain original Spanish names.
- Community draft is independent of the assessment list; it is not automatically a material-level receipt or eligibility decision.
- No verified partner map pins, route planning, guaranteed pickup, payments or wallet.
- No durable plan/edit-history store, accounts or authenticated operator console.
- No calibrated accuracy, weight estimation, verified recycling outcomes or CO2 savings.
- Public source dates/hours/acceptance need reverification before showing a place as available.
- English/natural-voice video must be re-captured/re-rendered before replacing the prior demo. A voice choice alone does not update old screenshots or the official form.
- Keep the official submission unsubmitted until the user explicitly resumes that action and reviews required permissions.

Before changing anything: inspect branch/status; read AGENTS; understand which features are operational vs proposed; keep the Meta decision engine separate from voice and economic promises; run meaningful checks; update this handoff and the work log with actual observed results.

## References

- https://dev.meta.ai/docs/cookbook/quickstart-chat-completions
- https://dev.meta.ai/docs/sam/overview
- https://dev.meta.ai/docs/sam/client-libraries
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- Public Lince programme sources are linked directly in `lib/circular/community.ts`.

## 15. Extension verification and handoff update

- 30 tests passed, including independent voice/Meta budgets, exact command rejection, arbitrary TTS-input rejection, inconsistent count rejection and compensation gates. TypeScript and production builds pass.
- Local route probes returned 400 for invalid step, arbitrary text and malformed JSON. Non-browser requests to the public host encountered an edge HTML response, so provider behavior was validated through the public browser workflow instead of bypassing edge protection.
- Hosted English Harper guide loaded valid audio (16.672 s); Spanish Alisson guide loaded valid audio (19.830 s), both without media errors. Microphone commands remain dependent on browser support and device permissions; no actual spoken hardware command was claimed as tested.
- Hosted Muse returned an English label (`empty plastic soda bottle`) and English visual evidence. SAM produced an aligned mask/box. Human correction, business context and policy `.2` exported correctly.
- Sequential prepared-object review preserves independent confirmation. Camera dialog opens/closes, but physical camera capture on an iPhone and GPS acquisition were not exercised; verify those on user devices. Streams are stopped by the implemented cleanup.
- Community handoff download tested with estimated 2.5 kg, cash preference and assisted delivery. Output remains `partner_required` with null measured weight, receipt and compensation. No financial value was created.
- Desktop and mobile reviewed; document scroll width equaled mobile viewport width (375 px), with no horizontal overflow.
- New video: 178.777 seconds, 5,534,662 bytes, natural Harper narration without tempo acceleration. Separate URL: `/circularos-community-demo.mp4`; player: `/community-demo`. Older direct-video URL remains intact.
- Counter-bucket retention cleanup is not implemented; the D1 table can accumulate dated keys. Add bounded cleanup and per-user quotas before production scale.
- Source integration/deployment final commit IDs should be taken from git/log and the Sites deployment response; never infer them from this narrative.


## Railway migration prepared (not deployed)

See `docs/RAILWAY.md` for the native Node deployment target and proposed `circularos.circulapp.la` domain. The Cloudflare Sites deployment is unchanged. Railway needs a persistent volume, privately configured provider secrets, a live deployment check, and authoritative DNS changes before submission URLs can be replaced.
