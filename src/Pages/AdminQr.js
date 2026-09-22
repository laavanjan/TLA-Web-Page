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
          baseUrl={
            typeof window !== "undefined"
              ? `${window.location.origin}/books/tla26`
              : "/books/tla26"
          }
          title="TLA 26 Book"
          description="Scan to read and download the TLA 26 book opens directly on any phone, no app needed."
          caption="Scan to read the book"
          downloadFilename="tla26-book-qr.png"
        />
        <QrShareCard
          baseUrl={
            typeof window !== "undefined"
              ? `${window.location.origin}/books/thamilaruvi26`
              : "/books/thamilaruvi26"
          }
          title="தமிழருவி'26 Book"
          description="Scan to read and download தமிழருவி'26 (PDF or Document) — opens directly on any phone, no app needed."
          caption="Scan to read the book"
          downloadFilename="thamilaruvi26-book-qr.png"
        />
      </div>
    </div>
  );
}
