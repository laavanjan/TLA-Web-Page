// The kind of device, browser and system, read from the user agent. Only
// these broad names are stored, never the user agent itself.

const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|whatsapp|telegrambot|discordbot|preview|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|phantomjs|puppeteer|playwright|selenium/i;

export function isBot(ua = "", nav = {}) {
  if (nav.webdriver) return true;
  return !ua || BOT.test(ua);
}

export function deviceOf(ua = "", nav = {}) {
  // iPads on iPadOS 13+ claim to be a Mac; touch gives them away.
  if (/ipad|tablet|kindle|silk|playbook/i.test(ua) || (/macintosh/i.test(ua) && nav.maxTouchPoints > 1)) return "tablet";
  if (/android/i.test(ua) && !/mobile/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

export function browserOf(ua = "") {
  if (/edg(e|a|ios)?\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/fban|fbav|instagram/i.test(ua)) return "In-app (Meta)";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/chrome|crios|chromium/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  return "Other";
}

export function osOf(ua = "", nav = {}) {
  if (/windows/i.test(ua)) return "Windows";
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && nav.maxTouchPoints > 1)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/mac os|macintosh/i.test(ua)) return "macOS";
  if (/cros/i.test(ua)) return "ChromeOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}
