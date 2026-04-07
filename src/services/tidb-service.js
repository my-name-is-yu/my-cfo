const crypto = require("crypto");
const { readJson, writeJson } = require("../lib/file-store");
const { isLiveTiDBEnabled, query } = require("../lib/tidb");

const runtimeStorePath = "db/data/runtime-store.json";

function getRuntimeStore() {
  return readJson(runtimeStorePath);
}

function saveRuntimeStore(store) {
  writeJson(runtimeStorePath, store);
}

function normalizeHash(payload) {
  return crypto.createHash("sha1").update(JSON.stringify(payload)).digest("hex");
}

function parseJsonValue(value, fallback) {
  if (value == null) {
    return fallback;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }
  return value;
}

async function getMonthlyCashflows() {
  if (!isLiveTiDBEnabled()) {
    return readJson("db/data/demo-cashflows.json");
  }

  const rows = await query(
    `SELECT
      target_month,
      income_total,
      rent,
      food,
      convenience_store,
      transport,
      utilities,
      phone,
      entertainment,
      subscriptions_total,
      misc,
      savings_delta,
      note
    FROM monthly_cashflows
    WHERE user_id = ?
    ORDER BY target_month ASC`,
    ["demo-user-001"]
  );

  if (!rows.length) {
    return readJson("db/data/demo-cashflows.json");
  }

  return rows.map((row) => ({
    targetMonth: String(row.target_month).slice(0, 7),
    incomeTotal: row.income_total,
    rent: row.rent,
    food: row.food,
    convenienceStore: row.convenience_store,
    transport: row.transport,
    utilities: row.utilities,
    phone: row.phone,
    entertainment: row.entertainment,
    subscriptionsTotal: row.subscriptions_total,
    misc: row.misc,
    savingsDelta: row.savings_delta,
    note: row.note
  }));
}

async function getUserProfile() {
  if (!isLiveTiDBEnabled()) {
    return readJson("db/data/demo-memory.json");
  }

  const rows = await query(
    `SELECT
      user_id,
      display_name,
      age,
      occupation,
      university_year,
      city,
      nearest_station,
      living_style,
      monthly_income_total,
      monthly_income_part_time,
      monthly_income_allowance,
      monthly_rent,
      current_savings,
      has_credit_card,
      study_abroad_plan,
      spending_traits,
      subscriptions
    FROM user_profiles
    WHERE user_id = ?
    LIMIT 1`,
    ["demo-user-001"]
  );

  if (!rows.length) {
    return readJson("db/data/demo-memory.json");
  }

  const row = rows[0];
  const traits = parseJsonValue(row.spending_traits, []);
  const subscriptions = parseJsonValue(row.subscriptions, []);

  return {
    userId: row.user_id,
    profile: {
      displayName: row.display_name,
      age: row.age,
      occupation: row.occupation,
      universityYear: row.university_year,
      city: row.city,
      nearestStation: row.nearest_station,
      livingStyle: row.living_style,
      studyAbroadPlan: row.study_abroad_plan,
      hasCreditCard: Boolean(row.has_credit_card)
    },
    income: {
      monthlyTotal: row.monthly_income_total,
      partTime: row.monthly_income_part_time,
      allowance: row.monthly_income_allowance,
      currentSavings: row.current_savings
    },
    expenses: {
      rent: row.monthly_rent,
      food: 18000,
      convenienceStore: 12000,
      transport: 6000,
      utilities: 7000,
      phone: 4000,
      entertainment: 8000,
      subscriptionsTotal: Array.isArray(subscriptions)
        ? subscriptions.reduce((sum, item) => sum + Number(item.price || 0), 0)
        : 2470,
      misc: 9000
    },
    subscriptions,
    traits,
    memories: [
      `${row.city}で一人暮らしをしている${row.age}歳の大学${row.university_year}年生。最寄り駅は${row.nearest_station}。`,
      `月収は${row.monthly_income_total}円で、バイト${row.monthly_income_part_time}円と仕送り${row.monthly_income_allowance}円。`,
      `家賃は${row.monthly_rent}円、現在の貯金は${row.current_savings}円。`,
      `${row.study_abroad_plan}。クレジットカード保有は${row.has_credit_card ? "あり" : "なし"}。`
    ]
  };
}

