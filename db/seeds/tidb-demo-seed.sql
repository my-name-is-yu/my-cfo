USE student_ai_cfo;

INSERT INTO user_profiles (
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
) VALUES (
  'demo-user-001',
  '都内在住の大学2年生',
  20,
  'student',
  2,
  '東京',
  '下北沢',
  '一人暮らし',
  120000,
  80000,
  40000,
  65000,
  300000,
  FALSE,
  '来年春に短期留学予定',
  JSON_ARRAY(
    'コンビニ利用が多い',
    '節約しすぎて生活の満足度を落とす提案は好まない',
    '学生向け割引やキャンペーンに関心が高い',
    '留学予定があるため、海外利用や為替コストに関係する提案は優先度が高い'
  ),
  JSON_ARRAY(
    JSON_OBJECT('name', 'Netflix', 'price', 1490),
    JSON_OBJECT('name', 'Spotify', 'price', 980)
  )
)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  age = VALUES(age),
  occupation = VALUES(occupation),
  university_year = VALUES(university_year),
  city = VALUES(city),
  nearest_station = VALUES(nearest_station),
  living_style = VALUES(living_style),
  monthly_income_total = VALUES(monthly_income_total),
  monthly_income_part_time = VALUES(monthly_income_part_time),
  monthly_income_allowance = VALUES(monthly_income_allowance),
  monthly_rent = VALUES(monthly_rent),
  current_savings = VALUES(current_savings),
  has_credit_card = VALUES(has_credit_card),
  study_abroad_plan = VALUES(study_abroad_plan),
  spending_traits = VALUES(spending_traits),
  subscriptions = VALUES(subscriptions);

INSERT INTO monthly_cashflows (
  user_id,
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
) VALUES
('demo-user-001', '2026-04-01', 120000, 65000, 18000, 12000, 6000, 7000, 4000, 8000, 2470, 9000, -11470, '現状維持だと毎月少しずつ赤字'),
('demo-user-001', '2026-05-01', 120000, 65000, 17500, 11500, 6000, 7000, 4000, 7500, 2470, 8500, -9470, 'コンビニ節約の改善ケース'),
('demo-user-001', '2026-06-01', 120000, 65000, 18000, 10000, 6000, 7000, 4000, 7000, 2470, 8500, -7970, '節約努力後の想定')
ON DUPLICATE KEY UPDATE
  income_total = VALUES(income_total),
  rent = VALUES(rent),
  food = VALUES(food),
  convenience_store = VALUES(convenience_store),
  transport = VALUES(transport),
  utilities = VALUES(utilities),
  phone = VALUES(phone),
  entertainment = VALUES(entertainment),
  subscriptions_total = VALUES(subscriptions_total),
  misc = VALUES(misc),
  savings_delta = VALUES(savings_delta),
  note = VALUES(note);
