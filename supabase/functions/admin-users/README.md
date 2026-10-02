# Team editors — setup

Team editors are people who can sign in to `/admin` but only edit the team
page(s) you assign them, and see who applied to join those teams. Main admins
manage them at **/admin/editors** and can see everything they did at
**/admin/activity**.

Do these steps **in this order**, all in your Supabase project.

## 1. Check who already has an account

**Authentication → Users.** Every account listed here becomes a **main admin**
in step 2. Delete any account you don't recognise first.

## 2. Run the database script

1. Open **SQL Editor → New query**.
2. Paste the whole of [`supabase/migrations/team_editors.sql`](../../migrations/team_editors.sql).
3. Click **Run**. It should finish with "Success. No rows returned".

This adds the roles, tightens who can change what, and starts the activity log.
It's safe to run again.

## 3. Create the password key

Team editors' passwords are stored encrypted so main admins can look them up.
Make a long random key — for example in PowerShell:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

(or any 40+ character random string from a password manager).

**Edge Functions → Secrets → Add new secret**

| Name | Value |
|---|---|
| `PASSWORD_VAULT_KEY` | the key you just made |

Keep a copy somewhere safe. If this key is lost or changed, stored passwords
can't be read any more — you'd just reset them.

## 4. Deploy the `admin-users` function

1. **Edge Functions → Deploy a new function → Via Editor**.
2. Replace the sample code with [`index.ts`](./index.ts).
3. Name it exactly `admin-users` and click **Deploy function**.

## 5. Redeploy `cloudinary-sign`

Open the existing **cloudinary-sign** function, replace its code with the new
[`../cloudinary-sign/index.ts`](../cloudinary-sign/index.ts) and deploy. This
version stops team editors uploading to (or deleting from) other teams.

## 6. Turn off public sign-ups

**Authentication → Sign In / Providers → "Allow new users to sign up" → off.**
All accounts are created from /admin/editors now.

## 7. Try it

1. Sign in at `/admin` as yourself → **Team Editors → Add person**.
2. Enter a name, email, pick their team(s). A password is generated for you.
3. **Create account** → copy the details shown and send them to the person.
4. Sign in as them in a private window: they land on their team page and can't
   see the other teams or admin tools.

## What main admins can do

On **/admin/editors**, for each person:

- **Edit** — name, email, role (team editor ↔ main admin), teams.
- **Reset password** — set a new one (a strong one is suggested).
- **Show password** — for team editors, even after they change it themselves.
  Each view is recorded in the activity log.
- **Disable / Enable** — disabled accounts can't sign in or change anything.
- **Remove** — deletes the login; the activity log keeps their history.

You can't disable, remove or demote yourself, and there's always at least one
main admin.

## What's logged (/admin/activity)

- Every team page **publish**: who, which team, when, and what changed
  ("added 4 photos to Gallery, edited the About text…").
- **Account changes**: created, edited, disabled/enabled, removed, password
  reset / changed / viewed.
- **Deleted join applications**.

Publishes and deletions are recorded by the database itself, so they can't be
skipped from the browser.

## Notes

- Join applications are matched to a team by the team name the applicant
  picked. If a team option in the join form doesn't match a team's name, those
  applications are visible to main admins only.
- Team editors change their password under **Change Password**; the form tells
  them main admins can see it.