async function upsertCardOffers(records) {
  if (isLiveTiDBEnabled()) {
    for (const record of records) {
      await query(
        `INSERT INTO scraped_card_offers (
          source_site,
          source_url,
          scraped_at,
          card_name,
          issuer_name,
          annual_fee_yen,
          point_reward_rate,
          student_benefits,
          overseas_fee_note,
          campaign_title,
          campaign_value,
          campaign_expiry,
          eligibility_note,
          raw_payload,
          normalized_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          source_site = VALUES(source_site),
          source_url = VALUES(source_url),
          scraped_at = VALUES(scraped_at),
          issuer_name = VALUES(issuer_name),
          annual_fee_yen = VALUES(annual_fee_yen),
          point_reward_rate = VALUES(point_reward_rate),
          student_benefits = VALUES(student_benefits),
          overseas_fee_note = VALUES(overseas_fee_note),
          campaign_title = VALUES(campaign_title),
          campaign_value = VALUES(campaign_value),
          campaign_expiry = VALUES(campaign_expiry),
          eligibility_note = VALUES(eligibility_note),
          raw_payload = VALUES(raw_payload)`,
        [
          record.sourceSite,
          record.sourceUrl,
          record.scrapedAt,
          record.cardName,
          record.issuerName,
          record.annualFeeYen,
          record.pointRewardRate,
          record.studentBenefits,
          record.overseasFeeNote,
          record.campaignTitle,
          record.campaignValue,
          record.campaignExpiry,
          record.eligibilityNote,
          JSON.stringify(record),
          record.normalizedHash || normalizeHash(record)
        ]
      );
    }

    return getCardOffers();
  }

  const store = getRuntimeStore();
  const byHash = new Map(store.scrapedCardOffers.map((item) => [item.normalizedHash, item]));

  records.forEach((record) => {
    const normalizedHash = record.normalizedHash || normalizeHash(record);
    byHash.set(normalizedHash, { ...record, normalizedHash });
  });

  store.scrapedCardOffers = Array.from(byHash.values()).sort((a, b) => a.cardName.localeCompare(b.cardName, "ja"));
  saveRuntimeStore(store);
  return store.scrapedCardOffers;
}

async function upsertTravelEstimate(record) {
  if (isLiveTiDBEnabled()) {
    await query(
      `INSERT INTO travel_cost_cache (
        destination_city,
        departure_city,
        travel_month,
        flight_cost_yen,
        hotel_cost_yen,
        local_cost_yen,
        total_estimated_cost_yen,
        source_site,
        source_url,
        scraped_at,
        raw_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        flight_cost_yen = VALUES(flight_cost_yen),
        hotel_cost_yen = VALUES(hotel_cost_yen),
        local_cost_yen = VALUES(local_cost_yen),
        total_estimated_cost_yen = VALUES(total_estimated_cost_yen),
        source_site = VALUES(source_site),
        source_url = VALUES(source_url),
        scraped_at = VALUES(scraped_at),
        raw_payload = VALUES(raw_payload)`,
      [
        record.destinationCity,
        record.departureCity,
        record.travelMonth,
        record.flightCostYen,
        record.hotelCostYen,
        record.localCostYen,
        record.totalEstimatedCostYen,
        record.sourceSite,
        record.sourceUrl,
        record.scrapedAt,
        JSON.stringify(record)
      ]
    );

    return record;
  }

  const store = getRuntimeStore();
  const key = `${record.departureCity}:${record.destinationCity}:${record.travelMonth}`;
  const rest = store.travelCostCache.filter(
    (item) => `${item.departureCity}:${item.destinationCity}:${item.travelMonth}` !== key
  );

  store.travelCostCache = [...rest, record];
  saveRuntimeStore(store);
  return record;
}

