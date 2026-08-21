const { execFileSync } = require("node:child_process");

function runNpm(args) {
  return execFileSync("npm", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  }).trim();
}

const npmVersion = runNpm(["--version"]);
const major = Number.parseInt(npmVersion.split(".")[0], 10);
const minReleaseAge = runNpm(["config", "get", "min-release-age"]);

if (!Number.isFinite(major) || major < 11) {
  throw new Error("npm min-release-age requires npm 11+, found npm " + npmVersion);
}

if (minReleaseAge !== "3") {
  throw new Error("expected npm min-release-age=3, got " + minReleaseAge);
}

console.log("npm cooldown: npm " + npmVersion + ", min-release-age=" + minReleaseAge);
