import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBookOpen,
  FaFileUpload,
  FaFileWord,
  FaImage,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";
import "./submitForm.css";
import {
  WORK_TYPE_OPTIONS,
  FACULTY_OPTIONS,
  MAX_DOC_SIZE,
  MAX_PHOTO_SIZE,
  ACCEPTED_DOC_TYPES,
  ACCEPTED_PHOTO_TYPES,
} from "./formOptions";

// Paste the deployed Google Apps Script Web App URL here (see google-apps-script/README.md).
const APPS_SCRIPT_URL = process.env.REACT_APP_SUBMIT_URL || "";

const INITIAL_VALUES = {
  fullName: "",
  penName: "",
  faculty: "",
  department: "",
  batch: "",
  phone: "",
  email: "",
  workType: "",
  workTitle: "",
  wordCount: "",
  intro: "",
  alreadyPublished: "no",
  publishedWhere: "",
  agreed: false,
};

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result looks like "data:<mime>;base64,<payload>" — keep only the payload.
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("file read failed"));
    reader.readAsDataURL(file);
  });

const formatSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const SubmitForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [docFile, setDocFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverMessage, setServerMessage] = useState("");

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ACCEPTED_DOC_TYPES.includes(file.type) && !file.name.match(/\.docx?$/i)) {
      setErrors((prev) => ({ ...prev, docFile: "Microsoft Word (.doc / .docx) கோப்பு மட்டுமே ஏற்றுக்கொள்ளப்படும்." }));
      return;
    }
    if (file.size > MAX_DOC_SIZE) {
      setErrors((prev) => ({ ...prev, docFile: `கோப்பின் அளவு ${formatSize(MAX_DOC_SIZE)}-ஐ விடக் குறைவாக இருக்க வேண்டும்.` }));
      return;
    }
    setDocFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.docFile;
      return next;
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, photoFile: "JPG, PNG அல்லது WEBP படம் மட்டுமே ஏற்றுக்கொள்ளப்படும்." }));
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setErrors((prev) => ({ ...prev, photoFile: `படத்தின் அளவு ${formatSize(MAX_PHOTO_SIZE)}-ஐ விடக் குறைவாக இருக்க வேண்டும்.` }));
      return;
    }
    setPhotoFile(file);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.photoFile;
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!values.fullName.trim()) next.fullName = "முழுப் பெயரை வழங்கவும்.";
    if (!values.faculty) next.faculty = "பீடத்தைத் தெரிவுசெய்யவும்.";
    if (!values.department.trim()) next.department = "துறையை வழங்கவும்.";
    if (!values.batch.trim()) next.batch = "கல்வியாண்டை வழங்கவும்.";

    if (!values.phone.trim()) {
      next.phone = "தொடர்பு இலக்கத்தை வழங்கவும்.";
    } else if (!/^[0-9+\s-]{9,15}$/.test(values.phone.trim())) {
      next.phone = "சரியான தொடர்பு இலக்கத்தை வழங்கவும்.";
    }

    if (!values.email.trim()) {
      next.email = "மின்னஞ்சல் முகவரியை வழங்கவும்.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "சரியான மின்னஞ்சல் முகவரியை வழங்கவும்.";
    }

    if (!values.workType) next.workType = "படைப்பின் வகையைத் தெரிவுசெய்யவும்.";
    if (!values.workTitle.trim()) next.workTitle = "படைப்பின் தலைப்பை வழங்கவும்.";

    if (!values.wordCount.trim()) {
      next.wordCount = "சொற்களின் எண்ணிக்கையை வழங்கவும்.";
    } else if (!/^\d+$/.test(values.wordCount.trim())) {
      next.wordCount = "எண்களை மட்டும் உள்ளிடவும்.";
    }

    if (!values.intro.trim()) {
      next.intro = "சுருக்கமான அறிமுகத்தை வழங்கவும்.";
    } else if (values.intro.trim().length < 20) {
      next.intro = "அறிமுகம் குறைந்தது 20 எழுத்துகளாவது இருக்க வேண்டும்.";
    }

    if (values.alreadyPublished === "yes" && !values.publishedWhere.trim()) {
      next.publishedWhere = "எங்கு வெளிவந்தது என்பதைக் குறிப்பிடவும்.";
    }

    if (!docFile) next.docFile = "படைப்பின் Word கோப்பை இணைக்கவும்.";
    if (!values.agreed) next.agreed = "விதிமுறைகளை ஏற்றுக்கொள்ள வேண்டும்.";

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (!APPS_SCRIPT_URL) {
      setStatus("error");
      setServerMessage(
        "சமர்ப்பிப்பு இணைப்பு இன்னும் அமைக்கப்படவில்லை. நிர்வாகியைத் தொடர்பு கொள்ளவும்."
      );
      return;
    }

    setStatus("sending");
    setServerMessage("");

    try {
      const payload = {
        ...values,
        submittedAt: new Date().toISOString(),
        document: {
          name: docFile.name,
          mimeType: docFile.type || "application/octet-stream",
          data: await readFileAsBase64(docFile),
        },
        photo: photoFile
          ? {
              name: photoFile.name,
              mimeType: photoFile.type,
              data: await readFileAsBase64(photoFile),
            }
          : null,
      };

      // text/plain keeps this a "simple" request so the browser skips the CORS
      // preflight — Apps Script web apps do not answer OPTIONS.
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "submission rejected");
      }

      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("error");
      setServerMessage(
        "படைப்பை அனுப்புவதில் பிழை ஏற்பட்டது. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
      );
    }
  };

  const resetForm = () => {
    setValues(INITIAL_VALUES);
    setDocFile(null);
    setPhotoFile(null);
    setErrors({});
    setStatus("idle");
    setServerMessage("");
  };

  if (status === "success") {
    return (
      <div className="submit-form-page">
        <div className="sf-success">
          <FaCheckCircle className="sf-success-icon" />
          <h1 className="sf-success-title">படைப்பு வெற்றிகரமாகச் சமர்ப்பிக்கப்பட்டது!</h1>
          <p className="sf-success-text">
            உங்கள் படைப்பு எமக்குக் கிடைத்துவிட்டது. ஆசிரியர் குழுவினரால் பரிசீலிக்கப்பட்டு, தெரிவு
            செய்யப்பட்டால் உங்கள் மின்னஞ்சல் முகவரிக்கு அறிவிக்கப்படும். உங்கள் பங்களிப்புக்கு மிக்க நன்றி.
          </p>
          <div className="sf-success-actions">
            <button className="sf-btn-primary" onClick={resetForm}>
              மற்றொரு படைப்பை அனுப்ப
            </button>
            <button className="sf-btn-ghost" onClick={() => navigate("/books")}>
              நூல்கள் பக்கத்திற்குச் செல்ல
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-form-page">
      <div className="sf-hero">
        <button className="sf-back" onClick={() => navigate("/books/submit")}>
          <FaArrowLeft /> வழிகாட்டல்களுக்குத் திரும்ப
        </button>
        <h1 className="sf-hero-title">படைப்பைச் சமர்ப்பிக்க</h1>
        <p className="sf-hero-text">
          கீழுள்ள படிவத்தை நிரப்பி உங்கள் படைப்பை எமக்கு அனுப்பவும். <span className="sf-req">*</span> குறியிடப்பட்ட
          புலங்கள் கட்டாயமானவை.
        </p>
      </div>

      <form className="sf-form" onSubmit={handleSubmit} noValidate>
        {status === "error" && (
          <div className="sf-alert sf-alert-error">
            <FaExclamationTriangle />
            <span>{serverMessage}</span>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="sf-alert sf-alert-warn">
            <FaExclamationTriangle />
            <span>சில புலங்கள் நிரப்பப்படவில்லை அல்லது தவறாக உள்ளன. கீழே சரிபார்க்கவும்.</span>
          </div>
        )}

        {/* Personal details */}
        <div className="sf-section">
          <p className="sf-legend">
            <FaUser className="sf-legend-icon" />
            தனிப்பட்ட தகவல்கள்
          </p>

          <div className="sf-grid">
            <Field
              label="முழுப் பெயர்"
              name="fullName"
              required
              value={values.fullName}
              error={errors.fullName}
              onChange={handleChange}
              placeholder="உ.ம். ம. திகர்ணன்"
            />
            <Field
              label="புனைபெயர்"
              name="penName"
              value={values.penName}
              error={errors.penName}
              onChange={handleChange}
              placeholder="இருப்பின் மட்டும்"
            />
            <SelectField
              label="பீடம்"
              name="faculty"
              required
              value={values.faculty}
              error={errors.faculty}
              onChange={handleChange}
              options={FACULTY_OPTIONS}
              placeholder="பீடத்தைத் தெரிவுசெய்யவும்"
            />
            <Field
              label="துறை"
              name="department"
              required
              value={values.department}
              error={errors.department}
              onChange={handleChange}
              placeholder="உ.ம். கணினி விஞ்ஞானம் & பொறியியல்"
            />
            <Field
              label="கல்வியாண்டு (Batch)"
              name="batch"
              required
              value={values.batch}
              error={errors.batch}
              onChange={handleChange}
              placeholder="உ.ம். TMLE 24"
            />
            <Field
              label="தொடர்பு இலக்கம்"
              name="phone"
              type="tel"
              required
              value={values.phone}
              error={errors.phone}
              onChange={handleChange}
              placeholder="உ.ம். 0771234567"
            />
            <Field
              label="மின்னஞ்சல் முகவரி"
              name="email"
              type="email"
              required
              value={values.email}
              error={errors.email}
              onChange={handleChange}
              placeholder="உ.ம். name@uom.lk"
              full
            />
          </div>
        </div>

        {/* Work details */}
        <div className="sf-section">
          <p className="sf-legend">
            <FaBookOpen className="sf-legend-icon" />
            படைப்பு பற்றிய தகவல்கள்
          </p>

          <div className="sf-grid">
            <SelectField
              label="படைப்பின் வகை"
              name="workType"
              required
              value={values.workType}
              error={errors.workType}
              onChange={handleChange}
              options={WORK_TYPE_OPTIONS}
              placeholder="வகையைத் தெரிவுசெய்யவும்"
            />
            <Field
              label="படைப்பின் தலைப்பு"
              name="workTitle"
              required
              value={values.workTitle}
              error={errors.workTitle}
              onChange={handleChange}
              placeholder="உ.ம். விட்டில் பூச்சி"
            />
            <Field
              label="சொற்களின் எண்ணிக்கை"
              name="wordCount"
              required
              value={values.wordCount}
              error={errors.wordCount}
              onChange={handleChange}
              placeholder="உ.ம். 420"
            />

            <div className="sf-field" data-field="alreadyPublished">
              <label className="sf-label">ஏற்கனவே வேறு தளத்தில் வெளிவந்ததா?</label>
              <div className="sf-radio-row">
                <label className="sf-radio">
                  <input
                    type="radio"
                    name="alreadyPublished"
                    value="no"
                    checked={values.alreadyPublished === "no"}
                    onChange={handleChange}
                  />
                  <span>இல்லை</span>
                </label>
                <label className="sf-radio">
                  <input
                    type="radio"
                    name="alreadyPublished"
                    value="yes"
                    checked={values.alreadyPublished === "yes"}
                    onChange={handleChange}
                  />
                  <span>ஆம்</span>
                </label>
              </div>
            </div>

            {values.alreadyPublished === "yes" && (
              <Field
                label="எங்கு வெளிவந்தது?"
                name="publishedWhere"
                required
                value={values.publishedWhere}
                error={errors.publishedWhere}
                onChange={handleChange}
                placeholder="தளத்தின் பெயர் / இணைப்பு"
                full
              />
            )}

            <div className="sf-field sf-full" data-field="intro">
              <label className="sf-label" htmlFor="intro">
                படைப்பின் சுருக்கமான அறிமுகம் <span className="sf-req">*</span>
              </label>
              <textarea
                id="intro"
                name="intro"
                className={errors.intro ? "sf-textarea sf-invalid" : "sf-textarea"}
                rows={4}
                value={values.intro}
                onChange={handleChange}
                placeholder="2 அல்லது 3 வரிகளில் உங்கள் படைப்பை அறிமுகப்படுத்தவும்"
              />
              <div className="sf-help-row">
                {errors.intro ? (
                  <span className="sf-error">{errors.intro}</span>
                ) : (
                  <span className="sf-hint">2–3 வரிகள் போதுமானது</span>
                )}
                <span className="sf-count">{values.intro.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uploads */}
        <div className="sf-section">
          <p className="sf-legend">
            <FaFileUpload className="sf-legend-icon" />
            கோப்புகளை இணைக்க
          </p>

          <div className="sf-upload-grid">
            <FileDrop
              id="docFile"
              label="படைப்பின் Word கோப்பு"
              required
              icon={<FaFileWord />}
              accept=".doc,.docx"
              file={docFile}
              error={errors.docFile}
              hint="Category_Name_Batch.docx - அதிகபட்சம் 10 MB"
              onChange={handleDocChange}
              onClear={() => setDocFile(null)}
            />
            <FileDrop
              id="photoFile"
              label="எழுத்தாளரின் புகைப்படம்"
              icon={<FaImage />}
              accept="image/jpeg,image/png,image/webp"
              file={photoFile}
              error={errors.photoFile}
              hint="JPG / PNG / WEBP - அதிகபட்சம் 5 MB"
              onChange={handlePhotoChange}
              onClear={() => setPhotoFile(null)}
            />
          </div>
        </div>

        {/* Declaration */}
        <div className="sf-field sf-declaration" data-field="agreed">
          <label className="sf-check">
            <input type="checkbox" name="agreed" checked={values.agreed} onChange={handleChange} />
            <span>
              இப்படைப்பு எனது சொந்த ஆக்கம் என்பதையும், வழிகாட்டல்களில் குறிப்பிடப்பட்ட விதிமுறைகளை நான்
              ஏற்றுக்கொள்வதையும் உறுதிப்படுத்துகிறேன். <span className="sf-req">*</span>
            </span>
          </label>
          {errors.agreed && <span className="sf-error">{errors.agreed}</span>}
        </div>

        <div className="sf-actions">
          <button type="submit" className="sf-btn-primary" disabled={status === "sending"}>
            {status === "sending" ? (
              <>
                <span className="sf-spinner" /> அனுப்பப்படுகிறது…
              </>
            ) : (
              "படைப்பைச் சமர்ப்பிக்க"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, name, value, error, onChange, placeholder, required, type = "text", full }) => (
  <div className={full ? "sf-field sf-full" : "sf-field"} data-field={name}>
    <label className="sf-label" htmlFor={name}>
      {label} {required && <span className="sf-req">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      className={error ? "sf-input sf-invalid" : "sf-input"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <span className="sf-error">{error}</span>}
  </div>
);

const SelectField = ({ label, name, value, error, onChange, options, placeholder, required }) => (
  <div className="sf-field" data-field={name}>
    <label className="sf-label" htmlFor={name}>
      {label} {required && <span className="sf-req">*</span>}
    </label>
    <select
      id={name}
      name={name}
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

const FileDrop = ({ id, label, icon, accept, file, error, hint, onChange, onClear, required }) => (
  <div className="sf-field" data-field={id}>
    <label className="sf-label" htmlFor={id}>
      {label} {required && <span className="sf-req">*</span>}
    </label>

    {file ? (
      <div className="sf-file-chosen">
        <span className="sf-file-icon">{icon}</span>
        <div className="sf-file-meta">
          <span className="sf-file-name">{file.name}</span>
          <span className="sf-file-size">{formatSize(file.size)}</span>
        </div>
        <button type="button" className="sf-file-clear" onClick={onClear} aria-label="கோப்பை நீக்க">
          <FaTimes />
        </button>
      </div>
    ) : (
      <label className={error ? "sf-dropzone sf-invalid" : "sf-dropzone"} htmlFor={id}>
        <span className="sf-drop-icon">{icon}</span>
        <span className="sf-drop-text">கோப்பைத் தெரிவுசெய்ய அழுத்தவும்</span>
        <span className="sf-drop-hint">{hint}</span>
      </label>
    )}

    <input id={id} type="file" accept={accept} onChange={onChange} className="sf-file-input" />
    {error && <span className="sf-error">{error}</span>}
  </div>
);

export default SubmitForm;
