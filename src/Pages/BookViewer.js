import React from "react";
import { Helmet } from "react-helmet";

import LotusDivider from "./LotusDivider";
import "./Frame.css";
import "./BookViewer.css";

const FILE_ID = "1tVvDgXaQXHyEvBQOUYnu5O0oIjpdZDbS";
const PREVIEW_URL = `https://drive.google.com/file/d/${FILE_ID}/preview`;
const DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

export default function BookViewer() {
  return (
    <div className="frame-page">
      <Helmet>
        <title>TLA 26 — நூல் | தமிழ் இலக்கிய மன்றம்</title>
        <meta
          name="description"
          content="தமிழ் இலக்கிய மன்றம் — TLA 26 நூல். Read and download the TLA 26 book."
        />
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">TLA 26 · நூல்</span>
      </header>

      <div className="book-viewer-wrap">
        <iframe
          src={PREVIEW_URL}
          className="book-viewer-iframe"
          title="TLA 26 Book"
          allow="autoplay"
        />

        <a
          href={DOWNLOAD_URL}
          className="frame-btn frame-btn-primary book-viewer-download"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⬇&nbsp; Download PDF
        </a>
      </div>
    </div>
  );
}
