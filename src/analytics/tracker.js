// Counts page views for the Traffic page in the admin (/admin/traffic).
// Each view is sent to the track_page_view() function in Supabase (see
// supabase/migrations/analytics.sql). Not counted at all:
//   * bots, previews and automated browsers
//   * browsers that send Do Not Track / Global Privacy Control
//   * anyone signed in to the admin panel (admins and team editors)
//   * the admin pages themselves, and local development
// Nothing is sent that identifies a person: see identity.js.
import { supabase } from "../helpers/supabaseClient";
import { classifyVisit, cleanPath } from "./classify";
import { isBot, deviceOf, browserOf, osOf } from "./device";
import { dailyVisitor, currentSession, optedOut } from "./identity";
import { visitorCountry } from "./geo";

const HEARTBEAT = 30 * 1000;
const SKIP_PATHS = ["/admin"];

let lastView = { path: "", at: 0 };
let heartbeat = null;

const storage = (kind) => {
  try {
    return window[kind];
  } catch (e) {
    return null;
  }
};

function localDev() {
  const host = window.location.hostname;
  return (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) && !process.env.REACT_APP_ANALYTICS_DEV;
}

// Worked out once per tab: the answer doesn't change while it is open.
let allowed = null;
function trackingAllowed() {
  if (allowed !== null) return allowed;
  const nav = window.navigator || {};
  allowed = !localDev() && !optedOut(nav, window) && !isBot(nav.userAgent || "", nav);
  return allowed;
}

// Signed in to the admin panel? Asked on every view, because someone can
// sign in or out without reloading.
async function isStaff() {
  try {
    const { data } = await supabase.auth.getSession();
    return !!(data && data.session);
  } catch (e) {
    return false;
  }
}

function visitContext(path) {
  const nav = window.navigator || {};
  const ua = nav.userAgent || "";
  const landing = classifyVisit({
    referrer: document.referrer,
    search: window.location.search,
    ownHost: window.location.hostname,
  });
  const session = currentSession(storage("sessionStorage"), landing);
  const visitor = dailyVisitor(storage("localStorage"));
  const from = session.landing || landing;
  return {
    p_visitor: visitor.id,
    p_session: session.id,
    p_returning: visitor.returning,
    p_path: path,
    p_referrer_host: session.isNew ? from.referrerHost : "",
    p_source: from.source,
    p_utm_source: from.utm.source,
    p_utm_medium: from.utm.medium,
    p_utm_campaign: from.utm.campaign,
    p_device: deviceOf(ua, nav),
    p_browser: browserOf(ua),
    p_os: osOf(ua, nav),
  };
}

async function send(kind, name, pathname, title) {
  const path = cleanPath(pathname);
  if (!trackingAllowed() || SKIP_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return;
  if (await isStaff()) return;
  const country = await visitorCountry();
  const context = visitContext(path);
  const { error } = await supabase.rpc("track_page_view", {
    p_kind: kind,
    p_name: name,
    p_title: title || "",
    p_country: country,
    ...context,
  });
  // analytics.sql not run yet, or offline: counting is never worth an error.
  if (error && process.env.NODE_ENV === "development") console.debug("analytics:", error.message); // eslint-disable-line no-console
  if (!error && kind === "view") startHeartbeat(context.p_session);
}

// While the tab is open and visible, tell the site every 30 seconds that the
// visitor is still here, for the "on the site right now" count. Stops when
// the tab is hidden; the next view or a return to the tab starts it again.
function startHeartbeat(session) {
  const first = !heartbeat;
  if (heartbeat) clearInterval(heartbeat.timer);
  const beat = () => {
    if (document.visibilityState !== "visible") return;
    supabase
      .rpc("analytics_ping", { p_session: session, p_path: cleanPath(window.location.pathname), p_title: document.title })
      .then(() => {}, () => {});
  };
  heartbeat = { beat, timer: setInterval(beat, HEARTBEAT) };
  if (first) {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") heartbeat.beat();
    });
  }
}

// Called on every route change. The title is read a moment later, once the
// page has set it.
export function trackPageView(pathname) {
  const now = Date.now();
  if (pathname === lastView.path && now - lastView.at < 1500) return; // the same view reported twice
  lastView = { path: pathname, at: now };
  setTimeout(() => {
    send("view", "", pathname, document.title).catch(() => {});
  }, 600);
}

// Form submissions and other moments worth counting, for the funnels.
export function trackEvent(name) {
  send("event", name, window.location.pathname, "").catch(() => {});
}
