// dev-browser verification script (QuickJS sandbox). Run: dev-browser run tools/verify.dev.js
const page = await browser.getPage("back-on-track");
await page.setViewportSize({ width: 412, height: 880 });

const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

const base = "http://127.0.0.1:5178/";
const routes = ["home", "today", "learn", "flare", "goal", "safety"];
const shots = [];

await page.goto(base + "?from=magnet#/home", { waitUntil: "load" });
await page.waitForTimeout(400);
const tiles = await page.locator(".tile").count();
const screenText = (await page.locator("#screen").innerText()).length;

for (const r of routes) {
  await page.goto(base + "?from=magnet#/" + r, { waitUntil: "load" });
  await page.waitForTimeout(350);
  shots.push(await saveScreenshot(await page.screenshot(), "bot-" + r + ".png"));
}

await page.goto(base + "magnets.html", { waitUntil: "load" });
await page.waitForTimeout(500);
const qrCount = await page.$$eval(".magnet .qr svg", (els) => els.length);
const magnetCount = await page.locator(".magnet").count();
const magShot = await saveScreenshot(await page.screenshot({ fullPage: true }), "bot-magnets.png");

console.log(JSON.stringify({ errors, tiles, screenText, qrCount, magnetCount, shots, magShot }, null, 2));
