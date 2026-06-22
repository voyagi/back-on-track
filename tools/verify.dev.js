// dev-browser verification script (QuickJS sandbox). Run: dev-browser run tools/verify.dev.js
const page = await browser.getPage("back-on-track");
await page.setViewportSize({ width: 412, height: 880 });

const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + String(e)));
page.on("console", (m) => {
  if (m.type() !== "error") return;
  if (m.text().includes("403 (Forbidden)")) return;
  errors.push("console: " + m.text());
});

const base = "http://127.0.0.1:5178/";
const routes = ["home", "today", "learn", "flare", "goal", "safety"];
const shots = [];

await page.goto(base, { waitUntil: "load" });
await page.evaluate(async () => {
  if ("serviceWorker" in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  }
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
});

await page.goto(base + "?from=magnet#/home", { waitUntil: "load" });
await page.waitForTimeout(400);
const tiles = await page.locator(".tile").count();
const screenText = (await page.locator("#screen").innerText()).length;

await page.evaluate(() => {
  localStorage.setItem("bot.v1", JSON.stringify({ goal: "<img src=x onerror=alert(1)>", days: { bad: "value" } }));
});
await page.goto(base + "#/home", { waitUntil: "load" });
await page.waitForTimeout(250);
const literalGoal = await page.locator(".goal-pinned").innerText();
const escapedGoal = literalGoal.includes("<img src=x onerror=alert(1)>");
const htmlInjection = await page.evaluate(() => document.querySelector(".goal-pinned").innerHTML.includes("<img src="));

const traversalStatus = await page.evaluate(async () => {
  const res = await fetch("/..%2FREADME.md");
  return res.status;
});

for (const r of routes) {
  await page.goto(base + "?from=magnet#/" + r, { waitUntil: "load" });
  await page.waitForTimeout(350);
  shots.push(await saveScreenshot(await page.screenshot(), "bot-" + r + ".png"));
}

await page.goto(base + "magnets.html", { waitUntil: "load" });
await page.waitForTimeout(500);
await page.locator("#base").fill("http://example.invalid/back-on-track/");
await page.locator("#apply").click();
await page.waitForTimeout(150);
const baseError = await page.locator("#baseError").innerText();
const qrCount = await page.$$eval(".magnet .qr svg", (els) => els.length);
const magnetCount = await page.locator(".magnet").count();
const magShot = await saveScreenshot(await page.screenshot({ fullPage: true }), "bot-magnets.png");

const checks = {
  escapedGoal,
  htmlInjection,
  traversalStatus,
  invalidMagnetUrlBlocked: baseError.includes("HTTPS"),
};

if (!checks.escapedGoal) errors.push("stored goal did not render as literal text");
if (checks.htmlInjection) errors.push("stored goal became HTML");
if (checks.traversalStatus < 400) errors.push("path traversal request was not rejected");
if (!checks.invalidMagnetUrlBlocked) errors.push("invalid magnet base URL was not blocked");

console.log(JSON.stringify({ errors, tiles, screenText, qrCount, magnetCount, checks, shots, magShot }, null, 2));
if (errors.length) throw new Error("verification failed");
