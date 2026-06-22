// dev-browser accessibility audit. Run after node tools/serve.cjs.
const page = await browser.getPage("back-on-track-a11y");
const base = "http://127.0.0.1:5178/";
const routes = ["home", "today", "learn", "flare", "goal", "safety", "progress"];
const findings = [];

page.on("pageerror", (e) => findings.push("pageerror: " + String(e)));
page.on("console", (m) => {
  if (m.type() === "error") findings.push("console: " + m.text());
});

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

function result(route, items) {
  items.forEach((item) => findings.push(route + ": " + item));
}

for (const route of routes) {
  await page.setViewportSize({ width: 375, height: 860 });
  await page.goto(base + "#/" + route, { waitUntil: "load" });
  await page.waitForTimeout(250);
  result(
    route,
    await page.evaluate(() => {
      const issues = [];
      const title = document.querySelector("title");
      if (!document.documentElement.lang) issues.push("html lang is missing");
      if (!title || !title.textContent.trim()) issues.push("title is missing");

      document.querySelectorAll("button, a").forEach((node) => {
        const name = (node.getAttribute("aria-label") || node.textContent || "").trim();
        if (!name) issues.push("interactive control has no accessible name");
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const smallAllowed = node.closest(".lesson") || node.closest(".action-link");
        if (!smallAllowed && (rect.width < 44 || rect.height < 44)) {
          issues.push("touch target below 44px: " + name);
        }
      });

      document.querySelectorAll("input").forEach((input) => {
        const id = input.id;
        const safeId = id.replace(/"/g, '\\"');
        const label = id ? document.querySelector('label[for="' + safeId + '"]') : null;
        const name = (input.getAttribute("aria-label") || input.getAttribute("placeholder") || "").trim();
        if (!label && !name) issues.push("input has no label or accessible hint");
      });

      function parseColor(value) {
        const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(value);
        return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
      }

      function luminance(rgb) {
        const values = rgb.map((channel) => {
          const c = channel / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
      }

      function contrast(a, b) {
        const l1 = luminance(a);
        const l2 = luminance(b);
        const hi = Math.max(l1, l2);
        const lo = Math.min(l1, l2);
        return (hi + 0.05) / (lo + 0.05);
      }

      function backgroundFor(node) {
        let current = node;
        while (current && current !== document.documentElement) {
          const bg = getComputedStyle(current).backgroundColor;
          if (bg && !bg.includes("rgba(0, 0, 0, 0)") && bg !== "transparent") return parseColor(bg);
          current = current.parentElement;
        }
        return parseColor(getComputedStyle(document.body).backgroundColor);
      }

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const checked = new Set();
      while (walker.nextNode()) {
        const text = walker.currentNode.textContent.trim();
        if (!text) continue;
        const node = walker.currentNode.parentElement;
        if (!node || checked.has(node)) continue;
        checked.add(node);
        const style = getComputedStyle(node);
        if (style.visibility === "hidden" || style.display === "none") continue;
        const fg = parseColor(style.color);
        const bg = backgroundFor(node);
        if (!fg || !bg) continue;
        const size = Number.parseFloat(style.fontSize);
        const ratio = contrast(fg, bg);
        const min = size >= 18 ? 3 : 4.5;
        if (ratio < min) issues.push("low contrast text: " + text.slice(0, 32));
      }

      return issues;
    })
  );
}

if (findings.length) {
  console.log(JSON.stringify({ findings }, null, 2));
  throw new Error("a11y failed");
}

console.log(JSON.stringify({ routes, status: "ok" }, null, 2));
