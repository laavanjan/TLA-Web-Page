// Admin auth, backed by Supabase Auth (see src/helpers/supabaseClient.js).
// Admin accounts are created manually in the Supabase dashboard — there is no
// public sign-up flow in this app.
import { supabase } from "../helpers/supabaseClient";

const STICKERS_KEY = "tla_enabled_stickers";

export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return !error;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function isAuthed() {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

export async function getAdminEmail() {
  const { data } = await supabase.auth.getUser();
  return (data.user && data.user.email) || "";
}

// Change email and/or password. Re-authenticates with the current password
// first, since Supabase's updateUser() doesn't ask for it itself.
export async function updateCredentials({ currentPassword, newEmail, newPassword }) {
  const { data: userData } = await supabase.auth.getUser();
  const currentEmail = userData.user && userData.user.email;
  if (!currentEmail) {
    throw new Error("Not signed in.");
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: currentEmail,
    password: currentPassword || "",
  });
  if (reauthError) {
    throw new Error("Current password is incorrect.");
  }

  const updates = {};
  const email = (newEmail || "").trim();
  if (email && email.toLowerCase() !== currentEmail.toLowerCase()) {
    updates.email = email;
  }
  if (newPassword) {
    updates.password = newPassword;
  }
  if (Object.keys(updates).length === 0) {
    return currentEmail;
  }

  const { data: updated, error } = await supabase.auth.updateUser(updates);
  if (error) {
    throw new Error(error.message || "Could not save.");
  }
  return (updated.user && updated.user.email) || currentEmail;
}

// --- Which stickers are shown in the editor -------------------------------
// Unrelated to auth — stays local. Returns an array of enabled ids, or null
// meaning "all enabled" (default).
export function getEnabledStickerIds() {
  try {
    const raw = localStorage.getItem(STICKERS_KEY);
    if (!raw) return null;
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

export function setEnabledStickerIds(ids) {
  try {
    localStorage.setItem(STICKERS_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}
