# Railway deployment · circulapp.la

Status: deployed to Railway at https://circularos.circulapp.la with HTTPS and a persistent volume. Provider secrets configured privately with the user’s approval. Final live-provider validation is in progress. The earlier Sites deployment remains available as a fallback.

## Runtime

Railway uses native Next.js on Node 22, built from `app/Dockerfile`. Sites retains its Vinext/Cloudflare build. Both run the same UI, perception, voice and deterministic decision policy. `@circularos/runtime` resolves to Node in Next.js and to Cloudflare in Vite. No provider keys are embedded in either bundle.

The Node adapter replaces D1 with SQLite on a Railway persistent volume. Atomic quota statements, independent voice/Meta budgets and fail-closed behavior are preserved. Use one service replica; this is not a distributed SQLite deployment. Do not use an ephemeral filesystem for production quotas. The mounted volume uses the container default root user to permit SQLite writes; provider secrets remain server-only.

## Service configuration

1. Create a Railway service from `jmiranda25/circularos-meta-hackathon`, using the reviewed deployment branch (then main after merge).
2. Set **Root Directory** to `/app`; Dockerfile path is `Dockerfile`. The dashboard currently disallows new Config-as-Code configurations; set deployment options directly there. The checked-in `/app/railway.toml` documents the intended settings.
3. Attach a persistent volume mounted at `/data`. Set `QUOTA_DB_PATH=/data/quota.sqlite` and `APP_ORIGIN=https://circularos.circulapp.la`. Keep one replica.
4. Configure secret variables `MODEL_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, optional `ELEVENLABS_VOICE_ID_ES`. Transfer values privately; do not put them in Git, logs or chat.
5. Docker listens on `0.0.0.0` and honors Railway `PORT` (default 3000). Health check `/` validates page serving, not provider readiness. A service without keys or volume must not be considered ready for judges.
6. Generate a Railway domain and verify image inference, SAM, voice, corrected decisions, export and video there before attaching the custom domain.

## Domain

Configured host: `circularos.circulapp.la`.

On November 4, 2026, a DNS lookup returned `ns49.domaincontrol.com` and `ns50.domaincontrol.com`: GoDaddy authoritative nameservers. Hosting at Hostinger does not mean Hostinger controls these DNS records. Use the authoritative DNS panel.

Add the custom domain to Railway and copy its exact CNAME target and ownership TXT record into that panel. Do not guess either value. Preserve apex and existing www/MX records. Wait for DNS validation and HTTPS issuance; verify the final domain before updating submission links.

## Validation performed locally

- Native Next.js production build succeeded.
- 35 tests passed, including quota persistence across two separate Node processes.
- TypeScript and retained Vinext build passed.
- Standalone Node server started successfully.
- `/`, `/community-demo`, and `/circularos-community-demo.mp4` returned HTTP 200.
- Invalid plan returned 400; voice without server secrets returned controlled 503.
- Docker build on Railway, native startup, custom-domain HTTPS, the example decision flow and video playback passed.
- Final live Meta/ElevenLabs tests are in progress.

## Submission and rollback

Change the official demo/video links only after the new host passes live checks. Video path is `/circularos-community-demo.mp4`; player path is `/community-demo`. The existing video contains captures of the previous hosted address; assess whether a caption update is needed. The player uses relative links, so the app and downloads stay on the new domain. No form has been submitted by this migration work.

Official references: https://docs.railway.com/networking/domains/working-with-domains and https://docs.railway.com/networking/public-networking.


## Provisioned resources

- Project: `ecad990b-7b5e-4286-b82d-0102e32bef58` (initial generated name imaginative-trust).
- Service: `ed4b4f39-b050-4021-8c5c-67f62af1e5bc`.
- Production environment: `c3ff185f-9125-43a9-9187-cb622778d0a0`.
- Root `/app`; branch `feat/railway-deployment` until its PR is merged.
- Volume mount `/data`; `QUOTA_DB_PATH=/data/quota.sqlite`; explicit `PORT=3000` and `HOSTNAME=0.0.0.0`.
- Custom DNS is managed in GoDaddy. The CNAME and Railway ownership TXT were verified via DNS lookup.
- Temporary Railway domain: https://circularos-meta-hackathon-production.up.railway.app.
