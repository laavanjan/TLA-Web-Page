import React, { useCallback, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// QR generator packaged as a self-contained card.
// `baseUrl` overrides the default URL; all other props customise the copy.

// Links to this site get ?utm_source=qr added (unless they already carry a
// tag), so scans show up as "QR code / poster" on the Traffic page.
function tagForScans(url) {
  try {
    const u = new URL(url);
    if (typeof window === "undefined" || u.host !== window.location.host || u.searchParams.has("utm_source")) return url;
    u.searchParams.set("utm_source", "qr");
    u.searchParams.set("utm_medium", "print");
    return u.toString();
  } catch (e) {
    return url;
  }
}
export default function QrShareCard({
  baseUrl,
  title = "Share this frame",
  description = "Print or display this QR at your event. Anyone who scans it lands straight on the photo-frame editor no app, no sign-in.",
  caption = "Scan to open the editor",
  downloadFilename = "qr-code",
}) {
  const defaultUrl = useMemo(() => {
    if (baseUrl) return baseUrl;
    if (typeof window === "undefined") return "/frame";
    return `${window.location.origin}/frame`;
  }, [baseUrl]);

  const [url, setUrl] = useState(defaultUrl);
  const [copied, setCopied] = useState(false);
  const [countScans, setCountScans] = useState(true);
  const qrWrapRef = useRef(null);
  const qrValue = countScans ? tagForScans(url) : url;
  const tagged = qrValue !== url;

  const getCanvas = () =>
    qrWrapRef.current && qrWrapRef.current.querySelector("canvas");

  const downloadPng = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `${downloadFilename}.png`;
    a.href = canvas.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [downloadFilename]);

  const downloadPdf = useCallback(async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const { jsPDF } = await import("jspdf");
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const qrSize = 80;
    const x = (pageW - qrSize) / 2;
    const y = (pageH - qrSize) / 2 - 10;
    pdf.addImage(imgData, "PNG", x, y, qrSize, qrSize);
    pdf.setFontSize(11);
    pdf.setTextColor(80, 80, 80);
    pdf.text(url, pageW / 2, y + qrSize + 10, { align: "center" }); // the plain link reads better on paper
    pdf.save(`${downloadFilename}.pdf`);
  }, [downloadFilename, url]);

  const copyUrl = useCallback(() => {
    if (!navigator.clipboard) return;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  }, [url]);

  return (
    <div className="admin-card">
      <div className="admin-qr-col">
        <div className="admin-qr" ref={qrWrapRef}>
          <QRCodeCanvas
            value={qrValue || " "}
            size={220}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#0d1017"
          />
        </div>
        <p className="admin-caption">{caption}</p>
      </div>

      <div className="admin-info">
        <h2 className="admin-title">{title}</h2>
        <p className="admin-desc">{description}</p>

        <span className="admin-label">Page URL</span>
        <div className="admin-url-row">
          <input
            id="frame-url"
            className="admin-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            spellCheck={false}
          />
          <button
            type="button"
            className="admin-copy"
            onClick={copyUrl}
            title="Copy link"
            aria-label="Copy link"
          >
            {copied ? "✓" : "Copy"}
          </button>
        </div>

        <label className="admin-qr-count">
          <input type="checkbox" checked={countScans} onChange={(e) => setCountScans(e.target.checked)} />
          <span>
            Count scans on the Traffic page
            {countScans && !tagged && <small> (only for links to this website)</small>}
          </span>
        </label>

        <div className="admin-download-row">
          <button
            type="button"
            className="frame-btn frame-btn-ghost"
            onClick={downloadPng}
          >
            PNG
          </button>
          <button
            type="button"
            className="frame-btn frame-btn-primary"
            onClick={downloadPdf}
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
