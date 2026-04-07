const { scrapeTravelEstimate } = require("./brightdata-service");
const { getTravelCostCache, upsertTravelEstimate } = require("./tidb-service");

async function getTravelEstimate(destination, travelMonth) {
  const cache = await getTravelCostCache();
  const cached = cache.find(
    (item) => item.destinationCity === destination && item.travelMonth === travelMonth
  );
  if (cached) {
    return cached;
  }

  const scraped = scrapeTravelEstimate(destination, travelMonth);
  if (!scraped) {
    return null;
  }

  return upsertTravelEstimate(scraped);
}

module.exports = {
  getTravelEstimate
};
