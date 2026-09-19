import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isAuthed } from "../admin/adminStore";

// Route guard: renders children only when the admin is "logged in" (client-side
// flag). Otherwise redirects to the admin login, remembering where they wanted
// to go. This is a UX gate, not a security boundary (see adminStore.js).
export default function RequireAdmin({ children }) {
  const location = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
