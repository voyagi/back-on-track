/*
 * Tiny dependency-free static server for local preview.
 * Usage: node tools/serve.cjs [port]
 * Binds to 127.0.0.1 only.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = parseInt(process.argv[2] || "5178", 10);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
};

const server = http.createServer((req, res) => {
  req.on("error", () => {});
  res.on("error", () => {});
  try {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    if (pathname.includes("\0")) {
      res.writeHead(400);
      return res.end("bad request");
    }
    const rel = pathname.replace(/^\/+/, "");
    const file = path.resolve(root, rel);
    const insideRoot = path.relative(root, file);
    if (insideRoot.startsWith("..") || path.isAbsolute(insideRoot)) {
      res.writeHead(403);
      return res.end("forbidden");
    }
    fs.readFile(file, (err, data) => {
      if (res.writableEnded || res.destroyed) return;
      if (err) {
        res.writeHead(404);
        return res.end("not found");
      }
      res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  } catch (e) {
    try {
      res.writeHead(400);
      res.end("bad request");
    } catch (ignore) {
      if (ignore) return;
    }
  }
});

server.on("clientError", (err, socket) => {
  if (err) {
    /* The request is already invalid. */
  }
  if (socket.writable) socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("Port " + port + " is in use. Try another, e.g.: node tools/serve.cjs 5179");
  } else {
    console.error("server error:", err.code || err.message);
  }
  process.exit(1);
});

process.on("uncaughtException", (e) => {
  console.error("uncaught (server stays up):", (e && (e.stack || e.message)) || e);
});

server.listen(port, "127.0.0.1", () => {
  console.log("Back on Track running at http://127.0.0.1:" + port);
});
