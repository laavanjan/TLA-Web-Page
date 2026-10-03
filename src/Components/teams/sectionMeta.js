import {
  FaAlignLeft,
  FaHistory,
  FaUsers,
  FaYoutube,
  FaInstagram,
  FaTrophy,
  FaImages,
} from "react-icons/fa";

export const SECTION_META = {
  text: { icon: FaAlignLeft, label: "Text", hint: "A heading, paragraphs and an optional button" },
  years: { icon: FaUsers, label: "Team by year", hint: "Coordinators and members for each year, past and present" },
  timeline: { icon: FaHistory, label: "Milestones", hint: "Key moments, one line per year" },
  youtube: { icon: FaYoutube, label: "YouTube videos", hint: "Paste video links and they play on the page" },
  instagram: { icon: FaInstagram, label: "Instagram posts", hint: "Paste post or reel links to embed them" },
  competitions: { icon: FaTrophy, label: "Competitions", hint: "Countdown, register button, winners, recording" },
  gallery: { icon: FaImages, label: "Photo gallery", hint: "Upload photos, or paste Drive/Cloudinary links" },
};
