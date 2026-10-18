// The "read these next" shelf at the foot of a book's page: up to four other
// listed books, picked at random (a fresh pick on every visit), each a small
// standing book that tilts on hover, then a button to the whole library.
import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

import { useListedBooks } from "../book/books";
import CoverImg from "../book/CoverImg";
import LotusDivider from "./LotusDivider";

const SHOWN = 4;

// A cheap string hash, so one visit's random pick stays put while the book
// list refreshes underneath it (the cached list, then the live one).
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function BookSuggestions({ slug }) {
  const books = useListedBooks();
  const seed = useRef(String(Math.random())).current;

  const picks = useMemo(
    () =>
      (books || [])
        .filter((b) => b.slug !== slug)
        .map((b) => [hash(seed + b.slug), b])
        .sort((a, b) => a[0] - b[0])
        .slice(0, SHOWN)
        .map(([, b]) => b),
    [books, slug, seed]
  );

  return (
    <section className="bk-sg" aria-label="மற்ற நூல்கள்">
      {picks.length > 0 && (
        <>
          <div className="bk-sg-head">
            <LotusDivider />
            <span>இவற்றையும் படியுங்கள்</span>
            <small>More from our library</small>
          </div>

          <ul className="bk-sg-grid">
            {picks.map((b, i) => (
              <li key={b.slug} style={{ "--i": i }}>
                <Link to={`/books/${b.slug}`} className="bk-sg-card">
                  <span className="bk-sg-cover">
                    <CoverImg
                      book={b}
                      width={400}
                      alt={b.title}
                      loading="lazy"
                      empty={<span className="bk-sg-blank">{b.title}</span>}
                    />
                  </span>
                  <span className="bk-sg-title">{b.title}</span>
                  <span className="bk-sg-meta">{[b.year, b.category === "student" ? b.author : ""].filter(Boolean).join(" · ")}</span>
                  <span className="bk-sg-go">
                    படிக்க <FaArrowRight />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <Link to="/books" className="bk-sg-all">
        எல்லா நூல்களும் <FaArrowRight />
      </Link>
    </section>
  );
}
