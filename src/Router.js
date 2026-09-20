import { useRoutes, Navigate } from "react-router-dom";

import BrammamEventAbout from "./Components/events/brammam/aboutEvent/BrammamEventAbout";
import ExtraInfo from "./Components/events/brammam/ExtraInfo/ExtraInfo";
import Aramiyam from "./Pages/Aramiyam";
import BloodDonation from "./Pages/Blood-donation";
import Brammam from "./Pages/Brammam";
import FoodFestival from "./Pages/Food-festival";
import Home from "./Pages/Home";
import Jeevanathi from "./Pages/Jeevanathi";
import Kovil from "./Pages/Kovil";
import MovieNight from "./Pages/Movie-night";
import PPL from "./Pages/PPL";
import SotkanaiDistrict from "./Pages/Sotkanai-district";
import SotkanaiMain from "./Pages/Sotkanai-main";
import Thaipongal from "./Pages/Thaipongal";
import Thamilaruvi from "./Pages/Thamilaruvi";
import VaniVilla from "./Pages/Vani-villa";
import ComingSoon from "./shared/comingSoon/ComingSoon";

import Contact from "./Components/Home/Contact/contact";
import Books from "./Pages/Books";
import BookViewer from "./Pages/BookViewer";
import BookSubmitGuidelines from "./Pages/BookSubmitGuidelines";
import BookSubmitForm from "./Pages/BookSubmitForm";
import HistoryPage from "./Pages/History";
import Ideathon from "./Pages/Ideathon";
import MemorySharing from "./Pages/Memory-Sharing";
import TeamsPage from "./Pages/Teams-Page";
import TeamDetailPage from "./Pages/TeamDetailPage";

import Login from "./Components/Login";
import Signup from "./Components/Signup";
import MakkalMantramVote from "./Pages/MakkalMantramVote";
import Seniors from "./Pages/Seniors";
import MakkalMantramVoteResults from "./Pages/MakkalMantramVoteResults";
import Frame from "./Pages/Frame";
import Admin from "./Pages/Admin";
import AdminQr from "./Pages/AdminQr";
import AdminStickers from "./Pages/AdminStickers";
import AdminAccount from "./Pages/AdminAccount";
import AdminBooks from "./Pages/AdminBooks";
import AdminLogin from "./Pages/AdminLogin";
import RequireAdmin from "./Pages/RequireAdmin";

function Router() {
  return useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/events",
      children: [
        {
          path: "thaipongal",
          element: <Thaipongal />,
        },
        {
          path: "sotkanai",
          element: <SotkanaiMain />,
        },
        {
          path: "sotkanai-district",
          element: <SotkanaiDistrict />,
        },
        {
          path: "aramiyam",
          element: <Aramiyam />,
        },
        {
          path: "jeevanathi",
          element: <Jeevanathi />,
        },
        {
          path: "vani-villa",
          element: <VaniVilla />,
        },
        {
          path: "kovil",
          element: <Kovil />,
        },
        {
          path: "blood-donation",
          element: <BloodDonation />,
        },
        {
          path: "food-festival",
          element: <FoodFestival />,
        },
        {
          path: "thamilaruvi",
          element: <Thamilaruvi />,
        },
        {
          path: "brammam",
          element: <Brammam />,
        },
        {
          path: "brammam/:event",
          element: <BrammamEventAbout />,
        },
        {
          path: "brammam/:event/rules",
          element: <ExtraInfo />,
        },
        {
          path: "comingSoon",
          element: <ComingSoon />,
        },
        {
          path: "ppl",
          element: <PPL />,
        },
        {
          path: "movie-night",
          element: <MovieNight />,
        },
      ],
    },
    {
      path: "ideathon",
      element: <Ideathon />,
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
      path: "/books/tla26",
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
      path: "/seniors",
      element: <Seniors />,
    },
    {
      path: "teams",
      element: <TeamsPage />,
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
        <RequireAdmin>
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
        <RequireAdmin>
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
      // old QR route → the QR tool in the new admin dashboard
      path: "frame/admin",
      element: <Navigate to="/admin/qr" replace />,
    },
  ]);
}

export default Router;
