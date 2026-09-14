import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file into process.env if available
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
    console.log("✅ Loaded environment variables from .env file");
  } catch (err) {
    console.warn("⚠️ Failed to parse .env file:", err.message);
  }
}

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || "0.0.0.0";

const clientDir = path.join(__dirname, "dist", "client");
const serverEntryUrl = pathToFileURL(path.join(__dirname, "dist", "server", "server.js")).href;

let handler;
try {
  const mod = await import(serverEntryUrl);
  handler = mod.default;
} catch (err) {
  console.error("Failed to load server handler:", err);
}

// MIME types map for static files
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  // 1. Check if requested path corresponds to a static file in dist/client
  const safePath = path.normalize(url.pathname).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(clientDir, safePath);

  if (filePath.startsWith(clientDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const acceptEncoding = (req.headers["accept-encoding"] || "").toLowerCase();
    const isCompressible = /\.(js|mjs|css|json|html|svg|txt|xml)$/i.test(ext);

    const baseHeaders = {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    };
    if (ext === ".pdf") {
      baseHeaders["Content-Disposition"] = "inline";
    }

    if (isCompressible && acceptEncoding.includes("gzip")) {
      res.writeHead(200, {
        ...baseHeaders,
        "Content-Encoding": "gzip",
        "Vary": "Accept-Encoding",
      });
      fs.createReadStream(filePath).pipe(zlib.createGzip({ level: 6 })).pipe(res);
      return;
    }

    res.writeHead(200, baseHeaders);
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // 2. Delegate to TanStack Start SSR Handler
  if (!handler || typeof handler.fetch !== "function") {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Server handler not loaded. Please run 'npm run build' first.");
    return;
  }

  try {
    // Read body for non-GET/HEAD requests
    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }

    // Create Web Standard Request
    const webReq = new Request(url.href, {
      method: req.method,
      headers: req.headers,
      body: body,
      duplex: body ? "half" : undefined,
    });

    // Invoke TanStack Start SSR fetch handler
    const webRes = await handler.fetch(webReq);

    // Convert headers for Node response
    const resHeaders = {};
    const setCookieHeaders = [];
    webRes.headers.forEach((val, key) => {
      if (key.toLowerCase() === "set-cookie") {
        setCookieHeaders.push(val);
      } else {
        resHeaders[key] = val;
      }
    });
    if (setCookieHeaders.length > 0) {
      resHeaders["set-cookie"] = setCookieHeaders;
    }

    res.writeHead(webRes.status, resHeaders);

    // Stream or send body
    if (webRes.body) {
      const reader = webRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error("SSR Handler Error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 LMS Production Server running at http://${HOST}:${PORT}`);
});
