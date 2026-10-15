// A home-page section heading that rises into place when it scrolls into
// view, with the gold lotus flourish unfolding underneath (homeFx.css).
import React, { useRef } from "react";
import LotusDivider from "../../Pages/LotusDivider";
import { useInView } from "../../shared/scrollFx/scrollFx";

export default function FxHeading({ children }) {
  const ref = useRef(null);
  const seen = useInView(ref, { threshold: 0.4 });
  return (
    <div ref={ref} className={`fx-heading ${seen ? "is-in" : ""}`}>
      {children}
      <LotusDivider className="fx-lotus" />
    </div>
  );
}
