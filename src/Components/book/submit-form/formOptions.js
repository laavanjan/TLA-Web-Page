// Dropdown / validation options for the article submission form.

export const WORK_TYPE_OPTIONS = [
  "கவிதை",
  "சிறுகதை",
  "கதை / குறுங்கதை",
  "கட்டுரை",
  "சமூகப் பார்வை / சமூகக் கட்டுரை / ஆய்வுக் கட்டுரை",
  "பத்தி எழுத்து",
  "உரையாடல், நேர்காணல்",
  "புகைப்படம் / Photography",
  "ஓவியம் / Art, கார்ட்டூன் / Cartoon",
  "தமிழ் இலக்கிய விமர்சனம்",
  "ஏனையவை",
];

export const FACULTY_OPTIONS = [
  "பொறியியற் பீடம்",
  "கட்டிடக்கலைப் பீடம்",
  "தகவல் தொழினுட்பப் பீடம்",
  "வணிக முகாமைத்துவப் பீடம்",
  "ஏனையவை",
];

// Max upload sizes in bytes.
export const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_DOC_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export const ACCEPTED_PDF_TYPES = ["application/pdf"];

export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
