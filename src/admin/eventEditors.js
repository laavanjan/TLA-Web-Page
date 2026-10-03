// The editor for each event section type (the body of a section card in
// /admin/events). Text, milestones, competitions, gallery, YouTube and
// Instagram reuse the team-page editors; the rest are described by their
// fields and drawn by ItemsEditor.
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Field, ImageField, LinkList, TextEditor, TimelineEditor, CompetitionsEditor } from "./editorKit";
import { ItemsEditor } from "./itemsEditor";
import GalleryEditor from "../Pages/AdminTeamsGallery";
import {
  blankAgendaItem,
  blankSponsor,
  blankAward,
  blankRule,
  blankCard,
  blankContact,
  blankFact,
  blankEdition,
  LIVE_BLOCKS,
} from "../shared/eventSections";
import { LIVE_BLOCK_META } from "../Components/events/eventSectionMeta";

const textOf = (set, s, key) => (e) => set({ ...s, [key]: e.target.value });

function IntroEditor({ s, set }) {
  return (
    <>
      <Field label="Text" hint="Shown under the name. Leave empty to use the event's card text.">
        <textarea className="tj-input tj-choices" rows={4} value={s.text} onChange={textOf(set, s, "text")} />
      </Field>
      <ImageField label="Illustration" value={s.image} onChange={(v) => set({ ...s, image: v })} />
      <small className="tj-muted ts-field-note">Leave empty to use the event's card illustration.</small>
      <div className="ts-grid-2">
        <Field label="Date (optional)" hint="Written as you like, e.g. 13.10.2024">
          <input className="tj-input" value={s.date} onChange={textOf(set, s, "date")} />
        </Field>
        <Field label="Venue (optional)">
          <input className="tj-input" value={s.venue} onChange={textOf(set, s, "venue")} />
        </Field>
      </div>
      <div className="ts-grid-2">
        <Field label="Button label (optional)">
          <input className="tj-input" value={s.buttonLabel} onChange={textOf(set, s, "buttonLabel")} placeholder="பதிவு செய்ய" />
        </Field>
        <Field label="Button link (optional)" hint="https://… or a page on this site such as /events/ppl">
          <input className="tj-input" value={s.buttonUrl} onChange={textOf(set, s, "buttonUrl")} placeholder="https://…" />
        </Field>
      </div>
    </>
  );
}

function AgendaEditor({ s, set, onUpdate }) {
  return (
    <>
      <div className="ts-grid-2">
        <Field label="Line above the title (optional)">
          <input className="tj-input" value={s.lead} onChange={textOf(set, s, "lead")} placeholder="மொறட்டுவை பல்கலைக்கழக தமிழ் இலக்கிய மன்றம் பெருமையுடன் வழங்கும்" />
        </Field>
        <Field label="Title on the invitation (optional)">
          <input className="tj-input" value={s.heading} onChange={textOf(set, s, "heading")} placeholder="பொங்கல் விழா 2026" />
        </Field>
      </div>
      <div className="ev-grid-3">
        <Field label="Date">
          <input className="tj-input" value={s.date} onChange={textOf(set, s, "date")} placeholder="08.01.2026" />
        </Field>
        <Field label="Time">
          <input className="tj-input" value={s.time} onChange={textOf(set, s, "time")} placeholder="காலை 07:30" />
        </Field>
        <Field label="Venue">
          <input className="tj-input" value={s.venue} onChange={textOf(set, s, "venue")} />
        </Field>
      </div>
      <span className="tj-control-label">Order of the day</span>
      <ItemsEditor
        compact
        noun="item"
        items={s.items}
        onChange={(items) => set({ ...s, items })}
        onUpdate={onUpdate}
        blank={blankAgendaItem}
        fields={[
          { key: "time", label: "Time", size: "s", placeholder: "7:30" },
          { key: "title", label: "Item", placeholder: "தமிழ்த்தாய் வாழ்த்து" },
          { key: "detail", label: "Details", kind: "textarea", rows: 2, more: true },
          { key: "linkUrl", label: "Link (optional)", placeholder: "https://…", more: true },
          { key: "linkLabel", label: "Link text", placeholder: "மேலும் அறிய", more: true },
        ]}
      />
      <span className="tj-control-label">Invitation posters (optional)</span>
      <GalleryEditor s={s} onUpdate={onUpdate} />
    </>
  );
}

