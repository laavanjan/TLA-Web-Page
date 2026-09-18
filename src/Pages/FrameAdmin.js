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
    if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
  }, [url]);

  return (
    <div className="frame-page">
      <Helmet>
        <title>Frame QR · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Photo frame · QR</span>
      </header>

      <div className="admin-card">
        <div className="admin-qr" ref={qrWrapRef}>
          <QRCodeCanvas
            value={url || " "}
            size={240}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#0d1017"
          />
        </div>

        <p className="admin-caption">Scan to open the photo-frame page</p>

        <label className="admin-label" htmlFor="frame-url">
          Page URL
        </label>
        <input
          id="frame-url"
          className="admin-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          spellCheck={false}
        />

        <div className="frame-actions" style={{ marginTop: 18 }}>
          <button type="button" className="frame-btn frame-btn-ghost" onClick={copyUrl}>
            Copy link
          </button>
          <button type="button" className="frame-btn frame-btn-primary" onClick={downloadQr}>
            Download QR
          </button>
        </div>
      </div>

      <p className="frame-tip" style={{ maxWidth: 320 }}>
        Print or display this QR. Anyone who scans it lands directly on the frame
        editor to add their photo.
      </p>
    </div>
  );
}
