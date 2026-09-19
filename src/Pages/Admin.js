import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import LotusDivider from "./LotusDivider";
import "./Frame.css";
import "./Admin.css";

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <g fill="currentColor">
        <path d="M3 3h7v7H3V3zm2 2v3h3V5H5z" />
        <path d="M14 3h7v7h-7V3zm2 2v3h3V5h-3z" />
        <path d="M3 14h7v7H3v-7zm2 2v3h3v-3H5z" />
        <path d="M14 14h3v3h-3v-3zM18 14h3v3h-3v-3zM14 18h3v3h-3v-3zM18 18h3v3h-3v-3z" />
      </g>
    </svg>
  );
}

// Admin dashboard: a grid of tools. Each tile links to its own page.
export default function Admin() {
  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Admin · தமிழ் இலக்கிய மன்றம்</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin Dashboard</span>
      </header>

      <div className="admin-dash">
        <Link className="admin-tile" to="/admin/qr">
          <span className="admin-tile-ic">
            <QrIcon />
          </span>
          <span className="admin-tile-title">QR Code Generator</span>
          <span className="admin-tile-desc">
            Create a QR that opens the photo-frame editor — ready to print or
            share.
          </span>
          <span className="admin-tile-go">Open →</span>
        </Link>

        <Link className="admin-tile" to="/admin/stickers">
          <span className="admin-tile-ic">🎨</span>
          <span className="admin-tile-title">Stickers</span>
          <span className="admin-tile-desc">
            Choose which sticker designs appear in the editor.
          </span>
          <span className="admin-tile-go">Open →</span>
        </Link>

        <Link className="admin-tile" to="/admin/account">
          <span className="admin-tile-ic">🔑</span>
          <span className="admin-tile-title">Account & Password</span>
          <span className="admin-tile-desc">
            Change your admin email or reset your password.
          </span>
          <span className="admin-tile-go">Open →</span>
        </Link>
      </div>
    </div>
  );
}
