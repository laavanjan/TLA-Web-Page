// A book's cover picture (see coverUrl in books.js). Falls back to the other
// picture once if the chosen one can't be loaded; renders `empty` when the
// book has no picture at all.
import React from "react";
import { useCover } from "./books";

export default function CoverImg({ book, width = 600, empty = null, ...imgProps }) {
  const [src, onError] = useCover(book, width);
  if (!src) return empty;
  return <img key={src} src={src} onError={onError} alt="" {...imgProps} />;
}
