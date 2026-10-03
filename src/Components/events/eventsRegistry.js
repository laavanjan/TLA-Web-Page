// The events the website ships with, and the content of each page as it was
// before the admin could edit it. An event with no saved page in the database
// shows this content, so the site looks the same until an admin publishes a
// change (the same idea as teamsData.js for team pages).
//
// The home page card text and illustration come from shared/EventDetails.js,
// photo lists from the old gallery components, so there is one copy of each.
import "./eventsAssets";
import { cultureEvent, competition, guidance, social, carnival } from "../../shared/EventDetails";
import { blankSection } from "../../shared/eventSections";
import { images as pongalPhotos } from "./thaipongal/pongalGallery/PongalGallery";
import { images as thamilaruviPhotos } from "./thamilaruvi/gallery/ThamilaruviGallery";
import { images as bloodPhotos } from "./blood-donation/gallery/BloodGallery";
import { images as kovilPhotos } from "./kovil/kovil-gallery/KovilGallery";
import { images as vaniPhotos } from "./vani-villa/gallery/VanivillaGallery";
import { images as foodPhotos } from "./food-festival/gallery/foodGallery";
import { images as moviePhotos } from "./movie-night/movie-gallery/MovieGallery";
import { images as pplPhotos } from "./ppl/pplGallery/PplGallery";
import { pplTeamImages } from "./ppl/teams/PplTeams";

// ---- Small builders ------------------------------------------------------------------

// Photo lists in the old galleries are { img, thumbnail }. Flickr "_o" originals
// are huge, so those use the thumbnail instead.
const photos = (prefix, list) =>
  list.map((p, i) => ({
    id: `${prefix}_${i}`,
    url: /_o\.(jpe?g|png)$/i.test(p.img) && p.thumbnail ? p.thumbnail : p.img || p.thumbnail,
    caption: "",
    width: 0,
    height: 0,
  }));

// A section with a stable id (so a built-in page compares equal to itself).
const sec = (eventId, key, type, fields = {}) => ({ ...blankSection(type), id: `${eventId}_${key}`, ...fields });
const rows = (prefix, list, make) => list.map((x, i) => ({ id: `${prefix}_${i}`, ...make(x, i) }));

const intro = (id, fields = {}) => sec(id, "intro", "intro", fields);
const gallery = (id, list, fields = {}) => sec(id, "gallery", "gallery", { images: photos(id, list), ...fields });
const live = (id, block, key = block) => sec(id, key, "live", { title: "", block });

const card = (id, source, fields = {}) => ({
  id,
  title: source.title.trim(),
  summary: source.descriiption.trim(),
  image: `asset:card/${id}`,
  ...fields,
});

// ---- Event content ----------------------------------------------------------------------

const POSTER_LEAD = "மொறட்டுவை பல்கலைக்கழக தமிழ் இலக்கிய மன்றம் பெருமையுடன் வழங்கும்";

const BRAMMAM_COMPETITIONS = [
  {
    slug: "eluthoviyam",
    title: "எழுத்தோவியம்",
    text: "தமிழ் மாணவர்களது சிந்தனையாக்க திறனை வெளிக்கொணர தமிழ் இலக்கிய மன்றத்தினால் நடத்தப்படும் எழுத்தாக்கப் போட்டியே எழுத்தோவியம் ஆகும்",
  },
  {
    slug: "olisuvadu",
    title: "ஒளிச்சுவடு",
    text: "தமிழ் மாணவர்களது புகைப்பட ஆற்றலை வெளிக்கொணர தமிழ் இலக்கிய மன்றத்தினால் நடத்தப்படும் போட்டியே ஒளிச்சுவடு ஆகும்",
  },
  {
    slug: "meerigai",
    title: "மீரிகை",
    text: "தமிழ் சமூகத்தின் கலையாக்க திறனை வெளிக்கொணர தமிழ் இலக்கிய மன்றத்தினால் நடத்தப்படும் எண்ணிமச்சித்திர போட்டியே மீரிகை ஆகும்",
  },
  {
    slug: "solalvalar",
    title: "சொலல்வலர்",
    text: "தமிழ் சமூகத்தின் பேச்சாற்றல் திறனை வெளிக்கொணர தமிழ் இலக்கிய மன்றத்தினால் நடத்தப்படும் போட்டியே சொல்வலர் ஆகும்",
  },
];

