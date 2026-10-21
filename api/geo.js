// GET /api/geo → { "country": "LK" }
// The visitor's country, from the header Vercel adds to every request. Used
// by the traffic counter (src/analytics/geo.js); the IP address itself is
// never read or stored.
module.exports = (req, res) => {
  const country = String(req.headers["x-vercel-ip-country"] || "").slice(0, 2).toUpperCase();
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ country: /^[A-Z]{2}$/.test(country) ? country : "" }));
};
