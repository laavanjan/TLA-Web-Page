import { lazy } from "react";
import { useRoutes, Navigate } from "react-router-dom";

import { EventRoute, CustomEventRoute, BrammamCompetitionRoute } from "./Components/events/EventRoute";
import ExtraInfo from "./Components/events/brammam/ExtraInfo/ExtraInfo";
import Home from "./Pages/Home";
import SotkanaiDistrict from "./Pages/Sotkanai-district";
import ComingSoon from "./shared/comingSoon/ComingSoon";

import Contact from "./Components/Home/Contact/contact";
import Books from "./Pages/Books";
import BookViewer from "./Pages/BookViewer";
import BookSubmitGuidelines from "./Pages/BookSubmitGuidelines";
import BookSubmitForm from "./Pages/BookSubmitForm";
import HistoryPage from "./Pages/History";
import MemorySharing from "./Pages/Memory-Sharing";
import TeamsPage from "./Pages/Teams-Page";
import TeamDetailPage from "./Pages/TeamDetailPage";
import TeamJoinForm from "./Pages/TeamJoinForm";

import Login from "./Components/Login";
import Signup from "./Components/Signup";
import MakkalMantramVote from "./Pages/MakkalMantramVote";
import Seniors from "./Pages/Seniors";
import MembersPage from "./Pages/Members";
import Privacy from "./Pages/Privacy";
import Faq from "./Pages/Faq";

// The admin panel, the photo-frame editor and the vote results screen are
// downloaded only when opened, so visitors to the public pages don't load
// them (or their chart, canvas and PDF libraries) up front.
const MakkalMantramVoteResults = lazy(() => import("./Pages/MakkalMantramVoteResults"));
const Frame = lazy(() => import("./Pages/Frame"));
const Admin = lazy(() => import("./Pages/Admin"));
const AdminQr = lazy(() => import("./Pages/AdminQr"));
const AdminStickers = lazy(() => import("./Pages/AdminStickers"));
const AdminAccount = lazy(() => import("./Pages/AdminAccount"));
const AdminBooks = lazy(() => import("./Pages/AdminBooks"));
const AdminContact = lazy(() => import("./Pages/AdminContact"));
const AdminTeamJoin = lazy(() => import("./Pages/AdminTeamJoin"));
const AdminTeams = lazy(() => import("./Pages/AdminTeams"));
const AdminEvents = lazy(() => import("./Pages/AdminEvents"));
const AdminMaintenance = lazy(() => import("./Pages/AdminMaintenance"));
const AdminWallpapers = lazy(() => import("./Pages/AdminWallpapers"));
const AdminFaq = lazy(() => import("./Pages/AdminFaq"));
const AdminMembers = lazy(() => import("./Pages/AdminMembers"));
const AdminLogin = lazy(() => import("./Pages/AdminLogin"));
const RequireAdmin = lazy(() => import("./Pages/RequireAdmin"));
const AdminEditors = lazy(() => import("./Pages/AdminEditors"));
const AdminActivity = lazy(() => import("./Pages/AdminActivity"));
const AdminTraffic = lazy(() => import("./Pages/AdminTraffic"));

