// dev-browser visual capture script. Run after node tools/serve.cjs.
const page = await browser.getPage("back-on-track-visual");
const base = "http://127.0.0.1:5178/";
const routes = ["home", "today", "progress"];
const widths = [1440, 768, 375];
const schemes = ["light", "dark"];
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

for (const scheme of schemes) {
  await page.emulateMedia({ colorScheme: scheme });
  for (const width of widths) {
    await page.setViewportSize({ width, height: width === 1440 ? 960 : 860 });
    for (const route of routes) {
      await page.goto(base + "#/" + route, { waitUntil: "load" });
      await page.waitForTimeout(300);
      shots.push(await saveScreenshot(await page.screenshot({ fullPage: true }), "bot-" + scheme + "-" + width + "-" + route + ".png"));
    }
    await page.goto(base + "magnets.html", { waitUntil: "load" });
    await page.waitForTimeout(300);
    shots.push(await saveScreenshot(await page.screenshot({ fullPage: true }), "bot-" + scheme + "-" + width + "-magnets.png"));
  }
}

console.log(JSON.stringify({ shots }, null, 2));
