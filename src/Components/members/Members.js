import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../helpers/supabaseClient";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./members.css";

const initials = (name) =>
    name
        .split(/[\s.]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");

const BATCH_ORDER = (a, b) => b - a;

const Members = () => {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(false);
    const [batch, setBatch] = useState(null);
    const [query, setQuery] = useState("");
    const [faculty, setFaculty] = useState("");
    const [department, setDepartment] = useState("");
    const [district, setDistrict] = useState("");

    useEffect(() => {
        let alive = true;
        supabase
            .from("members")
            .select("id,batch,name,faculty,department,district")
            .order("name")
            .range(0, 4999)
            .then(({ data, error: err }) => {
                if (!alive) return;
                if (err) return setError(true);
                setRows(data || []);
            });
        return () => {
            alive = false;
        };
    }, []);

    const batches = useMemo(
        () => [...new Set((rows || []).map((r) => r.batch))].sort(BATCH_ORDER),
        [rows]
    );
    const active = batch ?? batches[0];

    const batchRows = useMemo(
        () => (rows || []).filter((r) => r.batch === active),
        [rows, active]
    );
    const optionsOf = (key) =>
        [...new Set(batchRows.map((r) => r[key]).filter(Boolean))].sort((a, b) =>
            a.localeCompare(b)
        );

    const pickBatch = (b) => {
        setBatch(b);
        setFaculty("");
        setDepartment("");
        setDistrict("");
    };

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return batchRows.filter(
            (r) =>
                (!faculty || r.faculty === faculty) &&
                (!department || r.department === department) &&
                (!district || r.district === district) &&
                (!q ||
                    [r.name, r.faculty, r.department, r.district]
                        .filter(Boolean)
                        .some((v) => v.toLowerCase().includes(q)))
        );
    }, [batchRows, query, faculty, department, district]);

    return (
        <div className="members">
            <h1>எங்கள் உறுப்பினர்கள்</h1>
            <p className="members-intro">
                தமிழ் இலக்கிய மன்றத்தின் அங்கத்தவர்களாக இணைந்து எம்மோடு பயணிக்கும் அனைத்து
                உறவுகளுக்கும் நன்றி.
            </p>

            {error && <p className="members-note">உறுப்பினர் பட்டியலை ஏற்ற முடியவில்லை.</p>}
            {!rows && !error && <p className="members-note">ஏற்றுகிறது…</p>}

            {rows && (
                <>
                    <div className="members-tabs">
                        {batches.map((b) => (
                            <button
                                key={b}
                                className={b === active ? "members-tab active" : "members-tab"}
                                onClick={() => pickBatch(b)}
                            >
                                தொகுதி {b}
                            </button>
                        ))}
                    </div>

                    <input
                        className="members-search"
                        type="search"
                        placeholder="பெயர் / துறை / மாவட்டம் தேடுங்கள்"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="members-filters">
                        {[
                            ["faculty", "பீடம் (Faculty)", faculty, setFaculty],
                            ["department", "துறை (Department)", department, setDepartment],
                            ["district", "மாவட்டம் (District)", district, setDistrict],
                        ].map(([key, label, value, set]) => (
                            <select
                                key={key}
                                className="members-select"
                                value={value}
                                onChange={(e) => set(e.target.value)}
                            >
                                <option value="">{label} - அனைத்தும்</option>
                                {optionsOf(key).map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        ))}
                    </div>
                    <p className="members-count">
                        தொகுதி {active} · {shown.length} உறுப்பினர்கள்
                    </p>

                    <div className="members-grid">
                        {shown.map((m) => (
                            <div className="members-card" key={m.id}>
                                <div className="members-avatar">{initials(m.name)}</div>
                                <span className="members-name">{m.name}</span>
                                <span className="members-dept">{m.department}</span>
                                <div className="members-foot">
                                    <span className="members-faculty">{m.faculty}</span>
                                    {m.district && (
                                        <span className="members-district">
                                            <FaMapMarkerAlt /> {m.district}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Members;
