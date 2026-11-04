# CircularOS

**Circular Intelligence for Everyone.** A human-in-the-loop decision workflow that turns a waste photo into an actionable, auditable circular plan for a household or business.

## What works

1. Upload JPG, PNG or WebP; the browser resizes it to at most 1600 px.
2. Muse Spark 1.3 proposes objects, material hypotheses, condition and visual evidence.
3. Correct labels and conditions, add/remove objects, and confirm your review. Request SAM 3.1 segmentation for an individual object to see its region in the original photo.
4. Select household/business, city, **user-confirmed** collection channels, compost and reuse access.
5. A deterministic versioned engine produces decisions with rule IDs, reasons, next steps, accountability and unresolved checks.
6. Mark actions as self-reported complete and export the entire plan as JSON, including model provenance and corrected inputs. Editing inputs invalidates the plan.

This goes beyond image classification: the same bottle takes a different path when its material is corrected, when no receiving channel exists, or when it can be reused. Business mode adds responsibility and delivery-record requirements. Hazardous and electronic items are diverted to specialized handling.

## Run locally

Node.js 22.13+ is required. The app uses Next.js App Router conventions, React, TypeScript and Vinext for Cloudflare Workers/Sites deployment.

```sh
cd app
npm ci
# Configure MODEL_API_KEY in a local untracked .dev.vars file:
# MODEL_API_KEY=your-new-key
npm run dev
```

Open the Local URL printed by the server (normally http://127.0.0.1:5173). `MODEL_API_KEY` stays server-side. Never paste a key into chat or commit it. Without a key, live perception returns an explicit configuration error; the prepared example and manual workflow remain available. They are visibly labeled and never presented as live inference.

```sh
npm test
npx tsc --noEmit
npm run build
```

## Architecture and delivery

- [Architecture, scope and decision rules](docs/ARCHITECTURE.md)
- [Hackathon work log and verification](docs/HACKATHON.md)
- [Three-minute demo script](docs/DEMO.md)
- [Submission checklist and copy](docs/SUBMISSION.md)
- [Agent collaboration](AGENTS.md)

The app is in `app/`; core policy is `app/lib/circular/domain.ts`, provider calls are `app/lib/circular/perception.ts`, and API routes are under `app/app/api/`.

## Boundaries

No municipal acceptance database, verified collection locations, calibrated confidence, measured carbon savings, physical sorting verification, accounts, payments or industrial equipment control. City is a user-provided label, not evidence of coverage. Recommendations use a conservative general policy, not jurisdiction-specific recycling rules. Consult the receiving operator before delivery. Actions marked complete are user reports, not verified recycling outcomes.

Photographs and plans are not persisted by CircularOS; the selected photo is sent to Meta only when the user requests perception or segmentation. Meta's own service policies apply. Reloading loses session state unless the plan was exported. Live requests have timeouts and no automatic retries. Hosted access begins private to protect the credit budget; make the demo accessible to judges only after reviewing sharing and abuse controls.

## Meta integration references

- [Muse Spark Chat Completions](https://dev.meta.ai/docs/cookbook/quickstart-chat-completions)
- [SAM 3.1 overview](https://dev.meta.ai/docs/sam/overview)
- [Official SAM parser](https://dev.meta.ai/docs/sam/client-libraries)
- [Hackathon dates](https://dev.meta.ai/events/global-hackathon)

Built for the Meta Global AI Developer Hackathon, November 4, 2026. MIT license.
