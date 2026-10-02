import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";

import LotusDivider from "./LotusDivider";
import {
  getAdminEmail,
  updateCredentials,
  logout as adminLogout,
} from "../admin/adminStore";
import { useAdminRole } from "../admin/adminRole";
import { changeOwnPassword, MIN_PASSWORD } from "../admin/adminUsers";
import "./Frame.css";
import "./Admin.css";

export default function AdminAccount() {
  const navigate = useNavigate();
  const editor = useAdminRole().role === "editor";

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminEmail().then(setEmail).catch(() => {});
  }, []);

  const onSaveAccount = useCallback(
    async (e) => {
      e.preventDefault();
      setMsg({ type: "", text: "" });
      setBusy(true);
      try {
        if (editor) {
          // Team editors change only their password, through the admin-users
          // function so main admins' copy stays current. Their email is
          // managed by a main admin.
          if (newPassword.length < MIN_PASSWORD) {
            throw new Error(`New password must be at least ${MIN_PASSWORD} characters.`);
          }
          await changeOwnPassword(currentPassword, newPassword);
        } else {
          await updateCredentials({
            currentPassword,
            newEmail: email,
            newPassword: newPassword || undefined,
          });
        }
        setCurrentPassword("");
        setNewPassword("");
        setMsg({ type: "ok", text: "Saved." });
      } catch (err) {
        setMsg({ type: "err", text: err.message || "Could not save." });
      } finally {
        setBusy(false);
      }
    },
    [currentPassword, email, newPassword, editor]
  );

  const onLogout = useCallback(() => {
    adminLogout();
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Account · Admin</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin · Account</span>
      </header>

      <div className="admin-hub">
        <Link to="/admin" className="admin-back">
          ← Dashboard
        </Link>

        <form className="admin-card admin-account" onSubmit={onSaveAccount}>
          <div className="admin-info">
            <div className="admin-account-head">
              <h2 className="admin-title" style={{ textAlign: "left" }}>
                Account & password
              </h2>
              <button type="button" className="admin-copy" onClick={onLogout}>
                Log out
              </button>
            </div>

            <span className="admin-label" style={{ marginTop: 14 }}>
              Email
            </span>
            <input
              type="email"
              className="admin-input admin-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              spellCheck={false}
              readOnly={editor}
              title={editor ? "Ask a main admin to change your email" : undefined}
            />

            <span className="admin-label" style={{ marginTop: 14 }}>
              {editor ? "New password" : "New password (leave blank to keep)"}
            </span>
            <input
              type="password"
              className="admin-input admin-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
              required={editor}
              minLength={editor ? MIN_PASSWORD : undefined}
            />
            {editor && (
              <p className="admin-note">
                Main admins can see this password. Don't reuse a password you use anywhere else.
              </p>
            )}

            <span className="admin-label" style={{ marginTop: 14 }}>
              Current password (required to save)
            </span>
            <input
              type="password"
              className="admin-input admin-field"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            {msg.text && (
              <p className={msg.type === "ok" ? "admin-ok" : "admin-error"}>
                {msg.text}
              </p>
            )}

            <button
              type="submit"
              className="frame-btn frame-btn-primary admin-download"
              disabled={busy}
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
