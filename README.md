# Hazecreates + Supabase

This portfolio uses React/Vite for the site and Supabase (Postgres + Auth) for persistent content and the admin panel. No separate Express server is required.

## Setup

1. Create a Supabase project.
2. In its SQL Editor, run [supabase/schema.sql](./supabase/schema.sql).
3. In **Authentication → Users**, create your admin user with email and password.
4. Copy `.env.example` to `.env` and add the Project URL and anon key from **Project Settings → API**.
5. Run `pnpm install` then `pnpm dev`.
6. Open `/#/admin` and sign in with the user you created.

## Vercel

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Environment Variables, then deploy. Updates made in `/#/admin` save straight to Supabase and appear on the website without a redeploy.

Do not use the Supabase service-role key in this frontend app.
