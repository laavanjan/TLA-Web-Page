
import "./App.css";

import Router from "./Router";
import Navbar from "./Components/Home/Navbar/navbar";
import Footer from "./Components/Home/Footer/footer";
import ScrollToTop from "./Components/ScrollToTop";
import { useEffect } from "react";
import { useAuth } from "./providers/AuthProvider";
import { currentUser } from "./helpers/server";

function App() {
  const auth = useAuth();
  useEffect(() => {
    currentUser().then(auth.loggedIn).catch(() => { });
  }, []);
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Router/>
      <Footer />
    </>
  );
}

export default App;
