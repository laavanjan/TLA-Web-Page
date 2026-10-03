// Who is signed in to the admin panel and what they may do: a main admin
// (everything) or an editor (only the team pages, join requests and event
// pages they are assigned to).
// Roles live in the Supabase `admin_users` table (see
// supabase/migrations/team_editors.sql); the database enforces them, this
// only decides what the panel shows.
import { createContext, useContext } from "react";
import { supabase } from "../helpers/supabaseClient";

// { role: "admin" | "editor" | null, teams: number[], events: string[], name, email, userId }
export const AdminRoleContext = createContext({ role: "admin", teams: [], events: [], name: "", email: "", userId: "" });
export const useAdminRole = () => useContext(AdminRoleContext);

export const canEditTeam = (who, teamId) => who.role === "admin" || who.teams.includes(teamId);
export const canEditEvent = (who, eventId) => who.role === "admin" || (who.events || []).includes(eventId);

// Error codes for "that table doesn't exist" (Postgres / PostgREST).
const MISSING_TABLE = ["42P01", "PGRST205"];
// ... and "there is no such relationship", which is what a nested select on a
// table that doesn't exist yet (event_pages.sql not run) reports.
const MISSING_RELATION = ["PGRST200"];

let cached = null; // { uid, promise }

async function load(session) {
  const uid = session.user.id;
  const email = session.user.email || "";
  const query = (columns) => supabase.from("admin_users").select(columns).eq("user_id", uid).maybeSingle();
  let { data, error } = await query("role, name, disabled, admin_user_teams(team_id), admin_user_events(event_id)");
  if (error && MISSING_RELATION.includes(error.code)) {
    // event_pages.sql hasn't been run yet: editors just have no events.
    ({ data, error } = await query("role, name, disabled, admin_user_teams(team_id)"));
  }
  if (error) {
    // team_editors.sql hasn't been run yet: everyone signed in is an admin,
    // as before team editors existed.
    if (MISSING_TABLE.includes(error.code)) return { role: "admin", teams: [], events: [], name: "", email, userId: uid };
    throw new Error(error.message || "Couldn't load your permissions.");
  }
  if (!data || data.disabled) return { role: null, teams: [], events: [], name: "", email, userId: uid };
  return {
    role: data.role,
    teams: (data.admin_user_teams || []).map((t) => t.team_id).sort((a, b) => a - b),
    events: (data.admin_user_events || []).map((e) => e.event_id).sort(),
    name: data.name || "",
    email,
    userId: uid,
  };
}

// Resolves to null when nobody is signed in.
export async function fetchAdminRole() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return null;
  if (cached && cached.uid === session.user.id) return cached.promise;
  const promise = load(session);
  cached = { uid: session.user.id, promise };
  promise.catch(() => {
    if (cached && cached.promise === promise) cached = null;
  });
  return promise;
}

supabase.auth.onAuthStateChange((event) => {
  if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") cached = null;
});