const sotkanaiRules = [
  "போட்டியில் பங்குபற்றும் அனைத்து மாணவர்களும் 31-01-2004 இற்குப் பின்னர் பிறந்தவர்களாக இருக்க வேண்டும்.",
  "விண்ணப்பப் படிவத்தில் போட்டியாளர்களின் முழுப்பெயர்கள் ஆங்கிலத்தில் எழுதப்படல் வேண்டும்.",
  "விண்ணப்பப் படிவத்தை பூர்த்தி செய்து பாடசாலை அதிபரின் கையொப்பத்தோடு போட்டி நடைபெறும் தினத்தன்று மாவட்ட இணைப்பாளரிடம் கையளிக்கவும்.",
  "உங்கள் பாடசாலையின் வருகையை முன்னதாக மாவட்ட நிலை போட்டி திகதிக்கு ஒரு கிழமைக்கு முன்னதாக மாவட்ட இணைப்பாளருக்கு தொலைபேசி மூலம் அறியத்தரவும்.",
  "வருகையைக் குறித்த திகதிக்கு முன்னர் உறுதிப்படுத்தாத அணிகள் போட்டியில் கலந்து கொள்ள அனுமதிக்கப்படமாட்டா.",
  "ஒவ்வொரு அணியும் 4 விவாதிகளையும், 1 உதிரி விவாதியையும் கொண்டிருக்கவேண்டும்.",
  "தலைவர் உட்பட அனைத்துப் போட்டியாளர்களும் பேசுவதற்கு 4 நிமிடங்களும் இறுதியில் தலைவரின் தொகுப்புரைக்கு 5 நிமிடங்களுமாக ஒரு அணிக்கு மொத்தமாக 21 நிமிடங்கள் வழங்கப்படும்.",
  "பேச்சுக்கள் தனிப்பட்ட தாக்குதல்களாகவோ, இனம், மதம், பிரிவினைகள் சார்ந்த அவதூறுகளாகவோ அமையக்கூடாது.",
  "போட்டியில் பங்குபற்றும் அணிகளுக்கான தரப்படுத்தல்கள் யாவும் இசற் புள்ளி (z-score) முறையில் அமைந்த புள்ளியிடல் திட்டத்தினுாடாக மேற்கொள்ளப்படும்.",
  "விவாதப்போட்டி நடைபெறும் முறை மற்றும் புள்ளியிடல் பற்றிய விரிவான விளக்கம் போட்டித் தினத்தன்று ஆரம்பத்தில் அனைவருக்கும் அறியத்தரப்படும்.",
  "சுயாதீன நடுவர்கள் குழாத்தின் தீர்ப்பே இறுதியானது. இது தொடர்பான எந்த முறைப்பாடுகளும் ஏற்கப்படாது.",
];

const jeevanathiProjects = [
  {
    title: "செம்மலை மகா வித்தியாலய திட்டம் - 2024",
    photos: ["semmalai-1"],
    text: "மொறட்டுவை பல்கலைக்கழக தமிழ் இலக்கிய மன்றத்தின் ஜீவநதி செயற்றிட்டத்தின் மூலம் முல்லைத்தீவு செம்மலை மகா வித்தியாலயத்தின் மாணவர்களுக்கு ஐந்து துவிச்சக்கரவண்டிகள் இலங்கை தமிழர் சமூகம் கத்தாரின் உதவியுடன் கையளிக்கப்பட்டது.",
  },
  {
    title: "உடவேரிய பாடசாலை திட்டம் - 2018",
    photos: ["udaweriya-1", "udaweriya-2", "udaweriya-3", "udaweriya-4"],
    text: "ஜீவநதி திட்டத்தின் மூலம் பதுளை மாவட்டத்தில் அமைந்திருக்கும் உடவெறியா கிராமத்தின் பாடசாலை மாணவர்களுக்காக அப்பியாசக் கொப்பிகள், புத்தகப்பை, சப்பாத்து, காலணி உறை போன்றவையும் மற்றும் உடவெறியா பாடசாலை அபிவிருத்திக்குச் சிறிய நிதியுதவியும் வழங்கி வைக்கப்பட்டது.",
  },
  {
    title: "வெள்ள நிவாரணத் திட்டம் - 2018",
    photos: ["flood-1", "flood-2", "flood-3", "flood-4"],
    text: "நாட்டின் பல்வேறு மாவட்ட மக்களிடமிருந்து நிவாரண பொருட்கள் எமது மன்றத்தினால் சேகரிக்கப்பட்டு கிளிநொச்சி மற்றும் முல்லைத்தீவில் வெள்ளத்தினால் பாதிக்கப்பட்ட மக்களுக்கு வழங்கப்பட்டது.",
  },
  {
    title: "மண்சரிவு நிவாரண திட்டம் - 2014",
    photos: ["landslide-1", "landslide-2", "landslide-3", "landslide-4"],
    text: "பதுளை மாவட்டத்தில் மண்சரிவினால் பாதிக்கப்பட்ட மக்களுக்கு நிவாரண உதவிகள் எமது தமிழிலக்கிய மன்றத்தினால் வழங்கி வைக்கப்பட்டது.",
  },
];

