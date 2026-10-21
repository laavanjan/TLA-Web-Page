// Loading the traffic numbers for /admin/traffic from Supabase (see
// supabase/migrations/analytics.sql). Main admins only; the database checks.
import { supabase } from "../helpers/supabaseClient";

// "That table/function doesn't exist": analytics.sql hasn't been run yet.
const NOT_SET_UP = ["42P01", "PGRST205", "PGRST202", "42883"];

export class TrafficNotSetUp extends Error {}

const fail = (error, what) => {
  if (NOT_SET_UP.includes(error.code)) throw new TrafficNotSetUp("analytics.sql hasn't been run in Supabase yet.");
  throw new Error(error.message || `Couldn't load ${what}.`);
};

// Daily rows from..to (inclusive), brought up to date first.
export async function fetchTrafficDays(from, to) {
  const refreshed = await supabase.rpc("analytics_refresh");
  if (refreshed.error) fail(refreshed.error, "traffic");
  const { data, error } = await supabase
    .from("analytics_daily")
    .select("*")
    .gte("day", from)
    .lte("day", to)
    .order("day", { ascending: true });
  if (error) fail(error, "traffic");
  return data || [];
}

// { count, pages: [{ path, title, n }], sources, devices, countries }
export async function fetchLiveVisitors() {
  const { data, error } = await supabase.rpc("analytics_live_now");
  if (error) fail(error, "live visitors");
  return data || { count: 0, pages: [], sources: {}, devices: {}, countries: {} };
}

// Sessions reaching each step, e.g. [120, 40, 6].
export async function fetchFunnel(from, to, steps) {
  const { data, error } = await supabase.rpc("analytics_funnel", { p_from: from, p_to: to, p_steps: steps });
  if (error) fail(error, "the funnel");
  return data || [];
}
