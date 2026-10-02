import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

import LotusDivider from "./LotusDivider";
import { isAuthed, logout } from "../admin/adminStore";
import { AdminRoleContext, fetchAdminRole } from "../admin/adminRole";
import "./Frame.css";
import "./Admin.css";

function NoAccess({ email, message }) {
  const navigate = useNavigate();
  return (
    <div className="frame-page admin-page">
      <Helmet>
        <title>No access · Admin</title>
      </Helmet>
      <header className="frame-topbar">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <span className="frame-subtitle">Admin</span>
      </header>
      <div className="admin-card admin-form">
        <div className="admin-info">
          <h2 className="admin-title">No access</h2>
          <p className="admin-desc">
            {message || (
              <>
                <b>{email}</b> is signed in but doesn't have access to the admin panel, or the account has been
                disabled. Ask a main admin to check it.
              </>
            )}
          </p>
          <button
            type="button"
            className="frame-btn frame-btn-primary admin-download"
            onClick={async () => {
              await logout();
              navigate("/admin/login", { replace: true });
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

// Route guard: renders children only when a real Supabase session exists and
// the account may see this page. allow="admin" pages are for main admins;
// team editors are sent to their own dashboard instead. allow="any" pages
// work for both and read the role with useAdminRole().
export default function RequireAdmin({ children, allow = "admin" }) {
  const location = useLocation();
  const [state, setState] = useState({ status: "checking" }); // checking | anon | ready | error

  useEffect(() => {
    let active = true;
    isAuthed()
      .then((ok) => (ok ? fetchAdminRole() : null))
      .then((who) => active && setState(who ? { status: "ready", who } : { status: "anon" }))
      .catch((err) => active && setState({ status: "error", message: err.message }));
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "checking") return null;
  if (state.status === "anon") {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  if (state.status === "error") return <NoAccess message={state.message} />;
  const { who } = state;
  if (!who.role) return <NoAccess email={who.email} />;
  if (allow === "admin" && who.role !== "admin") return <Navigate to="/admin" replace />;
  return <AdminRoleContext.Provider value={who}>{children}</AdminRoleContext.Provider>;
}
