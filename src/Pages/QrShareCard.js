import React, { useCallback, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// QR generator packaged as a self-contained card.
// `baseUrl` overrides the default URL; all other props customise the copy.
export default function QrShareCard({
  baseUrl,
  title = "Share this frame",
  description = "Print or display this QR at your event. Anyone who scans it lands straight on the photo-frame editor no app, no sign-in.",
  caption = "Scan to open the editor",
  downloadFilename = "qr-code.png",
}) {
  const defaultUrl = useMemo(() => {
    if (baseUrl) return baseUrl;
    if (typeof window === "undefined") return "/frame";
    return `${window.location.origin}/frame`;
  }, [baseUrl]);

  const [url, setUrl] = useState(defaultUrl);
  const [copied, setCopied] = useState(false);
  const qrWrapRef = useRef(null);

  const downloadQr = useCallback(() => {
    const canvas = qrWrapRef.current && qrWrapRef.current.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = downloadFilename;
    a.href = canvas.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [downloadFilename]);

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
            value={url || " "}
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

        <button
          type="button"
          className="frame-btn frame-btn-primary admin-download"
          onClick={downloadQr}
        >
          Download QR
        </button>
      </div>
    </div>
  );
}
