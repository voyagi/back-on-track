/*
 * tools/serve.cjs — tiny dependency-free static server for local preview.
 * Usage:  node tools/serve.cjs [port]   (default 5178)
 * Binds to 127.0.0.1 only (never expose this to the network).
 *
 * Hardened so a single bad request can't take the whole server down:
 *   - browsers abort requests (cancelled image loads, service-worker prefetch),
 *     which emits a socket 'error' (ECONNRESET) — unhandled, that crashes Node;
 *   - a malformed URL makes decodeURIComponent throw a URIError.
 * Both are caught below.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
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
  // A client may drop the connection mid-request; swallow the stream error.
  req.on("error", () => {});
  res.on("error", () => {});
  try {
    let p = decodeURIComponent(req.url.split("?")[0]); // can throw on a malformed URL
    if (p === "/") p = "/index.html";
    const file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end("forbidden");
    }
    fs.readFile(file, (err, data) => {
      if (res.writableEnded || res.destroyed) return; // connection already closed
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
    } catch (_) {
      /* response already gone */
    }
  }
});

// Malformed HTTP request line/headers: close cleanly instead of throwing.
server.on("clientError", (err, socket) => {
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

// Last-resort backstop: log instead of dying silently.
process.on("uncaughtException", (e) => {
  console.error("uncaught (server stays up):", (e && (e.stack || e.message)) || e);
});

server.listen(port, "127.0.0.1", () => {
  console.log("Back on Track running at http://127.0.0.1:" + port);
});
