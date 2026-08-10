import {
  FaFeatherAlt,
  FaBookOpen,
  FaBook,
  FaPen,
  FaSearch,
  FaNewspaper,
  FaComments,
  FaCamera,
  FaPaintBrush,
  FaImage,
  FaGraduationCap,
  FaUsers,
  FaChalkboardTeacher,
  FaTrophy,
} from "react-icons/fa";

export const SECTIONS = [
  { id: "types", num: "01", label: "படைப்புகளின் வகைகள்" },
  { id: "content-guidelines", num: "02", label: "உள்ளடக்க வழிகாட்டல்கள்" },
  { id: "title-format", num: "03", label: "படைப்பின் தலைப்பு" },
  { id: "formatting", num: "04", label: "எழுத்துரு & வடிவமைப்பு" },
  { id: "required-info", num: "05", label: "வழங்க வேண்டிய தகவல்கள்" },
  { id: "selection", num: "06", label: "படைப்புகளின் தேர்வு" },
  { id: "extra", num: "07", label: "கூடுதல் ஆக்கங்கள்" },
  { id: "file-format", num: "08", label: "File Format & தொடர்பு" },
];

export const WORK_TYPES = [
  { icon: FaFeatherAlt, name: "கவிதை", sub: "புதுக்கவிதை / மரபுக்கவிதை / ஹைக்கூகள்", limit: "16–32 வரிகள்" },
  { icon: FaBook, name: "சிறுகதை", limit: "350–500 சொற்கள்" },
  { icon: FaBookOpen, name: "கதை / குறுங்கதை", limit: "250–500 சொற்கள்" },
  { icon: FaPen, name: "கட்டுரை", limit: "250–500 சொற்கள்" },
  { icon: FaSearch, name: "சமூகப் பார்வை / சமூகக் கட்டுரை / ஆய்வுக் கட்டுரை", limit: "250–600 சொற்கள்" },
  { icon: FaNewspaper, name: "பத்தி எழுத்து", limit: "150–400 சொற்கள்" },
  { icon: FaComments, name: "உரையாடல், நேர்காணல்", limit: "150–500 சொற்கள்" },
];

export const CONTENT_RULES = [
  "மாணவரின் சொந்தப் படைப்பாக இருக்க வேண்டும்.",
  "பிறருடைய படைப்பை நகலெடுத்ததாக இருக்கக்கூடாது.",
  "AI மூலம் உருவாக்கப்பட்ட படைப்புகளைத் தவிர்க்க வேண்டும்.",
  "தேவையற்ற ஆபாசம், வெறுப்பு, இன/மத அவமதிப்பு அல்லது தனிநபரை இழிவுபடுத்தும் உள்ளடக்கங்கள் தவிர்க்கப்பட வேண்டும்.",
  "சமூகப் பிரச்சினைகள் குறித்து எழுதும்போது பொறுப்பான மொழியைப் பயன்படுத்த வேண்டும்.",
  "உண்மைச் சம்பவங்களை எழுதும்போது சம்பந்தப்பட்ட நபர்களின் தனியுரிமையை மதிக்க வேண்டும்.",
  "மொழிநடை இயல்பாகவும் வாசிக்க எளிதாகவும் இருக்க வேண்டும்.",
  "தமிழ் இலக்கணம், எழுத்துப்பிழை மற்றும் நிறுத்தற்குறிகள் சரிபார்க்கப்பட வேண்டும்.",
  "ஏற்கனவே ஏதேனும் ஒரு தளத்தில் இதே ஆக்கம் வெளிவந்திருப்பின் அதை எமக்கு அறியத்தருதல் கட்டாயமானது.",
  "தமிழிலக்கிய மன்றத்தின் மேன்மையைப் பேணுகின்றதாக ஆக்கங்கள் அமைதல் வேண்டும்.",
];

export const TITLE_EXAMPLE = {
  type: "கவிதை",
  title: "விட்டில் பூச்சி",
  author: "ம.திகர்ணன்",
  faculty: "பொறியியற் பீடம்",
  department: "போக்குவரத்து முகாமைத்துவம் மற்றும் விநியோகப் பொறியியல் (TMLE 24)",
};

export const FONT_SPECS = [
  { label: "தலைப்பு", value: "16 pt – Bold" },
  { label: "உபதலைப்பு", value: "14 pt – Bold" },
  { label: "எழுத்தாளர் பெயர்", value: "12 pt – Bold" },
  { label: "குறிப்புகள்", value: "10–11 pt" },
];

export const PAGE_SPECS = [
  { label: "Paper Size", value: "B5" },
  { label: "Margins", value: "1 inch (Top/Bottom/Left/Right)" },
  { label: "Line spacing", value: "1.15" },
  { label: "Paragraph alignment", value: "Justify" },
  { label: "Paragraph spacing", value: "6 pt" },
  { label: "Page number", value: "Center (கீழ்ப்பகுதி)" },
];

export const ALLOWED_FONTS = ["Bamini", "Latha", "Nirmala-UI", "Unicode"];

export const REQUIRED_INFO = [
  "முழுப் பெயர்",
  "புனைபெயர்",
  "பீடம் மற்றும் துறை",
  "கல்வியாண்டு (Batch)",
  "தொடர்பு இலக்கம்",
  "மின்னஞ்சல் முகவரி",
  "படைப்பின் வகை",
  "படைப்பின் தலைப்பு",
  "சொற்களின் எண்ணிக்கை",
  "படைப்பின் சுருக்கமான அறிமுகம் (2 அல்லது 3 வரிகள்)",
  "படைப்பின் Word கோப்பு (.doc / .docx)",
  "படைப்பின் PDF கோப்பு (.pdf)",
];

export const SELECTION_CRITERIA = [
  "படைப்பாற்றல்",
  "மொழிநடை",
  "கருத்தின் புதுமை",
  "உள்ளடக்கத்தின் தரம்",
  "வாசிப்பு அனுபவம்",
  "சமூகப் பொருத்தம்",
  "நூலின் ஒட்டுமொத்தத் தரத்துடன் பொருந்துதல்",
];

export const EXTRA_WORKS = [
  { icon: FaCamera, name: "புகைப்படம் / Photography" },
  { icon: FaPaintBrush, name: "ஓவியம் / Art, கார்ட்டூன் / Cartoon" },
  { icon: FaBook, name: "தமிழ் இலக்கிய விமர்சனம்" },
  { icon: FaImage, name: "பழைய மாணவர்களின் நினைவுப் பதிவுகள்" },
  { icon: FaChalkboardTeacher, name: "பேராசிரியர்களின் சிறப்புக் கட்டுரைகள்" },
  { icon: FaTrophy, name: "மாணவர் சாதனைகள் / துறையின் முக்கிய நிகழ்வுகள்" },
  { icon: FaGraduationCap, name: "பல்கலைக்கழக வாழ்க்கையைப் பிரதிபலிக்கும் படைப்புகள்" },
  { icon: FaUsers, name: "பிரம்மப் போட்டியில் வெற்றியீட்டிய ஆக்கங்கள்" },
];

export const CONTACTS = [
  { name: "பபினயா", phone: "0741122471" },
  { name: "கீதசஞ்சாரன்", phone: "0757822809" },
  { name: "அபீத்", phone: "0772202766" },
];
