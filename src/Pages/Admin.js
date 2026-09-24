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

// Each tile carries its own category (content/tools/account) — grouping is
// expressed through the tile's own tint + tag rather than separate sections,
// so it stays tidy no matter how many tiles land in any one category.
const TILES = [
  {
    to: "/admin/books",
    icon: "📖",
    title: "Book Submissions",
    desc: "Open/close submissions, set the deadline, dropdowns and limits.",
    category: "content",
  },
  {
    to: "/admin/contact",
    icon: "☎️",
    title: "Contact Info",
    desc: "Edit the email, phone and social media links shown on the Contact section.",
    category: "content",
  },
  {
    to: "/admin/qr",
    icon: <QrIcon />,
    title: "QR Code Generator",
    desc: "Create a QR that opens the photo-frame editor ready to print or share.",
    category: "tools",
  },
  {
    to: "/admin/stickers",
    icon: "🎨",
    title: "Stickers",
    desc: "Choose which sticker designs appear in the editor.",
    category: "tools",
  },
  {
    to: "/admin/account",
    icon: "🔑",
    title: "Account & Password",
    desc: "Change your admin email or reset your password.",
    category: "account",
  },
];

const CATEGORY_LABEL = {
  content: "Content",
  tools: "Tools",
  account: "Account",
};

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
        {TILES.map((tile) => (
          <Link
            key={tile.to}
            className={`admin-tile cat-${tile.category}`}
            to={tile.to}
          >
            <span className="admin-tile-tag">{CATEGORY_LABEL[tile.category]}</span>
            <span className="admin-tile-ic">{tile.icon}</span>
            <span className="admin-tile-title">{tile.title}</span>
            <span className="admin-tile-desc">{tile.desc}</span>
            <span className="admin-tile-go">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
