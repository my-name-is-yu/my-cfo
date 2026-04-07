const { getUserProfile } = require("./tidb-service");

async function getProfile() {
  return getUserProfile();
}

function getMemorySummary(profile) {
  const activeProfile = profile || getProfile();
  return {
    title: `${activeProfile.profile.displayName} の mem9 プロフィール`,
    bullets: [
      `${activeProfile.profile.city}・${activeProfile.profile.nearestStation}で一人暮らし、大学${activeProfile.profile.universityYear}年生`,
      `月収 ${activeProfile.income.monthlyTotal.toLocaleString("ja-JP")}円、家賃 ${activeProfile.expenses.rent.toLocaleString("ja-JP")}円、貯金 ${activeProfile.income.currentSavings.toLocaleString("ja-JP")}円`,
      `${activeProfile.profile.studyAbroadPlan} / クレカ保有: ${activeProfile.profile.hasCreditCard ? "あり" : "なし"}`,
      `固定サブスク: ${activeProfile.subscriptions.map((item) => `${item.name} ${item.price.toLocaleString("ja-JP")}円`).join("、")}`
    ],
    memories: activeProfile.memories
  };
}

module.exports = {
  getProfile,
  getMemorySummary
};
