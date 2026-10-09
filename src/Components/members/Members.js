import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { fetchMembers, useMemberFilters, MEMBER_FIELDS, initials } from "../../shared/members";
import "./members.css";

const Members = () => {
    const [rows, setRows] = useState(null);
    const [error, setError] = useState(false);
    const { batches, active, pickBatch, query, setQuery, filters, setFilter, optionsOf, shown } =
        useMemberFilters(rows);

    useEffect(() => {
        let alive = true;
        fetchMembers()
            .then((data) => alive && setRows(data))
            .catch(() => alive && setError(true));
        return () => {
            alive = false;
        };
    }, []);

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
                        {MEMBER_FIELDS.map(([key, label]) => (
                            <select
                                key={key}
                                className="members-select"
                                value={filters[key]}
                                onChange={(e) => setFilter(key, e.target.value)}
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
