// Who is signed in to the admin panel and what they may do: a main admin
// (everything) or a team editor (only their teams' pages and join requests).
// Roles live in the Supabase `admin_users` table (see
// supabase/migrations/team_editors.sql); the database enforces them, this
// only decides what the panel shows.
import { createContext, useContext } from "react";
import { supabase } from "../helpers/supabaseClient";

// { role: "admin" | "editor" | null, teams: number[], name, email, userId }
export const AdminRoleContext = createContext({ role: "admin", teams: [], name: "", email: "", userId: "" });
export const useAdminRole = () => useContext(AdminRoleContext);

export const canEditTeam = (who, teamId) => who.role === "admin" || who.teams.includes(teamId);

// Error codes for "that table doesn't exist" (Postgres / PostgREST).
const MISSING_TABLE = ["42P01", "PGRST205"];

let cached = null; // { uid, promise }

async function load(session) {
  const uid = session.user.id;
  const email = session.user.email || "";
  const { data, error } = await supabase
    .from("admin_users")
    .select("role, name, disabled, admin_user_teams(team_id)")
    .eq("user_id", uid)
    .maybeSingle();
  if (error) {
    // team_editors.sql hasn't been run yet: everyone signed in is an admin,
    // as before team editors existed.
    if (MISSING_TABLE.includes(error.code)) return { role: "admin", teams: [], name: "", email, userId: uid };
    throw new Error(error.message || "Couldn't load your permissions.");
  }
  if (!data || data.disabled) return { role: null, teams: [], name: "", email, userId: uid };
  return {
    role: data.role,
    teams: (data.admin_user_teams || []).map((t) => t.team_id).sort((a, b) => a - b),
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
