// Wraps the whole site (see App.js). While maintenance mode is on, visitors
// get the maintenance page; signed-in admins and editors still see the site,
// with a banner saying so. The /admin area is never blocked, so maintenance
// mode can always be switched off.
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MaintenancePage from "./MaintenancePage";
import { useSiteStatus, useNow, isMaintenanceOn, gateView, formatReopen } from "../../shared/siteStatus";
import { isAuthed } from "../../admin/adminStore";
import { fetchAdminRole } from "../../admin/adminRole";
import "./maintenance.css";

// Is the visitor a signed-in admin or editor? Only asked while maintenance is
// on, and only once. -> "idle" | "checking" | "staff" | "visitor"
function useStaff(active) {
  const [result, setResult] = useState(null); // null = not asked yet
  useEffect(() => {
    if (!active || result !== null) return undefined;
    let alive = true;
    isAuthed()
      .then((ok) => (ok ? fetchAdminRole() : null))
      .then((who) => alive && setResult(!!(who && who.role)))
      .catch(() => alive && setResult(false));
    return () => {
      alive = false;
    };
  }, [active, result]);
  if (!active) return "idle";
  if (result === null) return "checking";
  return result ? "staff" : "visitor";
}

function Splash() {
  return (
    <div className="mt-splash" role="status" aria-label="Loading">
      <img src="/images/logo.png" alt="" />
    </div>
  );
}

function StaffBanner({ status }) {
  return (
    <div className="mt-banner" role="status">
      <span>
        <b>Maintenance mode is ON.</b> Visitors see the maintenance page; you can see the site because you're signed in.
        {status.reopensAt && <> Reopens {formatReopen(status.reopensAt, "en-GB")}.</>}
      </span>
      <Link to="/admin/maintenance">Manage</Link>
    </div>
  );
}

export default function MaintenanceGate({ children }) {
  const { pathname } = useLocation();
  const { status, ready } = useSiteStatus();
  const now = useNow();
  const on = isMaintenanceOn(status, now);
  const inAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const staff = useStaff(on && !inAdmin);

  switch (gateView({ path: pathname, ready, on, staff })) {
    case "splash":
      return <Splash />;
    case "maintenance":
      return <MaintenancePage status={status} now={now} />;
    case "site-with-banner":
      return (
        <>
          {children}
          <StaffBanner status={status} />
        </>
      );
    default:
      return children;
  }
}
