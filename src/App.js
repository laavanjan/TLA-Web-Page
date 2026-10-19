
import "./App.css";

import Router from "./Router";
import Navbar from "./Components/Home/Navbar/navbar";
import Footer from "./Components/Home/Footer/footer";
import HelpBot from "./Components/HelpBot/HelpBot";
import MaintenanceGate from "./Components/maintenance/MaintenanceGate";
import ScrollToTop from "./Components/ScrollToTop";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./providers/AuthProvider";
import { currentUser } from "./helpers/server";
import { trackPageView } from "./analytics/tracker";

function App() {
  const auth = useAuth();
  const { pathname } = useLocation();
  // Standalone pages (e.g. the QR photo-frame editor) render without the
  // site nav/footer so they work as a focused, full-screen landing.
  const standalone = pathname.startsWith("/frame") || pathname.startsWith("/admin");
  useEffect(() => {
    currentUser().then(auth.loggedIn).catch(() => { });
  }, []);
  // Count the visit for the admin's Traffic page (src/analytics/tracker.js).
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  return (
    <MaintenanceGate>
      <ScrollToTop />
      {!standalone && <Navbar />}
      <Router/>
      {!standalone && <Footer />}
      {!standalone && <HelpBot />}
    </MaintenanceGate>
  );
}

export default App;
