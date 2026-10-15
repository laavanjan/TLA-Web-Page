import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@mui/material";
import Heading from "../../../shared/Heading";
import FxHeading from "../FxHeading";
import Reveal from "../../../shared/Reveal/Reveal";
import { supabase } from "../../../helpers/supabaseClient";
import { useInView, prefersReducedMotion } from "../../../shared/scrollFx/scrollFx";
import "./membersBanner.css";

// How many members there are (null until known, or if it can't be read).
function useMemberCount() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    let alive = true;
    supabase
      .from("members")
      .select("id", { count: "exact", head: true })
      .then(({ count: n, error }) => {
        if (alive && !error && n > 0) setCount(n);
      });
    return () => {
      alive = false;
    };
  }, []);
  return count;
}

// Counts from 0 up to `to` once on screen, writing straight into the element.
function CountUp({ to }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.6 });

  useEffect(() => {
    const el = ref.current;
    if (!el || !seen) return undefined;
    if (prefersReducedMotion()) {
      el.textContent = to.toLocaleString("en-US");
      return undefined;
    }
    const ms = 1800;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / ms);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(to * eased).toLocaleString("en-US");
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);

  return (
    <span ref={ref} className="fx-count-num">
      0
    </span>
  );
}

function MembersBanner() {
  const count = useMemberCount();

  return (
    <section className="members-banner">
      <Container maxWidth="lg" className="members-banner-wrap">
        <FxHeading>
          <Heading>எங்கள் உறுப்பினர்கள்</Heading>
        </FxHeading>
        {count && (
          <div className="fx-count">
            <CountUp to={count} />
            <span className="fx-count-label">உறவுகள் எம்மோடு</span>
          </div>
        )}
        {/* The same fade-up as the History page (shared/Reveal). */}
        <Reveal className="intro-heading1">எம்மோடு இணைந்து பயணிக்கும் உறவுகளை அறிந்து கொள்ளுங்கள்.</Reveal>
        <Reveal style={{ transitionDelay: "150ms" }}>
          <Link to="/members" className="members-banner-btn">
            உறுப்பினர்களைப் பார்க்க
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}

export default MembersBanner;
