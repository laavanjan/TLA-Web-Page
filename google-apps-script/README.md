# Thamilaruvi submission endpoint — setup

The `/books/submit/form` page posts to a Google Apps Script Web App, which drops
each submission into a Drive folder and logs a row in a Google Sheet. No backend
server or hosting is involved.

Do all of this from the Google account that should **own** the submissions.

## 1. Create the Drive folder

1. Go to [drive.google.com](https://drive.google.com) and create a folder,
   e.g. `Thamilaruvi 2026 — Submissions`.
2. Open it. The URL looks like
   `https://drive.google.com/drive/folders/1AbCdEf...` — copy the id after
   `/folders/`.

## 2. Create the log Sheet

1. Create a new Google Sheet, e.g. `Thamilaruvi Submissions Log`.
2. The URL looks like
   `https://docs.google.com/spreadsheets/d/1XyZ.../edit` — copy the id between
   `/d/` and `/edit`.
3. Leave it empty; the script writes the header row on the first submission.

## 3. Create the Apps Script

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Delete the placeholder `Code.gs` contents and paste in everything from
   [`Code.gs`](./Code.gs) in this folder.
3. At the top of the file, replace the two placeholders:

   ```javascript
   var FOLDER_ID = '<the folder id from step 1>';
   var SHEET_ID  = '<the sheet id from step 2>';
   ```

4. Rename the project (top left) to something recognisable, then **Save**.

## 4. Deploy as a Web App

1. **Deploy** → **New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Fill in:
   - **Description**: `Thamilaruvi submissions`
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**  ← required, otherwise the form gets a 401
4. **Deploy**. Google will ask you to authorise the script — accept the Drive
   and Sheets permissions. You may need to click *Advanced → Go to
   \<project name\> (unsafe)*; that warning is normal for your own unpublished
   script.
5. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy.../exec`.

Sanity check: open that URL in a browser. You should see
`{"status":"ok","message":"Thamilaruvi submission endpoint is live."}`.

## 5. Point the frontend at it

Create a `.env` file in the project root (same folder as `package.json`):

```
REACT_APP_SUBMIT_URL=https://script.google.com/macros/s/AKfy.../exec
```

Then restart the dev server — Create React App only reads `.env` at startup:

```bash
npm start
```

`.env` is already covered by `.gitignore`, so the URL will not be committed. For
the production build, set the same variable in your host's environment settings
(Netlify/Vercel: *Site settings → Environment variables*).

## Redeploying after script edits

Apps Script keeps the old code live until you cut a new version:

**Deploy** → **Manage deployments** → pencil icon → **Version: New version** →
**Deploy**. The URL stays the same.

## What a submission looks like

- **Drive**: `<folder>/2026-03-14_10-22-05 - ம. திகர்ணன் - விட்டில் பூச்சி/`
  containing `கவிதை_ம. திகர்ணன்_TMLE 24.docx` and, if supplied,
  `Photo_ம. திகர்ணன்.jpg`.
- **Sheet**: one row per submission with every form field plus direct links to
  the file, the photo and the folder.

## Notes and limits

- Apps Script allows ~50 MB per request; the form caps uploads at 10 MB for the
  document and 5 MB for the photo, so there is plenty of headroom.
- Free-tier quota is roughly 20,000 script executions/day — far above what a
  submission form needs.
- The form sends `Content-Type: text/plain` on purpose. That keeps the request
  "simple" so the browser skips the CORS preflight, which Apps Script does not
  answer.
- Whoever deploys the script owns the folder. Share the folder with the rest of
  the editorial team so they can read submissions.
