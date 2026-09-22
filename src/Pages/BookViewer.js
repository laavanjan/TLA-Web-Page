import React from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";

import LotusDivider from "./LotusDivider";
import "./Frame.css";
import "./BookViewer.css";
import { BOOKS } from "./booksData";

const drivePreviewUrl = (fileId) =>
  `https://drive.google.com/file/d/${fileId}/preview`;
const driveDownloadUrl = (fileId) =>
  `https://drive.google.com/uc?export=download&id=${fileId}`;
// Native Google Docs (as opposed to a file uploaded to Drive) are fetched
// through the export endpoint, not the uc?export=download one.
const docsExportUrl = (fileId, format) =>
  `https://docs.google.com/document/d/${fileId}/export?format=${format}`;

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3v13M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

export default function BookViewer() {
  const { slug } = useParams();
  const book = BOOKS[slug];

  if (!book) {
    return (
      <div className="frame-page">
        <header className="frame-topbar">
          <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
          <LotusDivider />
          <span className="frame-subtitle">நூல்</span>
        </header>
        <div className="book-viewer-not-found">
          <h2>நூல் காணப்படவில்லை</h2>
          <p>கோரப்பட்ட நூல் இங்கு இல்லை.</p>
          <Link to="/books" className="frame-btn frame-btn-primary">
            நூல்களுக்குத் திரும்ப
          </Link>
        </div>
      </div>
    );
  }

  const pdfPreviewUrl = drivePreviewUrl(book.pdfFileId);
  const pdfDownloadUrl = driveDownloadUrl(book.pdfFileId);
  const docDownloadUrl = book.docFileId
    ? docsExportUrl(book.docFileId, "docx")
    : null;

  return (
    <div className="frame-page">
      <Helmet>
        <title>{book.title} - நூல் | தமிழ் இலக்கிய மன்றம்</title>
        <meta name="description" content={book.description} />
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">{book.subtitle}</span>
      </header>

      <div className="book-viewer-wrap">
        <iframe
          src={pdfPreviewUrl}
          className="book-viewer-iframe"
          title={book.title}
          allow="autoplay"
        />

        <div className="frame-actions">
          <a
            href={pdfDownloadUrl}
            className="frame-btn frame-btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DownloadIcon />
            PDF பதிவிறக்க
          </a>
          {docDownloadUrl && (
            <a
              href={docDownloadUrl}
              className="frame-btn frame-btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              <DownloadIcon />
              Document பதிவிறக்க
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
