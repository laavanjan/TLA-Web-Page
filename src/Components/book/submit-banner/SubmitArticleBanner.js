import React from "react";
import { useNavigate } from "react-router-dom";
import "./submitArticleBanner.css";

const SubmitArticleBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="submit-article-banner">
      <p className="submit-heading">உங்கள் படைப்பை பகிருங்கள்</p>
      <p className="submit-subtext">
        மொறட்டுவை பல்கலைக்கழக தமிழ் மாணவர்கள் தங்கள் படைப்புகளை இங்கு சமர்ப்பிக்கலாம்.
      </p>
      <button
        className="submit-article-button"
        onClick={() => navigate("/books/submit")}
      >
        படைப்பு அனுப்ப
      </button>
    </div>
  );
};

export default SubmitArticleBanner;
