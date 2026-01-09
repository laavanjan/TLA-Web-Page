import React from "react";
import { Helmet } from "react-helmet";
import History from "../Components/history/History";

function HistoryPage() {
  return (
    <>
      <Helmet>
        <title>எமது வரலாறு | தமிழ் இலக்கிய மன்றம்</title>
        <meta
          name="description"
          content="எமது வரலாறு"
        />
        <meta
          name="keywords"
          content="TLA, Tamil Literary Association, History"
        />
      </Helmet>
      <History/>
    </>
  );
}

export default HistoryPage;