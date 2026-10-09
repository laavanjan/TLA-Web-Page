// /admin/members - the paid TLA members listed on /members. Search and filter
// them the same way as the public page, add, view, edit or remove them, record
// each member's fee and download a receipt for it.
// Main admins only (the database enforces it, see members_admin.sql).
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  FaUserPlus,
  FaSearch,
  FaSyncAlt,
  FaDownload,
  FaEye,
  FaPen,
  FaTrash,
  FaTimes,
  FaMapMarkerAlt,
  FaReceipt,
  FaCog,
  FaFilePdf,
  FaImage,
} from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import { ago } from "../admin/activityText";
import { drawReceipt, downloadReceiptPdf, downloadReceiptImage } from "../admin/memberReceipt";
import {
  fetchMembers,
  addMember,
  updateMember,
  removeMember,
  blankMember,
  useMemberFilters,
  fetchReceiptConfig,
  saveReceiptConfig,
  DEFAULT_RECEIPT_CONFIG,
  isPaid,
  todayYmd,
  formatRupees,
  MEMBER_FIELDS,
  ALL_BATCHES,
  initials,
} from "../shared/members";
import "./Frame.css";
import "./Admin.css";
import "./AdminMembers.css";
import "../Components/members/members.css";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const shortDate = (ymd) => {
  const [y, m, d] = String(ymd).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const FEE_FILTERS = [
  ["", "Fee: all"],
  ["paid", "Fee recorded"],
  ["unpaid", "No fee recorded"],
];

export default function AdminMembers() {
  const [rows, setRows] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState(null); // { mode: "view" | "edit" | "add" | "settings", member }
  const [receiptCfg, setReceiptCfg] = useState(DEFAULT_RECEIPT_CONFIG);
  const [feeFilter, setFeeFilter] = useState("");
  const [busyReceipt, setBusyReceipt] = useState(null); // id of the member whose receipt is being made
  const f = useMemberFilters(rows, { allowAll: true });

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchMembers({ admin: true })
      .then(setRows)
      .catch((err) => {
        setRows((cur) => cur || []);
        setError(`${err.message} Run supabase/migrations/members.sql first if you haven't.`);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    fetchReceiptConfig()
      .then(setReceiptCfg)
      .catch(() => {});
  }, []);

  const batchCounts = useMemo(() => {
    const counts = {};
    (rows || []).forEach((r) => {
      counts[r.batch] = (counts[r.batch] || 0) + 1;
    });
    return counts;
  }, [rows]);

  const shown = useMemo(
    () => f.shown.filter((m) => !feeFilter || (feeFilter === "paid") === isPaid(m)),
    [f.shown, feeFilter]
  );

  const onSaved = (saved, isNew) => {
    setRows((cur) => {
      const rest = (cur || []).filter((r) => r.id !== saved.id);
      return [...rest, saved].sort((a, b) => a.name.localeCompare(b.name));
    });
    setNotice(`${isNew ? "Added" : "Saved"} ${saved.name}.${saved.receipt_no ? ` Receipt ${saved.receipt_no} is ready.` : ""}`);
  };

  const onDelete = async (m) => {
    const receipt = m.receipt_no ? `\n\nTheir receipt ${m.receipt_no} will no longer match a member.` : "";
    if (!window.confirm(`Remove ${m.name} (batch ${m.batch}) from the members list? This can't be undone.${receipt}`)) return;
    setNotice("");
    setError("");
    try {
      await removeMember(m.id);
      setRows((cur) => cur.filter((r) => r.id !== m.id));
      setDialog(null);
      setNotice(`Removed ${m.name}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const receipt = async (m, kind = "pdf") => {
    setBusyReceipt(m.id);
    setError("");
    try {
      await (kind === "pdf" ? downloadReceiptPdf : downloadReceiptImage)(m, receiptCfg);
    } catch (err) {
      setError(`Couldn't make the receipt: ${err.message || "unknown error"}`);
    } finally {
      setBusyReceipt(null);
    }
  };

  const exportCsv = () => {
    const head = ["Name", "Batch", "Faculty", "Department", "District", "Fee", "Paid on", "Receipt no"];
    const lines = [
      head,
      ...shown.map((m) => [m.name, m.batch, ...MEMBER_FIELDS.map(([key]) => m[key]), m.fee_amount, m.paid_on, m.receipt_no]),
    ];
    const blob = new Blob(["\ufeff" + lines.map((l) => l.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `members-${f.active === ALL_BATCHES ? "all" : "batch-" + f.active}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const total = (rows || []).length;
  const paidCount = (rows || []).filter(isPaid).length;
  const batchLabel = f.active === ALL_BATCHES ? "All batches" : `Batch ${f.active}`;
  const openAdd = () =>
    setDialog({ mode: "add", member: blankMember(f.active === ALL_BATCHES ? "" : f.active), nonce: "new" });

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Members · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Members</span>
      </header>

      <div className="admin-hub admin-hub-xwide tj">
        <div className="tj-topnav">
          <Link to="/admin" className="tj-back">
            ← Dashboard
          </Link>
          <a href="/members" target="_blank" rel="noopener noreferrer" className="tj-back">
            Open the members page ↗
          </a>
        </div>

        <section className="tj-section">
          <header className="tj-section-head">
            <div>
              <h3 className="tj-h3">Members</h3>
              <p className="tj-muted">
                {rows === null
                  ? "Loading…"
                  : `${total} member${total === 1 ? "" : "s"} in ${f.batches.length} batch${f.batches.length === 1 ? "" : "es"} · ${paidCount} with a fee recorded`}
              </p>
            </div>
            <div className="tj-head-actions">
              <button type="button" className="tj-btn tj-btn-ghost" onClick={load} disabled={loading}>
                <FaSyncAlt className={loading ? "tj-spin" : ""} /> Refresh
              </button>
              <button type="button" className="tj-btn tj-btn-ghost" onClick={exportCsv} disabled={!shown.length}>
                <FaDownload /> Export CSV
              </button>
              <button type="button" className="tj-btn tj-btn-ghost" onClick={() => setDialog({ mode: "settings" })}>
                <FaCog /> Receipt settings
              </button>
              <button type="button" className="tj-btn" onClick={openAdd} disabled={rows === null}>
                <FaUserPlus /> Add member
              </button>
            </div>
          </header>

          {total > 0 && (
            <div className="tj-filters">
              <div className="tj-team-chips">
                <button
                  type="button"
                  className={`tj-filter-chip${f.active === ALL_BATCHES ? " is-active" : ""}`}
                  onClick={() => f.pickBatch(ALL_BATCHES)}
                >
                  All <b>{total}</b>
                </button>
                {f.batches.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`tj-filter-chip${f.active === b ? " is-active" : ""}`}
                    onClick={() => f.pickBatch(b)}
                  >
                    Batch {b} <b>{batchCounts[b]}</b>
                  </button>
                ))}
              </div>
              <div className="amb-filter-row">
                <label className="tj-search">
                  <FaSearch />
                  <input
                    type="search"
                    value={f.query}
                    onChange={(e) => f.setQuery(e.target.value)}
                    placeholder="Search name, faculty, department, district…"
                  />
                </label>
                {MEMBER_FIELDS.map(([key, label]) => (
                  <select
                    key={key}
                    className="tj-input amb-select"
                    value={f.filters[key]}
                    onChange={(e) => f.setFilter(key, e.target.value)}
                    aria-label={label}
                  >
                    <option value="">{label}: all</option>
                    {f.optionsOf(key).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ))}
                <select
                  className="tj-input amb-select"
                  value={feeFilter}
                  onChange={(e) => setFeeFilter(e.target.value)}
                  aria-label="Membership fee"
                >
                  {FEE_FILTERS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <p className="tj-muted">
                {batchLabel} · {shown.length} shown
              </p>
            </div>
          )}

          {error && <p className="tj-savebar-msg is-err">{error}</p>}
          {notice && !error && <p className="tj-savebar-msg is-ok">{notice}</p>}

          {rows && total === 0 && !error && <p className="tj-empty">No members yet. Add the first one above.</p>}
          {total > 0 && shown.length === 0 && <p className="tj-empty">No members match these filters.</p>}

          {shown.length > 0 && (
            <div className="tj-table-wrap">
              <table className="tj-table">
                <thead>
                  <tr>
                    <th className="tj-col-num">#</th>
                    <th>Name</th>
                    <th>Batch</th>
                    <th>Faculty</th>
                    <th>Department</th>
                    <th>District</th>
                    <th>Fee</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((m, i) => (
                    <tr key={m.id}>
                      <td className="tj-col-num">{i + 1}</td>
                      <td className="tj-col-name">
                        <button type="button" className="amb-name" onClick={() => setDialog({ mode: "view", member: m })}>
                          {m.name}
                        </button>
                      </td>
                      <td>{m.batch}</td>
                      {MEMBER_FIELDS.map(([key]) => (
                        <td key={key} title={m[key] || ""}>
                          {m[key] || <span className="tj-dash">—</span>}
                        </td>
                      ))}
                      <td className="tj-col-date">
                        {isPaid(m) ? (
                          <>
                            {formatRupees(m.fee_amount)}
                            <small>{shortDate(m.paid_on)}</small>
                          </>
                        ) : (
                          <span className="tj-dash">—</span>
                        )}
                      </td>
                      <td className="amb-tools">
                        <button
                          type="button"
                          className="tj-tool amb-receipt"
                          onClick={() => (m.receipt_no ? receipt(m) : setDialog({ mode: "edit", member: m }))}
                          disabled={busyReceipt === m.id}
                          title={m.receipt_no ? `Download receipt ${m.receipt_no}` : "Record the fee to make a receipt"}
                          aria-label={m.receipt_no ? `Download receipt for ${m.name}` : `Record the fee for ${m.name}`}
                          data-ready={m.receipt_no ? "yes" : "no"}
                        >
                          <FaReceipt />
                        </button>
                        <button
                          type="button"
                          className="tj-tool"
                          onClick={() => setDialog({ mode: "view", member: m })}
                          title="View"
                          aria-label={`View ${m.name}`}
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          className="tj-tool"
                          onClick={() => setDialog({ mode: "edit", member: m })}
                          title="Edit"
                          aria-label={`Edit ${m.name}`}
                        >
                          <FaPen />
                        </button>
                        <button
                          type="button"
                          className="tj-tool tj-tool-del"
                          onClick={() => onDelete(m)}
                          title="Remove"
                          aria-label={`Remove ${m.name}`}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {dialog && (
        <div className="amb-modal tj" onMouseDown={(e) => e.target === e.currentTarget && setDialog(null)}>
          <div
            className={`amb-dialog${dialog.mode === "view" ? " is-wide" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="amb-dialog-title"
          >
            {dialog.mode === "settings" ? (
              <ReceiptSettings
                config={receiptCfg}
                onSaved={(cfg) => {
                  setReceiptCfg(cfg);
                  setDialog(null);
                  setNotice("Receipt settings saved.");
                }}
                onClose={() => setDialog(null)}
              />
            ) : dialog.mode === "view" ? (
              <MemberView
                member={dialog.member}
                config={receiptCfg}
                busy={busyReceipt === dialog.member.id}
                onReceipt={(kind) => receipt(dialog.member, kind)}
                onEdit={() => setDialog({ mode: "edit", member: dialog.member })}
                onDelete={() => onDelete(dialog.member)}
                onClose={() => setDialog(null)}
              />
            ) : (
              <MemberForm
                key={dialog.member.id || dialog.nonce}
                member={dialog.member}
                rows={rows || []}
                defaultFee={receiptCfg.default_fee}
                onSaved={(saved, again) => {
                  onSaved(saved, !dialog.member.id);
                  if (again) setDialog({ mode: "add", member: blankMember(saved.batch), nonce: saved.id });
                  else setDialog(saved.receipt_no ? { mode: "view", member: saved } : null);
                }}
                onClose={() => setDialog(null)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DialogHead({ title, onClose }) {
  return (
    <div className="amb-head">
      <h3 className="tj-h3" id="amb-dialog-title">
        {title}
      </h3>
      <button type="button" className="tj-tool" onClick={onClose} aria-label="Close">
        <FaTimes />
      </button>
    </div>
  );
}

// The receipt exactly as it will download.
function ReceiptPreview({ member, config }) {
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    drawReceipt(member, config)
      .then((canvas) => alive && setSrc(canvas.toDataURL("image/jpeg", 0.8)))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [member, config]);

  if (failed) return <p className="tj-savebar-msg is-err">Couldn't draw the receipt preview.</p>;
  if (!src) return <div className="amb-receipt-preview is-loading" aria-hidden="true" />;
  return <img className="amb-receipt-preview" src={src} alt={`Receipt ${member.receipt_no} for ${member.name}`} />;
}

// One member's details: the card as visitors see it, the fee and the receipt.
function MemberView({ member: m, config, busy, onReceipt, onEdit, onDelete, onClose }) {
  const paid = isPaid(m);
  return (
    <div className="amb-panel">
      <DialogHead title={m.name} onClose={onClose} />
      <div className="amb-view">
        <div className="amb-preview">
          <div className="members-card">
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
          <small className="tj-muted">How the card looks on the members page</small>
        </div>
        <dl className="amb-details">
          <dt>Batch</dt>
          <dd>{m.batch}</dd>
          {MEMBER_FIELDS.map(([key, label]) => (
            <React.Fragment key={key}>
              <dt>{label}</dt>
              <dd>{m[key] || <span className="tj-dash">—</span>}</dd>
            </React.Fragment>
          ))}
          <dt>Membership fee</dt>
          <dd>{paid ? `${formatRupees(m.fee_amount)} · paid ${shortDate(m.paid_on)}` : <span className="tj-dash">Not recorded</span>}</dd>
          {m.receipt_no && (
            <>
              <dt>Receipt no.</dt>
              <dd>{m.receipt_no}</dd>
            </>
          )}
          {m.created_at && (
            <>
              <dt>Added</dt>
              <dd>{new Date(m.created_at).toLocaleDateString()}</dd>
            </>
          )}
          {m.updated_at && m.created_at && m.updated_at.slice(0, 19) !== m.created_at.slice(0, 19) && (
            <>
              <dt>Last changed</dt>
              <dd>{ago(m.updated_at)}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="amb-receipt-box">
        <span className="tj-control-label">
          <FaReceipt /> Membership fee receipt
        </span>
        {m.receipt_no ? (
          <>
            <ReceiptPreview member={m} config={config} />
            {!config.treasurer_name && (
              <small className="tj-muted">Tip: add the treasurer's name in Receipt settings to print it above the signature line.</small>
            )}
            <div className="amb-actions">
              <button type="button" className="tj-btn tj-btn-ghost" onClick={() => onReceipt("image")} disabled={busy}>
                <FaImage /> Download image
              </button>
              <button type="button" className="tj-btn" onClick={() => onReceipt("pdf")} disabled={busy}>
                <FaFilePdf /> {busy ? "Preparing…" : "Download PDF"}
              </button>
            </div>
          </>
        ) : (
          <p className="tj-muted">
            {paid
              ? "This fee was recorded before receipts were set up. Open Edit and save once to give it a receipt number."
              : "No fee recorded yet. Edit the member, tick “Membership fee paid” and save to get a receipt."}
          </p>
        )}
      </div>

      <div className="amb-actions">
        <button type="button" className="tj-btn tj-btn-ghost amb-danger" onClick={onDelete}>
          <FaTrash /> Remove
        </button>
        <button type="button" className="tj-btn" onClick={onEdit}>
          <FaPen /> {paid ? "Edit" : "Edit / record fee"}
        </button>
      </div>
    </div>
  );
}

// Add or edit. Faculty, department and district suggest the values already in
// use, so the public filters don't split on spelling differences.
function MemberForm({ member, rows, defaultFee, onSaved, onClose }) {
  const isNew = !member.id;
  const wasPaid = isPaid(member);
  const [draft, setDraft] = useState(() => ({
    ...member,
    batch: member.batch ?? "",
    paid: wasPaid,
    fee_amount: wasPaid ? member.fee_amount : defaultFee ?? "",
    paid_on: member.paid_on || todayYmd(),
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef(null);

  useEffect(() => {
    if (nameRef.current) nameRef.current.focus();
  }, []);

  const suggestions = useMemo(() => {
    const of = (key, keep = () => true) =>
      [...new Set(rows.filter(keep).map((r) => r[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
    return {
      batch: of("batch"),
      faculty: of("faculty"),
      // The chosen faculty's departments, or every department for a new faculty.
      department: rows.some((r) => r.faculty === draft.faculty)
        ? of("department", (r) => r.faculty === draft.faculty)
        : of("department"),
      district: of("district"),
    };
  }, [rows, draft.faculty]);

  const duplicate = useMemo(() => {
    const name = String(draft.name || "").trim().toLowerCase();
    if (!name) return null;
    return rows.find((r) => r.id !== member.id && r.name.trim().toLowerCase() === name && String(r.batch) === String(draft.batch)) || null;
  }, [rows, draft.name, draft.batch, member.id]);

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  const save = async (again) => {
    setBusy(true);
    setError("");
    try {
      const saved = isNew ? await addMember(draft) : await updateMember(member.id, draft);
      onSaved(saved, again);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form
      className="amb-panel"
      onSubmit={(e) => {
        e.preventDefault();
        save(false);
      }}
    >
      <DialogHead title={isNew ? "Add member" : `Edit ${member.name}`} onClose={onClose} />
      <div className="amb-grid">
        <label className="tj-control amb-wide">
          <span className="tj-control-label">Name</span>
          <input ref={nameRef} className="tj-input" value={draft.name} onChange={set("name")} maxLength={120} required />
        </label>
        <label className="tj-control">
          <span className="tj-control-label">Batch</span>
          <input
            className="tj-input"
            type="number"
            inputMode="numeric"
            min="1"
            max="999"
            value={draft.batch}
            onChange={set("batch")}
            list="amb-batch"
            required
          />
        </label>
        {MEMBER_FIELDS.map(([key, label]) => (
          <label key={key} className="tj-control">
            <span className="tj-control-label">{label}</span>
            <input className="tj-input" value={draft[key] || ""} onChange={set(key)} list={`amb-${key}`} maxLength={120} />
          </label>
        ))}
      </div>
      {["batch", ...MEMBER_FIELDS.map(([key]) => key)].map((key) => (
        <datalist key={key} id={`amb-${key}`}>
          {suggestions[key].map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
      ))}

      <div className="amb-fee">
        <label className="admin-check-row amb-check">
          <input type="checkbox" checked={draft.paid} onChange={(e) => setDraft((d) => ({ ...d, paid: e.target.checked }))} />
          Membership fee paid
          {member.receipt_no && <span className="amb-receipt-no">Receipt {member.receipt_no}</span>}
        </label>
        {draft.paid && (
          <div className="amb-grid">
            <label className="tj-control">
              <span className="tj-control-label">Amount paid (Rs.)</span>
              <input
                className="tj-input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={draft.fee_amount ?? ""}
                onChange={set("fee_amount")}
                required
              />
            </label>
            <label className="tj-control">
              <span className="tj-control-label">Date paid</span>
              <input className="tj-input" type="date" max={todayYmd()} value={draft.paid_on || ""} onChange={set("paid_on")} required />
            </label>
          </div>
        )}
        {wasPaid && !draft.paid && member.receipt_no && (
          <p className="tj-savebar-msg amb-warn">
            Saving cancels receipt {member.receipt_no}. Recording the fee again later gives a new receipt number.
          </p>
        )}
        {draft.paid && !wasPaid && <small className="tj-muted">A receipt number is given when you save.</small>}
      </div>

      {duplicate && (
        <p className="tj-savebar-msg amb-warn">
          There's already a {duplicate.name} in batch {duplicate.batch}. Check it isn't the same person.
        </p>
      )}
      {error && <p className="tj-savebar-msg is-err">{error}</p>}

      <div className="amb-actions">
        <button type="button" className="tj-btn tj-btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        {isNew && (
          <button type="button" className="tj-btn tj-btn-ghost" onClick={() => save(true)} disabled={busy}>
            Save &amp; add another
          </button>
        )}
        <button type="submit" className="tj-btn" disabled={busy}>
          {busy ? "Saving…" : isNew ? "Add member" : "Save"}
        </button>
      </div>
    </form>
  );
}

// The fee filled in by default and who signs the receipts. Shared by every admin.
function ReceiptSettings({ config, onSaved, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...config, default_fee: config.default_fee ?? "" }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <form
      className="amb-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          onSaved(await saveReceiptConfig(draft));
        } catch (err) {
          setError(err.message);
          setBusy(false);
        }
      }}
    >
      <DialogHead title="Receipt settings" onClose={onClose} />
      <label className="tj-control">
        <span className="tj-control-label">Membership fee (Rs.)</span>
        <input
          className="tj-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={draft.default_fee}
          onChange={set("default_fee")}
          placeholder="e.g. 500"
        />
        <small className="tj-muted">Filled in when you record a fee. You can still change it for one member.</small>
      </label>
      <div className="amb-grid">
        <label className="tj-control">
          <span className="tj-control-label">Treasurer's name</span>
          <input className="tj-input" value={draft.treasurer_name} onChange={set("treasurer_name")} maxLength={80} />
        </label>
        <label className="tj-control">
          <span className="tj-control-label">Title</span>
          <input className="tj-input" value={draft.treasurer_title} onChange={set("treasurer_title")} maxLength={60} placeholder="Treasurer" />
        </label>
      </div>
      <small className="tj-muted">
        Printed under the signature line. Each receipt keeps the treasurer set when it was issued, so changing this
        doesn't change receipts already given out (ones issued before any name was set use this one).
      </small>
      {error && <p className="tj-savebar-msg is-err">{error}</p>}
      <div className="amb-actions">
        <button type="button" className="tj-btn tj-btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="tj-btn" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
