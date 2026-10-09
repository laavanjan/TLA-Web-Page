import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  FaLayerGroup,
  FaBookOpen,
  FaHandshake,
  FaAddressCard,
  FaUsersCog,
  FaHistory,
  FaQrcode,
  FaPalette,
  FaArrowRight,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaUserCog,
  FaPenNib,
  FaRegLightbulb,
  FaCalendarAlt,
  FaTools,
  FaImages,
  FaIdCard,
} from "react-icons/fa";

import LotusDivider from "./LotusDivider";
import { SmartImage } from "../Components/teams/team-detail/media";
import { useAdminRole, canEditEvent } from "../admin/adminRole";
import { logout, getEnabledStickerIds } from "../admin/adminStore";
import { fetchActivity } from "../admin/adminUsers";
import { actionMeta, actorName, activityObject, ago } from "../admin/activityText";
import { getCachedTeamPages, fetchTeamPages } from "../shared/teamPages";
import { getCachedEventPages, fetchEventPages, eventTitle as eventTitleIn } from "../shared/eventPages";
import { fetchTeamJoinApplications } from "../shared/teamJoinApplications";
import { fetchTeamJoinConfig } from "../shared/teamJoinConfig";
import { fetchContactConfig } from "../shared/contactConfig";
import { fetchWallpapers } from "../shared/wallpapers";
import { fetchSiteStatus, isMaintenanceOn, formatReopen } from "../shared/siteStatus";
import { fetchBookConfig, isSubmissionOpen } from "../book/bookConfig";
import { DESIGNS } from "../assets/frame/designs";
import { supabase } from "../helpers/supabaseClient";
import "./Frame.css";
import "./Admin.css";
import "./AdminDashboard.css";

const WEEK = 7 * 24 * 3600 * 1000;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const shortDate = (ymd) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString([], { day: "numeric", month: "short" });
};

// Everything the cards report on, loaded in parallel. Each key stays
// undefined while loading, so its card shows a shimmer instead of a guess.
function useDashboardData(admin) {
  const [d, setD] = useState({ pages: getCachedTeamPages(), events: getCachedEventPages().pages });

  useEffect(() => {
    let alive = true;
    const set = (key, value) => alive && setD((prev) => ({ ...prev, [key]: value }));
    const since = Date.now() - WEEK;

    fetchTeamPages()
      .then((pages) => set("pages", pages))
      .catch(() => {});
    fetchEventPages()
      .then((snap) => set("events", snap.pages))
      .catch(() => {});
    fetchTeamJoinApplications()
      .then((apps) => set("apps", { total: apps.length, week: apps.filter((a) => new Date(a.created_at) > since).length }))
      .catch(() => set("apps", null));

    if (admin) {
      fetchTeamJoinConfig()
        .then((c) => set("joinOpen", !!c.enabled))
        .catch(() => set("joinOpen", null));
      fetchBookConfig()
        .then((c) => set("book", c))
        .catch(() => set("book", null));
      fetchContactConfig()
        .then((c) => set("contact", c))
        .catch(() => set("contact", null));
      fetchSiteStatus()
        .then((s) => set("maintenance", s))
        .catch(() => set("maintenance", null));
      fetchWallpapers()
        .then((w) => set("wallpapers", w))
        .catch(() => set("wallpapers", null));
      supabase
        .from("members")
        .select("id", { count: "exact", head: true })
        .then(({ count, error }) => set("members", error ? null : count));
      supabase
        .from("admin_users")
        .select("role, disabled")
        .then(({ data, error }) => set("accounts", error ? null : data || []));
      fetchActivity({ limit: 6 })
        .then((rows) => set("activity", rows))
        .catch(() => set("activity", null));
    }
    return () => {
      alive = false;
    };
  }, [admin]);

  return d;
}

// ---- Status pills -----------------------------------------------------------

// A card's status while its data is still on the way (shows a shimmer).
// Cards with no status at all just leave the prop out.
const LOADING = "loading";

function Status({ value }) {
  if (value === LOADING) return <span className="ad-status is-loading" aria-hidden="true" />;
  if (!value) return null;
  return (
    <span className={`ad-status is-${value.tone || "info"}`}>
      <i />
      {value.text}
    </span>
  );
}

function bookStatus(book) {
  if (book === undefined) return LOADING;
  if (!book) return null;
  if (!isSubmissionOpen(book)) return { tone: "off", text: "Closed" };
  return { tone: "ok", text: book.deadline ? `Open · closes ${shortDate(book.deadline)}` : "Open · no deadline" };
}

