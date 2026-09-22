// Books shown at /books/:slug (see BookViewer.js). Frontend-only: each entry
// points at Google Drive file IDs, no backend involved — the same approach
// already used for TLA 26. `docFileId` is optional; when a book only has a
// PDF, the "Document" download button is simply not rendered.
export const BOOKS = {
  tla26: {
    title: "TLA 26",
    subtitle: "TLA 26 · நூல்",
    description:
      "தமிழ் இலக்கிய மன்றம் — TLA 26 நூல். Read and download the TLA 26 book.",
    pdfFileId: "1tVvDgXaQXHyEvBQOUYnu5O0oIjpdZDbS",
  },
};