// In home-page order. `path` is where the page lives; `parent` marks a
// sub-page that isn't listed on the home page.
export const BUILTIN_EVENTS = [
  {
    ...card("thaipongal", cultureEvent[0]),
    path: "/events/thaipongal",
    category: "culture",
    sections: () => [
      intro("thaipongal"),
      sec("thaipongal", "agenda", "agenda", {
        hidden: true,
        title: "நிகழ்ச்சி நிரல்",
        lead: POSTER_LEAD,
        heading: "பொங்கல் விழா 2023",
        date: "08.01.2023",
        time: "காலை 07:30",
        venue: "பல்கலைக்கழக வளாகம்",
        items: rows("thaipongal_a", [
          "பொங்கல் பூஜை",
          "தமிழ்த்தாய் வாழ்த்து",
          "வரவேற்புரை",
          "நடனம்",
          "வாய்ப்பாட்டு",
          "பிரதம விருந்தினர் உரை",
          "வில்லுப்பாட்டு",
          "வாய்ப்பாட்டு",
          "சிறப்பு விருந்தினர் உரை",
          "பட்டிமன்றம்",
          "நடனம்",
          "நன்றி உரை",
          "பாரம்பரிய விளையாட்டு",
        ], (title) => ({ time: "", title, detail: "", linkUrl: "", linkLabel: "" })),
        images: photos("thaipongal_inv", [
          { img: "https://live.staticflickr.com/65535/53518910764_6a927d8d93_b.jpg" },
        ]),
      }),
      gallery("thaipongal", pongalPhotos),
    ],
  },
  {
    ...card("vani-villa", cultureEvent[1]),
    path: "/events/vani-villa",
    category: "culture",
    sections: () => [intro("vani-villa"), gallery("vani-villa", vaniPhotos)],
  },
  {
    ...card("thamilaruvi", cultureEvent[2]),
    path: "/events/thamilaruvi",
    category: "culture",
    sections: () => [
      intro("thamilaruvi"),
      sec("thamilaruvi", "agenda", "agenda", {
        title: "நிகழ்ச்சி நிரல்",
        lead: POSTER_LEAD,
        heading: "தமிழருவி",
        date: "13.10.2024",
        time: "மாலை 2.32",
        venue: "கொழும்பு இராமகிருஷ்ண மண்டபம்",
        items: rows("thamilaruvi_a", [
          "மங்கல விளக்கேற்றல்",
          "தமிழ்த்தாய் வாழ்த்து",
          "வரவேற்பு நடனம்",
          "தலைமை உரை",
          "பிரதம விருந்தினர் உரை",
          "இதழ் வெளியீடு",
          "பல்லியம்",
          "நாடகம்",
          "மெல்லிசை",
          "மக்கள் மன்றம்",
          "நடனம்",
          "நன்றியுரை",
        ], (title) => ({ time: "", title, detail: "", linkUrl: "", linkLabel: "" })),
        images: photos("thamilaruvi_inv", [
          { img: "https://live.staticflickr.com/65535/54057711577_ac451486b2_w.jpg" },
          { img: "https://live.staticflickr.com/65535/54058586916_b9c4748ae4_w.jpg" },
        ]),
      }),
      gallery("thamilaruvi", thamilaruviPhotos),
    ],
  },
  {
    ...card("sotkanai", competition[0]),
    path: "/events/sotkanai",
    category: "competition",
    sections: () => [
      intro("sotkanai"),
      sec("sotkanai", "winners", "awards", {
        title: "சொற்கணை 2024",
        items: [
          { id: "sotkanai_w_0", place: "1ம் இடம்", name: "கிளி / அன் திரேசா பெண்கள் பாடசாலை", detail: "", image: "asset:sotkanai/gold" },
          { id: "sotkanai_w_1", place: "2ம் இடம்", name: "யாழ் / இந்துக் கல்லூரி", detail: "", image: "asset:sotkanai/silver" },
          { id: "sotkanai_w_2", place: "3ம் இடம்", name: "வவுனியா தமிழ் மகா வித்தியாலயம்", detail: "", image: "asset:sotkanai/bronze" },
          { id: "sotkanai_w_3", place: "சிறந்த விவாதி", name: "வைஷ்ணவி சிவாஸ்கரன்", detail: "", image: "asset:sotkanai/best-debater" },
        ],
      }),
      sec("sotkanai", "rules", "rules", {
        title: "",
        collapsible: true,
        buttonLabel: "சொற்கணைக்கான போட்டி விதிமுறைகள்",
        items: rows("sotkanai_r", sotkanaiRules, (text) => ({ text })),
      }),
      live("sotkanai", "sotkanai-districts"),
      sec("sotkanai", "agenda", "agenda", {
        hidden: true,
        title: "நிகழ்ச்சி நிரல்",
        items: [],
        images: photos("sotkanai_inv", [
          { img: "https://live.staticflickr.com/65535/53570767991_4cabca69b6_b.jpg" },
        ]),
      }),
    ],
  },
  {
    ...card("ideathon", competition[1]),
    path: "/ideathon",
    category: "competition",
    sections: () => [
      intro("ideathon"),
      live("ideathon", "ideathon-rules"),
      live("ideathon", "ideathon-agenda"),
      sec("ideathon", "sponsors", "sponsors", {
        items: [
          {
            id: "ideathon_sp_0",
            tier: "Bronze Sponsor",
            name: "JRide",
            logo: "https://a2zcleangimages.s3.amazonaws.com/TlaImages/JRide-logo-01-(1).png",
            text: "JRide is the ultimate solution for hassle-free transportation in Sri Lanka. Our online taxi app offers a quick and easy way to book any kind of vehicle ride, from cars to tuk-tuks, to get you where you need to go.",
            url: "",
          },
        ],
      }),
      sec("ideathon", "prizes", "awards", {
        title: "பரிசில்கள் விபரம்",
        items: [
          { id: "ideathon_pz_0", place: "", name: "", detail: "1ம், 2ம் மற்றும் 3ம் இடங்களுக்கு பெறுமதி மிக்க பரிசில்கள் வழங்கப்படும்", image: "asset:ideathon/award" },
          { id: "ideathon_pz_1", place: "", name: "", detail: "பங்குபற்றிய மாணவர்களுக்கு இலத்திரனியல் சான்றிதழ் வழங்கப்படும்", image: "asset:ideathon/certificate" },
          { id: "ideathon_pz_2", place: "", name: "", detail: "பரிசளிப்பு வைபம் தமிழருவி விழாவில் நடைபெறும்", image: "asset:ideathon/tha" },
        ],
      }),
      sec("ideathon", "contacts", "contacts", {
        note: "பங்குபற்றும் மாணவர்களுக்கு எங்கள் “நிரலி” ஒழுங்கமைப்பு குழுவின் வாழ்த்துக்கள்.",
        items: [
          { id: "ideathon_ct_0", name: "கேதீஸ்வரன் குகேசன்", role: "", email: "kkukesan29@gmail.com", phone: "075 546 4760" },
          { id: "ideathon_ct_1", name: "காயத்ரி சிவகுமார்", role: "", email: "sivathri30@gmail.com", phone: "076 544 9380" },
          { id: "ideathon_ct_2", name: "வீனியஸ் டிலான்", role: "", email: "delanvenesious27@gmail.com", phone: "071 157 2216" },
        ],
      }),
    ],
  },
  {
    ...card("brammam", competition[2]),
    path: "/events/brammam",
    category: "competition",
    sections: () => [
      intro("brammam"),
      sec("brammam", "competitions", "cards", {
        title: "போட்டிகள்",
        items: BRAMMAM_COMPETITIONS.map((c) => ({
          id: `brammam_c_${c.slug}`,
          title: c.title,
          text: c.text,
          image: `asset:brammam/${c.slug}`,
          images: [],
          url: `/events/brammam/${c.slug}`,
          urlLabel: "மேலும் அறிய",
        })),
      }),
    ],
  },
  {
    ...card("aramiyam", guidance[0]),
    path: "/events/aramiyam",
    category: "guidance",
    sections: () => [intro("aramiyam"), live("aramiyam", "aramiyam-seminars")],
  },
  {
    ...card("jeevanathi", social[0]),
    path: "/events/jeevanathi",
    category: "social",
    sections: () => [
      intro("jeevanathi"),
      sec("jeevanathi", "donate", "facts", {
        title: "எம்முடன் இணையுங்கள்",
        note: "வங்கி கணக்கு விபரம்",
        items: [
          { id: "jeevanathi_f_0", label: "Account Name", value: "Tamil Literary Association" },
          { id: "jeevanathi_f_1", label: "Account Number", value: "320654" },
          { id: "jeevanathi_f_2", label: "Bank Name", value: "Bank of Ceylon" },
          { id: "jeevanathi_f_3", label: "Branch Name", value: "Kattubeda Branch" },
        ],
      }),
      sec("jeevanathi", "contacts", "contacts", {
        items: [
          { id: "jeevanathi_ct_0", name: "Kisanth", role: "", email: "", phone: "077 591 4008" },
          { id: "jeevanathi_ct_1", name: "Keethasaba", role: "", email: "", phone: "076 263 7656" },
        ],
      }),
      sec("jeevanathi", "projects", "cards", {
        title: "கடந்த காலங்களில் வழங்கப்பட்ட உதவிகள்",
        items: jeevanathiProjects.map((p, i) => ({
          id: `jeevanathi_p_${i}`,
          title: p.title,
          text: p.text,
          image: "",
          images: p.photos.map((key, k) => ({
            id: `jeevanathi_p_${i}_${k}`,
            url: `asset:jeevanathi/${key}`,
            caption: "",
            width: 0,
            height: 0,
          })),
          url: "",
          urlLabel: "",
        })),
      }),
    ],
  },
  {
    ...card("kovil", social[1]),
    path: "/events/kovil",
    category: "social",
    sections: () => [intro("kovil"), gallery("kovil", kovilPhotos)],
  },
  {
    ...card("blood-donation", social[2]),
    path: "/events/blood-donation",
    category: "social",
    sections: () => [intro("blood-donation"), gallery("blood-donation", bloodPhotos)],
  },
  {
    ...card("ppl", carnival[0]),
    path: "/events/ppl",
    category: "carnival",
    sections: () => [
      intro("ppl"),
      sec("ppl", "results", "awards", {
        title: "போட்டி முடிவுகள்",
        items: [
          { id: "ppl_r_0", place: "முதலாம் இடம்", name: "Spicy Blasters", detail: "", image: "asset:ppl/first" },
          { id: "ppl_r_1", place: "இரண்டாம் இடம்", name: "Cheddi Nadu Supper King", detail: "", image: "asset:ppl/second" },
          { id: "ppl_r_2", place: "விருது", name: "Logithan", detail: "", image: "asset:ppl/award" },
        ],
      }),
      gallery("ppl-teams", pplTeamImages, { id: "ppl_teams", title: "அணி விபரங்கள்" }),
      gallery("ppl", pplPhotos),
    ],
  },
  {
    ...card("movie-night", carnival[1]),
    path: "/events/movie-night",
    category: "carnival",
    sections: () => [intro("movie-night"), gallery("movie-night", moviePhotos)],
  },
  {
    id: "food-festival",
    title: "உணவுத் திருவிழா",
    summary: "எமது பாரம்பரிய உணவுகளை சகோதர மொழி மாணவர்களுடன் பகிர்ந்துண்னும் நிகழ்வு",
    image: "asset:card/food-festival",
    path: "/events/food-festival",
    category: "carnival",
    // Not on the home page and its introduction was switched off on the old page.
    hiddenOnHome: true,
    sections: () => [intro("food-festival", { hidden: true }), gallery("food-festival", foodPhotos)],
  },
  // Sub-pages of பிரம்மம்: one per competition. Their content comes from the
  // server (winners, themes, rules), so each starts as that built-in block.
  ...BRAMMAM_COMPETITIONS.map((c) => ({
    id: `brammam-${c.slug}`,
    title: c.title,
    summary: c.text,
    image: `asset:brammam/${c.slug}`,
    path: `/events/brammam/${c.slug}`,
    parent: "brammam",
    category: "competition",
    sections: () => [live(`brammam-${c.slug}`, "brammam-about")],
  })),
];

const byId = new Map(BUILTIN_EVENTS.map((e) => [e.id, e]));

export const isBuiltIn = (id) => byId.has(id);

// The built-in page for an event as the editor/site work with it:
// { title, summary, image, category, sections }. A fresh copy each time.
export function builtInPage(id) {
  const e = byId.get(id);
  if (!e) return null;
  return { title: e.title, summary: e.summary, image: e.image, category: e.category, sections: e.sections() };
}

export const builtInEvent = (id) => byId.get(id) || null;

// Where an event's page lives. Events made in the admin live at /events/<id>.
export const eventPath = (id) => (byId.get(id) ? byId.get(id).path : `/events/${id}`);

// Names that can't be used for a new event: they're already pages of the site.
export const RESERVED_SLUGS = [...BUILTIN_EVENTS.map((e) => e.id), "comingsoon", "sotkanai-district", "brammam"];
