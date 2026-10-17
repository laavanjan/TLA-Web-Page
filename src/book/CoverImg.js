// A book's cover picture (see coverUrl in books.js): kind "card" (the
// uploaded photo, for the /books cards) or "page" (the PDF's first page, for
// the book's own page). Falls back to the other picture once if the first one
// can't be loaded; renders `empty` when the book has no picture at all.
import React from "react";
import { useCover } from "./books";

export default function CoverImg({ book, width = 600, kind = "card", empty = null, ...imgProps }) {
  const [src, onError] = useCover(book, width, kind);
  if (!src) return empty;
  return <img key={src} src={src} onError={onError} alt="" {...imgProps} />;
}
