import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaPhoneAlt,
  FaUserTie,
  FaHistory,
  FaUsers,
  FaPlayCircle,
  FaYoutube,
} from "react-icons/fa";
import "./teamDetail.css";
import { TeamsData } from "../teamsData";

const TEAM_YOUTUBE_CHANNEL = "https://www.youtube.com/@TLAUOM";

const TeamDetail = () => {
  const { teamId } = useParams();
  const team = TeamsData.find((t) => String(t.id) === teamId);

  if (!team) {
    return (
      <div className="team-detail-page">
        <div className="team-not-found">
          <h2>அணி காணப்படவில்லை</h2>
          <p>கோரப்பட்ட அணி இங்கு இல்லை. அணிகள் பட்டியலுக்குத் திரும்பவும்.</p>
          <Link to="/teams" className="team-back-btn">
            <FaArrowLeft /> அணிகளுக்குத் திரும்ப
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="team-detail-page">
      {/* Hero */}
      <div className="team-hero">
        <Link to="/teams" className="team-hero-back">
          <FaArrowLeft /> அணிகளுக்குத் திரும்ப
        </Link>
        <h1 className="team-hero-title">{team.title}</h1>
        {team.tagline && <p className="team-hero-tagline">{team.tagline}</p>}
      </div>

      <div className="team-detail-body">
        {/* Photo */}
        {team.photo && (
          <div className="team-photo-card">
            <img src={team.photo} alt={`${team.title} புகைப்படம்`} />
          </div>
        )}

        {/* About */}
        <section className="team-section">
          <h2 className="team-section-title">அணி பற்றி</h2>
          <p className="team-about-text">{team.description}</p>
        </section>

        {/* Current coordinators */}
        {team.coordinators?.length > 0 && (
          <section className="team-section">
            <h2 className="team-section-title">
              <FaUserTie className="team-section-icon" /> தற்போதைய ஒருங்கிணைப்பாளர்கள்
            </h2>
            <div className="team-coordinator-grid">
              {team.coordinators.map((c) => (
                <div className="team-coordinator-card" key={c.name}>
                  <p className="team-coordinator-name">{c.name}</p>
                  <p className="team-coordinator-role">{c.role}</p>
                  {c.phone && (
                    <a className="team-coordinator-phone" href={`tel:${c.phone}`}>
                      <FaPhoneAlt /> {c.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past coordinators */}
        {team.pastCoordinators?.length > 0 && (
          <section className="team-section">
            <h2 className="team-section-title">
              <FaHistory className="team-section-icon" /> முன்னாள் ஒருங்கிணைப்பாளர்கள்
            </h2>
            <div className="team-timeline">
              {team.pastCoordinators.map((p) => (
                <div className="team-timeline-item" key={`${p.year}-${p.name}`}>
                  <span className="team-timeline-year">{p.year}</span>
                  <span className="team-timeline-name">{p.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Members */}
        {team.members?.length > 0 && (
          <section className="team-section">
            <h2 className="team-section-title">
              <FaUsers className="team-section-icon" /> அணி உறுப்பினர்கள்
            </h2>
            <div className="team-member-grid">
              {team.members.map((name) => (
                <div className="team-member-chip" key={name}>
                  <span className="team-member-avatar">{name.charAt(0)}</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos */}
        {team.videos?.length > 0 && (
          <section className="team-section">
            <h2 className="team-section-title">
              <FaYoutube className="team-section-icon" /> தொடர்புடைய காணொளிகள்
            </h2>
            <div className="team-video-grid">
              {team.videos.map((v) => (
                <a
                  className="team-video-card"
                  href={TEAM_YOUTUBE_CHANNEL}
                  target="_blank"
                  rel="noreferrer"
                  key={v.title}
                >
                  <div className="team-video-thumb-wrap">
                    <img src={v.thumbnail} alt={v.title} />
                    <FaPlayCircle className="team-video-play" />
                  </div>
                  <p className="team-video-title">{v.title}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="team-cta">
          <Link to="/teams" className="team-cta-btn">
            மற்ற அணிகளைப் பார்வையிட
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
