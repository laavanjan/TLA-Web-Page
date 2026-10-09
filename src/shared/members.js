// TLA members: rows in the Supabase `members` table (see
// supabase/migrations/members.sql and members_admin.sql). Shown on /members,
// managed at /admin/members by main admins.
import { useMemo, useState } from "react";
import { supabase } from "../helpers/supabaseClient";

const TABLE = "members";
const COLUMNS = "id,batch,name,faculty,department,district";
const ADMIN_COLUMNS = COLUMNS + ",created_at,updated_at,fee_amount,paid_on,receipt_no,receipt_signer_name,receipt_signer_title";
const RECEIPT_CONFIG = "member_receipt_config";

export const MEMBER_FIELDS = [
  ["faculty", "பீடம் (Faculty)"],
  ["department", "துறை (Department)"],
  ["district", "மாவட்டம் (District)"],
];

export const initials = (name) =>
  name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export const blankMember = (batch = "") => ({
  name: "",
  batch,
  faculty: "",
  department: "",
  district: "",
  fee_amount: null,
  paid_on: null,
  receipt_no: null,
});

export const isPaid = (m) => m.fee_amount !== null && m.fee_amount !== undefined && !!m.paid_on;

// Today as YYYY-MM-DD in the admin's own time zone (what a date input holds).
export const todayYmd = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const formatRupees = (n) =>
  "Rs. " + Number(n).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The admin page also wants when each row was added / last changed and the
// fee. Falls back to the public columns before members_admin.sql has been run.
export async function fetchMembers({ admin = false } = {}) {
  const query = (columns) => supabase.from(TABLE).select(columns).order("name").range(0, 4999);
  let { data, error } = await query(admin ? ADMIN_COLUMNS : COLUMNS);
  if (error && admin) ({ data, error } = await query(COLUMNS + ",created_at"));
  if (error) throw new Error(error.message || "Couldn't load the members.");
  return data || [];
}

const clean = (v) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");

// Trim the form into a row, or throw a message the form can show.
export function memberRow(draft) {
  const name = clean(draft.name);
  const batch = Number(draft.batch);
  if (!name) throw new Error("Enter the member's name.");
  if (!Number.isInteger(batch) || batch < 1 || batch > 999) throw new Error("Enter the batch as a number, e.g. 22.");
  const row = { name, batch };
  MEMBER_FIELDS.forEach(([key]) => {
    row[key] = clean(draft[key]) || null;
  });
  row.fee_amount = null;
  row.paid_on = null;
  if (draft.paid) {
    const amount = Number(draft.fee_amount);
    if (draft.fee_amount === "" || draft.fee_amount === null || !Number.isFinite(amount) || amount < 0 || amount > 99999999)
      throw new Error("Enter the fee paid, e.g. 500.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.paid_on || "")) throw new Error("Enter the date the fee was paid.");
    if (draft.paid_on > todayYmd()) throw new Error("The date paid can't be in the future.");
    row.fee_amount = Math.round(amount * 100) / 100;
    row.paid_on = draft.paid_on;
  }
  return row;
}

const NEEDS_MIGRATION = "Run supabase/migrations/members_admin.sql in Supabase first.";

const writeError = (error) =>
  new Error(
    error.code === "42501" || /row-level security/i.test(error.message || "")
      ? "Only main admins can change members."
      : ["42703", "PGRST204", "42P01", "PGRST205"].includes(error.code)
      ? NEEDS_MIGRATION
      : error.message || "Couldn't save the member."
  );

export async function addMember(draft) {
  const { data, error } = await supabase.from(TABLE).insert(memberRow(draft)).select().single();
  if (error) throw writeError(error);
  return data;
}

export async function updateMember(id, draft) {
  const { data, error } = await supabase.from(TABLE).update(memberRow(draft)).eq("id", id).select().single();
  if (error) throw writeError(error);
  return data;
}

export async function removeMember(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw writeError(error);
}

// ---- Receipt settings: the fee filled in by default and who signs ----------------

export const DEFAULT_RECEIPT_CONFIG = { default_fee: null, treasurer_name: "", treasurer_title: "Treasurer" };

export async function fetchReceiptConfig() {
  const { data, error } = await supabase
    .from(RECEIPT_CONFIG)
    .select("default_fee,treasurer_name,treasurer_title")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw writeError(error);
  return { ...DEFAULT_RECEIPT_CONFIG, ...(data || {}) };
}

export async function saveReceiptConfig(cfg) {
  const fee = cfg.default_fee === "" || cfg.default_fee === null ? null : Number(cfg.default_fee);
  if (fee !== null && (!Number.isFinite(fee) || fee < 0)) throw new Error("Enter the default fee as a number, e.g. 500.");
  const row = {
    default_fee: fee,
    treasurer_name: clean(cfg.treasurer_name),
    treasurer_title: clean(cfg.treasurer_title) || "Treasurer",
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from(RECEIPT_CONFIG).update(row).eq("id", 1).select().maybeSingle();
  if (error) throw writeError(error);
  if (!data) throw new Error("Only main admins can change the receipt settings.");
  return { ...DEFAULT_RECEIPT_CONFIG, ...data };
}

export const BATCH_ORDER = (a, b) => b - a;
export const ALL_BATCHES = "all";

// Batch tabs, search box and faculty / department / district filters, shared
// by /members and /admin/members. `allowAll` adds an "every batch" choice.
export function useMemberFilters(rows, { allowAll = false } = {}) {
  const [batch, setBatch] = useState(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ faculty: "", department: "", district: "" });

  const batches = useMemo(() => [...new Set((rows || []).map((r) => r.batch))].sort(BATCH_ORDER), [rows]);
  const active = batch !== null && (batch === ALL_BATCHES || batches.includes(batch)) ? batch : batches[0];

  const batchRows = useMemo(
    () => (rows || []).filter((r) => (allowAll && active === ALL_BATCHES) || r.batch === active),
    [rows, active, allowAll]
  );
  const optionsOf = (key) =>
    [...new Set(batchRows.map((r) => r[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const pickBatch = (b) => {
    setBatch(b);
    setFilters({ faculty: "", department: "", district: "" });
  };
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return batchRows.filter(
      (r) =>
        MEMBER_FIELDS.every(([key]) => !filters[key] || r[key] === filters[key]) &&
        (!q ||
          [r.name, r.faculty, r.department, r.district]
            .filter(Boolean)
            .some((v) => v.toLowerCase().includes(q)))
    );
  }, [batchRows, query, filters]);

  return { batches, active, pickBatch, query, setQuery, filters, setFilter, optionsOf, shown, batchRows };
}
