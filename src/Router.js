import { useRoutes } from "react-router-dom";

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
import HistoryPage from "./Pages/History";
import Ideathon from "./Pages/Ideathon";
import MemorySharing from "./Pages/Memory-Sharing";
import TeamsPage from "./Pages/Teams-Page";

import Login from "./Components/Login";
import Signup from "./Components/Signup";
import MakkalMantramVote from "./Pages/MakkalMantramVote";
import Seniors from "./Pages/Seniors";
import MakkalMantramVoteResults from "./Pages/MakkalMantramVoteResults";

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
      path: "/seniors",
      element: <Seniors />,
    },
    {
      path: "teams",
      element: <TeamsPage />,
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
  ]);
}

export default Router;