function Router() {
  return useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      // Event pages: each reads the admin-published page (/admin/events) or the
      // content built into the site. Events made in the admin match :slug.
      path: "/events",
      children: [
        { path: "thaipongal", element: <EventRoute id="thaipongal" /> },
        { path: "vani-villa", element: <EventRoute id="vani-villa" /> },
        { path: "thamilaruvi", element: <EventRoute id="thamilaruvi" /> },
        { path: "sotkanai", element: <EventRoute id="sotkanai" /> },
        { path: "sotkanai-district", element: <SotkanaiDistrict /> },
        { path: "brammam", element: <EventRoute id="brammam" /> },
        { path: "brammam/:event", element: <BrammamCompetitionRoute /> },
        { path: "brammam/:event/rules", element: <ExtraInfo /> },
        { path: "aramiyam", element: <EventRoute id="aramiyam" /> },
        { path: "jeevanathi", element: <EventRoute id="jeevanathi" /> },
        { path: "kovil", element: <EventRoute id="kovil" /> },
        { path: "blood-donation", element: <EventRoute id="blood-donation" /> },
        { path: "ppl", element: <EventRoute id="ppl" /> },
        { path: "movie-night", element: <EventRoute id="movie-night" /> },
        { path: "food-festival", element: <EventRoute id="food-festival" /> },
        { path: "comingSoon", element: <ComingSoon /> },
        { path: ":slug", element: <CustomEventRoute /> },
      ],
    },
    {
      path: "ideathon",
      element: <EventRoute id="ideathon" />,
    },
    {
      path: "/memory-sharing",
      element: <MemorySharing />,
    },
    {
      path: "/books",
      element: <Books />,
    },
    {
      path: "/books/:slug",
      element: <BookViewer />,
    },
    {
      path: "/books/submit",
      element: <BookSubmitGuidelines />,
    },
    {
      path: "/books/submit/form",
      element: <BookSubmitForm />,
    },
    {
      path: "/members",
      element: <MembersPage />,
    },
    {
      path: "/seniors",
      element: <Seniors />,
    },
    {
      path: "teams",
      element: <TeamsPage />,
    },
    {
      path: "teams/join",
      element: <TeamJoinForm />,
    },
    {
      path: "teams/:teamId",
      element: <TeamDetailPage />,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      path: "signup",
      element: <Signup />,
    },
    {
      path: "history",
      element: <HistoryPage />,
    },
    {
      path: "contact",
      element: <Contact />,
    },
    {
      path: "privacy",
      element: <Privacy />,
    },
    {
      // Not linked from the menus: for search engines (see Pages/Faq.js).
      path: "faq",
      element: <Faq />,
    },
    {
      path: "vote",
      element: <MakkalMantramVote />,
    },
    {
      path: "vote/mm-2024-results-screen",
      element: <MakkalMantramVoteResults />,
    },
    {
      path: "frame",
      element: <Frame />,
    },
    {
      path: "admin/login",
      element: <AdminLogin />,
    },
    {
      path: "admin",
      element: (
        <RequireAdmin allow="any">
          <Admin />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/qr",
      element: (
        <RequireAdmin>
          <AdminQr />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/stickers",
      element: (
        <RequireAdmin>
          <AdminStickers />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/account",
      element: (
        <RequireAdmin allow="any">
          <AdminAccount />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/books",
      element: (
        <RequireAdmin>
          <AdminBooks />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/contact",
      element: (
        <RequireAdmin>
          <AdminContact />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/teams",
      element: (
        <RequireAdmin allow="any">
          <AdminTeams />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/events",
      element: (
        <RequireAdmin allow="any">
          <AdminEvents />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/wallpapers",
      element: (
        <RequireAdmin>
          <AdminWallpapers />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/faq",
      element: (
        <RequireAdmin>
          <AdminFaq />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/members",
      element: (
        <RequireAdmin>
          <AdminMembers />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/maintenance",
      element: (
        <RequireAdmin>
          <AdminMaintenance />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/team-join",
      element: (
        <RequireAdmin allow="any">
          <AdminTeamJoin />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/editors",
      element: (
        <RequireAdmin>
          <AdminEditors />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/activity",
      element: (
        <RequireAdmin>
          <AdminActivity />
        </RequireAdmin>
      ),
    },
    {
      path: "admin/traffic",
      element: (
        <RequireAdmin>
          <AdminTraffic />
        </RequireAdmin>
      ),
    },
    {
      // old QR route → the QR tool in the new admin dashboard
      path: "frame/admin",
      element: <Navigate to="/admin/qr" replace />,
    },
  ]);
}

export default Router;
