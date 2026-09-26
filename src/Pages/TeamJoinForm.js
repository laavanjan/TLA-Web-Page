import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaWhatsapp,
} from "react-icons/fa";
import "../Components/book/submit-form/submitForm.css";
import {
  fetchTeamJoinConfig,
  getCachedTeamJoinConfig,
} from "../shared/teamJoinConfig";
import { submitTeamJoinApplication } from "../shared/teamJoinApplications";

const Field = ({ label, value, error, onChange, placeholder, required, full }) => (
  <div className={full ? "sf-field sf-full" : "sf-field"}>
    <label className="sf-label">
      {label} {required && <span className="sf-req">*</span>}
    </label>
    <input
      type="text"
      className={error ? "sf-input sf-invalid" : "sf-input"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <span className="sf-error">{error}</span>}
  </div>
);

const SelectField = ({ label, value, error, onChange, options, placeholder, required }) => (
  <div className="sf-field">
    <label className="sf-label">
      {label} {required && <span className="sf-req">*</span>}
    </label>
    <select
      className={error ? "sf-input sf-select sf-invalid" : "sf-input sf-select"}
      value={value}
      onChange={onChange}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <span className="sf-error">{error}</span>}
  </div>
);

const TextAreaField = ({ label, value, error, onChange, placeholder, required }) => (
  <div className="sf-field sf-full">
    <label className="sf-label">
      {label} {required && <span className="sf-req">*</span>}
    </label>
    <textarea
      className={error ? "sf-input sf-textarea sf-invalid" : "sf-input sf-textarea"}
      rows={4}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <span className="sf-error">{error}</span>}
  </div>
);

export default function TeamJoinForm() {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState(getCachedTeamJoinConfig);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    let alive = true;
    fetchTeamJoinConfig()
      .then((c) => {
        if (alive) setCfg(c);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const setAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "பெயரை வழங்கவும்.";
    cfg.fields.forEach((f) => {
      if (f.required && !String(answers[f.key] || "").trim()) {
        next[f.key] = "இப்புலம் கட்டாயமானது.";
      }
    });
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    try {
      await submitTeamJoinApplication(name, answers);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setServerMessage(err.message || "படிவத்தை அனுப்ப முடியவில்லை.");
    }
  };

  const resetForm = () => {
    setName("");
    setAnswers({});
    setErrors({});
    setStatus("idle");
    setServerMessage("");
  };

  const teamFieldKey = cfg.fields.find((f) => f.key === "team")?.key;
  const chosenTeam = teamFieldKey ? answers[teamFieldKey] : null;
  const whatsappLink = chosenTeam ? cfg.teamLinks[chosenTeam] : null;

  if (status === "success") {
    return (
      <div className="submit-form-page">
        <div className="sf-success">
          <FaCheckCircle className="sf-success-icon" />
          <h1 className="sf-success-title">உங்கள் விண்ணப்பம் அனுப்பப்பட்டது!</h1>
          <p className="sf-success-text">
            விரைவில் எமது குழுவினர் உங்களைத் தொடர்பு கொள்வார்கள். உங்கள் ஆர்வத்திற்கு நன்றி.
          </p>
          {whatsappLink && (
            <a
              className="sf-btn-primary"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <FaWhatsapp /> அணியின் WhatsApp குழுவில் இணைய
            </a>
          )}
          <div className="sf-success-actions">
            <button className="sf-btn-ghost" onClick={resetForm}>
              மற்றொரு விண்ணப்பத்தை அனுப்ப
            </button>
            <button className="sf-btn-ghost" onClick={() => navigate("/teams")}>
              அணிகள் பக்கத்திற்குச் செல்ல
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cfg.enabled) {
    return (
      <div className="submit-form-page">
        <div className="sf-success">
          <FaExclamationTriangle className="sf-success-icon" />
          <h1 className="sf-success-title">தற்போது விண்ணப்பங்கள் ஏற்றுக்கொள்ளப்படவில்லை</h1>
          <p className="sf-success-text">
            பின்னர் மீண்டும் முயற்சிக்கவும், அல்லது எங்களைத் தொடர்பு கொள்ளவும்.
          </p>
          <div className="sf-success-actions">
            <button className="sf-btn-ghost" onClick={() => navigate("/teams")}>
              அணிகள் பக்கத்திற்குச் செல்ல
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-form-page">
      <div className="sf-hero">
        <button className="sf-back" onClick={() => navigate("/teams")}>
          <FaArrowLeft /> அணிகள் பக்கத்திற்குத் திரும்ப
        </button>
        <h1 className="sf-hero-title">எங்கள் அணியில் இணையுங்கள்</h1>
        <p className="sf-hero-text">
          கீழுள்ள படிவத்தை நிரப்பவும். <span className="sf-req">*</span> குறியிடப்பட்ட புலங்கள் கட்டாயமானவை.
        </p>
      </div>

      <form className="sf-form" onSubmit={handleSubmit} noValidate>
        {status === "error" && (
          <div className="sf-alert sf-alert-error">
            <FaExclamationTriangle />
            <span>{serverMessage}</span>
          </div>
        )}

        <div className="sf-section">
          <p className="sf-legend">
            <FaUser className="sf-legend-icon" />
            விண்ணப்பப் படிவம்
          </p>

          <div className="sf-grid">
            <Field
              label="பெயர்"
              required
              value={name}
              error={errors.name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="உங்கள் முழுப் பெயர்"
              full
            />

            {cfg.fields.map((f) => {
              const value = answers[f.key] || "";
              const error = errors[f.key];
              const onChange = (e) => setAnswer(f.key, e.target.value);

              if (f.type === "select") {
                return (
                  <SelectField
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    value={value}
                    error={error}
                    onChange={onChange}
                    options={f.options}
                    placeholder={`${f.label}ஐத் தெரிவுசெய்யவும்`}
                  />
                );
              }
              if (f.type === "textarea") {
                return (
                  <TextAreaField
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    value={value}
                    error={error}
                    onChange={onChange}
                    placeholder=""
                  />
                );
              }
              return (
                <Field
                  key={f.key}
                  label={f.label}
                  required={f.required}
                  value={value}
                  error={error}
                  onChange={onChange}
                  placeholder=""
                />
              );
            })}
          </div>
        </div>

        <div className="sf-actions">
          <button type="submit" className="sf-btn-primary" disabled={status === "sending"}>
            {status === "sending" ? (
              <>
                <span className="sf-spinner" /> அனுப்பப்படுகிறது…
              </>
            ) : (
              "விண்ணப்பிக்க"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
