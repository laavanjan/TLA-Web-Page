// How activity-log entries are worded and drawn — shared by the Activity
// page and the dashboard's "Recent activity" panel.
import {
  FaUpload,
  FaUserPlus,
  FaUserEdit,
  FaKey,
  FaEye,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaUserMinus,
  FaThList,
  FaTools,
  FaLockOpen,
} from "react-icons/fa";

export const ACTIONS = {
  publish: { icon: FaUpload, verb: "published", group: "pages" },
  event_publish: { icon: FaUpload, verb: "published the event page", group: "pages" },
  event_layout: { icon: FaThList, verb: "rearranged the home page event cards", group: "pages" },
  event_removed: { icon: FaTrash, verb: "removed the published event page", group: "pages" },
  maintenance_on: { icon: FaTools, verb: "turned maintenance mode on", group: "site" },
  maintenance_off: { icon: FaLockOpen, verb: "turned maintenance mode off", group: "site" },
  maintenance_updated: { icon: FaTools, verb: "changed the maintenance page", group: "site" },
  application_deleted: { icon: FaTrash, verb: "deleted a join application", group: "applications" },
  account_created: { icon: FaUserPlus, verb: "created an account for", group: "accounts" },
  account_updated: { icon: FaUserEdit, verb: "updated the account of", group: "accounts" },
  account_removed: { icon: FaUserMinus, verb: "removed the account of", group: "accounts" },
  account_disabled: { icon: FaBan, verb: "disabled", group: "accounts" },
  account_enabled: { icon: FaCheckCircle, verb: "re-enabled", group: "accounts" },
  password_reset: { icon: FaKey, verb: "reset the password of", group: "accounts" },
  password_viewed: { icon: FaEye, verb: "viewed the password of", group: "accounts" },
  password_changed: { icon: FaKey, verb: "changed their own password", group: "accounts" },
};

export const actionMeta = (action) => ACTIONS[action] || { icon: FaUserEdit, verb: action, group: "other" };

export const actorName = (e) => e.actor_name || e.actor_email || "Someone";

// What the action was done to: the team or event for publishes, otherwise the
// account. `eventTitle` looks up an event page's name from its id.
export function activityObject(e, teamTitle, eventTitle = (id) => id) {
  if (e.action === "publish") return teamTitle(e.team_id);
  if (e.action === "event_publish" || e.action === "event_removed") return eventTitle((e.details || {}).event_id);
  if (e.action === "event_layout") return "";
  if (e.target_email && e.action !== "password_changed") return e.target_email;
  return "";
}

export function when(iso) {
  const d = new Date(iso);
  const s = (Date.now() - d.getTime()) / 1000;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400 && d.getDate() === new Date().getDate()) return `today ${time}`;
  return `${d.toLocaleDateString()} ${time}`;
}

export function ago(iso) {
  if (!iso) return "";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString();
}
