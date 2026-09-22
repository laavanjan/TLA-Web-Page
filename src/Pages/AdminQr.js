import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import LotusDivider from "./LotusDivider";
import QrShareCard from "./QrShareCard";
import "./Frame.css";
import "./Admin.css";

// The QR-code generator tool, opened from the admin dashboard.
export default function AdminQr() {
  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>QR Code · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · QR Code</span>
      </header>

      <div className="admin-hub">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>
        <QrShareCard />
        <QrShareCard
          baseUrl={typeof window !== "undefined" ? window.location.origin : ""}
          title="QR Code Generator"
          description="Paste any link below to generate a scannable QR code for it — download as PNG or PDF."
          caption="Scan to open the link"
          downloadFilename="qr-code"
        />
      </div>
    </div>
  );
}
