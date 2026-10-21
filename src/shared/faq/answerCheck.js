// Tips for writing an answer that AI answer engines (ChatGPT, Google's AI
// Overviews, Perplexity…) can quote: they lift a sentence or two out of
// /faq and llms.txt, so the first sentence should answer the question on its
// own. Shown live in the /admin/faq editor; advice only, never blocks saving.

// Words that mean nothing once a sentence is quoted on its own.
const VAGUE_START = /^(it|this|that|these|those|they|he|she|here|there|இது|அது|இவை|அவை|இதில்|அதில்|இங்கு|அங்கு|இவர்கள்|அவர்கள்)(?=[\s,.:;!?'"]|$)/i;
const FIRST_SENTENCE_MAX = 220;
const ANSWER_MAX = 700;

// The first sentence of the first non-empty line, bullets ignored.
export function firstSentence(text) {
  const line = String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .find(Boolean);
  if (!line) return "";
  const m = line.replace(/^[•\-–]\s+/, "").match(/^[\s\S]*?[.!?](?=\s|$)/);
  return (m ? m[0] : line.replace(/^[•\-–]\s+/, "")).trim();
}

function textTips(text, label) {
  const tips = [];
  const t = String(text || "").trim();
  if (!t) return tips;
  const first = firstSentence(t);
  const vague = first.match(VAGUE_START);
  if (/^[•\-–]\s/.test(t)) {
    tips.push(`${label} starts with a list. Begin with one sentence that answers the question, then the list.`);
  } else if (vague) {
    tips.push(`${label} starts with "${vague[1]}". Quoted on its own nobody knows what that is - name it (TLA, Thamilaruvi, Sotkanai…).`);
  }
  if (first.length > FIRST_SENTENCE_MAX) {
    tips.push(`${label}'s first sentence is ${first.length} characters. Answer engines usually quote just that one - keep the direct answer in it, under ${FIRST_SENTENCE_MAX}.`);
  }
  if (t.length > ANSWER_MAX) {
    tips.push(`${label} is ${t.length} characters. Fine for the assistant, but make sure the first two sentences are a complete answer.`);
  }
  return tips;
}

// [] when the answer is ready to be quoted; otherwise short tips.
export function answerTips({ q, a, q_en, a_en } = {}) {
  if (!String(a || "").trim()) return [];
  const tips = textTips(a, "The Tamil answer");
  if (!String(q_en || "").trim() || !String(a_en || "").trim()) {
    tips.push("No English yet. Most AI assistants answer in English - add the English question and answer so they can quote TLA directly.");
  } else {
    tips.push(...textTips(a_en, "The English answer"));
  }
  if (String(q || "").trim() && !/[?？]\s*$/.test(String(q).trim())) {
    tips.push("Write the question the way people ask it, ending with a question mark.");
  }
  return tips;
}
