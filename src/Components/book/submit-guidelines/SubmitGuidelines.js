import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaPhoneAlt, FaFileWord, FaExternalLinkAlt } from "react-icons/fa";
import "./submitGuidelines.css";
import {
  SECTIONS,
  WORK_TYPES,
  CONTENT_RULES,
  TITLE_EXAMPLE,
  FONT_SPECS,
  PAGE_SPECS,
  ALLOWED_FONTS,
  REQUIRED_INFO,
  SELECTION_CRITERIA,
  EXTRA_WORKS,
  CONTACTS,
} from "./guidelinesData";

const TOPICS_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1-wILuWyyXn6fJbMjIXX6iC6XJNhXtJX3bYvAoZodJ54/edit?usp=sharing";

const SubmitGuidelines = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="guidelines-page">
      <div className="guidelines-hero">
        <span className="guidelines-hero-kicker">தமிழருவி ஆக்கங்கள் அழைப்பு</span>
        {/* <h1 className="guidelines-hero-title">title</h1> */}
        <p className="guidelines-hero-text">
          மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றத்தினால் எம்மவர்களின் படைப்பாற்றல், சிந்தனை, அனுபவம்,
          தர்க்கம் மற்றும் எழுத்துத் திறனை ஒருங்கிணைத்து &ldquo;தமிழருவி&rdquo; எனும் நாமத்தோடு படைப்பிலக்கிய நூல்
          கடந்த வருடங்களைப் போலவே இவ்வருடமும் வெளியிடப்படவுள்ளது.
        </p>
      </div>

      <div className="guidelines-body">
        <nav className="guidelines-nav" aria-label="Section navigation">
          <p className="guidelines-nav-title">உள்ளடக்கம்</p>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  className={activeId === s.id ? "nav-link active" : "nav-link"}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span className="nav-num">{s.num}</span>
                  <span>{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="guidelines-content">
          {/* 1. Types */}
          <section
            id="types"
            ref={(el) => (sectionRefs.current["types"] = el)}
            className="guidelines-section"
          >
            <SectionHeading num="01" title="படைப்புகளின் வகைகள்" />
            <p className="section-lead">
              விரும்பிய கருப்பொருள் கொண்டதாகவும், கற்பனை அல்லது உண்மைச் சம்பவங்களை அடிப்படையாகக் கொண்டு
              எழுதலாம் — மாணவர் வாழ்க்கை, சமூகப் பிரச்சினைகள், மனித உறவுகள், சமூகம், அரசியல், விஞ்ஞானம்,
              தொழினுட்பம் மற்றும் இதர பல கருப்பொருட்களை உள்ளடக்கியதாக ஆக்கங்கள் வரவேற்கப்படுகின்றன.
            </p>
            <div className="type-grid">
              {WORK_TYPES.map((t) => (
                <div className="type-card" key={t.name}>
                  <t.icon className="type-icon" />
                  <p className="type-name">{t.name}</p>
                  {t.sub && <p className="type-sub">{t.sub}</p>}
                  <span className="type-limit">{t.limit}</span>
                </div>
              ))}
            </div>
            <a className="topics-link" href={TOPICS_SHEET_URL} target="_blank" rel="noreferrer">
              தெரிவுசெய்யப்பட்ட தலைப்புகளின் பட்டியலைப் பார்வையிட <FaExternalLinkAlt />
            </a>
          </section>

          {/* 2. Content guidelines */}
          <section
            id="content-guidelines"
            ref={(el) => (sectionRefs.current["content-guidelines"] = el)}
            className="guidelines-section"
          >
            <SectionHeading num="02" title="உள்ளடக்க வழிகாட்டல்கள்" />
            <ul className="checklist">
              {CONTENT_RULES.map((rule, i) => (
                <li key={i}>
                  <FaCheckCircle className="check-icon" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Title format */}
          <section
            id="title-format"
            ref={(el) => (sectionRefs.current["title-format"] = el)}
            className="guidelines-section"
          >
            <SectionHeading num="03" title="படைப்பின் தலைப்பு" />
            <p className="section-lead">
              ஒவ்வொரு படைப்பிற்கும், படைப்பின் இறுதியில் படைப்பின் வகை, தலைப்பு, எழுத்தாளர் பெயர், துறை,
              பீடம் கல்வியாண்டு என்ற தகவல்கள் வழங்கப்பட வேண்டும்.
            </p>
            <div className="example-card">
              <p className="example-label">உதாரணம்</p>
              <ul className="example-fields">
                <li><strong>வகை</strong><span>{TITLE_EXAMPLE.type}</span></li>
                <li><strong>தலைப்பு</strong><span>{TITLE_EXAMPLE.title}</span></li>
                <li><strong>எழுத்தாளர்</strong><span>{TITLE_EXAMPLE.author}</span></li>
                <li><strong>பீடம்</strong><span>{TITLE_EXAMPLE.faculty}</span></li>
                <li><strong>துறை</strong><span>{TITLE_EXAMPLE.department}</span></li>
              </ul>
            </div>
          </section>

          {/* 4. Formatting */}
          <section
            id="formatting"
            ref={(el) => (sectionRefs.current["formatting"] = el)}
            className="guidelines-section"
          >
            <SectionHeading num="04" title="எழுத்துரு & Document Formatting" />
            <p className="section-lead">
              தமிழ் எழுத்துரு: பின்வரும் எழுத்துருக்களில் ஏதேனும் ஒன்றைப் பயன்படுத்தலாம் - {" "}
              {ALLOWED_FONTS.join(", ")}.
            </p>
            <div className="spec-grid">
              <div className="spec-card">
                <p className="spec-title">Font Size</p>
                {FONT_SPECS.map((f) => (
                  <div className="spec-row" key={f.label}>
                    <span>{f.label}</span>
                    <span className="spec-value">{f.value}</span>
                  </div>
                ))}
              </div>
              <div className="spec-card">
                <p className="spec-title">Page Setup</p>
                {PAGE_SPECS.map((f) => (
                  <div className="spec-row" key={f.label}>
                    <span>{f.label}</span>
                    <span className="spec-value">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 5. Required info */}
          <section
            id="required-info"
            ref={(el) => (sectionRefs.current["required-info"] = el)}
            className="guidelines-section"
          >
            <SectionHeading num="05" title="படைப்புடன் வழங்க வேண்டிய தகவல்கள்" />
            <p className="section-lead">ஒவ்வொரு மாணவரும் படைப்புடன் பின்வரும் தகவல்களை வழங்க வேண்டும்:</p>
            <ol className="info-list">
              {REQUIRED_INFO.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          {/* 6. Selection */}
          <section
            id="selection"
            ref={(el) => (sectionRefs.current["selection"] = el)}
            className="guidelines-section"
          >
            <SectionHeading num="06" title="படைப்புகளின் தேர்வு" />
            <p className="section-lead">
              சமர்ப்பிக்கப்பட்ட அனைத்து படைப்புகளும் நூலில் இடம்பெறும் என்பது உறுதி செய்யப்படாது. படைப்புகள்
              பின்வரும் அடிப்படைகளில் பரிசீலிக்கப்படும்:
            </p>
            <div className="tag-list">
              {SELECTION_CRITERIA.map((c) => (
                <span className="tag" key={c}>{c}</span>
              ))}
            </div>
            <p className="section-note">
              குறிப்பு: தேவைப்பட்டால் ஆசிரியர் குழுவினால் சிறிய மொழித் திருத்தங்கள் மேற்கொள்ளப்படலாம்.
            </p>
          </section>

          {/* 7. Extra works */}
          <section
            id="extra"
            ref={(el) => (sectionRefs.current["extra"] = el)}
            className="guidelines-section"
          >
            <SectionHeading num="07" title="கூடுதலாக வரவேற்கப்படும் படைப்புகள்" />
            <div className="type-grid">
              {EXTRA_WORKS.map((w) => (
                <div className="type-card" key={w.name}>
                  <w.icon className="type-icon" />
                  <p className="type-name">{w.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 8. File format + contact */}
          <section
            id="file-format"
            ref={(el) => (sectionRefs.current["file-format"] = el)}
            className="guidelines-section"
          >
            <SectionHeading num="08" title="படைப்பை சமர்ப்பிக்கும் File Format" />
            <div className="file-format-box">
              <FaFileWord className="file-icon" />
              <div>
                <p className="section-lead" style={{ margin: 0 }}>
                  ஒவ்வொரு படைப்பும் Microsoft Word (.docx) வடிவில் சமர்ப்பிக்கப்பட வேண்டும்.
                </p>
                <code className="file-name-pattern">Category_Name_Batch</code>
                <p className="file-example">உதாரணம்: <code>Poem_Thikarnan_TMLE24.docx</code></p>
              </div>
            </div>

            <p className="section-lead">ஆக்கங்கள் சார்ந்த மேலதிக விளக்கங்களைப் பெற தொடர்பு கொள்ளவும்:</p>
            <div className="contact-grid">
              {CONTACTS.map((c) => (
                <a className="contact-card" href={`tel:${c.phone}`} key={c.name}>
                  <span className="contact-icon-badge">
                    <FaPhoneAlt className="contact-icon" />
                  </span>
                  <div className="contact-text">
                    <p className="contact-name">{c.name}</p>
                    <p className="contact-phone">{c.phone}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <div className="guidelines-cta">
            <button className="guidelines-cta-button" onClick={() => navigate("/books/submit/form")}>
              சமர்ப்பிக்க செல்ல
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeading = ({ num, title }) => (
  <div className="section-heading">
    <span className="section-num">{num}</span>
    <h2>{title}</h2>
  </div>
);

export default SubmitGuidelines;
