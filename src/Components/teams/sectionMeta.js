import {
  FaAlignLeft,
  FaUserTie,
  FaHistory,
  FaUsers,
  FaYoutube,
  FaInstagram,
  FaTrophy,
  FaImages,
} from "react-icons/fa";

export const SECTION_META = {
  text: { icon: FaAlignLeft, label: "Text", hint: "A heading, paragraphs and an optional button" },
  people: { icon: FaUserTie, label: "People", hint: "Coordinators with photo, role, phone, LinkedIn" },
  timeline: { icon: FaHistory, label: "Timeline", hint: "Past coordinators or milestones by year" },
  members: { icon: FaUsers, label: "Members", hint: "Name chips for everyone on the team" },
  youtube: { icon: FaYoutube, label: "YouTube videos", hint: "Paste video links — they play on the page" },
  instagram: { icon: FaInstagram, label: "Instagram posts", hint: "Paste post or reel links to embed them" },
  competitions: { icon: FaTrophy, label: "Competitions", hint: "Countdown, register button, winners, recording" },
  gallery: { icon: FaImages, label: "Photo gallery", hint: "Google Drive or Cloudinary image links" },
};
