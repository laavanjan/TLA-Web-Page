// /books/:slug - one book's page: a hero with the book standing in 3D, its
// details and download buttons, then the reader. An uploaded PDF opens in the
// page-turning reader (FlipBook); a Google Drive book in Drive's own viewer.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { FaBookOpen, FaDownload, FaFileWord, FaShareAlt, FaArrowLeft, FaGoogleDrive } from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import FlipBook from "../Components/book/flipbook/FlipBook";
import {
  useBook,
  usePageCount,
  pdfViewUrl,
  pdfDownloadUrl,
  docDownloadUrl,
  pdfPageImage,
  useCover,
  shareImageUrl,
  driveViewLink,
} from "../book/books";
import "./Frame.css";
import "./BookViewer.css";

const SITE = "தமிழ் இலக்கிய மன்றம்";

export default function BookViewer() {
  const { slug } = useParams();
  const book = useBook(slug);
  const pages = usePageCount(book);

  if (book === undefined) return <BookSkeleton />;
  if (!book) return <BookNotFound />;
  return <BookPage book={book} pages={pages} />;
}

function BookPage({ book, pages }) {
  const [copied, setCopied] = useState(false);
  const readerRef = useRef(null);
  const uploaded = book.source === "upload";
  // The book's own page shows the PDF's first page (sharper, as it's big here),
  // or the uploaded photo if the page can't load. Link previews use the photo.
  const [cover, onCoverError] = useCover(book, 800, "page");
  const shareImage = shareImageUrl(book);
  const pdfDownload = pdfDownloadUrl(book);
  const docDownload = docDownloadUrl(book);
  const description = book.description || `${SITE} — ${book.title} நூல்.`;
  const eyebrow = book.category === "student" ? "பல்கலைக்கழக மாணவர் வெளியீடு" : `${SITE} · வெளியீடு`;
  // A thicker book for more pages, within reason.
  const thickness = pages ? Math.round(Math.min(40, Math.max(10, pages * 0.32))) : 20;
  const pdfUrl = book.pdf_url;
  const pageSrc = useCallback((n, w) => pdfPageImage({ pdf_url: pdfUrl }, n, w), [pdfUrl]);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  // A link with #page=… (from the reader) opens straight at the reader.
  useEffect(() => {
    if (/page=\d+/.test(window.location.hash) && readerRef.current) {
      readerRef.current.scrollIntoView({ block: "start" });
    }
  }, []);

  const startReading = (e) => {
    e.preventDefault();
    if (readerRef.current) readerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: book.title, text: `${book.title} · ${SITE}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="bk">
      <Helmet>
        <title>{`${book.title} - நூல் | ${SITE}`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={book.title} />
        <meta property="og:description" content={description} />
        {shareImage && /^https?:/.test(shareImage) && <meta property="og:image" content={shareImage} />}
      </Helmet>

      <section className="bk-hero">
        {cover && <div className="bk-ambient" style={{ backgroundImage: `url("${cover}")` }} aria-hidden="true" />}
        {book.year && (
          <span className="bk-watermark" aria-hidden="true">
            {book.year}
          </span>
        )}

        <div className="bk-hero-inner">
          <a href="#read" className="bk-object" onClick={startReading} aria-label="படிக்கத் தொடங்கு">
            <div className="bk-book3d" style={{ "--thick": `${thickness}px` }}>
              <div className="bk-book3d-cover">
                {cover ? <img src={cover} alt={`${book.title} அட்டை`} onError={onCoverError} /> : <span className="bk-book3d-blank">{book.title}</span>}
                <span className="bk-book3d-crease" />
                <span className="bk-book3d-gloss" />
              </div>
              <span className="bk-book3d-pages" />
              <span className="bk-book3d-back" />
              <span className="bk-ribbon" aria-hidden="true" />
            </div>
          </a>

          <div className="bk-info">
            <Link to="/books" className="bk-back">
              <FaArrowLeft /> நூல்கள்
            </Link>
            <span className="bk-eyebrow">{eyebrow}</span>
            <h1 className="bk-title">{book.title}</h1>
            {book.author && (
              // TLA publications list their editors; a student's book its author.
              <div className="bk-author">
                <span className="bk-author-label">
                  {book.category === "student" ? "எழுத்தாளர்" : "இதழாசிரியர்கள்"}
                  <small>{book.category === "student" ? " (Author)" : " (Editors)"}</small>:
                </span>
                <span className="bk-author-names">
                  {book.author
                    .split(/\s*[,،;]\s*/)
                    .filter(Boolean)
                    .map((name, i) => (
                      <span key={i} className="bk-author-name">
                        {name}
                      </span>
                    ))}
                </span>
              </div>
            )}

            <ul className="bk-facts">
              {book.year && (
                <li>
                  <b>{book.year}</b>
                  <span>ஆண்டு</span>
                </li>
              )}
              {pages > 0 && (
                <li>
                  <b>{pages}</b>
                  <span>பக்கங்கள்</span>
                </li>
              )}
              <li>
                <b>{docDownload ? "PDF + Word" : "PDF"}</b>
                <span>வடிவம்</span>
              </li>
            </ul>

            {book.description && <div className="bk-desc">{book.description}</div>}

            <div className="bk-actions">
              <a href="#read" className="bk-btn is-primary" onClick={startReading}>
                <FaBookOpen /> படிக்கத் தொடங்கு
              </a>
              <a href={pdfDownload} className="bk-btn" target="_blank" rel="noopener noreferrer">
                <FaDownload /> PDF
              </a>
              {docDownload && (
                <a href={docDownload} className="bk-btn" target="_blank" rel="noopener noreferrer">
                  <FaFileWord /> Word
                </a>
              )}
              <button type="button" className="bk-btn is-icon" onClick={share} aria-label="பகிர்" title="பகிர்">
                <FaShareAlt />
              </button>
            </div>
            <span className={`bk-toast ${copied ? "is-on" : ""}`} role="status">
              {copied ? "இணைப்பு நகலெடுக்கப்பட்டது" : ""}
            </span>
          </div>
        </div>
      </section>

      <section id="read" ref={readerRef} className="bk-reader">
        <div className="bk-reader-head">
          <LotusDivider />
          <span>வாசிப்பு அறை</span>
        </div>

        {uploaded ? (
          pages > 0 ? (
            <FlipBook count={pages} title={book.title} pageSrc={pageSrc} />
          ) : (
            <div className="bk-reader-wait">
              <div className="bk-reader-wait-page" style={cover ? { backgroundImage: `url("${cover}")` } : undefined} />
              <span>பக்கங்கள் தயாராகின்றன…</span>
            </div>
          )
        ) : (
          <div className="bk-drive">
            <iframe src={pdfViewUrl(book)} title={book.title} allow="autoplay" className="bk-drive-frame" />
            <a href={driveViewLink(book.drive_file_id)} className="bk-drive-link" target="_blank" rel="noopener noreferrer">
              <FaGoogleDrive /> Google Drive-இல் திறக்க
            </a>
          </div>
        )}

        <Link to="/books" className="bk-more">
          <FaArrowLeft /> மற்ற நூல்கள்
        </Link>
      </section>
    </div>
  );
}

function BookSkeleton() {
  return (
    <div className="bk">
      <section className="bk-hero">
        <div className="bk-hero-inner">
          <div className="bk-object">
            <div className="bk-skel bk-skel-book" />
          </div>
          <div className="bk-info">
            <div className="bk-skel bk-skel-line" style={{ width: "40%" }} />
            <div className="bk-skel bk-skel-title" />
            <div className="bk-skel bk-skel-line" style={{ width: "60%" }} />
            <div className="bk-skel bk-skel-line" style={{ width: "50%" }} />
          </div>
        </div>
      </section>
    </div>
  );
}

function BookNotFound() {
  return (
    <div className="bk">
      <section className="bk-hero bk-missing">
        <div className="bk-missing-inner">
          <LotusDivider />
          <h1 className="bk-title">நூல் காணப்படவில்லை</h1>
          <div className="bk-desc">கோரப்பட்ட நூல் இங்கு இல்லை, அல்லது அது அகற்றப்பட்டுள்ளது.</div>
          <div className="bk-actions">
            <Link to="/books" className="bk-btn is-primary">
              <FaArrowLeft /> நூல்களுக்குத் திரும்ப
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
