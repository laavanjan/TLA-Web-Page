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
