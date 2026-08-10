# TLA Web Page

Official web application for the **தமிழ் இலக்கிய மன்றம் (Tamil Literary Association)** of the University of Moratuwa.

---

## Running the project

```bash
npm install
npm start
```

The app runs on `http://localhost:3000`. A separate backend is required for certain features (memory-sharing, books listing) — see `src/helpers/server.js` for the API base URL.

---

## Deployment Guide (Vercel + Custom Domain)

This section explains how the live website works "behind the scenes" — where it's hosted, how the custom domain (`tlauom.com`) is connected to it, and how to make changes safely in the future. It's written so that someone with no coding background can still follow it.

### The three services involved

There are three different websites/tools involved in making `tlauom.com` work, and it's easy to confuse them:

| Service | What it actually does | Think of it as... |
|---|---|---|
| **Vercel** | Actually runs the website — this is where the code lives and gets served to visitors | The "building" the shop operates out of |
| **Namecheap** | Where the domain name `tlauom.com` was purchased/registered | The company that legally owns the "street address" on paper |
| **Cloudflare** | Controls where the domain name actually points on the internet | The "signpost" that tells visitors' browsers which building to walk into |

Even though `tlauom.com` was bought through Namecheap, Namecheap is **not** in charge of directing traffic — that job was handed over to Cloudflare when Namecheap's "nameservers" were set to Cloudflare's nameservers. So any changes to where the domain points must be made **in Cloudflare**, not in Namecheap.

### How the website itself is deployed

- The code for this website lives in this GitHub repository.
- Vercel is connected directly to this repository. Every time new code is pushed to the `main` branch, Vercel automatically rebuilds and re-publishes the live site — no manual upload needed.
- The build command Vercel uses is set to:
  ```
  DISABLE_ESLINT_PLUGIN=true react-scripts build
  ```
  In plain terms: normally, small code-style warnings would completely block the website from being published on Vercel. This setting tells Vercel to ignore those warnings and publish anyway. (It does **not** ignore real errors — only style warnings.)

### The submission form's "backend" link (environment variable)

The article submission form (`/books/submit/form`) needs to know *where* to send the files students upload. That destination is a Google Apps Script link, stored as a setting called `REACT_APP_SUBMIT_URL`.

- **Locally** (on a developer's own computer), this is stored in a file called `.env` in the project's main folder.
- **On the live website**, it's stored inside Vercel itself, under:
  **Vercel dashboard → select the project → Settings → Environment Variables → `REACT_APP_SUBMIT_URL`**

⚠️ **Important:** if this value is ever changed (for example, because the Google Apps Script was redeployed under a different Google account — see the "Article Submission Feature" section below), you must:
1. Update the value in the Vercel Environment Variables screen, **and**
2. Go to the **Deployments** tab and trigger a new deployment (or just push any small code change) — Vercel does **not** apply environment variable changes to a site that's already live until it's redeployed.

### Connecting the custom domain (`tlauom.com`) to Vercel — full walkthrough

This only needs to be done once, but it's documented here in case the domain, hosting, or DNS provider ever needs to be changed again.

**Step 1 — Tell Vercel about the domain**
1. Go to the Vercel dashboard → select the project → **Settings → Domains**
2. Type in `tlauom.com` and click **Add Domain**
3. Vercel will show you the DNS records it needs — normally an `A` record value like `76.76.21.21` for the root domain, and a `CNAME` value like `cname.vercel-dns.com` for `www`. (Always use whatever values Vercel is currently showing on that screen, since they can change.)

**Step 2 — Point the domain at Vercel, inside Cloudflare**
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) and log in with the account that manages this domain (the Google account tied to it is `thamizhiyam@gmail.com`)
2. Select `tlauom.com`, then go to **DNS → DNS Records**
3. Find the row where **Name = `tlauom.com`** and **Type = `A`** (there are several other rows with similar names like `mail.tlauom.com`, `cpanel.tlauom.com` — make sure you pick the one with *just* `tlauom.com`, nothing in front of it)
4. Click **Edit** on that row:
   - Change the address to the `A` record value Vercel gave you (e.g. `76.76.21.21`)
   - Click the orange **"Proxied"** cloud icon so it turns grey and says **"DNS only"** instead
   - Click **Save**
5. Find the row where **Name = `www.tlauom.com`** and **Type = `CNAME`**
6. Click **Edit** on that row:
   - Change the target to the `CNAME` value Vercel gave you (e.g. `cname.vercel-dns.com`)
   - Turn its proxy toggle to **"DNS only"** as well
   - Click **Save**

**Why "DNS only" and not "Proxied"?** Cloudflare's orange-cloud "Proxied" mode routes traffic through Cloudflare's own servers first. Vercel needs to talk to visitors' browsers directly to issue its free security certificate (the padlock icon) and to avoid the site getting stuck in an endless redirect loop. "DNS only" simply means Cloudflare acts like a signpost only, pointing straight at Vercel, without getting in the middle.

### ⚠️ Records you must NEVER change

The same Cloudflare DNS page also lists many other records that have nothing to do with the website — they run the organization's email and file-hosting instead. **Do not edit or delete any of these:**

- `mail.tlauom.com`, `webmail.tlauom.com`, `autodiscover.tlauom.com`, `autoconfig.tlauom.com` — email
- `cpanel.tlauom.com`, `whm.tlauom.com`, `cpcalendars.tlauom.com`, `cpcontacts.tlauom.com`, `webdisk.tlauom.com`, `ftp.tlauom.com` — hosting control panel
- All rows of type `MX`, `SRV`, and `TXT` (including the ones mentioning `DKIM`, `SPF`, or `dmarc`) — these keep email delivery working and prevent the domain's emails from being marked as spam

