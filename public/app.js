let chart;

function formatYen(value) {
  return `${Number(value || 0).toLocaleString("ja-JP")}円`;
}

function renderIntegrationBadges(integrations) {
  const root = document.getElementById("integrationBadges");
  root.innerHTML = "";
  Object.entries(integrations || {}).forEach(([key, value]) => {
    const span = document.createElement("span");
    span.className = `badge ${value}`;
    span.textContent = `${key}: ${value}`;
    root.appendChild(span);
  });
}

function renderMetrics(summary) {
  const root = document.getElementById("metricGrid");
  root.innerHTML = "";
  if (!summary) {
    return;
  }

  [
    ["月収", formatYen(summary.monthlyIncome)],
    ["月支出", formatYen(summary.monthlyExpenses)],
    ["月次差分", formatYen(summary.monthlyNet)],
    ["貯金", formatYen(summary.currentSavings)]
  ].forEach(([label, value]) => {
    const card = document.createElement("div");
    card.className = "metric";
    card.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    root.appendChild(card);
  });
}

function renderProfileSummary(summary) {
  const root = document.getElementById("profileSummary");
  root.innerHTML = "";
  if (!summary) {
    return;
  }

  const title = document.createElement("h3");
  title.textContent = summary.title;
  root.appendChild(title);

  const list = document.createElement("ul");
  summary.bullets.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  root.appendChild(list);
}

function renderHighlights(items) {
  const root = document.getElementById("highlights");
  root.innerHTML = "";
  (items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    root.appendChild(li);
  });
}

function renderCards(items) {
  const root = document.getElementById("cards");
  root.innerHTML = "";
  (items || []).forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${item.rank}. ${item.cardName}</h3>
      <p class="meta">発行: ${item.issuerName} / 年会費: ${item.annualFeeYen.toLocaleString("ja-JP")}円 / 還元率: ${item.pointRewardRate}%</p>
      <p class="meta">キャンペーン: ${item.campaignTitle || "-"} ${item.campaignValue || ""}</p>
      <p class="meta">学生特典: ${item.studentBenefits || "-"}</p>
      <p>${item.reason}</p>
    `;
    root.appendChild(card);
  });
}

function renderComparisonTable(rows) {
  const root = document.getElementById("comparisonTable");
  root.innerHTML = "";
  if (!rows || !rows.length) {
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>カード</th>
        <th>年会費</th>
        <th>還元率</th>
        <th>学生特典</th>
        <th>海外</th>
        <th>キャンペーン</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map((row) => `
        <tr>
          <td>${row.cardName}</td>
          <td>${row.annualFee}</td>
          <td>${row.rewardRate}</td>
          <td>${row.studentPerk}</td>
          <td>${row.overseas}</td>
          <td>${row.campaign}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
  root.appendChild(table);
}

function renderAlternatives(items, riskLevel) {
  const root = document.getElementById("alternatives");
  root.innerHTML = "";

  if (!items || !items.length) {
    return;
  }

  const title = document.createElement("h3");
  title.textContent = `代替案${riskLevel ? ` (${riskLevel})` : ""}`;
  root.appendChild(title);

  const list = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
  root.appendChild(list);
}

function renderChart(payload) {
  const ctx = document.getElementById("chart");
  if (chart) {
    chart.destroy();
  }
  if (!payload) {
    return;
  }

  if (payload.type === "pie") {
    chart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: payload.data.map((item) => item.name),
        datasets: [
          {
            data: payload.data.map((item) => item.value),
            backgroundColor: ["#c85d32", "#315c5a", "#f3c58b", "#8ea4d2", "#dd8b6f", "#778681", "#b1a18e", "#d1b07b"]
          }
        ]
      }
    });
    return;
  }

  if (payload.type === "bar") {
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: payload.labels,
        datasets: payload.series.map((series) => ({
          label: series.name,
          data: series.values,
          backgroundColor: "#c85d32"
        }))
      }
    });
    return;
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: payload.labels,
      datasets: payload.series.map((series, index) => ({
        label: series.name,
        data: series.values,
        borderColor: index === 0 ? "#315c5a" : "#c85d32",
        backgroundColor: "transparent",
        tension: 0.2
      }))
    }
  });
}

function renderCashflowTable(rows) {
  const root = document.getElementById("cashflowTable");
  root.innerHTML = "";
  if (!rows || !rows.length) {
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>月</th>
        <th>収入</th>
        <th>支出</th>
        <th>差分</th>
        <th>メモ</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map((row) => `
        <tr>
          <td>${row.targetMonth}</td>
          <td>${formatYen(row.incomeTotal)}</td>
          <td>${formatYen(row.totalExpenses)}</td>
          <td>${formatYen(row.savingsDelta)}</td>
          <td>${row.note}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
  root.appendChild(table);
}

function renderStoredData(payload) {
  const root = document.getElementById("storedData");
  root.innerHTML = "";

  const sections = [
    ["scraped_card_offers", payload.cardOffers ? payload.cardOffers.length : 0],
    ["travel_cost_cache", payload.travelCostCache ? payload.travelCostCache.length : 0],
    ["decision_runs", payload.decisionRuns ? payload.decisionRuns.length : 0]
  ];

  sections.forEach(([name, count]) => {
    const div = document.createElement("div");
    div.className = "stored-item";
    div.innerHTML = `<strong>${name}</strong><span>${count} rows</span>`;
    root.appendChild(div);
  });
}

async function runPrompt(message) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const payload = await response.json();

  document.getElementById("message").textContent = `${payload.message} [${payload.source}]`;
  renderIntegrationBadges(payload.integrations);
  renderMetrics(payload.summary);
  renderProfileSummary(payload.profileSummary);
  renderHighlights(payload.highlights);
  renderCards(payload.recommendations);
  renderComparisonTable(payload.comparisonTable);
  renderAlternatives(payload.alternatives, payload.riskLevel);
  renderCashflowTable(payload.cashflowTable);
  renderChart(payload.chart);
  const state = await fetch("/api/state").then((stateResponse) => stateResponse.json());
  renderStoredData(state.storedData);
}

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    runPrompt(button.dataset.prompt);
  });
});

document.getElementById("sendPrompt").addEventListener("click", () => {
  const input = document.getElementById("freePrompt");
  runPrompt(input.value || "自分の状況教えて");
});

fetch("/api/state")
  .then((response) => response.json())
  .then((payload) => {
    renderIntegrationBadges(payload.integrations);
    renderMetrics(payload.dashboard.summary);
    renderProfileSummary(payload.dashboard.profileSummary);
    renderHighlights(payload.dashboard.highlights);
    renderCashflowTable(payload.dashboard.cashflowTable);
    renderChart(payload.dashboard.chart);
    renderStoredData(payload.storedData);
  });
