// /admin/editors — main admins create and manage admin panel accounts: editors
// (only the team pages, join requests and event pages they are given) and
// other main admins.
// All changes go through the admin-users Edge Function and are logged.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  FaUserPlus,
  FaUserEdit,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaCopy,
  FaRandom,
  FaSyncAlt,
  FaUserShield,
  FaHistory,
} from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import { useAdminRole } from "../admin/adminRole";
import {
  listAccounts,
  createAccount,
  updateAccount,
  resetPassword,
  revealPassword,
  setAccountDisabled,
  removeAccount,
  generatePassword,
  MIN_PASSWORD,
} from "../admin/adminUsers";
import { getCachedTeamPages, fetchTeamPages } from "../shared/teamPages";
import { getCachedEventPages } from "../shared/eventPages";
import { EVENT_CATEGORIES } from "../shared/eventSections";
import "./Frame.css";
import "./Admin.css";
import "./AdminEditors.css";

function ago(iso) {
  if (!iso) return "never";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} days ago`;
  return new Date(iso).toLocaleDateString();
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function PasswordInput({ value, onChange, autoFocus }) {
  const [show, setShow] = useState(true);
  return (
    <div className="ae-pass">
      <input
        className="tj-input ae-mono"
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={MIN_PASSWORD}
        required
        autoComplete="new-password"
        spellCheck={false}
        autoFocus={autoFocus}
        placeholder={`At least ${MIN_PASSWORD} characters`}
      />
      <button type="button" className="tj-tool" onClick={() => setShow((v) => !v)} title={show ? "Hide" : "Show"} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>
      <button type="button" className="tj-btn tj-btn-ghost" onClick={() => onChange(generatePassword())}>
        <FaRandom /> Generate
      </button>
    </div>
  );
}

function TeamPicker({ teams, value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((t) => t !== id) : [...value, id].sort((a, b) => a - b));
  return (
    <div className="ae-teams">
      {teams.map((t) => (
        <button
          type="button"
          key={t.id}
          className={`ae-team-chip${value.includes(t.id) ? " is-on" : ""}`}
          aria-pressed={value.includes(t.id)}
          onClick={() => toggle(t.id)}
        >
          {value.includes(t.id) && <FaCheckCircle />} {t.title}
        </button>
      ))}
    </div>
  );
}

// Events grouped like the home page. A sub-page is named after its event.
function EventPicker({ events, value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((e) => e !== id) : [...value, id].sort());
  const label = (e) => {
    const parent = e.parent && events.find((p) => p.id === e.parent);
    return parent ? `${parent.title} › ${e.title}` : e.title;
  };
  return (
    <div className="ae-events">
      {EVENT_CATEGORIES.map((c) => {
        const inGroup = events.filter((e) => e.category === c.id);
        if (!inGroup.length) return null;
        return (
          <div className="ae-event-group" key={c.id}>
            <span className="ae-event-group-name">{c.title}</span>
            <div className="ae-teams">
              {inGroup.map((e) => (
                <button
                  type="button"
                  key={e.id}
                  className={`ae-team-chip${value.includes(e.id) ? " is-on" : ""}`}
                  aria-pressed={value.includes(e.id)}
                  onClick={() => toggle(e.id)}
                >
                  {value.includes(e.id) && <FaCheckCircle />} {label(e)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RolePicker({ value, onChange, disabled }) {
  return (
    <div className="ae-role" role="radiogroup" aria-label="Role">
      {[
        ["editor", "Editor", "Only the teams and events you pick"],
        ["admin", "Main admin", "Everything, including this page"],
      ].map(([v, label, hint]) => (
        <button
          type="button"
          key={v}
          role="radio"
          aria-checked={value === v}
          className={value === v ? "is-on" : ""}
          onClick={() => onChange(v)}
          disabled={disabled}
        >
          <strong>{label}</strong>
          <small>{hint}</small>
        </button>
      ))}
    </div>
  );
}

// Create (no `account`) or edit an account.
function AccountForm({ account, teams, events, isSelf, onDone, onCancel }) {
  const editing = !!account;
  const [name, setName] = useState(account ? account.name : "");
  const [email, setEmail] = useState(account ? account.email : "");
  const [role, setRole] = useState(account ? account.role : "editor");
  const [picked, setPicked] = useState(account ? account.teams : []);
  const [pickedEvents, setPickedEvents] = useState(account ? account.events || [] : []);
  const [password, setPassword] = useState(() => (editing ? "" : generatePassword()));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (role === "editor" && !picked.length && !pickedEvents.length) {
      setError("Pick at least one team or event.");
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        await updateAccount(account.userId, { name, email, role, teams: picked, events: pickedEvents });
        onDone({ type: "ok", text: `Saved ${name}.` });
      } else {
        await createAccount({ name, email, password, role, teams: picked, events: pickedEvents });
        onDone({ type: "created", text: `Created ${name}.`, email: email.trim().toLowerCase(), password });
      }
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="ae-form" onSubmit={submit}>
      <h3 className="tj-h3">{editing ? `Edit ${account.name || account.email}` : "Add a person"}</h3>
      <div className="ae-grid">
        <label className="tj-control">
          <span className="tj-control-label">Name</span>
          <input className="tj-input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} autoFocus={!editing} />
        </label>
        <label className="tj-control">
          <span className="tj-control-label">Email (they sign in with this)</span>
          <input className="tj-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required spellCheck={false} />
        </label>
      </div>
      <div className="tj-control">
        <span className="tj-control-label">Role</span>
        <RolePicker value={role} onChange={setRole} disabled={isSelf} />
        {isSelf && <small className="tj-muted">You can't change your own role.</small>}
      </div>
      {role === "editor" && (
        <>
          <div className="tj-control">
            <span className="tj-control-label">Teams they can edit</span>
            <TeamPicker teams={teams} value={picked} onChange={setPicked} />
          </div>
          <div className="tj-control">
            <span className="tj-control-label">
              Events they can edit ({pickedEvents.length})
              <button type="button" className="ts-link-btn" onClick={() => setPickedEvents(events.map((e) => e.id).sort())}>
                All
              </button>
              <button type="button" className="ts-link-btn" onClick={() => setPickedEvents([])}>
                None
              </button>
            </span>
            <EventPicker events={events} value={pickedEvents} onChange={setPickedEvents} />
            <small className="tj-muted">An editor can be given as many events as you like, and teams as well.</small>
          </div>
        </>
      )}
      {!editing && (
        <div className="tj-control">
          <span className="tj-control-label">Password</span>
          <PasswordInput value={password} onChange={setPassword} />
          <small className="tj-muted">
            You'll see it again after saving, so you can send it to them.
            {role === "editor" && " You can look it up later too, even if they change it."}
          </small>
        </div>
      )}
      {error && <p className="tj-savebar-msg is-err">{error}</p>}
      <div className="ae-form-actions">
        <button type="button" className="tj-btn tj-btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="frame-btn frame-btn-primary" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save" : "Create account"}
        </button>
      </div>
    </form>
  );
}

function ResetPanel({ account, onDone, onCancel }) {
  const [password, setPassword] = useState(generatePassword);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await resetPassword(account.userId, password);
      onDone({ type: "created", text: `New password set for ${account.name || account.email}.`, email: account.email, password });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  return (
    <form className="ae-panel" onSubmit={submit}>
      <span className="tj-control-label">New password for {account.name || account.email}</span>
      <PasswordInput value={password} onChange={setPassword} autoFocus />
      <small className="tj-muted">They'll need this next time they sign in. Anyone signed in with the old one stays signed in until they sign out.</small>
      {error && <p className="tj-savebar-msg is-err">{error}</p>}
      <div className="ae-form-actions">
        <button type="button" className="tj-btn tj-btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="frame-btn frame-btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Set password"}
        </button>
      </div>
    </form>
  );
}

function Revealed({ password, onHide }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const t = setTimeout(onHide, 30000); // don't leave it on screen
    return () => clearTimeout(t);
  }, [onHide]);
  return (
    <div className="ae-revealed">
      <code className="ae-mono">{password}</code>
      <button
        type="button"
        className="tj-btn tj-btn-ghost"
        onClick={async () => setCopied(await copy(password))}
      >
        <FaCopy /> {copied ? "Copied" : "Copy"}
      </button>
      <button type="button" className="tj-tool" onClick={onHide} aria-label="Hide password" title="Hide">
        <FaEyeSlash />
      </button>
      <small className="tj-muted">Hides itself in 30 seconds. Viewing is recorded in the activity log.</small>
    </div>
  );
}

function AccountCard({ account, teams, events, isSelf, onChanged, onNotice }) {
  const [panel, setPanel] = useState(null); // edit | reset | null
  const [password, setPassword] = useState(null);
  const [busy, setBusy] = useState(false);
  const teamTitle = (id) => (teams.find((t) => t.id === id) || {}).title || `Team ${id}`;
  const eventTitle = (id) => (events.find((e) => e.id === id) || {}).title || id;
  const label = account.name || account.email;
  const hide = useCallback(() => setPassword(null), []);

  const act = async (fn, okText) => {
    setBusy(true);
    try {
      await fn();
      if (okText) onNotice({ type: "ok", text: okText });
      onChanged();
    } catch (err) {
      onNotice({ type: "err", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const reveal = async () => {
    setBusy(true);
    try {
      setPassword(await revealPassword(account.userId));
    } catch (err) {
      onNotice({ type: "err", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`ae-card${account.disabled ? " is-disabled" : ""}`}>
      <div className="ae-card-head">
        <span className={`ae-avatar ae-role-${account.role}`}>
          {account.role === "admin" ? <FaUserShield /> : (label || "?").charAt(0).toUpperCase()}
        </span>
        <div className="ae-who">
          <strong>
            {label}
            {isSelf && <span className="tj-chip ae-you">You</span>}
            {account.disabled && <span className="tj-chip ae-off">Disabled</span>}
          </strong>
          <span className="ae-email">{account.email}</span>
          <div className="ae-meta">
            {account.role === "editor" ? (
              <>
                {account.teams.map((id) => (
                  <span key={id} className="ae-team-tag">
                    {teamTitle(id)}
                  </span>
                ))}
                {(account.events || []).map((id) => (
                  <span key={id} className="ae-team-tag ae-event-tag">
                    {eventTitle(id)}
                  </span>
                ))}
              </>
            ) : (
              <span className="ae-team-tag ae-team-all">Everything · full admin</span>
            )}
          </div>
          <small className="tj-muted">
            Last sign-in {ago(account.lastSignInAt)} · password changed {ago(account.passwordChangedAt)}
          </small>
        </div>
      </div>

      <div className="ae-actions">
        <button type="button" className="tj-btn tj-btn-ghost" onClick={() => setPanel(panel === "edit" ? null : "edit")} disabled={busy}>
          <FaUserEdit /> Edit
        </button>
        <button type="button" className="tj-btn tj-btn-ghost" onClick={() => setPanel(panel === "reset" ? null : "reset")} disabled={busy}>
          <FaKey /> Reset password
        </button>
        {account.role === "editor" && !password && (
          <button type="button" className="tj-btn tj-btn-ghost" onClick={reveal} disabled={busy || !account.passwordStored} title={account.passwordStored ? "" : "Reset the password once to start keeping it"}>
            <FaEye /> Show password
          </button>
        )}
        {!isSelf && (
          <button
            type="button"
            className="tj-btn tj-btn-ghost"
            disabled={busy}
            onClick={() => {
              const off = !account.disabled;
              if (off && !window.confirm(`Disable ${label}? They won't be able to sign in or change anything until you enable them again.`)) return;
              act(() => setAccountDisabled(account.userId, off), off ? `Disabled ${label}.` : `Enabled ${label}.`);
            }}
          >
            {account.disabled ? <FaCheckCircle /> : <FaBan />} {account.disabled ? "Enable" : "Disable"}
          </button>
        )}
        {!isSelf && (
          <button
            type="button"
            className="tj-btn tj-btn-ghost ae-danger"
            disabled={busy}
            onClick={() => {
              if (!window.confirm(`Remove ${label} completely? Their login is deleted. The activity log keeps what they did.`)) return;
              act(() => removeAccount(account.userId), `Removed ${label}.`);
            }}
          >
            <FaTrash /> Remove
          </button>
        )}
      </div>

      {password && <Revealed password={password} onHide={hide} />}
      {panel === "edit" && (
        <AccountForm
          account={account}
          teams={teams}
          events={events}
          isSelf={isSelf}
          onCancel={() => setPanel(null)}
          onDone={(n) => {
            setPanel(null);
            onNotice(n);
            onChanged();
          }}
        />
      )}
      {panel === "reset" && (
        <ResetPanel
          account={account}
          onCancel={() => setPanel(null)}
          onDone={(n) => {
            setPanel(null);
            onNotice(n);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function Notice({ notice, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!notice) return null;
  if (notice.type === "created") {
    const text = `Admin panel: ${window.location.origin}/admin/login\nEmail: ${notice.email}\nPassword: ${notice.password}`;
    return (
      <div className="ae-notice is-created">
        <div>
          <strong>
            <FaCheckCircle /> {notice.text}
          </strong>
          <p className="tj-muted">Send them these details:</p>
          <pre className="ae-mono">{text}</pre>
        </div>
        <div className="ae-notice-actions">
          <button type="button" className="tj-btn" onClick={async () => setCopied(await copy(text))}>
            <FaCopy /> {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className="tj-btn tj-btn-ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className={`ae-notice${notice.type === "err" ? " is-err" : ""}`}>
      <span>{notice.text}</span>
      <button type="button" className="tj-tool" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}

export default function AdminEditors() {
  const me = useAdminRole();
  const [teams, setTeams] = useState(() => getCachedTeamPages().map((p) => ({ id: p.id, title: p.title })));
  useEffect(() => {
    let alive = true;
    fetchTeamPages()
      .then((all) => alive && setTeams(all.map((p) => ({ id: p.id, title: p.title }))))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const events = useRef(
    getCachedEventPages().pages.map((p) => ({ id: p.id, title: p.title, category: p.category, parent: p.parent }))
  ).current;
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    listAccounts()
      .then((list) => {
        setAccounts(list);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const editors = accounts.filter((a) => a.role === "editor");
  const admins = accounts.filter((a) => a.role === "admin");
  const card = (a) => (
    <AccountCard
      key={a.userId}
      account={a}
      teams={teams}
      events={events}
      isSelf={a.userId === me.userId}
      onChanged={load}
      onNotice={setNotice}
    />
  );

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Editors · Admin</title>
      </Helmet>
      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Editors</span>
      </header>

      <div className="admin-hub admin-hub-xwide tj ae">
        <div className="tj-topnav">
          <Link to="/admin" className="tj-back">
            ← Dashboard
          </Link>
          <div className="ae-top-actions">
            <Link to="/admin/activity" className="tj-btn tj-btn-ghost">
              <FaHistory /> Activity log
            </Link>
            <button type="button" className="tj-btn tj-btn-ghost" onClick={load} disabled={loading}>
              <FaSyncAlt className={loading ? "tj-spin" : ""} /> Refresh
            </button>
            <button type="button" className="tj-btn" onClick={() => setAdding((v) => !v)}>
              <FaUserPlus /> Add person
            </button>
          </div>
        </div>

        <p className="tj-muted ae-intro">
          <b>Editors</b> sign in at <code>/admin/login</code> and can only edit the team pages and event pages you give
          them, plus see who applied to join those teams. <b>Main admins</b> can do everything.
        </p>

        <Notice notice={notice} onClose={() => setNotice(null)} />

        {adding && (
          <AccountForm
            teams={teams}
            events={events}
            onCancel={() => setAdding(false)}
            onDone={(n) => {
              setAdding(false);
              setNotice(n);
              load();
            }}
          />
        )}

        {error && <p className="tj-savebar-msg is-err">{error}</p>}

        <section className="tj-section">
          <header className="tj-section-head">
            <div>
              <h3 className="tj-h3">Editors</h3>
              <p className="tj-muted">{loading && !accounts.length ? "Loading…" : `${editors.length} ${editors.length === 1 ? "person" : "people"}`}</p>
            </div>
          </header>
          {editors.map(card)}
          {!loading && !error && editors.length === 0 && (
            <p className="tj-empty">No editors yet - use "Add person" to give someone access to their team or event pages.</p>
          )}
        </section>

        <section className="tj-section">
          <header className="tj-section-head">
            <div>
              <h3 className="tj-h3">Main admins</h3>
              <p className="tj-muted">{admins.length} {admins.length === 1 ? "person" : "people"}</p>
            </div>
          </header>
          {admins.map(card)}
        </section>
      </div>
    </div>
  );
}
