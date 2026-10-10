// Membership fee receipt for /admin/members: drawn on a canvas (so Tamil text
// is shaped by the browser), then saved as a PDF or a picture. A5 landscape at
// 300 dpi. Everything printed comes from the member row (including who signed
// it), so a receipt downloaded again later is identical.
import signatureFontUrl from "@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff2";
import logoUrl from "../images/logo.png";
import { formatRupees } from "../shared/members";

const W = 2480;
const H = 1748;
const NAVY = "#022345";
const NAVY_LIGHT = "#0a3a6b";
const GOLD = "#c8932f";
const GOLD_LIGHT = "#e8b755";
const MIST = "#c9d3e6"; // quiet text on navy
const GREY = "#6b6f76";
const DOTS = "#c3c9d3";
const CREAM = "#fbf5e8";
const STAMP = "#1b7a4c";
const INK = "#1c3f94"; // pen-blue signature

// The site's own Tamil fonts (public/fonts). Heading has Latin letters too,
// Para is Tamil only and draws small for its size, so `ta()` scales it up to
// sit level with the English next to it.
const TAMIL_HEAD = '"TLA Receipt Heading", "Nirmala UI", "Latha", sans-serif';
const TAMIL_BODY = '"TLA Receipt Para", "Nirmala UI", "Latha", sans-serif';
const LATIN = '"Segoe UI", Roboto, "Helvetica Neue", Arial, "TLA Receipt Para", "Nirmala UI", sans-serif';
const SIGNATURE = '"TLA Receipt Signature", "Segoe Script", cursive';
const ta = (size) => Math.round(size * 1.45);

let fontsReady = null;
function loadFonts() {
  if (!fontsReady) {
    fontsReady = Promise.all(
      [
        ["TLA Receipt Heading", "/fonts/Heading.ttf"],
        ["TLA Receipt Para", "/fonts/Para.ttf"],
        ["TLA Receipt Signature", signatureFontUrl],
      ].map(([family, url]) =>
        new FontFace(family, `url(${url})`)
          .load()
          .then((face) => document.fonts.add(face))
          .catch(() => {}) // falls back to a system Tamil font
      )
    );
  }
  return fontsReady;
}

let logoReady = null;
function loadLogo() {
  if (!logoReady) {
    logoReady = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = logoUrl;
    });
  }
  return logoReady;
}

// ---- Amount in words ------------------------------------------------------------

const ONES = "Zero One Two Three Four Five Six Seven Eight Nine Ten Eleven Twelve Thirteen Fourteen Fifteen Sixteen Seventeen Eighteen Nineteen".split(" ");
const TENS = "  Twenty Thirty Forty Fifty Sixty Seventy Eighty Ninety".split(" ");

function underThousand(n) {
  const words = [];
  if (n >= 100) {
    words.push(ONES[Math.floor(n / 100)], "Hundred");
    n %= 100;
  }
  if (n >= 20) {
    words.push(TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : ""));
  } else if (n > 0 || !words.length) {
    words.push(ONES[n]);
  }
  return words.join(" ");
}

function integerWords(n) {
  if (n === 0) return "Zero";
  const parts = [];
  [
    [1e6, "Million"],
    [1e3, "Thousand"],
  ].forEach(([size, name]) => {
    if (n >= size) {
      parts.push(underThousand(Math.floor(n / size)) + " " + name);
      n %= size;
    }
  });
  if (n) parts.push(underThousand(n));
  return parts.join(" ");
}

// Sri Lankan style: "Rupees Five Hundred Only".
export function rupeesInWords(amount) {
  const cents = Math.round(Number(amount) * 100);
  const rupees = Math.floor(cents / 100);
  const rest = cents % 100;
  return `Rupees ${integerWords(rupees)}${rest ? ` and Cents ${integerWords(rest)}` : ""} Only`;
}

// ---- Drawing helpers ---------------------------------------------------------------