function AwardsEditor({ s, set, onUpdate }) {
  return (
    <ItemsEditor
      noun="winner / prize"
      items={s.items}
      onChange={(items) => set({ ...s, items })}
      onUpdate={onUpdate}
      blank={blankAward}
      titleOf={(a) => [a.place, a.name].filter(Boolean).join(" · ") || a.detail.slice(0, 40)}
      fields={[
        { key: "place", label: "Place or award", size: "m", placeholder: "1ம் இடம்" },
        { key: "name", label: "Winner", size: "m", placeholder: "பாடசாலை / அணி / பெயர்" },
        { key: "detail", label: "Prize or details", kind: "textarea", rows: 2 },
        { key: "image", label: "Picture (medal, trophy, photo…)", kind: "image" },
      ]}
    />
  );
}

function RulesEditor({ s, set, onUpdate }) {
  const [paste, setPaste] = useState("");
  const addLines = () => {
    const lines = paste.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    set({ ...s, items: [...s.items, ...lines.map(blankRule)] });
    setPaste("");
  };
  return (
    <>
      <label className="ts-check">
        <input type="checkbox" checked={s.collapsible} onChange={(e) => set({ ...s, collapsible: e.target.checked })} />
        Hide the list behind a button
      </label>
      {s.collapsible && (
        <Field label="Button text" hint="Leave empty to use the section heading.">
          <input className="tj-input" value={s.buttonLabel} onChange={textOf(set, s, "buttonLabel")} placeholder="போட்டி விதிமுறைகள்" />
        </Field>
      )}
      <ItemsEditor
        compact
        noun="rule"
        items={s.items}
        onChange={(items) => set({ ...s, items })}
        onUpdate={onUpdate}
        blank={() => blankRule()}
        fields={[{ key: "text", label: "Rule", kind: "textarea", rows: 2 }]}
      />
      <Field label="Add several at once" hint="One rule per line.">
        <textarea className="tj-input tj-choices" rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} />
      </Field>
      <button type="button" className="tj-btn tj-btn-ghost" onClick={addLines} disabled={!paste.trim()}>
        <FaPlus /> Add these rules
      </button>
    </>
  );
}

function CardsEditor({ s, set, onUpdate }) {
  return (
    <ItemsEditor
      noun="card"
      items={s.items}
      onChange={(items) => set({ ...s, items })}
      onUpdate={onUpdate}
      blank={blankCard}
      titleOf={(c) => c.title}
      subtitleOf={(c) => (c.images.length ? `${c.images.length} photo${c.images.length === 1 ? "" : "s"}` : "")}
      fields={[
        { key: "title", label: "Title" },
        { key: "text", label: "Text", kind: "textarea", rows: 4 },
        { key: "image", label: "Picture (optional)", kind: "image" },
        { key: "images", label: "Photos (optional)", kind: "photos" },
        { key: "url", label: "Link (optional)", size: "m", placeholder: "https://… or /events/…" },
        { key: "urlLabel", label: "Link text", size: "m", placeholder: "மேலும் அறிய" },
      ]}
    />
  );
}

function SponsorsEditor({ s, set, onUpdate }) {
  return (
    <ItemsEditor
      noun="sponsor"
      items={s.items}
      onChange={(items) => set({ ...s, items })}
      onUpdate={onUpdate}
      blank={blankSponsor}
      titleOf={(x) => x.name}
      subtitleOf={(x) => x.tier}
      fields={[
        { key: "tier", label: "Level", size: "m", placeholder: "Platinum Sponsor" },
        { key: "name", label: "Name", size: "m" },
        { key: "logo", label: "Logo", kind: "image" },
        { key: "text", label: "A few words (optional)", kind: "textarea", rows: 3 },
        { key: "url", label: "Website (optional)", placeholder: "https://…" },
      ]}
    />
  );
}

function ContactsEditor({ s, set, onUpdate }) {
  return (
    <>
      <ItemsEditor
        compact
        noun="contact"
        items={s.items}
        onChange={(items) => set({ ...s, items })}
        onUpdate={onUpdate}
        blank={blankContact}
        fields={[
          { key: "name", label: "Name", size: "l", placeholder: "Name" },
          { key: "role", label: "Role", size: "m", placeholder: "Role (optional)" },
          { key: "phone", label: "Phone", size: "m", placeholder: "07X XXX XXXX" },
          { key: "email", label: "Email", size: "m", placeholder: "email@…" },
        ]}
      />
      <Field label="Closing line (optional)" hint="Shown under the contacts.">
        <textarea className="tj-input tj-choices" rows={2} value={s.note} onChange={textOf(set, s, "note")} />
      </Field>
    </>
  );
}

