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
  thamilaruvi26: {
    title: "தமிழருவி'26",
    subtitle: "தமிழருவி'26 · நூல்",
    description:
      "தமிழ் இலக்கிய மன்றம் — தமிழருவி'26 நூல். PDF அல்லது Document வடிவில் படிக்கவும், பதிவிறக்கவும்.",
    pdfFileId: "1MAR2g8M0ZhaNip4eSHk6hfwBYoBVy3IF",
    docFileId: "1lyxBng9S_Kpjzh3EqBKi8WywJLtVoLXD",
  },
};
