import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchBookConfig,
  getCachedConfig,
  isSubmissionOpen,
} from "../../../book/bookConfig";
import "./submitArticleBanner.css";

const SubmitArticleBanner = () => {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState(getCachedConfig);

  useEffect(() => {
    let alive = true;
    fetchBookConfig()
      .then((c) => {
        if (alive) setCfg(c);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const open = isSubmissionOpen(cfg);

  return (
    <div className="submit-article-banner">
      <p className="submit-heading">
        {open ? "உங்கள் படைப்பை பகிருங்கள்" : "சமர்ப்பிப்பு தற்போது மூடப்பட்டுள்ளது"}
      </p>
      <p className="submit-subtext">
        {open
          ? "மொறட்டுவை பல்கலைக்கழக தமிழ் மாணவர்கள் தங்கள் படைப்புகளை இங்கு சமர்ப்பிக்கலாம்."
          : cfg.announcement ||
            "தற்போது புதிய படைப்புகள் ஏற்றுக்கொள்ளப்படவில்லை. பின்னர் மீண்டும் முயற்சிக்கவும்."}
      </p>
      {open ? (
        <button
          className="submit-article-button"
          onClick={() => navigate("/books/submit")}
        >
          படைப்பு அனுப்ப
        </button>
      ) : (
        <button className="submit-article-button is-disabled" disabled>
          தற்போது மூடப்பட்டுள்ளது
        </button>
      )}
    </div>
  );
};

export default SubmitArticleBanner;
