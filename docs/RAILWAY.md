# Railway deployment · circulapp.la

Status: migration prepared and checked locally; no Railway service or DNS record has been created yet. The existing public Sites deployment remains available.

## Runtime

Railway uses native Next.js on Node 22, built from `app/Dockerfile`. Sites retains its Vinext/Cloudflare build. Both run the same UI, perception, voice and deterministic decision policy. `@circularos/runtime` resolves to Node in Next.js and to Cloudflare in Vite. No provider keys are embedded in either bundle.

The Node adapter replaces D1 with SQLite on a Railway persistent volume. Atomic quota statements, independent voice/Meta budgets and fail-closed behavior are preserved. Use one service replica; this is not a distributed SQLite deployment. Do not use an ephemeral filesystem for production quotas. The mounted volume uses the container default root user to permit SQLite writes; provider secrets remain server-only.

## Service configuration

1. Create a Railway service from `jmiranda25/circularos-meta-hackathon`, using the reviewed deployment branch (then main after merge).
2. Set **Root Directory** to `/app`; Dockerfile path is `Dockerfile`. Railway config file, if requested relative to repository root, is `/app/railway.toml`.
3. Attach a persistent volume mounted at `/data`. Set `QUOTA_DB_PATH=/data/quota.sqlite`. Keep one replica.
4. Configure secret variables `MODEL_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, optional `ELEVENLABS_VOICE_ID_ES`. Transfer values privately; do not put them in Git, logs or chat.
5. Docker listens on `0.0.0.0` and honors Railway `PORT` (default 3000). Health check `/` validates page serving, not provider readiness. A service without keys or volume must not be considered ready for judges.
6. Generate a Railway domain and verify image inference, SAM, voice, corrected decisions, export and video there before attaching the custom domain.

## Domain

Proposed final host: `circularos.circulapp.la`.

On November 4, 2026, a DNS lookup returned `ns49.domaincontrol.com` and `ns50.domaincontrol.com`: GoDaddy authoritative nameservers. Hosting at Hostinger does not mean Hostinger controls these DNS records. Use the authoritative DNS panel.

Add the custom domain to Railway and copy its exact CNAME target and ownership TXT record into that panel. Do not guess either value. Preserve apex and existing www/MX records. Wait for DNS validation and HTTPS issuance; verify the final domain before updating submission links.

## Validation performed locally

- Native Next.js production build succeeded.
- 31 tests passed, including quota persistence across two separate Node processes.
- TypeScript and retained Vinext build passed.
- Standalone Node server started successfully.
- `/`, `/community-demo`, and `/circularos-community-demo.mp4` returned HTTP 200.
- Invalid plan returned 400; voice without server secrets returned controlled 503.
- New-host live Meta/ElevenLabs tests, Docker build on Railway, persistent-volume permissions and custom-domain HTTPS remain pending.

## Submission and rollback

Do not change the official demo/video links until the new host passes live checks. Video path is `/circularos-community-demo.mp4`; player path is `/community-demo`. The existing video contains captures of the previous hosted address; assess whether a caption update is needed. Existing static player footer reflects the earlier submission status and should be refreshed once final links are confirmed. No form has been submitted by this migration work.

Official references: https://docs.railway.com/networking/domains/working-with-domains and https://docs.railway.com/networking/public-networking.