function joinStatus(apps, joinOpen) {
  if (apps === undefined) return LOADING;
  if (joinOpen === false && !(apps && apps.week)) return { tone: "off", text: "Applications closed" };
  if (!apps) return null;
  if (apps.week) return { tone: "warn", text: `${apps.week} new this week · ${apps.total} total` };
  return { tone: "info", text: apps.total ? `${apps.total} total · none this week` : "No applications yet" };
}

function editorsStatus(accounts) {
  if (accounts === undefined) return LOADING;
  if (!accounts) return { tone: "off", text: "Not set up yet" };
  const editors = accounts.filter((a) => a.role === "editor");
  const off = editors.filter((a) => a.disabled).length;
  if (!editors.length) return { tone: "info", text: "No editors yet" };
  return { tone: "ok", text: `${editors.length} editor${editors.length === 1 ? "" : "s"}${off ? ` · ${off} disabled` : ""}` };
}

function contactStatus(contact) {
  if (contact === undefined) return LOADING;
  if (!contact) return null;
  return { tone: "info", text: contact.email };
}

function wallpaperStatus(list) {
  if (list === undefined) return LOADING;
  if (!list) return { tone: "off", text: "Not set up yet" };
  const shown = list.filter((w) => w.is_visible).length;
  if (!shown) return { tone: "info", text: list.length ? `${list.length} hidden · default picture` : "Default picture" };
  return { tone: "ok", text: `${shown} showing${shown > 1 ? " · rotating" : ""}${list.length > shown ? ` · ${list.length - shown} hidden` : ""}` };
}

function maintenanceStatus(site) {
  if (site === undefined) return LOADING;
  if (!site) return null;
  if (!isMaintenanceOn(site)) return { tone: "ok", text: "Site is open" };
  return {
    tone: "warn",
    text: site.reopensAt ? `ON · reopens ${formatReopen(site.reopensAt, "en-GB")}` : "ON · visitors see the maintenance page",
  };
}

function membersStatus(count) {
  if (count === undefined) return LOADING;
  if (count === null) return { tone: "off", text: "Not set up yet" };
  return { tone: "info", text: `${count} member${count === 1 ? "" : "s"}` };
}

function activityStatus(activity) {
  if (activity === undefined) return LOADING;
  if (!activity || !activity[0]) return null;
  return { tone: "info", text: `Latest ${ago(activity[0].created_at)}` };
}

function stickersStatus() {
  const ids = getEnabledStickerIds();
  const on = ids ? ids.length : DESIGNS.length;
  return { tone: "info", text: on === DESIGNS.length ? `All ${DESIGNS.length} shown` : `${on} of ${DESIGNS.length} shown` };
}

// ---- Pieces -----------------------------------------------------------------

function Card({ to, icon: Icon, title, desc, status, tone, index }) {
  return (
    <Link to={to} className={`ad-card tone-${tone}`} style={{ "--i": index }}>
      <span className="ad-icon">
        <Icon />
      </span>
      <span className="ad-card-text">
        <strong>{title}</strong>
        <small>{desc}</small>
        <Status value={status} />
      </span>
      <FaArrowRight className="ad-arrow" aria-hidden="true" />
    </Link>
  );
}

