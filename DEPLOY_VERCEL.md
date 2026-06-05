# Deploying to Vercel

This project is a TanStack Start SSR app. It is preconfigured to build with
the **Nitro `vercel` preset** when the `VERCEL` environment variable is
present (Vercel sets this automatically), so the build output lands in
`.vercel/output` — Vercel's official Build Output API. No output directory
override is needed.

## 1. Push the project to GitHub

In Lovable: `+` menu → GitHub → Connect project → Create repository.

## 2. Import the repo on Vercel

1. Go to https://vercel.com/new and import the GitHub repo.
2. **Framework Preset**: leave as "Other" (auto-detected).
3. **Build Command**: `npm run build` (already set in `vercel.json`).
4. **Output Directory**: leave EMPTY — Nitro writes to `.vercel/output`.
5. **Install Command**: `npm install` (default).
6. **Node.js Version**: 22.x (Project Settings → General).

## 3. Add environment variables

In Vercel → Project → Settings → Environment Variables, add these for
**Production, Preview, and Development**:

| Name                          | Value                                          |
| ----------------------------- | ---------------------------------------------- |
| `VITE_SUPABASE_URL`           | from `.env`                                    |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | from `.env`                                  |
| `VITE_SUPABASE_PROJECT_ID`    | from `.env`                                    |
| `SUPABASE_URL`                | same as above (server runtime)                 |
| `SUPABASE_PUBLISHABLE_KEY`    | same as above (server runtime)                 |
| `SUPABASE_SERVICE_ROLE_KEY`   | from Lovable Cloud → Project Settings → Secrets |

`VITE_*` are bundled into the client at build time. The non-prefixed ones
are read by the SSR runtime (`createServerFn`, auth middleware, admin
client). `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — never prefix it
with `VITE_`.

## 4. Deploy

Click **Deploy**. After it finishes, your app is live at
`https://<project>.vercel.app` with full SSR, server functions, and Supabase
auth working.

## 5. Supabase auth — add the production URL

Lovable Cloud → Authentication → URL Configuration:
- **Site URL**: `https://<project>.vercel.app`
- **Redirect URLs**: add `https://<project>.vercel.app/**`

Without this, sign-in redirects will fail in production.

## Notes

- The Lovable preview keeps working — the Cloudflare preset is used inside
  the sandbox, the Vercel preset only kicks in when `VERCEL=1`.
- Routing (deep links, refresh on any URL) works automatically — TanStack
  Start handles it; no rewrites needed in `vercel.json`.
- For scale: Vercel auto-scales serverless functions. Cold starts are
  ~100–300ms; warm requests are fast. No additional config required.