async function saveDecisionRun(record) {
  if (isLiveTiDBEnabled()) {
    await query(
      `INSERT INTO decision_runs (
        user_id,
        scenario_type,
        scenario_title,
        scenario_payload,
        current_runway_months,
        projected_runway_months,
        risk_level,
        recommendation_summary,
        chart_payload
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.userId,
        record.scenarioType,
        record.scenarioTitle,
        JSON.stringify(record.scenarioPayload),
        record.currentRunwayMonths,
        record.projectedRunwayMonths,
        record.riskLevel,
        record.recommendationSummary,
        JSON.stringify(record.chartPayload)
      ]
    );

    const rows = await query(
      `SELECT
        id,
        user_id,
        scenario_type,
        scenario_title,
        current_runway_months,
        projected_runway_months,
        risk_level,
        recommendation_summary,
        created_at
      FROM decision_runs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1`,
      [record.userId]
    );

    const latest = rows[0];
    return {
      id: latest.id,
      userId: latest.user_id,
      scenarioType: latest.scenario_type,
      scenarioTitle: latest.scenario_title,
      currentRunwayMonths: Number(latest.current_runway_months),
      projectedRunwayMonths: Number(latest.projected_runway_months),
      riskLevel: latest.risk_level,
      recommendationSummary: latest.recommendation_summary,
      createdAt: latest.created_at
    };
  }

  const store = getRuntimeStore();
  const id = store.decisionRuns.length + 1;
  const saved = { id, createdAt: new Date().toISOString(), ...record };
  store.decisionRuns.unshift(saved);
  saveRuntimeStore(store);
  return saved;
}

async function getCardOffers() {
  if (!isLiveTiDBEnabled()) {
    return getRuntimeStore().scrapedCardOffers;
  }

  const rows = await query(
    `SELECT
      source_site,
      source_url,
      scraped_at,
      card_name,
      issuer_name,
      annual_fee_yen,
      point_reward_rate,
      student_benefits,
      overseas_fee_note,
      campaign_title,
      campaign_value,
      campaign_expiry,
      eligibility_note,
      normalized_hash
    FROM scraped_card_offers
    ORDER BY scraped_at DESC, card_name ASC`
  );

  return rows.map((row) => ({
    sourceSite: row.source_site,
    sourceUrl: row.source_url,
    scrapedAt: row.scraped_at,
    cardName: row.card_name,
    issuerName: row.issuer_name,
    annualFeeYen: row.annual_fee_yen,
    pointRewardRate: Number(row.point_reward_rate),
    studentBenefits: row.student_benefits,
    overseasFeeNote: row.overseas_fee_note,
    campaignTitle: row.campaign_title,
    campaignValue: row.campaign_value,
    campaignExpiry: row.campaign_expiry,
    eligibilityNote: row.eligibility_note,
    normalizedHash: row.normalized_hash
  }));
}

async function getTravelCostCache() {
  if (!isLiveTiDBEnabled()) {
    return getRuntimeStore().travelCostCache;
  }

  const rows = await query(
    `SELECT
      destination_city,
      departure_city,
      travel_month,
      flight_cost_yen,
      hotel_cost_yen,
      local_cost_yen,
      total_estimated_cost_yen,
      source_site,
      source_url,
      scraped_at
    FROM travel_cost_cache
    ORDER BY scraped_at DESC`
  );

  return rows.map((row) => ({
    destinationCity: row.destination_city,
    departureCity: row.departure_city,
    travelMonth: row.travel_month,
    flightCostYen: row.flight_cost_yen,
    hotelCostYen: row.hotel_cost_yen,
    localCostYen: row.local_cost_yen,
    totalEstimatedCostYen: row.total_estimated_cost_yen,
    sourceSite: row.source_site,
    sourceUrl: row.source_url,
    scrapedAt: row.scraped_at
  }));
}

async function getDecisionRuns() {
  if (!isLiveTiDBEnabled()) {
    return getRuntimeStore().decisionRuns;
  }

  const rows = await query(
    `SELECT
      id,
      user_id,
      scenario_type,
      scenario_title,
      scenario_payload,
      current_runway_months,
      projected_runway_months,
      risk_level,
      recommendation_summary,
      chart_payload,
      created_at
    FROM decision_runs
    ORDER BY created_at DESC`
  );

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    scenarioType: row.scenario_type,
    scenarioTitle: row.scenario_title,
    scenarioPayload: parseJsonValue(row.scenario_payload, {}),
    currentRunwayMonths: Number(row.current_runway_months),
    projectedRunwayMonths: Number(row.projected_runway_months),
    riskLevel: row.risk_level,
    recommendationSummary: row.recommendation_summary,
    chartPayload: parseJsonValue(row.chart_payload, {}),
    createdAt: row.created_at
  }));
}

module.exports = {
  getMonthlyCashflows,
  getUserProfile,
  upsertCardOffers,
  upsertTravelEstimate,
  saveDecisionRun,
  getCardOffers,
  getTravelCostCache,
  getDecisionRuns,
  normalizeHash
};
