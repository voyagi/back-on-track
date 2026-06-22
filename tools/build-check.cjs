const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const required = [
  "index.html",
  "styles.css",
  "app.js",
  "content.js",
  "exercise-anim.js",
  "manifest.webmanifest",
  "sw.js",
  "magnets.html",
  "vendor/qrcode.js",
  "PRIVACY.md",
  "SECURITY.md",
];
const jsFiles = [
  "app.js",
  "content.js",
  "exercise-anim.js",
  "sw.js",
  "tools/serve.cjs",
  "tools/lint.cjs",
  "tools/build-check.cjs",
  "tools/run-with-server.cjs",
  "tools/visual.dev.js",
  "tools/a11y.dev.js",
];
const errors = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

required.forEach((rel) => {
  if (!fs.existsSync(path.join(root, rel))) errors.push(rel + " is missing");
});

jsFiles.forEach((rel) => {
  const result = spawnSync(process.execPath, ["--check", rel], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) errors.push(rel + " failed syntax check: " + (result.stderr || result.stdout).trim());
});

const manifest = JSON.parse(read("manifest.webmanifest"));
["name", "short_name", "start_url", "display", "icons"].forEach((key) => {
  if (!manifest[key]) errors.push("manifest missing " + key);
});
manifest.icons.forEach((icon) => {
  if (!fs.existsSync(path.join(root, icon.src))) errors.push("manifest icon missing " + icon.src);
});

const sw = read("sw.js");
[
  "index.html",
  "styles.css",
  "app.js",
  "content.js",
  "exercise-anim.js",
  "manifest.webmanifest",
  "icon.svg",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
].forEach((asset) => {
  if (!sw.includes('"' + asset + '"')) errors.push("service worker cache missing " + asset);
});

const index = read("index.html");
if (!index.includes("Content-Security-Policy")) errors.push("index missing CSP");
if (!index.includes("script-src 'self'")) errors.push("CSP must keep scripts self hosted");
if (index.indexOf("content.js") > index.indexOf("app.js")) errors.push("content.js must load before app.js");

const gitignore = read(".gitignore");
if (!/(^|\n)\.env\*?(\n|$)/.test(gitignore)) errors.push(".gitignore must ignore .env");
if (!gitignore.includes("*.local.*")) errors.push(".gitignore must keep local patient files private");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("build-check: ok");