function FactsEditor({ s, set, onUpdate }) {
  return (
    <>
      <Field label="Line above the details (optional)">
        <input className="tj-input" value={s.note} onChange={textOf(set, s, "note")} placeholder="வங்கி கணக்கு விபரம்" />
      </Field>
      <ItemsEditor
        compact
        noun="detail"
        items={s.items}
        onChange={(items) => set({ ...s, items })}
        onUpdate={onUpdate}
        blank={blankFact}
        fields={[
          { key: "label", label: "Label", size: "m", placeholder: "Account Number" },
          { key: "value", label: "Value", size: "m", placeholder: "320654" },
        ]}
      />
    </>
  );
}

function EditionsEditor({ s, set, onUpdate }) {
  return (
    <ItemsEditor
      noun="year"
      hint="One entry per year the event was held. The newest year shows first."
      items={s.items}
      onChange={(items) => set({ ...s, items })}
      onUpdate={onUpdate}
      blank={blankEdition}
      titleOf={(e) => [e.year, e.title].filter(Boolean).join(" · ")}
      fields={[
        { key: "year", label: "Year", size: "s", placeholder: "2025" },
        { key: "title", label: "Title (optional)" },
        { key: "text", label: "What happened", kind: "textarea", rows: 5 },
        { key: "videoUrl", label: "Video (optional)", placeholder: "https://youtu.be/…" },
        { key: "images", label: "Photos", kind: "photos" },
      ]}
    />
  );
}

function LiveEditor({ s, set }) {
  const meta = LIVE_BLOCK_META[s.block];
  return (
    <>
      <p className="tj-muted">
        This block loads its content from the server, so it isn't edited here. You can move it, hide it with the eye
        button, or replace it by adding your own sections.
      </p>
      <Field label="Block" hint={meta && meta.text}>
        <select className="tj-input" value={s.block} onChange={textOf(set, s, "block")}>
          {LIVE_BLOCKS.map((b) => (
            <option key={b} value={b}>
              {LIVE_BLOCK_META[b].label}
            </option>
          ))}
        </select>
      </Field>
    </>
  );
}

export function EventSectionBody({ s, set, onUpdate }) {
  switch (s.type) {
    case "intro":
      return <IntroEditor s={s} set={set} />;
    case "text":
      return <TextEditor s={s} set={set} />;
    case "agenda":
      return <AgendaEditor s={s} set={set} onUpdate={onUpdate} />;
    case "gallery":
      return <GalleryEditor s={s} onUpdate={onUpdate} />;
    case "awards":
      return <AwardsEditor s={s} set={set} onUpdate={onUpdate} />;
    case "rules":
      return <RulesEditor s={s} set={set} onUpdate={onUpdate} />;
    case "cards":
      return <CardsEditor s={s} set={set} onUpdate={onUpdate} />;
    case "competitions":
      return <CompetitionsEditor s={s} set={set} />;
    case "sponsors":
      return <SponsorsEditor s={s} set={set} onUpdate={onUpdate} />;
    case "contacts":
      return <ContactsEditor s={s} set={set} onUpdate={onUpdate} />;
    case "facts":
      return <FactsEditor s={s} set={set} onUpdate={onUpdate} />;
    case "editions":
      return <EditionsEditor s={s} set={set} onUpdate={onUpdate} />;
    case "timeline":
      return <TimelineEditor s={s} set={set} />;
    case "live":
      return <LiveEditor s={s} set={set} />;
    default:
      return <LinkList kind={s.type} links={s.links} onChange={(links) => set({ ...s, links })} />;
  }
}

// "3 photos" style summary on the section card.
export function eventCountLabel(s) {
  const n = (v, word, many = `${word}s`) => `${v} ${v === 1 ? word : many}`;
  switch (s.type) {
    case "agenda":
      return s.items.length ? n(s.items.length, "item") : null;
    case "gallery":
      return n(s.images.length, "photo");
    case "awards":
      return n(s.items.length, "winner / prize", "winners / prizes");
    case "rules":
      return n(s.items.length, "rule");
    case "cards":
      return n(s.items.length, "card");
    case "competitions":
      return n(s.items.length, "competition");
    case "sponsors":
      return n(s.items.length, "sponsor");
    case "contacts":
      return n(s.items.length, "contact");
    case "facts":
      return n(s.items.length, "detail");
    case "editions":
      return n(s.items.length, "year");
    case "timeline":
      return n(s.items.length, "entry", "entries");
    case "youtube":
      return n(s.links.length, "video");
    case "instagram":
      return n(s.links.length, "post");
    default:
      return null;
  }
}
