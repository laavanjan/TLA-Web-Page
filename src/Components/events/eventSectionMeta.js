import {
  FaAlignLeft,
  FaStar,
  FaListUl,
  FaImages,
  FaTrophy,
  FaGavel,
  FaThLarge,
  FaFlagCheckered,
  FaHandshake,
  FaAddressBook,
  FaInfoCircle,
  FaLayerGroup,
  FaHistory,
  FaYoutube,
  FaInstagram,
  FaBolt,
} from "react-icons/fa";

// Shown in the admin's "Add a section" picker and on the section cards, and
// beside each heading on the page. `heading` is the hint under the heading box.
export const EVENT_SECTION_META = {
  intro: {
    icon: FaStar,
    label: "Introduction",
    hint: "The big opening: name, illustration, a few lines and a button",
    heading: "Leave empty to use the event name.",
    once: true,
  },
  text: { icon: FaAlignLeft, label: "Text", hint: "A heading, paragraphs and an optional button" },
  agenda: { icon: FaListUl, label: "Programme", hint: "Date, time, venue and the order of the day" },
  gallery: { icon: FaImages, label: "Photo gallery", hint: "Upload photos, or paste Drive/Cloudinary links" },
  awards: { icon: FaTrophy, label: "Winners & prizes", hint: "Places, winners and prizes, each with a picture" },
  rules: { icon: FaGavel, label: "Rules", hint: "A numbered list, optionally hidden behind a button" },
  cards: { icon: FaThLarge, label: "Cards", hint: "Projects or sub-events with a picture, text and photos" },
  competitions: { icon: FaFlagCheckered, label: "Competitions", hint: "Countdown, register button, winners, recording" },
  sponsors: { icon: FaHandshake, label: "Sponsors", hint: "Logos and a few words for each sponsor" },
  contacts: { icon: FaAddressBook, label: "Contacts", hint: "Names with phone numbers and emails" },
  facts: { icon: FaInfoCircle, label: "Key details", hint: "Label and value rows, like bank details" },
  editions: { icon: FaLayerGroup, label: "Past years", hint: "One entry per year, with its story, photos and video" },
  timeline: { icon: FaHistory, label: "Milestones", hint: "Key moments, one line per year" },
  youtube: { icon: FaYoutube, label: "YouTube videos", hint: "Paste video links and they play on the page" },
  instagram: { icon: FaInstagram, label: "Instagram posts", hint: "Paste post or reel links to embed them" },
  live: {
    icon: FaBolt,
    label: "Built-in block",
    hint: "Content that comes from the server (seminars, district results…)",
    heading: "Leave empty - the block has its own heading.",
  },
};

export const LIVE_BLOCK_META = {
  "sotkanai-districts": {
    label: "Sotkanai districts",
    text: "The provinces and districts with their photos and results, loaded from the server.",
  },
  "aramiyam-seminars": {
    label: "Aramiyam seminars",
    text: "The list of seminars with speakers and videos, loaded from the server.",
  },
  "ideathon-agenda": {
    label: "Ideathon timeline",
    text: "The day's timeline, loaded from the server.",
  },
  "ideathon-rules": {
    label: "Ideathon rules button",
    text: "The “போட்டி விதிமுறைகள்” button and its pop-up, loaded from the server.",
  },
  "brammam-about": {
    label: "Brammam competition page",
    text: "This competition's description, themes, deadline and winners, loaded from the server.",
  },
};
