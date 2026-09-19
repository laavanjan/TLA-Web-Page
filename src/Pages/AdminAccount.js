import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";

import LotusDivider from "./LotusDivider";
import {
  getAdminEmail,
  updateCredentials,
  logout as adminLogout,
} from "../admin/adminStore";
import "./Frame.css";
import "./Admin.css";

export default function AdminAccount() {
  const navigate = useNavigate();

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
        await updateCredentials({
          currentPassword,
          newEmail: email,
          newPassword: newPassword || undefined,
        });
        setCurrentPassword("");
        setNewPassword("");
        setMsg({ type: "ok", text: "Saved." });
      } catch (err) {
        setMsg({ type: "err", text: err.message || "Could not save." });
      } finally {
        setBusy(false);
      }
    },
    [currentPassword, email, newPassword]
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
            />

            <span className="admin-label" style={{ marginTop: 14 }}>
              New password (leave blank to keep)
            </span>
            <input
              type="password"
              className="admin-input admin-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="••••••••"
            />

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
