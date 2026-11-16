# Photo transfer API development

## One-time setup

1. Run `supabase/photo_transfers_api.sql` in the Supabase SQL editor.
2. Confirm that `photo-deliveries` is private and only accepts `image/png` up to `PHOTO_MAX_BYTES`.
3. Copy `.env.example` to `.env.local` and replace every placeholder.
4. Generate `PHOTO_TOKEN_PEPPER` with `openssl rand -base64 32`. Use the same value in Vercel.

Do not add browser policies to `photo_transfers` or expose `SUPABASE_SECRET_KEY` through a `VITE_` variable.

## Run locally

Vite alone does not execute the `api/` functions. Install the Vercel CLI and run:

```bash
npx vercel dev
```

## API smoke test

Create an authorization for a real PNG size:

```bash
curl -i http://localhost:3000/api/photos/create \
  -H 'content-type: application/json' \
  --data '{"mimeType":"image/png","sizeBytes":123456}'
```

Use `uploadPath` and `uploadToken` from that response with Supabase
`uploadToSignedUrl`. Then complete the transfer:

```bash
curl -i http://localhost:3000/api/photos/complete \
  -H 'content-type: application/json' \
  --data '{"uploadId":"REPLACE","manageToken":"REPLACE"}'
```

Fetch a short-lived private download URL:

```bash
curl -i http://localhost:3000/api/photos/SHARE_TOKEN
curl -i 'http://localhost:3000/api/photos/SHARE_TOKEN?download=1'
```

Also test wrong MIME types, a size over the configured maximum, repeated completion,
an invalid token, an expired row, and more create calls than the configured rate limit.

## Showcase rate limit and diagnostics

`/api/photos/create` counts rows created from the same public IP during the last
`PHOTO_RATE_LIMIT_WINDOW_MINUTES` minutes. It rejects the next request with HTTP
429 when the count reaches `PHOTO_RATE_LIMIT_MAX`. The server defaults remain
10 creations per 10 minutes. These are server-only environment variables; set
them in the Vercel environment for the showcase and redeploy. For example,
`PHOTO_RATE_LIMIT_MAX=60` keeps a limit while allowing more visitors behind one
public IP. Choose the value from the expected peak number of sessions and
retakes; pending sessions also count. Do not put these settings in `VITE_` keys.

To verify without using real photos, use a separate test environment and set
`PHOTO_RATE_LIMIT_MAX=2` and `PHOTO_RATE_LIMIT_WINDOW_MINUTES=1`. Call the
create endpoint twice from the same IP with a valid PNG size; the third call
should return 429. Wait for the window to pass and confirm the next call can
create a session. Check that a different IP is counted separately. Restore the
showcase values after testing. Created pending records expire and are removed
by the existing cleanup cron.

The browser console shows one timing table when the QR image loads only when
`VITE_ENABLE_QR_TIMINGS=true` was set at build time. It is disabled by default
in both development and production. The table contains PNG composition, create
API, Storage upload, complete API, QR generation/display, total time from
capture completion, and PNG Blob size in MiB. It does not log tokens, signed
URLs, or photo data. To measure on a deployment, set the variable to `true` in
that Vercel environment (Preview or Production), deploy again, complete one
photo session, and inspect the browser DevTools console after the QR appears.
Remove the variable or set it to `false` and redeploy when measurement is done.
Vite embeds this browser-safe flag in the build; changing the Vercel variable
without redeploying does not change an existing deployment. Network timing can
also be checked in DevTools with Preserve log enabled.

After 30 seconds without a transfer result, the result screen shows a delay
notice and local PNG save link. The original request keeps running; a late
success still displays the QR. A failed request keeps the manual retry action.
No automatic retry is performed.

Known recovery limit: if `/api/photos/create` succeeds but its response is lost,
the client cannot identify that server session and a manual retry can create a
second pending row. This needs a server-backed idempotency key in a later change.
