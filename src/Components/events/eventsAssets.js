// The images that ship with the website and are used by the built-in event
// pages. A saved event page refers to them as "asset:<key>" (see
// shared/bundledAssets.js), so they keep working across builds.
import { setBundledAssets } from "../../shared/bundledAssets";

import pongal from "../../images/Events/Card Illustration/pongal.webp";
import tamilaruvi from "../../images/Events/Card Illustration/tamilaruvi.webp";
import vanivila from "../../images/Events/Card Illustration/vanivila.webp";
import aramiyam from "../../images/Events/Card Illustration/aramiyamintro.png";
import blooddonation from "../../images/Events/Card Illustration/blooddonation.png";
import brammam from "../../images/Events/Card Illustration/brammam.png";
import foodfestival from "../../images/Events/Card Illustration/foodfestival.png";
import ideathon from "../../images/Events/Card Illustration/ideathon.png";
import jeevanathi from "../../images/Events/Card Illustration/jeevanathi.png";
import kovil from "../../images/Events/Card Illustration/kovil.png";
import movienight from "../../images/Events/Card Illustration/movienight.png";
import ppl from "../../images/Events/Card Illustration/ppl.png";
import sotkanai from "../../images/Events/Card Illustration/sotkanai.png";

import eluthoviyam from "./brammam/intro/images/eluthoviyam.png";
import meerigai from "./brammam/intro/images/meerigai.png";
import oliSuvadu from "./brammam/intro/images/oli_suvadu.png";
import solvalar from "./brammam/intro/images/solvalar.png";

import gold from "../../images/Sotkanai/gold.png";
import silver from "../../images/Sotkanai/silver.png";
import bronze from "../../images/Sotkanai/bronz.png";
import bestDebater from "../../images/Sotkanai/Cham.png";

import pplFirst from "../../images/Events/ppl/first.png";
import pplSecond from "../../images/Events/ppl/second.png";
import pplAward from "../../images/Events/ppl/award.png";

import ideaAward from "../../images/Ideathon/award.png";
import ideaCertificate from "../../images/Ideathon/certificate.png";
import ideaTha from "../../images/Ideathon/Tha.png";

import semmalai1 from "../../images/Events/jeevanathi/semmalai-2024/img1.jpg";
import school1 from "../../images/Events/jeevanathi/udaweriya-2018/school1.jpg";
import school2 from "../../images/Events/jeevanathi/udaweriya-2018/school2.jpg";
import school3 from "../../images/Events/jeevanathi/udaweriya-2018/school3.jpg";
import school4 from "../../images/Events/jeevanathi/udaweriya-2018/school4.jpg";
import flood1 from "../../images/Events/jeevanathi/flood-2018/flood1.jpg";
import flood2 from "../../images/Events/jeevanathi/flood-2018/flood2.jpg";
import flood3 from "../../images/Events/jeevanathi/flood-2018/flood3.jpg";
import flood4 from "../../images/Events/jeevanathi/flood-2018/flood4.jpg";
import landslide1 from "../../images/Events/jeevanathi/landslide-badulla-2014/landslide1.jpg";
import landslide2 from "../../images/Events/jeevanathi/landslide-badulla-2014/landslide2.jpg";
import landslide3 from "../../images/Events/jeevanathi/landslide-badulla-2014/landslide3.jpg";
import landslide4 from "../../images/Events/jeevanathi/landslide-badulla-2014/landslide4.jpg";

export const ASSETS = {
  "card/thaipongal": pongal,
  "card/vani-villa": vanivila,
  "card/thamilaruvi": tamilaruvi,
  "card/sotkanai": sotkanai,
  "card/ideathon": ideathon,
  "card/brammam": brammam,
  "card/aramiyam": aramiyam,
  "card/jeevanathi": jeevanathi,
  "card/kovil": kovil,
  "card/blood-donation": blooddonation,
  "card/ppl": ppl,
  "card/movie-night": movienight,
  "card/food-festival": foodfestival,

  "brammam/eluthoviyam": eluthoviyam,
  "brammam/meerigai": meerigai,
  "brammam/olisuvadu": oliSuvadu,
  "brammam/solalvalar": solvalar,

  "sotkanai/gold": gold,
  "sotkanai/silver": silver,
  "sotkanai/bronze": bronze,
  "sotkanai/best-debater": bestDebater,

  "ppl/first": pplFirst,
  "ppl/second": pplSecond,
  "ppl/award": pplAward,

  "ideathon/award": ideaAward,
  "ideathon/certificate": ideaCertificate,
  "ideathon/tha": ideaTha,

  "jeevanathi/semmalai-1": semmalai1,
  "jeevanathi/udaweriya-1": school1,
  "jeevanathi/udaweriya-2": school2,
  "jeevanathi/udaweriya-3": school3,
  "jeevanathi/udaweriya-4": school4,
  "jeevanathi/flood-1": flood1,
  "jeevanathi/flood-2": flood2,
  "jeevanathi/flood-3": flood3,
  "jeevanathi/flood-4": flood4,
  "jeevanathi/landslide-1": landslide1,
  "jeevanathi/landslide-2": landslide2,
  "jeevanathi/landslide-3": landslide3,
  "jeevanathi/landslide-4": landslide4,
};

setBundledAssets(ASSETS);
