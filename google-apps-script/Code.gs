/**
 * Thamilaruvi article submission endpoint.
 *
 * Receives a JSON POST from the React form, saves the uploaded files into a
 * Drive folder (one sub-folder per submission) and appends a metadata row to a
 * Google Sheet.
 *
 * Setup: fill in FOLDER_ID and SHEET_ID below, then deploy via
 * Deploy > New deployment > Web app (Execute as: Me, Access: Anyone).
 */

// ---- Configuration -------------------------------------------------------

// Drive folder that will hold the submissions.
// Grab it from the folder URL: drive.google.com/drive/folders/<FOLDER_ID>
var FOLDER_ID = '1dGJPPRbR6LHZiHAWbeeOqvLXCtVfhNt_';

// Google Sheet that logs the submissions.
var SHEET_ID = '1xesqw-44glVBivYrA58OitfjCAIBnqpfY_eLHgdY7Rc';

// Sheet tab name. Created automatically if missing.
var SHEET_NAME = 'Submissions';

var HEADERS = [
  'சமர்ப்பித்த நேரம்',
  'முழுப் பெயர்',
  'புனைபெயர்',
  'பீடம்',
  'துறை',
  'கல்வியாண்டு',
  'தொடர்பு இலக்கம்',
  'மின்னஞ்சல்',
  'படைப்பின் வகை',
  'படைப்பின் தலைப்பு',
  'சொற்கள்',
  'அறிமுகம்',
  'ஏற்கனவே வெளிவந்ததா',
  'எங்கு',
  'Word கோப்பு',
  'PDF கோப்பு',
  'புகைப்படம்',
  'Folder'
];

// ---- Entry points --------------------------------------------------------

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ status: 'error', message: 'No payload received.' });
    }

    var data = JSON.parse(e.postData.contents);

    var missing = validate(data);
    if (missing.length) {
      return jsonOut({ status: 'error', message: 'Missing fields: ' + missing.join(', ') });
    }

    var parent = DriveApp.getFolderById(FOLDER_ID);

    // One folder per submission keeps the Drive tidy and avoids name clashes.
    var stamp = Utilities.formatDate(new Date(), 'Asia/Colombo', 'yyyy-MM-dd_HH-mm-ss');
    var folderName = stamp + ' - ' + sanitize(data.fullName) + ' - ' + sanitize(data.workTitle);
    var folder = parent.createFolder(folderName);

    var docUrl = saveFile(folder, data.document, buildDocName(data));
    var pdfUrl = data.pdf ? saveFile(folder, data.pdf, buildDocName(data)) : '';
    var photoUrl = data.photo ? saveFile(folder, data.photo, buildPhotoName(data)) : '';

    logToSheet(data, docUrl, pdfUrl, photoUrl, folder.getUrl());

    return jsonOut({
      status: 'success',
      message: 'Submission stored.',
      folder: folder.getUrl()
    });
  } catch (err) {
    // Surface the reason in the Apps Script execution log for debugging.
    console.error(err);
    return jsonOut({ status: 'error', message: String(err) });
  }
}

function doGet() {
  return jsonOut({ status: 'ok', message: 'Thamilaruvi submission endpoint is live.' });
}

// ---- Helpers -------------------------------------------------------------

function validate(data) {
  var required = ['fullName', 'faculty', 'department', 'batch', 'phone', 'email', 'workType', 'workTitle', 'intro'];
  var missing = [];

  for (var i = 0; i < required.length; i++) {
    var key = required[i];
    if (!data[key] || String(data[key]).trim() === '') {
      missing.push(key);
    }
  }

  if (!data.document || !data.document.data) {
    missing.push('document');
  }

  if (!data.pdf || !data.pdf.data) {
    missing.push('pdf');
  }

  return missing;
}

function saveFile(folder, filePayload, preferredName) {
  var bytes = Utilities.base64Decode(filePayload.data);
  var extension = extensionOf(filePayload.name);
  var blob = Utilities.newBlob(
    bytes,
    filePayload.mimeType || 'application/octet-stream',
    preferredName + extension
  );
  return folder.createFile(blob).getUrl();
}

function buildDocName(data) {
  // Mirrors the naming convention from the guidelines: Category_Name_Batch
  return [sanitize(data.workType), sanitize(data.fullName), sanitize(data.batch)]
    .filter(String)
    .join('_');
}

function buildPhotoName(data) {
  return 'Photo_' + sanitize(data.fullName);
}

function extensionOf(fileName) {
  var dot = String(fileName || '').lastIndexOf('.');
  return dot > -1 ? String(fileName).slice(dot) : '';
}

function sanitize(value) {
  // Drive rejects slashes; trim the rest so folder names stay readable.
  return String(value || '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
}

function logToSheet(data, docUrl, pdfUrl, photoUrl, folderUrl) {
  if (!SHEET_ID || SHEET_ID.indexOf('PASTE_') === 0) return;

  var book = SpreadsheetApp.openById(SHEET_ID);
  var sheet = book.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date(),
    data.fullName || '',
    data.penName || '',
    data.faculty || '',
    data.department || '',
    data.batch || '',
    data.phone || '',
    data.email || '',
    data.workType || '',
    data.workTitle || '',
    data.wordCount || '',
    data.intro || '',
    data.alreadyPublished === 'yes' ? 'ஆம்' : 'இல்லை',
    data.publishedWhere || '',
    docUrl,
    pdfUrl,
    photoUrl,
    folderUrl
  ]);
}

function jsonOut(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
