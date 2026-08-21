// dev-browser live check against GitHub Pages. Run: dev-browser run tools/verify-live.dev.js
const page = await browser.getPage("bot-live");
await page.setViewportSize({ width: 412, height: 880 });
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

const base = "https://voyagi.github.io/back-on-track/";
await page.goto(base, { waitUntil: "load" });
await page.waitForTimeout(900);
const tiles = await page.locator(".tile").count();
const homeShot = await saveScreenshot(await page.screenshot(), "bot-live-home.png");

await page.goto(base + "?from=magnet#/flare", { waitUntil: "load" });
await page.waitForTimeout(800);
const flareTitle = await page.locator(".screen-title").first().innerText();
const flareShot = await saveScreenshot(await page.screenshot(), "bot-live-flare.png");

const swReg = await page.evaluate(async () => {
  if (!("serviceWorker" in navigator)) return "no-sw-api";
  const r = await navigator.serviceWorker.getRegistration();
  return r ? "registered:" + (r.active ? "active" : "installing") : "none-yet";
});

console.log(JSON.stringify({ errors, tiles, flareTitle, swReg, homeShot, flareShot }, null, 2));
