const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const bannedDash = new Set([String.fromCharCode(0x2013), String.fromCharCode(0x2014)]);
const textExt = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".svg",
  ".webmanifest",
  ".yml",
  ".yaml",
]);
const ignoredDirs = new Set([".git", ".claude", ".planning", ".crash-buffers", "coverage", "design-exports", "node_modules", "vendor"]);
const ignoredFiles = new Set(["package-lock.json"]);
const errors = [];
const bannedFontPattern = new RegExp("\\b(" + ["In" + "ter", "Ro" + "boto", "Space" + " Grotesk"].join("|") + ")\\b", "i");
const staleCopyPattern = new RegExp(
  "\\b(" + ["lorem" + " ipsum", "place" + "holder citations", "generated" + " with", "co-authored" + "-by"].join("|") + ")\\b",
  "i"
);

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    if (entry.name.endsWith(".local.md") || entry.name.endsWith(".local.docx") || entry.name.endsWith(".local.pdf")) return;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(full);
      return;
    }
    if (!textExt.has(path.extname(entry.name)) || ignoredFiles.has(entry.name)) return;
    checkFile(rel, full);
  });
}

function lineFor(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function report(rel, message, line) {
  errors.push(line ? rel + ":" + line + " " + message : rel + " " + message);
}

function checkFile(rel, full) {
  const text = fs.readFileSync(full, "utf8");
  for (let i = 0; i < text.length; i += 1) {
    if (bannedDash.has(text[i])) report(rel, "uses banned dash punctuation", lineFor(text, i));
  }
  if (/[\u{1f300}-\u{1faff}]/u.test(text)) report(rel, "contains emoji");
  if (/^\s*-{3,}\s*$/m.test(text)) report(rel, "contains a horizontal rule");
  if (bannedFontPattern.test(text)) report(rel, "uses a banned font name");
  if (staleCopyPattern.test(text)) report(rel, "contains stale process copy");
  if (/innerHTML\s*=/.test(text)) report(rel, "assigns innerHTML");
  if (/(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}/i.test(text)) report(rel, "looks like it contains a secret assignment");
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) && !/users\.noreply\.github\.com/i.test(text)) report(rel, "contains an email address");
}

walk(root);

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("lint: ok");
