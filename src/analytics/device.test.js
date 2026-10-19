import { isBot, deviceOf, browserOf, osOf } from "./device";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const ANDROID_TAB = "Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const IPAD_AS_MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const WINDOWS_EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0";
const INSTAGRAM =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 337.0.3.23.54";
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

test("bots, previews and automated browsers are skipped", () => {
  expect(isBot(GOOGLEBOT)).toBe(true);
  expect(isBot("WhatsApp/2.23.20.0")).toBe(true);
  expect(isBot("")).toBe(true);
  expect(isBot(IPHONE, { webdriver: true })).toBe(true);
  expect(isBot(IPHONE)).toBe(false);
  expect(isBot(INSTAGRAM)).toBe(false);
});

test("phones, tablets and computers", () => {
  expect(deviceOf(IPHONE)).toBe("mobile");
  expect(deviceOf(ANDROID)).toBe("mobile");
  expect(deviceOf(ANDROID_TAB)).toBe("tablet");
  expect(deviceOf(IPAD_AS_MAC, { maxTouchPoints: 5 })).toBe("tablet");
  expect(deviceOf(IPAD_AS_MAC, { maxTouchPoints: 0 })).toBe("desktop");
  expect(deviceOf(WINDOWS_EDGE)).toBe("desktop");
});

test("browser and system names", () => {
  expect(browserOf(WINDOWS_EDGE)).toBe("Edge");
  expect(browserOf(ANDROID)).toBe("Chrome");
  expect(browserOf(IPHONE)).toBe("Safari");
  expect(browserOf(INSTAGRAM)).toBe("In-app (Meta)");
  expect(osOf(WINDOWS_EDGE)).toBe("Windows");
  expect(osOf(IPHONE)).toBe("iOS");
  expect(osOf(ANDROID)).toBe("Android");
  expect(osOf(IPAD_AS_MAC, { maxTouchPoints: 5 })).toBe("iOS");
  expect(osOf(IPAD_AS_MAC)).toBe("macOS");
});
