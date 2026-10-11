# Deploying Penny Feed

Target: the reader on **GitHub Pages** (free, static), data on **Supabase** (free tier is plenty). None of this has been run yet; follow it once and tell me where it snags.

> GitHub Pages sites are public URLs even for private repos (private-repo Pages needs a paid plan). That's fine here: the site is only the app shell. Content is behind Supabase auth and row-level security, and the repo contains only sample content.

## 1. Supabase (about 10 minutes)

1. Create a project at supabase.com. Note the **Project URL**, **anon key**, **service role key** and **project ref**.
2. **Auth → Providers → Email:** enable email + password. **Disable "Allow new users to sign up".** Then create your one user under Authentication → Users (Add user, with a password, "auto confirm").
3. **SQL editor:** paste `supabase/migrations/0001_init.sql` and run it.
4. Register yourself as the owner (nothing is readable until you do). In the SQL editor:
   ```sql
   insert into public.app_owner (uid) select id from auth.users where email = 'you@example.com';
   ```
5. Install the Supabase CLI, then:
   ```bash
   supabase login
   supabase link --project-ref <project-ref>
   # a long random token the editor will use; keep it somewhere safe
   supabase secrets set INGEST_TOKEN="$(openssl rand -hex 32)"
   supabase functions deploy ingest --no-verify-jwt
   supabase functions deploy brief  --no-verify-jwt
   ```
   (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to functions automatically.)
6. Smoke test (expect `401`, then a JSON error about the payload, not a crash):
   ```bash
   curl -i -X POST https://<ref>.supabase.co/functions/v1/ingest
   curl -i -X POST https://<ref>.supabase.co/functions/v1/ingest -H "Authorization: Bearer $TOKEN" -d '{}'
   ```

## 2. GitHub Pages

1. Push this repo to your GitHub account (e.g. `penny-feed`).
2. **Settings → Pages → Source: GitHub Actions.**
3. **Settings → Secrets and variables → Actions → Variables:** add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. (Variables, not secrets: they ship to the browser by design.)
4. Push to `main`. `.github/workflows/pages.yml` builds with `NEXT_PUBLIC_BASE_PATH=/<repo-name>` and publishes.
5. Open `https://<you>.github.io/<repo-name>/`, sign in, and you should see the sample stories until the editor publishes something.

If you use a custom domain or a `<you>.github.io` user site, set `NEXT_PUBLIC_BASE_PATH` to an empty string in the workflow.

## 3. iPhone

Safari → open the site → Share → Add to Home Screen. Sign in once; the session persists in the installed app. (Note: the installed app has separate storage from Safari tabs, so sign in again there.)

## 4. Connect the editor

See [INTEGRATIONS.md](INTEGRATIONS.md) for creating the scheduled tasks and what to verify first.

## Backups

Settings → Export everything saves your ledger, history and progress as JSON. Content is regenerable; the `state` table is the thing worth keeping. In Supabase, enable daily backups (paid) or periodically run:
`supabase db dump --data-only -f backup.sql`.

## Revoking and removing

- Revoke the editor: `supabase secrets unset INGEST_TOKEN` (the functions then fail closed).
- Remove imported data: delete rows from `items`/`series` in the SQL editor; the reader state is separate.
- Disconnect Gmail: revoke at myaccount.google.com → Security → Third-party access.
