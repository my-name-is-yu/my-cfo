function isEnabled(flag) {
  return String(process.env[flag] || "false").toLowerCase() === "true";
}

function getIntegrationMode() {
  return {
    mem9: isEnabled("USE_LIVE_MEM9") ? "live" : "demo",
    brightData: isEnabled("USE_LIVE_BRIGHTDATA") ? "live" : "demo",
    tidb: isEnabled("USE_LIVE_TIDB") ? "live" : "demo"
  };
}

module.exports = {
  getIntegrationMode,
  isEnabled
};