Only the **root `A` record** and the **`www` `CNAME` record** should ever be touched when working with the website itself.

### How to check it worked

1. Open `https://tlauom.com` in a **private/incognito browser window** (this avoids seeing an old cached version of the site)
2. Confirm the page shows the current website content, not an old version
3. Confirm there's a padlock icon next to the address bar (means the security certificate is working)

DNS changes are usually visible within a few minutes, but can occasionally take up to 24 hours to fully update everywhere.

### Common problems and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Browser says "too many redirects" | The Cloudflare record is still set to "Proxied" instead of "DNS only" | Go back into the Cloudflare DNS record and switch it to "DNS only" |
| Google Drive page says "Sorry, the file you have requested does not exist" when opening the Apps Script URL | The Apps Script deployment URL was mistyped somewhere (easy to happen — the URLs are long and contain look-alike characters like `l`/`I`/`1` or `O`/`0`) | Go back to the Apps Script's **Deploy → Manage deployments** screen and use the **Copy** button instead of retyping the URL |
| The website loads, but shows old/outdated content | Vercel hasn't been redeployed since the last code change, or the domain hasn't finished pointing at Vercel yet | Check the **Deployments** tab in Vercel for the latest build; wait a few minutes for DNS and try again in a private browser window |
| Submitting the article form shows a Tamil error message ("படைப்பை அனுப்புவதில் பிழை ஏற்பட்டது...") | `REACT_APP_SUBMIT_URL` on Vercel is missing, outdated, or the site hasn't been redeployed after changing it | Check the value in Vercel's Environment Variables screen, correct it, then redeploy |

---

## Article Submission Feature (`/books/submit`)

### Overview

A three-step flow that lets students submit creative works for the annual **தமிழருவி** publication:

| Step | Route | Description |
|------|-------|-------------|
| 1 | `/books` | Entry banner — "படைப்பு அனுப்ப" button |
| 2 | `/books/submit` | Rules & guidelines page (sticky side-nav, 8 sections) |
| 3 | `/books/submit/form` | Submission form → Google Drive |

### Submission form fields

**Personal details**
- முழுப் பெயர் (Full name) — required
- புனைபெயர் (Pen name) — optional
- பீடம் (Faculty) — dropdown, required
- துறை (Department) — required
- கல்வியாண்டு / Batch — required
- தொடர்பு இலக்கம் (Phone) — required, validated
- மின்னஞ்சல் (Email) — required, validated

**Work details**
- படைப்பின் வகை (Work type) — dropdown (கவிதை, சிறுகதை, கட்டுரை, etc.)
- படைப்பின் தலைப்பு (Title) — required
- சொற்களின் எண்ணிக்கை (Word count) — required, numbers only
- ஏற்கனவே வெளிவந்ததா (Previously published?) — Yes / No radio; if Yes, source field appears
- சுருக்கமான அறிமுகம் (Brief intro) — required, min 20 characters

**File uploads**
- படைப்பு Word கோப்பு (`.doc` / `.docx`) — required, max 10 MB
- எழுத்தாளர் புகைப்படம் (author photo, JPG/PNG/WEBP) — optional, max 5 MB

**Declaration checkbox** — confirms the work is original and rules are accepted.

### What happens on submit

1. Both files are read as Base64 in the browser.
2. A JSON payload (form fields + Base64 files) is POSTed to the Google Apps Script Web App URL (`REACT_APP_SUBMIT_URL`).
3. The Apps Script (`google-apps-script/Code.gs`) runs on Google's servers:
   - Creates a timestamped sub-folder inside the configured Drive folder: `YYYY-MM-DD_HH-mm-ss - FullName - WorkTitle`
   - Saves the `.docx` file named `WorkType_FullName_Batch.docx`
   - Saves the author photo named `Photo_FullName.ext` (if provided)
   - Appends a metadata row to the configured Google Sheet (one row per submission, 17 columns including links to the file, photo, and folder)
4. On success the form shows a Tamil confirmation screen. On failure a Tamil error banner appears.

### Google Apps Script setup

See [`google-apps-script/README.md`](google-apps-script/README.md) for the full step-by-step.

**Quick summary:**
1. Create a Drive folder → copy the folder ID
2. Create a Google Sheet → copy the sheet ID
3. Open [script.google.com](https://script.google.com), paste `Code.gs`, set both IDs
4. Deploy as **Web App** (Execute as: Me, Access: Anyone)
5. Copy the Web App URL

### Environment variable

Create a `.env` file in the project root (already in `.gitignore`):

```
REACT_APP_SUBMIT_URL=https://script.google.com/macros/s/<deployment-id>/exec
```

Restart the dev server after adding the file — CRA reads `.env` only at startup.

For production (Netlify / Vercel), set `REACT_APP_SUBMIT_URL` in the host's environment variables panel instead.

### Key files

| File | Purpose |
|------|---------|
| `src/Components/book/submit-banner/SubmitArticleBanner.js` | Entry banner on `/books` |
| `src/Components/book/submit-guidelines/SubmitGuidelines.js` | Guidelines page component |
| `src/Components/book/submit-guidelines/guidelinesData.js` | All Tamil content / section data |
| `src/Components/book/submit-form/SubmitForm.js` | Submission form component |
| `src/Components/book/submit-form/formOptions.js` | Dropdown options & file-size constants |
| `src/Pages/BookSubmitGuidelines.js` | Route page wrapper for guidelines |
| `src/Pages/BookSubmitForm.js` | Route page wrapper for form |
| `google-apps-script/Code.gs` | Apps Script backend (Drive + Sheet) |
| `google-apps-script/README.md` | Full deployment instructions |

---

## Hackathon event configuration

Go to `src/Components/events/hackthon/agenda/eventList.js` and edit the `events` object to update the agenda.
