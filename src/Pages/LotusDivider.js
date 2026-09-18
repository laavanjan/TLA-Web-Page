import React from "react";

// Decorative gold lotus (தாமரை) flourish shown under the page heading.
// Symmetric petals fanning from a tapering underline — pure inline SVG so it
// stays crisp at any size and inherits the brand's gold palette.
const MAIN_PETAL = "M0,0 C -6.5,-13.5 -3.25,-27 0,-30 C 3.25,-27 6.5,-13.5 0,0 Z";
const OUTER_PETAL = "M0,0 C -5,-9.9 -2.5,-19.8 0,-22 C 2.5,-19.8 5,-9.9 0,0 Z";

export default function LotusDivider({ className = "" }) {
  return (
    <svg
      className={`frame-lotus ${className}`}
      viewBox="0 0 300 46"
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lotusGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0c2" />
          <stop offset="0.55" stopColor="#ffd76e" />
          <stop offset="1" stopColor="#e0a91d" />
        </linearGradient>
      </defs>

      {/* tapering flourish lines with a dotted trail at each outer end */}
      <g stroke="#e6b422" strokeWidth="2" strokeLinecap="round" fill="#e6b422">
        <line x1="34" y1="34" x2="120" y2="34" />
        <line x1="180" y1="34" x2="266" y2="34" />
        <circle cx="30" cy="34" r="2.6" stroke="none" />
        <circle cx="20" cy="34" r="1.7" stroke="none" opacity="0.75" />
        <circle cx="12" cy="34" r="1.1" stroke="none" opacity="0.5" />
        <circle cx="270" cy="34" r="2.6" stroke="none" />
        <circle cx="280" cy="34" r="1.7" stroke="none" opacity="0.75" />
        <circle cx="288" cy="34" r="1.1" stroke="none" opacity="0.5" />
      </g>

      {/* small rising curls where the lines meet the flower */}
      <g stroke="#e6b422" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M120,34 q10,-1 15,-8" />
        <path d="M180,34 q-10,-1 -15,-8" />
      </g>

      {/* lotus leaf pads resting on the line */}
      <g fill="url(#lotusGold)" opacity="0.65">
        <path d="M150,35 C138,31 128,33 121,35 C129,39 142,39 150,35 Z" />
        <path d="M150,35 C162,31 172,33 179,35 C171,39 158,39 150,35 Z" />
      </g>

      {/* the lotus flower */}
      <g transform="translate(150,34)" fill="url(#lotusGold)">
        <path d={OUTER_PETAL} transform="rotate(-64)" opacity="0.85" />
        <path d={OUTER_PETAL} transform="rotate(64)" opacity="0.85" />
        <path d={MAIN_PETAL} transform="rotate(-42)" />
        <path d={MAIN_PETAL} transform="rotate(42)" />
        <path d={MAIN_PETAL} transform="rotate(-20)" />
        <path d={MAIN_PETAL} transform="rotate(20)" />
        <path d={MAIN_PETAL} transform="rotate(0)" />
        {/* center petal highlight for depth */}
        <path
          d="M0,0 C -3,-11 -1.6,-22 0,-25 C 1.6,-22 3,-11 0,0 Z"
          fill="#fff6da"
          opacity="0.55"
        />
        <circle cx="0" cy="-1" r="2.2" fill="#e0a91d" />
      </g>
    </svg>
  );
}