const ymdDate = (ymd) => {
  const [y, m, d] = String(ymd).split("-").map(Number);
  return new Date(y, m - 1, d);
};
const longDate = (ymd) => ymdDate(ymd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const stampDate = (ymd) =>
  ymdDate(ymd).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

const fontOf = (p, scale = 1) => `${p.weight || "400"} ${Math.round(p.size * scale)}px ${p.family || LATIN}`;

// Text made of differently styled parts (e.g. Tamil + English) on one line,
// shrunk as a whole to fit `maxWidth`.
function runs(ctx, parts, x, y, { align = "left", maxWidth } = {}) {
  const measure = (scale) =>
    parts.reduce((sum, p) => {
      ctx.font = fontOf(p, scale);
      return sum + ctx.measureText(p.text).width + (p.gap || 0);
    }, 0);
  let scale = 1;
  let width = measure(1);
  if (maxWidth && width > maxWidth) {
    scale = maxWidth / width;
    width = measure(scale);
  }
  let cx = align === "right" ? x - width : align === "center" ? x - width / 2 : x;
  ctx.textAlign = "left";
  parts.forEach((p) => {
    ctx.font = fontOf(p, scale);
    ctx.fillStyle = p.color || NAVY;
    ctx.fillText(p.text, cx, y);
    cx += ctx.measureText(p.text).width + (p.gap || 0);
  });
  return width;
}

const text = (ctx, value, x, y, style = {}) =>
  runs(ctx, [{ text: value, ...style }], x, y, { align: style.align, maxWidth: style.maxWidth });

// Capitals with even letter spacing (canvas letterSpacing isn't everywhere).
function spaced(ctx, value, x, y, { size, weight = "700", color = GOLD, spacing = 10, align = "center" }) {
  ctx.font = `${weight} ${size}px ${LATIN}`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  const chars = [...value];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + spacing;
  });
  return total;
}

function rule(ctx, x1, y, x2, { color = GOLD, width = 3, dash = [] } = {}) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.lineTo(x2, y);
  ctx.stroke();
  ctx.restore();
}

function diamond(ctx, x, y, r, color = GOLD) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

