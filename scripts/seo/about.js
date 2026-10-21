// Who TLA is, as short self-contained facts in plain English: the sentences an
// answer engine can quote word for word. Used for the home page's raw HTML and
// llms.txt. Every fact here is also in the help assistant's answers
// (src/shared/faq/faqData.js) - keep them in step.
const ABOUT_TITLE = "About the Tamil Literary Association (TLA UoM)";

const ABOUT_FACTS = [
  "The Tamil Literary Association (TLA) of the University of Moratuwa, Sri Lanka, is a student organisation run by the university's Tamil students. In Tamil it is மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றம்.",
  'TLA was founded in 1968 as the "Tamil Mantram" and has run for more than five decades. It preserves and promotes Tamil arts, culture, literature and heritage.',
  "TLA is based at the University of Moratuwa in Katubedda, Sri Lanka. Its biggest events, Thamilaruvi and the Sotkanai grand final, are held in Colombo.",
  "Thamilaruvi is TLA's biggest annual arts festival, held in Colombo every year. TLA's magazine is launched there.",
  "Sotkanai is TLA's all-island debating competition for Tamil school students in Sri Lanka: district rounds first, then a grand final in Colombo.",
  "TLA also runs Brammam, online competitions in writing, photography, digital art and public speaking for Tamils around the world; Niraali, an IT innovation competition for school students; and Jeevanathi, its charity work for people in need.",
  'On campus, TLA celebrates Thai Pongal and Vani Vizha, runs blood donation camps and Aramiyam career guidance. Its motto is "தமிழுக்காய் நாம் ! நமக்கேயான தமிழ் !!" ("We are for Tamil, and Tamil is ours!").',
];

// The pages an answer engine should know about, in order.
const KEY_PAGES = [
  ["/", "Home", "Who TLA is and everything it runs"],
  ["/faq", "Questions and answers", "Answers about TLA's events, competitions, joining a team, books and contact, in Tamil and English"],
  ["/history", "History", "TLA's history from 1968 to today"],
  ["/events/thamilaruvi", "Thamilaruvi", "TLA's annual arts festival in Colombo"],
  ["/events/sotkanai", "Sotkanai", "The all-island school debating competition"],
  ["/events/brammam", "Brammam", "Online competitions for Tamils worldwide"],
  ["/ideathon", "Niraali", "IT innovation competition for school students"],
  ["/events/jeevanathi", "Jeevanathi", "TLA's charity work"],
  ["/books", "Books", "TLA's magazines and books to read and download"],
  ["/teams", "Teams", "TLA's teams and how to join one"],
  ["/members", "Members", "TLA's members"],
  ["/contact", "Contact", "Email, phone and social media"],
];

module.exports = { ABOUT_TITLE, ABOUT_FACTS, KEY_PAGES };
