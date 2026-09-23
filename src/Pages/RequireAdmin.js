import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isAuthed } from "../admin/adminStore";

// Route guard: renders children only when a real Supabase session exists.
// Otherwise redirects to the admin login, remembering where they wanted to go.
export default function RequireAdmin({ children }) {
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking | authed | anon

  useEffect(() => {
    let active = true;
    isAuthed().then((ok) => {
      if (active) setStatus(ok ? "authed" : "anon");
    });
    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") return null;
  if (status === "anon") {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
