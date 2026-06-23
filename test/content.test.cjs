const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function freshSource() {
  ["content.js", "exercise-anim.js"].forEach((rel) => {
    delete require.cache[require.resolve(path.join(root, rel))];
  });
  global.window = {};
  require(path.join(root, "content.js"));
  require(path.join(root, "exercise-anim.js"));
  return global.window;
}

function sortedKeys(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.keys(value).sort();
}

function assertSameShape(a, b, label) {
  assert.deepEqual(sortedKeys(a), sortedKeys(b), label);
  sortedKeys(a).forEach((key) => {
    if (a[key] && typeof a[key] === "object" && !Array.isArray(a[key])) {
      assertSameShape(a[key], b[key], label + "." + key);
    }
  });
}

test("English and Dutch content keep the same structure", () => {
  const source = freshSource();
  assertSameShape(source.CONTENT.en, source.CONTENT.nl, "CONTENT");
});

test("each exercise has a matching animation and flare routine item", () => {
  const source = freshSource();
  const ids = new Set(source.CONTENT.en.exercises.map((exercise) => exercise.id));
  source.CONTENT.en.exercises.forEach((exercise) => {
    assert.ok(source.EXERCISE_ANIM[exercise.id], exercise.id + " has animation");
  });
  source.CONTENT.en.flare.gentleRoutine.forEach((id) => {
    assert.ok(ids.has(id), id + " is a known exercise");
  });
});

test("privacy controls and safer rendering paths are present", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const content = fs.readFileSync(path.join(root, "content.js"), "utf8");
  const magnets = fs.readFileSync(path.join(root, "magnets.html"), "utf8");
  assert.match(content, /clearConfirm/);
  assert.doesNotMatch(app, /innerHTML\s*=/);
  assert.doesNotMatch(magnets, /innerHTML\s*=/);
  assert.match(app, /replaceChildren/);
});

test("review hardening checks stay in place", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "quality.yml"), "utf8");
  const buildCheck = fs.readFileSync(path.join(root, "tools", "build-check.cjs"), "utf8");
  const runner = fs.readFileSync(path.join(root, "tools", "run-with-server.cjs"), "utf8");
  const magnets = fs.readFileSync(path.join(root, "magnets.html"), "utf8");
  assert.match(app, /Object\.create\(null\)/);
  assert.match(app, /__proto__/);
  assert.match(workflow, /actions\/checkout@[0-9a-f]{40}/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /actions\/setup-node@[0-9a-f]{40}/);
  assert.match(buildCheck, /index missing content\.js script/);
  assert.match(buildCheck, /index missing app\.js script/);
  assert.match(runner, /signal\s*\?\s*1\s*:\s*\(?\s*code\s*\|\|\s*0\s*\)?/);
  assert.match(magnets, /\[::1\]/);
});
