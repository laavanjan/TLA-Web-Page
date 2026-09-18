import React, { useCallback, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Helmet } from "react-helmet";

import LotusDivider from "./LotusDivider";
import "./Frame.css";
import "./FrameAdmin.css";

export default function FrameAdmin() {
  const defaultUrl = useMemo(() => {
    if (typeof window === "undefined") return "/frame";
    return `${window.location.origin}/frame`;
  }, []);

  const [url, setUrl] = useState(defaultUrl);
  const [copied, setCopied] = useState(false);
  const qrWrapRef = useRef(null);

  const downloadQr = useCallback(() => {
    const canvas = qrWrapRef.current && qrWrapRef.current.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "frame-qr.png";
    a.href = canvas.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

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
    <div className="frame-page admin-page">
      <Helmet>
        <title>Frame QR · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Photo frame · QR</span>
      </header>

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
          <p className="admin-caption">Scan to open the editor</p>
        </div>

        <div className="admin-info">
          <h2 className="admin-title">Share this frame</h2>
          <p className="admin-desc">
            Print or display this QR at your event. Anyone who scans it lands
            straight on the photo-frame editor no app, no sign-in.
          </p>

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
    </div>
  );
}
