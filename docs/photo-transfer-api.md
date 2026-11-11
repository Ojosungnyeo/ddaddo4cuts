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