// Letters around a circle: across the top (left to right) or the bottom (still upright).
function arcText(ctx, value, cx, cy, r, side, font, spacing) {
  ctx.save();
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const chars = [...value];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  const dir = side === "top" ? 1 : -1;
  let angle = side === "top" ? -Math.PI / 2 - total / r / 2 : Math.PI / 2 + total / r / 2;
  chars.forEach((c, i) => {
    angle += (dir * widths[i]) / 2 / r;
    ctx.save();
    ctx.translate(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.rotate(angle + (dir * Math.PI) / 2);
    ctx.fillText(c, 0, 0);
    ctx.restore();
    angle += (dir * (widths[i] / 2 + spacing)) / r;
  });
  ctx.restore();
}

// Small repeatable random numbers, so the stamp's worn ink is the same on
// every download of the same receipt.
function seeded(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// A round rubber "PAID" stamp with the date paid.
function drawStamp(ctx, cx, cy, member) {
  const size = 400;
  const c = size / 2;
  const s = document.createElement("canvas");
  s.width = size;
  s.height = size;
  const g = s.getContext("2d");
  g.strokeStyle = STAMP;
  g.fillStyle = STAMP;
  g.lineWidth = 9;
  circle(g, c, c, 152);
  g.lineWidth = 3;
  circle(g, c, c, 108);
  arcText(g, "TAMIL LITERARY ASSOCIATION", c, c, 130, "top", `700 19px ${LATIN}`, 2);
  arcText(g, stampDate(member.paid_on), c, c, 130, "bottom", `700 23px ${LATIN}`, 4);
  g.textAlign = "center";
  g.textBaseline = "middle";
  [c - 130, c + 130].forEach((x) => diamond(g, x, c, 7, STAMP));
  g.font = `900 72px ${LATIN}`;
  g.fillText("PAID", c, c - 12);
  g.font = `400 ${ta(21)}px ${TAMIL_BODY}`;
  g.fillText("செலுத்தப்பட்டது", c, c + 44);

  const rand = seeded(member.receipt_no || member.name);
  g.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 520; i += 1) {
    g.globalAlpha = 0.2 + rand() * 0.6;
    g.beginPath();
    g.arc(rand() * size, rand() * size, 0.8 + rand() * 2.8, 0, Math.PI * 2);
    g.fill();
  }

  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.translate(cx, cy);
  ctx.rotate(-0.2);
  ctx.drawImage(s, -c, -c);
  ctx.restore();
}

// The signer's name written in a handwriting font, sitting on the signature
// line with a slight upward slant, like a pen signature.
function drawSignature(ctx, name, cx, baseline, maxWidth) {
  ctx.save();
  ctx.translate(cx, baseline);
  ctx.rotate(-0.06);
  text(ctx, name, 0, 0, { size: 150, family: SIGNATURE, color: INK, align: "center", maxWidth });
  ctx.restore();
}

// ---- The receipt -------------------------------------------------------------------

// member: { name, batch, faculty, department, fee_amount, paid_on, receipt_no,
//           receipt_signer_name, receipt_signer_title }
// config: { treasurer_name, treasurer_title } - used when the receipt was
//         issued before a treasurer was set.
export async function drawReceipt(member, config = {}) {
  await loadFonts();
  const logo = await loadLogo();

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Faint logo behind the details.
  if (logo) {
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.drawImage(logo, W / 2 - 430, 560, 860, 860);
    ctx.restore();
  }

  // ---- Header band: who issued it, receipt number and date
  const band = ctx.createLinearGradient(0, 0, W, 0);
  band.addColorStop(0, NAVY_LIGHT);
  band.addColorStop(0.6, NAVY);
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, W, 392);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, 392, W, 10);

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(262, 196, 146, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 7;
  circle(ctx, 262, 196, 146);
  if (logo) ctx.drawImage(logo, 262 - 118, 196 - 114, 236, 236);

  text(ctx, "தமிழ் இலக்கிய மன்றம்", 452, 190, { size: 100, family: TAMIL_HEAD, color: "#ffffff", maxWidth: 1080 });
  text(ctx, "Tamil Literary Association", 456, 266, { size: 54, weight: "700", color: GOLD_LIGHT });
  text(ctx, "University of Moratuwa · Sri Lanka", 456, 328, { size: 38, color: MIST });

  const right = W - 150;
  runs(
    ctx,
    [
      { text: "பற்றுச்சீட்டு இல.", size: ta(26), family: TAMIL_BODY, color: GOLD_LIGHT, gap: 14 },
      { text: "·  RECEIPT NO.", size: 27, weight: "600", color: GOLD_LIGHT },
    ],
    right,
    140,
    { align: "right" }
  );
  text(ctx, member.receipt_no || "—", right, 220, { size: 72, weight: "800", color: "#ffffff", align: "right", maxWidth: 640 });
  runs(
    ctx,
    [
      { text: "திகதி", size: ta(26), family: TAMIL_BODY, color: GOLD_LIGHT, gap: 14 },
      { text: "·  DATE PAID", size: 27, weight: "600", color: GOLD_LIGHT },
    ],
    right,
    292,
    { align: "right" }
  );
  text(ctx, longDate(member.paid_on), right, 352, { size: 48, weight: "600", color: "#ffffff", align: "right" });

  // ---- Title
  text(ctx, "அங்கத்துவக் கட்டணப் பற்றுச்சீட்டு", W / 2, 522, {
    size: 80,
    family: TAMIL_HEAD,
    align: "center",
    maxWidth: W - 400,
  });
  const titleWidth = spaced(ctx, "MEMBERSHIP FEE RECEIPT", W / 2, 594, { size: 40, spacing: 12 });
  const gapX = titleWidth / 2 + 46;
  rule(ctx, W / 2 - gapX - 230, 580, W / 2 - gapX, { width: 3 });
  rule(ctx, W / 2 + gapX, 580, W / 2 + gapX + 230, { width: 3 });
  diamond(ctx, W / 2 - gapX, 580, 10);
  diamond(ctx, W / 2 + gapX, 580, 10);

  // ---- Details: Tamil label over English label, value on a dotted line
  const left = 170;
  const valueX = 790;
  const end = W - 170;
  const half = 1340; // where the right half of a split row starts
  const halfValueX = half + 290;

  const rows = [
    { ta: "நன்றியுடன் பெற்றது", en: "Received with thanks from", value: member.name, size: 62 },
    {
      ta: "தொகுதி",
      en: "Batch",
      value: String(member.batch),
      size: 54,
      right: member.faculty ? { ta: "பீடம்", en: "Faculty", value: member.faculty, size: 50 } : null,
    },
    member.department && { ta: "துறை", en: "Department", value: member.department, size: 50 },
    { ta: "தொகை (எழுத்தில்)", en: "Amount in words", value: rupeesInWords(member.fee_amount), size: 50 },
    {
      ta: "விடயம்",
      en: "Being",
      parts: [
        { text: "Membership fee", size: 50, weight: "700", gap: 18 },
        { text: "·", size: 50, weight: "700", color: GOLD, gap: 18 },
        { text: "அங்கத்துவக் கட்டணம்", size: 58, family: TAMIL_BODY },
      ],
    },
  ].filter(Boolean);

  const label = (r, x, y, width) => {
    text(ctx, r.ta, x, y - 12, { size: ta(28), family: TAMIL_BODY, color: GREY, maxWidth: width });
    text(ctx, r.en, x, y + 30, { size: 29, color: GREY, maxWidth: width });
  };
  const value = (r, x, y, lineEnd) => {
    const parts = r.parts || [{ text: r.value, size: r.size, weight: "700" }];
    runs(ctx, parts, x, y + 22, { maxWidth: lineEnd - x - 10 });
    rule(ctx, x, y + 48, lineEnd, { color: DOTS, width: 3, dash: [3, 10] });
  };

  const top = 700;
  const step = Math.min(132, (1210 - top) / Math.max(1, rows.length - 1));
  rows.forEach((r, i) => {
    const y = top + i * step;
    label(r, left, y, valueX - left - 30);
    if (r.right) {
      value(r, valueX, y, half - 60);
      label(r.right, half, y, halfValueX - half - 24);
      value(r.right, halfValueX, y, end);
    } else {
      value(r, valueX, y, end);
    }
  });

  // ---- Amount, stamp and signature
  const boxY = 1318;
  ctx.fillStyle = CREAM;
  ctx.fillRect(left, boxY, 720, 200);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 5;
  ctx.strokeRect(left, boxY, 720, 200);
  ctx.fillStyle = GOLD;
  ctx.fillRect(left, boxY, 16, 200);
  runs(
    ctx,
    [
      { text: "தொகை", size: ta(26), family: TAMIL_BODY, color: GREY, gap: 14 },
      { text: "·  AMOUNT RECEIVED", size: 27, weight: "600", color: GREY },
    ],
    left + 52,
    boxY + 62
  );
  text(ctx, formatRupees(member.fee_amount), left + 52, boxY + 162, { size: 92, weight: "800", maxWidth: 620 });

  drawStamp(ctx, 1262, 1446, member);

  const sigL = 1650;
  const sigR = end;
  const sigX = (sigL + sigR) / 2;
  const signer = (member.receipt_signer_name || config.treasurer_name || "").trim();
  const title = (member.receipt_signer_title || config.treasurer_title || "Treasurer").trim();
  if (signer) drawSignature(ctx, signer, sigX, 1418, sigR - sigL - 80);
  rule(ctx, sigL, 1440, sigR, { color: NAVY, width: 3 });
  if (signer) text(ctx, signer, sigX, 1500, { size: 46, weight: "700", align: "center", maxWidth: sigR - sigL });
  runs(
    ctx,
    [
      { text: "பொருளாளர்", size: ta(28), family: TAMIL_BODY, color: GREY, gap: 14 },
      { text: `·  ${title}`, size: 32, color: GREY },
    ],
    sigX,
    signer ? 1556 : 1500,
    { align: "center", maxWidth: sigR - sigL }
  );

  // ---- Footer
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, H - 118, W, 6);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, H - 112, W, 112);
  text(
    ctx,
    "Computer-generated receipt  ·  Tamil Literary Association, University of Moratuwa  ·  Membership can be checked at tlauom.com/members",
    W / 2,
    H - 44,
    { size: 30, color: MIST, align: "center", maxWidth: W - 300 }
  );

  return canvas;
}

const fileName = (member, ext) =>
  `TLA-receipt-${member.receipt_no || "draft"}-${String(member.name).replace(/[^\w]+/g, "-").replace(/^-|-$/g, "")}.${ext}`;

export async function downloadReceiptPdf(member, config) {
  const canvas = await drawReceipt(member, config);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a5", orientation: "landscape" });
  pdf.setProperties({ title: `Membership fee receipt ${member.receipt_no || ""}`.trim(), author: "Tamil Literary Association" });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 210, 148);
  pdf.save(fileName(member, "pdf"));
}

export async function downloadReceiptImage(member, config) {
  const canvas = await drawReceipt(member, config);
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName(member, "png");
  link.click();
}
