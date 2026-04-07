const http = require("http");
const fs = require("fs");
const path = require("path");
const { getProfile } = require("./services/memory-service");
const { getCashflows, getLatestCashflow } = require("./services/cashflow-service");
const { getDashboard } = require("./services/dashboard-service");
const { buildCardRecommendation } = require("./services/card-service");
const { getTravelEstimate } = require("./services/travel-service");
const { analyzeTrip } = require("./services/whatif-service");
const { getIntegrationMode } = require("./services/live-adapters");
const { getCardOffers, getDecisionRuns, getTravelCostCache } = require("./services/tidb-service");
const { closePool } = require("./lib/tidb");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
const publicDir = path.join(process.cwd(), "public");

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  const fullPath = path.join(publicDir, filePath === "/" ? "index.html" : filePath);
  if (!fullPath.startsWith(publicDir) || !fs.existsSync(fullPath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = path.extname(fullPath);
  const contentType = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8"
  }[ext] || "text/plain; charset=utf-8";

  res.writeHead(200, { "Content-Type": contentType });
  res.end(fs.readFileSync(fullPath));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString("utf8");
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

async function chatResponse(userMessage) {
  const profile = await getProfile();
  const cashflows = await getCashflows();
  const latestCashflow = await getLatestCashflow();
  const integrations = getIntegrationMode();
  const normalizedMessage = userMessage.trim();

  if (normalizedMessage.includes("クレカ")) {
    const result = await buildCardRecommendation(profile);
    return {
      type: "cards",
      source: integrations.brightData === "live" ? "brightdata-live" : "demo-cache",
      integrations,
      ...result
    };
  }

  if (normalizedMessage.includes("バンクーバー") || normalizedMessage.includes("旅行")) {
    const estimate = await getTravelEstimate("Vancouver", "2026-09");
    const result = await analyzeTrip(profile, estimate, "9月のバンクーバー旅行");
    return {
      type: "whatif",
      source: integrations.brightData === "live" ? "brightdata-live" : "demo-cache",
      integrations,
      ...result
    };
  }

  return {
    type: "dashboard",
    source: integrations.mem9 === "live" ? "mem9-live" : "demo-memory",
    integrations,
    ...(await getDashboard(profile, latestCashflow, cashflows))
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/styles.css") || req.url.startsWith("/app.js"))) {
    sendFile(res, req.url);
    return;
  }

  if (req.method === "GET" && req.url === "/api/profile") {
    sendJson(res, 200, await getProfile());
    return;
  }

  if (req.method === "GET" && req.url === "/api/state") {
    const profile = await getProfile();
    const cashflows = await getCashflows();
    const latestCashflow = await getLatestCashflow();
    sendJson(res, 200, {
      integrations: getIntegrationMode(),
      dashboard: await getDashboard(profile, latestCashflow, cashflows),
      storedData: {
        cardOffers: await getCardOffers(),
        travelCostCache: await getTravelCostCache(),
        decisionRuns: await getDecisionRuns()
      }
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    try {
      const body = await readBody(req);
      sendJson(res, 200, await chatResponse(String(body.message || "")));
    } catch (error) {
      sendJson(res, 400, { error: error.message || "Invalid JSON payload" });
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(port, host, () => {
  console.log(`Student AI CFO demo listening on http://${host}:${port}`);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});
