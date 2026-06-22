const { spawn } = require("child_process");

const args = process.argv.slice(2);
if (!args.length) {
  console.error("usage: node tools/run-with-server.cjs <command> [args...]");
  process.exit(2);
}

const server = spawn(process.execPath, ["tools/serve.cjs", "5178"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});

let child = null;
let done = false;
let buffer = "";

function finish(code) {
  if (done) return;
  done = true;
  if (child && !child.killed) child.kill();
  if (!server.killed) server.kill();
  process.exit(code);
}

server.stdout.on("data", (data) => {
  buffer += data.toString();
  if (!child && buffer.includes("http://127.0.0.1:5178")) {
    child = spawn(args[0], args.slice(1), { cwd: process.cwd(), stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => finish(code || 0));
    child.on("error", () => finish(1));
  }
});

server.stderr.on("data", (data) => {
  process.stderr.write(data);
});

server.on("exit", (code) => {
  if (!done && !child) finish(code || 1);
});

server.on("error", () => finish(1));

setTimeout(() => {
  if (!child) {
    console.error("preview server did not start");
    finish(1);
  }
}, 5000);
