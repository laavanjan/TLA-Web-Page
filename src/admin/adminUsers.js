// Account management for /admin/editors and the activity log for
// /admin/activity. Account changes go through the `admin-users` Edge
// Function (supabase/functions/admin-users/index.ts); the activity log is
// read straight from the `admin_activity` table, which only main admins can
// see.
import { supabase } from "../helpers/supabaseClient";
import { callEdgeFunction } from "../helpers/edgeFunction";

const call = (action, args = {}) => callEdgeFunction("admin-users", { action, ...args });

export const listAccounts = () => call("list").then((r) => r.users);
export const createAccount = (account) => call("create", account);
export const updateAccount = (userId, patch) => call("update", { userId, ...patch });
export const resetPassword = (userId, password) => call("reset_password", { userId, password });
export const revealPassword = (userId) => call("reveal_password", { userId }).then((r) => r.password);
export const setAccountDisabled = (userId, disabled) => call("set_disabled", { userId, disabled });
export const removeAccount = (userId) => call("remove", { userId });
export const changeOwnPassword = (currentPassword, newPassword) =>
  call("change_own_password", { currentPassword, newPassword });

export const MIN_PASSWORD = 8;

// Readable random password: no look-alike characters (0/O, 1/l/I).
export function generatePassword(length = 12) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const limit = 256 - (256 % chars.length); // skip bytes that would bias the pick
  let out = "";
  while (out.length < length) {
    for (const b of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (b < limit && out.length < length) out += chars[b % chars.length];
    }
  }
  return out;
}

// Newest first; pass `before` (an ISO date) to page back further.
export async function fetchActivity({ before, limit = 50 } = {}) {
  let q = supabase.from("admin_activity").select("*").order("created_at", { ascending: false }).limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data, error } = await q;
  if (error) throw new Error(error.message || "Couldn't load the activity log.");
  return data || [];
}
