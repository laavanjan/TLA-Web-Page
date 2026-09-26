// Submitted "join our teams" applications, stored in the Supabase
// `team_join_applications` table (see supabase/migrations/team_join.sql).
// `name` is always a real column; every other field (built-in or admin-added)
// lives in the `answers` jsonb blob, keyed by that field's `key`.
import { supabase } from "../helpers/supabaseClient";

export async function submitTeamJoinApplication(name, answers) {
  const { error } = await supabase.from("team_join_applications").insert({
    name: String(name || "").trim(),
    answers: answers || {},
  });

  if (error) {
    throw new Error(error.message || "Could not submit.");
  }
}

// Admin-only (RLS requires a signed-in session).
export async function fetchTeamJoinApplications() {
  const { data, error } = await supabase
    .from("team_join_applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Could not load applications.");
  }
  return data || [];
}

export async function deleteTeamJoinApplication(id) {
  const { error } = await supabase
    .from("team_join_applications")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "Could not delete.");
  }
}