function TeamPagesCard({ pages, lastPublish, title, desc, index }) {
  const latest = pages.filter((p) => p.updatedAt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  let status = {
    tone: "info",
    text: pages.length === 1 ? "Not published yet, showing the built-in page" : "Every team shows its built-in page",
  };
  if (latest) {
    const by = lastPublish && lastPublish.team_id === latest.id ? ` by ${actorName(lastPublish)}` : "";
    status = { tone: "ok", text: `Last published ${ago(latest.updatedAt)}${by}` };
  }
  return (
    <Link to="/admin/teams" className="ad-card ad-feature tone-gold" style={{ "--i": index }}>
      <div className="ad-feature-head">
        <span className="ad-icon">
          <FaLayerGroup />
        </span>
        <span className="ad-card-text">
          <strong>{title}</strong>
          <small>{desc}</small>
          <Status value={status} />
        </span>
        <FaArrowRight className="ad-arrow" aria-hidden="true" />
      </div>
      <ul className="ad-teams">
        {pages.map((p) => (
          <li key={p.id}>
            <span className="ad-team-logo">
              {p.logo ? (
                <SmartImage src={p.logo} width={96} alt="" fallback={<b>{p.title.charAt(0)}</b>} />
              ) : (
                <b>{p.title.charAt(0)}</b>
              )}
            </span>
            <span className="ad-team-name">{p.title}</span>
            <span className={`ad-team-when${p.updatedAt ? "" : " is-default"}`}>
              {p.updatedAt ? ago(p.updatedAt) : "built-in"}
            </span>
          </li>
        ))}
      </ul>
    </Link>
  );
}

// Event pages: each event with when it was last edited. Events nobody has
// edited in the admin show their built-in content.
function EventPagesCard({ events, lastPublish, title, desc, index }) {
  const edited = events.filter((p) => p.updatedAt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  let status = {
    tone: "info",
    text: `${events.length} event page${events.length === 1 ? "" : "s"} · all showing built-in content`,
  };
  if (edited.length) {
    const by =
      lastPublish && lastPublish.details && lastPublish.details.event_id === edited[0].id ? ` by ${actorName(lastPublish)}` : "";
    status = { tone: "ok", text: `Last published ${ago(edited[0].updatedAt)}${by}` };
  }
  const shown = events.filter((p) => !p.parent);
  return (
    <Link to="/admin/events" className="ad-card ad-feature tone-sky" style={{ "--i": index }}>
      <div className="ad-feature-head">
        <span className="ad-icon">
          <FaCalendarAlt />
        </span>
        <span className="ad-card-text">
          <strong>{title}</strong>
          <small>{desc}</small>
          <Status value={status} />
        </span>
        <FaArrowRight className="ad-arrow" aria-hidden="true" />
      </div>
      <ul className="ad-teams ad-events">
        {shown.map((p) => (
          <li key={p.id}>
            <span className="ad-team-logo">
              {p.image ? (
                <SmartImage src={p.image} width={96} alt="" fallback={<b>{p.title.charAt(0)}</b>} />
              ) : (
                <b>{p.title.charAt(0)}</b>
              )}
            </span>
            <span className="ad-team-name">{p.title}</span>
            <span className={`ad-team-when${p.updatedAt ? "" : " is-default"}`}>
              {p.updatedAt ? ago(p.updatedAt) : "built-in"}
            </span>
          </li>
        ))}
      </ul>
    </Link>
  );
}

function Section({ label, icon: Icon, children }) {
  return (
    <section className="ad-section">
      <h2 className="ad-section-label">
        <Icon /> {label}
      </h2>
      {children}
    </section>
  );
}

function ActivityPanel({ activity, teamTitle, eventTitle }) {
  return (
    <aside className="ad-panel">
      <div className="ad-panel-head">
        <h2>
          <FaHistory /> Recent activity
        </h2>
        <Link to="/admin/activity">
          See all <FaArrowRight />
        </Link>
      </div>
      {activity === undefined && (
        <ul className="ad-feed">
          {[0, 1, 2, 3].map((n) => (
            <li key={n} className="ad-feed-skeleton" />
          ))}
        </ul>
      )}
      {activity === null && <p className="ad-panel-empty">The activity log starts once team editors are set up.</p>}
      {activity && activity.length === 0 && (
        <p className="ad-panel-empty">Nothing yet. Publishes and account changes will show up here.</p>
      )}
      {activity && activity.length > 0 && (
        <ul className="ad-feed">
          {activity.map((e) => {
            const meta = actionMeta(e.action);
            const Icon = meta.icon;
            const target = activityObject(e, teamTitle, eventTitle);
            return (
              <li key={e.id} className={`ad-feed-${meta.group}`}>
                <span className="ad-feed-icon">
                  <Icon />
                </span>
                <span className="ad-feed-text">
                  <b>{actorName(e)}</b> {meta.verb}
                  {target && <> <b>{target}</b></>}
                </span>
                <time dateTime={e.created_at}>{ago(e.created_at)}</time>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}

function TipsPanel() {
  return (
    <aside className="ad-panel">
      <div className="ad-panel-head">
        <h2>
          <FaRegLightbulb /> Tips
        </h2>
      </div>
      <ol className="ad-tips">
        <li>
          <b>Add photos</b> with a <i>Photo gallery</i> section. Drop them in and they're optimised for you.
        </li>
        <li>
          <b>Check the Preview tab</b> before publishing to see the page as visitors will.
        </li>
        <li>
          Nothing is live until you press <b>Publish</b>. Discard throws your draft away.
        </li>
      </ol>
    </aside>
  );
}

function TopBar({ who }) {
  const navigate = useNavigate();
  const label = who.name || who.email;
  return (
    <div className="ad-topbar">
      <div className="ad-brand">
        <span className="ad-brand-mark">த</span>
        <span>
          <strong>Admin</strong>
          <small>tlauom.com</small>
        </span>
      </div>
      <div className="ad-me">
        <span className="ad-avatar" aria-hidden="true">
          {(label || "?").charAt(0).toUpperCase()}
        </span>
        <span className="ad-me-text">
          <strong title={who.email}>{label}</strong>
          <small>{who.role === "editor" ? "Team editor" : "Main admin"}</small>
        </span>
        <a href="/" target="_blank" rel="noopener noreferrer" className="ad-bar-btn" title="Open the website">
          <FaExternalLinkAlt /> <span>View site</span>
        </a>
        <Link to="/admin/account" className="ad-bar-btn" title="Account & password">
          <FaUserCog /> <span>Account</span>
        </Link>
        <button
          type="button"
          className="ad-bar-btn is-exit"
          onClick={async () => {
            await logout();
            navigate("/admin/login", { replace: true });
          }}
        >
          <FaSignOutAlt /> <span>Log out</span>
        </button>
      </div>
    </div>
  );
}

// ---- Page -------------------------------------------------------------------

export default function Admin() {
  const who = useAdminRole();
  const editor = who.role === "editor";
  const data = useDashboardData(!editor);

  const pages = useMemo(
    () => (editor ? data.pages.filter((p) => who.teams.includes(p.id)) : data.pages),
    [data.pages, editor, who.teams]
  );
  const teamTitle = (id) => (data.pages.find((p) => p.id === id) || {}).title || `Team ${id}`;
  const eventTitle = (id) => eventTitleIn(data.events, id);
  const lastPublish = (data.activity || []).find((e) => e.action === "publish");
  const lastEventPublish = (data.activity || []).find((e) => e.action === "event_publish");
  const myEvents = useMemo(() => data.events.filter((p) => canEditEvent(who, p.id)), [data.events, who]);
  const firstName = (who.name || (who.email || "").split("@")[0]).split(" ")[0];
  const today = new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" });

  let n = 0; // entrance order, so the cards rise in one after another

  return (
    <div className="frame-page admin-page ad-page">
      <Helmet>
        <title>Admin · தமிழ் இலக்கிய மன்றம்</title>
      </Helmet>
      <div className="ad-aurora" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <TopBar who={who} />

      <header className="ad-hero">
        <span className="frame-brand">தமிழ் இலக்கிய மன்றம்</span>
        <LotusDivider />
        <h1>
          வணக்கம், <span>{firstName}</span>
        </h1>
        <p>
          {greeting()} · {today}
          {editor && pages.length > 0 && <> · editor of {pages.map((p) => p.title).join(", ")}</>}
        </p>
      </header>

      <div className="ad-layout">
        <main className="ad-main">
          {editor ? (
            <>
            <Section label={myEvents.length && !pages.length ? "Your events" : "Your team"} icon={FaPenNib}>
              <div className="ad-grid ad-grid-content">
                {pages.length === 0 && myEvents.length > 0 ? (
                  <EventPagesCard
                    events={myEvents}
                    lastPublish={lastEventPublish}
                    title={myEvents.length > 1 ? "Your event pages" : "Your event page"}
                    desc="Sections, photos and programme. Edit and publish."
                    index={n++}
                  />
                ) : pages.length > 0 ? (
                  <TeamPagesCard
                    pages={pages}
                    title={pages.length > 1 ? "Your team pages" : "Your team page"}
                    desc="Sections, photos and competitions. Edit and publish."
                    index={n++}
                  />
                ) : (
                  <p className="ad-panel-empty">You're not assigned to a team yet. Ask a main admin to add you.</p>
                )}
                <div className="ad-stack">
                  {pages.length > 0 && (
                    <Card
                      to="/admin/team-join"
                      icon={FaHandshake}
                      tone="rose"
                      title="Join requests"
                      desc="People who applied to join your team."
                      status={joinStatus(data.apps)}
                      index={n++}
                    />
                  )}
                  <Card
                    to="/admin/account"
                    icon={FaUserCog}
                    tone="violet"
                    title="Change password"
                    desc="Update the password you sign in with."
                    index={n++}
                  />
                </div>
              </div>
            </Section>
            {pages.length > 0 && myEvents.length > 0 && (
              <Section label="Your events" icon={FaCalendarAlt}>
                <div className="ad-grid">
                  <EventPagesCard
                    events={myEvents}
                    lastPublish={lastEventPublish}
                    title={myEvents.length > 1 ? "Your event pages" : "Your event page"}
                    desc="Sections, photos and programme. Edit and publish."
                    index={n++}
                  />
                </div>
              </Section>
            )}
            </>
          ) : (
            <>
              <Section label="Website content" icon={FaPenNib}>
                <div className="ad-grid ad-grid-content">
                  <TeamPagesCard
                    pages={pages}
                    lastPublish={lastPublish}
                    title="Team pages"
                    desc="Each team's page: sections, galleries, competitions."
                    index={n++}
                  />
                  <div className="ad-stack">
                    <Card
                      to="/admin/books"
                      icon={FaBookOpen}
                      tone="amber"
                      title="Book submissions"
                      desc="Open or close submissions, deadline and form options."
                      status={bookStatus(data.book)}
                      index={n++}
                    />
                    <Card
                      to="/admin/team-join"
                      icon={FaHandshake}
                      tone="rose"
                      title="Join requests"
                      desc="Application form, WhatsApp links and applicants."
                      status={joinStatus(data.apps, data.joinOpen)}
                      index={n++}
                    />
                    <Card
                      to="/admin/wallpapers"
                      icon={FaImages}
                      tone="amber"
                      title="Home wallpapers"
                      desc="Add, hide, reorder and delete the sliding home page pictures."
                      status={wallpaperStatus(data.wallpapers)}
                      index={n++}
                    />
                    <Card
                      to="/admin/contact"
                      icon={FaAddressCard}
                      tone="sky"
                      title="Contact info"
                      desc="Email, phone and social links on the site."
                      status={contactStatus(data.contact)}
                      index={n++}
                    />
                  </div>
                </div>
              </Section>

              <Section label="Events" icon={FaCalendarAlt}>
                <div className="ad-grid">
                  <EventPagesCard
                    events={data.events}
                    lastPublish={lastEventPublish}
                    title="Event pages"
                    desc="Every event's page, the home page cards, and who edits what."
                    index={n++}
                  />
                </div>
              </Section>

              <div className="ad-duo">
                <Section label="People & access" icon={FaUsersCog}>
                  <div className="ad-grid ad-grid-2">
                    <Card
                      to="/admin/members"
                      icon={FaIdCard}
                      tone="amber"
                      title="Members"
                      desc="Add, edit, view and remove the members on the members page."
                      status={membersStatus(data.members)}
                      index={n++}
                    />
                    <Card
                      to="/admin/editors"
                      icon={FaUsersCog}
                      tone="violet"
                      title="Editors"
                      desc="Logins that can only edit their own teams and events."
                      status={editorsStatus(data.accounts)}
                      index={n++}
                    />
                    <Card
                      to="/admin/activity"
                      icon={FaHistory}
                      tone="indigo"
                      title="Activity log"
                      desc="Who published what, and when."
                      status={activityStatus(data.activity)}
                      index={n++}
                    />
                  </div>
                </Section>

                <Section label="Tools" icon={FaPalette}>
                  <div className="ad-grid ad-grid-2">
                    <Card
                      to="/admin/qr"
                      icon={FaQrcode}
                      tone="teal"
                      title="QR code"
                      desc="Print-ready QR for the photo-frame editor."
                      index={n++}
                    />
                    <Card
                      to="/admin/stickers"
                      icon={FaPalette}
                      tone="teal"
                      title="Stickers"
                      desc="Choose the designs in the frame editor."
                      status={stickersStatus()}
                      index={n++}
                    />
                    <Card
                      to="/admin/maintenance"
                      icon={FaTools}
                      tone="rose"
                      title="Maintenance mode"
                      desc="Show visitors a maintenance page while you work."
                      status={maintenanceStatus(data.maintenance)}
                      index={n++}
                    />
                  </div>
                </Section>
              </div>
            </>
          )}
        </main>

        {editor ? <TipsPanel /> : <ActivityPanel activity={data.activity} teamTitle={teamTitle} eventTitle={eventTitle} />}
      </div>
    </div>
  );
}
