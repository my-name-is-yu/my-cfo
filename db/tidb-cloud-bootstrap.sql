-- TiDB Cloud bootstrap SQL for Student AI CFO
-- Copy and paste into the TiDB Cloud SQL editor.
-- If you use an embedding model with dimensions other than 1536,
-- change VECTOR(1536) below before running.

CREATE DATABASE IF NOT EXISTS student_ai_cfo;
USE student_ai_cfo;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id VARCHAR(64) NOT NULL,
  display_name VARCHAR(128) NOT NULL,
  age INT NOT NULL,
  occupation VARCHAR(64) NOT NULL,
  university_year INT NOT NULL,
  city VARCHAR(64) NOT NULL,
  nearest_station VARCHAR(64) NOT NULL,
  living_style VARCHAR(64),
  monthly_income_total INT NOT NULL,
  monthly_income_part_time INT NOT NULL,
  monthly_income_allowance INT NOT NULL,
  monthly_rent INT NOT NULL,
  current_savings INT NOT NULL,
  has_credit_card BOOLEAN NOT NULL DEFAULT FALSE,
  study_abroad_plan TEXT,
  spending_traits JSON,
  subscriptions JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id) CLUSTERED
);

CREATE TABLE IF NOT EXISTS monthly_cashflows (
  id BIGINT NOT NULL AUTO_RANDOM,
  user_id VARCHAR(64) NOT NULL,
  target_month DATE NOT NULL,
  income_total INT NOT NULL,
  rent INT NOT NULL,
  food INT NOT NULL,
  convenience_store INT NOT NULL,
  transport INT NOT NULL,
  utilities INT NOT NULL,
  phone INT NOT NULL,
  entertainment INT NOT NULL,
  subscriptions_total INT NOT NULL,
  misc INT NOT NULL,
  savings_delta INT NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id) CLUSTERED,
  UNIQUE KEY uniq_user_month (user_id, target_month),
  INDEX idx_cashflow_user_month (user_id, target_month)
);

CREATE TABLE IF NOT EXISTS scraped_card_offers (
  id BIGINT NOT NULL AUTO_RANDOM,
  source_site VARCHAR(255) NOT NULL,
  source_url TEXT NOT NULL,
  scraped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  card_name VARCHAR(255) NOT NULL,
  issuer_name VARCHAR(255),
  annual_fee_yen INT,
  point_reward_rate DECIMAL(5,2),
  student_benefits TEXT,
  overseas_fee_note TEXT,
  campaign_title VARCHAR(255),
  campaign_value TEXT,
  campaign_expiry DATE,
  eligibility_note TEXT,
  raw_payload JSON,
  normalized_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id) CLUSTERED,
  UNIQUE KEY uniq_offer_hash (normalized_hash),
  INDEX idx_card_name (card_name),
  INDEX idx_scraped_at (scraped_at)
);

CREATE TABLE IF NOT EXISTS travel_cost_cache (
  id BIGINT NOT NULL AUTO_RANDOM,
  destination_city VARCHAR(128) NOT NULL,
  departure_city VARCHAR(128) NOT NULL,
  travel_month VARCHAR(16) NOT NULL,
  flight_cost_yen INT,
  hotel_cost_yen INT,
  local_cost_yen INT,
  total_estimated_cost_yen INT NOT NULL,
  source_site VARCHAR(255) NOT NULL,
  source_url TEXT NOT NULL,
  scraped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  raw_payload JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id) CLUSTERED,
  INDEX idx_travel_lookup (departure_city, destination_city, travel_month)
);

CREATE TABLE IF NOT EXISTS decision_runs (
  id BIGINT NOT NULL AUTO_RANDOM,
  user_id VARCHAR(64) NOT NULL,
  scenario_type VARCHAR(64) NOT NULL,
  scenario_title VARCHAR(255) NOT NULL,
  scenario_payload JSON NOT NULL,
  current_runway_months DECIMAL(6,2) NOT NULL,
  projected_runway_months DECIMAL(6,2) NOT NULL,
  risk_level ENUM('low', 'medium', 'high') NOT NULL,
  recommendation_summary TEXT NOT NULL,
  chart_payload JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id) CLUSTERED,
  INDEX idx_user_created (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS memory_embeddings (
  id BIGINT NOT NULL AUTO_RANDOM,
  user_id VARCHAR(64) NOT NULL,
  memory_type VARCHAR(64) NOT NULL,
  content TEXT NOT NULL,
  metadata JSON,
  embedding VECTOR(1536) NOT NULL,
  VECTOR INDEX idx_memory_embedding ((VEC_COSINE_DISTANCE(embedding))),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id) CLUSTERED,
  INDEX idx_memory_user_type (user_id, memory_type)
);
