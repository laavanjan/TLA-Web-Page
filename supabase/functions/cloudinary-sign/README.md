# Team and event photo uploads — Cloudinary setup

`/admin/teams` and `/admin/events` let admins upload photos (gallery sections,
team logo, banner, cover, people photos, competition posters, event
illustrations, winners' pictures, sponsor logos…). Photos are resized to 2560px and
converted to WebP **in the admin's browser**, then uploaded straight to
Cloudinary. This Edge Function is the only place that knows the Cloudinary
**API secret** — it checks that the request comes from a signed-in admin and
hands back a one-off upload signature.

```
browser ──(admin login token)──► cloudinary-sign ──► signature
browser ──(file + signature)───────────────────────► Cloudinary  (tla/teams/<teamId>/… or tla/events/<eventId>/…)
```

Nothing needs adding to `.env` or Vercel — the website gets the cloud name and
API key from this function.

## 1. Cloudinary account

1. Sign up at [cloudinary.com](https://cloudinary.com) (the free plan is plenty).
2. On the dashboard (**Programmable Media → Dashboard**, or **Settings → API Keys**)
   copy the **Cloud name**, **API Key** and **API Secret**.

## 2. Deploy the function

Pick **one** of these.

### Option A — Supabase dashboard (no tools to install)

1. Supabase project → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Name it exactly `cloudinary-sign`.
3. Replace the sample code with the contents of [`index.ts`](./index.ts) and click **Deploy**.
4. **Edge Functions → Secrets** → add:

   | Name | Value |
   |---|---|
   | `CLOUDINARY_CLOUD_NAME` | your cloud name |
   | `CLOUDINARY_API_KEY` | your API key |
   | `CLOUDINARY_API_SECRET` | your API secret |

### Option B — Supabase CLI

Your project ref is the part before `.supabase.co` in `REACT_APP_SUPABASE_URL`.

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx
npx supabase functions deploy cloudinary-sign
```

## 3. Try it

Sign in at `/admin`, open **Team pages**, add a **Gallery** section and drop a
few photos on it. You should see each one go *Optimising… → % → done*, and the
size saving (e.g. `6.2 MB → 480 KB WebP −92%`). Publish, and they appear on
`/teams/<id>`.

## How it behaves

- **Who can upload:** main admins, to any team or event; editors, only to the
  teams and events they're assigned to (see [`../admin-users/README.md`](../admin-users/README.md)).
  Before `team_editors.sql` has been run, any signed-in account can.
- **Where files go:** `tla/teams/<teamId>/<random id>`, tagged `tla-team-<teamId>`;
  event photos in `tla/events/<eventId>/<random id>`, tagged `tla-event-<eventId>`.
  In the Cloudinary Media Library, search for the tag or the public id to find them.
- **Deleting:** removing a photo in the admin only changes the draft. When you
  **Publish**, photos the page no longer uses are deleted from Cloudinary.
  **Discard** deletes photos that were uploaded to that draft but never
  published. A file is only ever deleted if it lives in that team's or event's own folder.
- **Pasted links still work:** Google Drive / Cloudinary URLs pasted by hand are
  shown as before and are never deleted by the site.
- **Leftovers:** if a browser tab is closed mid-edit, photos uploaded to that
  unpublished draft stay in Cloudinary. They're harmless; to tidy up, delete
  files under `tla/teams/` and `tla/events/` that no page uses.

## Limits worth knowing (free plan)

- 25 monthly credits ≈ 25 GB of storage + delivery combined. At ~0.5 MB per
  optimised photo that's thousands of photos.
- 10 MB per uploaded file. The browser shrinks photos first, so only files it
  can't read (e.g. HEIC outside Safari) are sent as-is — those must be under 10 MB.
