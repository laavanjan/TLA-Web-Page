// Registry of overlay designs the /frame editor offers in its picker.
//
// Each design is finished, self-contained artwork with its own colours (there
// is no light/dark toggle). These are transparent PNGs — the metallic gold /
// silver / copper calligraphy — kept as raster images because they have
// gradients and fine detail that vector tracing would destroy. They were
// downscaled to 1600px wide for the web (originals were ~14000px).
//
// To add another design: drop its PNG (or SVG) in ./designs/, import it, and
// append one entry to DESIGNS with its natural width/height. The picker and the
// canvas both read straight from this array.
import goldSrc from "./designs/gold.png";
import silverSrc from "./designs/silver.png";
import copperSrc from "./designs/copper.png";

export const DESIGNS = [
  { id: "gold", label: "Gold", w: 1600, h: 765, src: goldSrc },
  { id: "silver", label: "Silver", w: 1600, h: 765, src: silverSrc },
  { id: "copper", label: "Copper", w: 1600, h: 765, src: copperSrc },
].map((d) => ({ ...d, ratio: d.w / d.h }));
