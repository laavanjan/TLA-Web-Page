import React, { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation, Navigate } from "react-router-dom";

import LotusDivider from "./LotusDivider";
import { login, isAuthed } from "../admin/adminStore";
import "./Frame.css";
import "./Admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const dest = (location.state && location.state.from) || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [alreadyAuthed, setAlreadyAuthed] = useState(false);

  useEffect(() => {
    let active = true;
    isAuthed().then((ok) => {
      if (active && ok) setAlreadyAuthed(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setBusy(true);
      try {
        const ok = await login(email, password);
        if (ok) navigate(dest, { replace: true });
        else setError("Wrong email or password.");
      } catch {
        setError("Something went wrong. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [email, password, dest, navigate]
  );

  if (alreadyAuthed) return <Navigate to={dest} replace />;

  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>Admin login · தமிழ் இலக்கிய மன்றம்</title>
      </Helmet>

      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin login</span>
      </header>

      <form className="admin-card admin-form" onSubmit={onSubmit}>
        <div className="admin-info">
          <h2 className="admin-title">Sign in</h2>
          <p className="admin-desc">Enter your admin credentials to continue.</p>

          <span className="admin-label">Email</span>
          <input
            type="email"
            className="admin-input admin-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            spellCheck={false}
            required
          />

          <span className="admin-label" style={{ marginTop: 14 }}>
            Password
          </span>
          <input
            type="password"
            className="admin-input admin-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="admin-error">{error}</p>}

          <button
            type="submit"
            className="frame-btn frame-btn-primary admin-download"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
