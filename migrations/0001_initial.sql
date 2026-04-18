-- 施設テーブル
CREATE TABLE IF NOT EXISTS facilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('recovery', 'living')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- スタッフテーブル
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  facility_id INTEGER REFERENCES facilities(id),
  role TEXT NOT NULL DEFAULT 'staff' CHECK(role IN ('admin', 'staff')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 患者テーブル
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_code TEXT NOT NULL,
  facility_id INTEGER NOT NULL REFERENCES facilities(id),
  gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')),
  birth_date TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  onset_date TEXT,
  discharge_date TEXT NOT NULL,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

-- FIM評価テーブル
CREATE TABLE IF NOT EXISTS fim_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL REFERENCES patients(id),
  facility_id INTEGER NOT NULL REFERENCES facilities(id),
  evaluator_id INTEGER REFERENCES users(id),
  evaluation_date TEXT NOT NULL,
  evaluation_type TEXT NOT NULL CHECK(evaluation_type IN ('baseline', 'quarterly')),

  -- 運動項目：セルフケア
  eating            INTEGER NOT NULL CHECK(eating            BETWEEN 1 AND 7),
  grooming          INTEGER NOT NULL CHECK(grooming          BETWEEN 1 AND 7),
  bathing           INTEGER NOT NULL CHECK(bathing           BETWEEN 1 AND 7),
  dressing_upper    INTEGER NOT NULL CHECK(dressing_upper    BETWEEN 1 AND 7),
  dressing_lower    INTEGER NOT NULL CHECK(dressing_lower    BETWEEN 1 AND 7),
  toileting         INTEGER NOT NULL CHECK(toileting         BETWEEN 1 AND 7),

  -- 運動項目：排泄コントロール
  bladder           INTEGER NOT NULL CHECK(bladder           BETWEEN 1 AND 7),
  bowel             INTEGER NOT NULL CHECK(bowel             BETWEEN 1 AND 7),

  -- 運動項目：移乗
  transfer_bed_chair INTEGER NOT NULL CHECK(transfer_bed_chair BETWEEN 1 AND 7),
  transfer_toilet    INTEGER NOT NULL CHECK(transfer_toilet    BETWEEN 1 AND 7),
  transfer_tub       INTEGER NOT NULL CHECK(transfer_tub       BETWEEN 1 AND 7),

  -- 運動項目：移動
  locomotion_walk   INTEGER NOT NULL CHECK(locomotion_walk   BETWEEN 1 AND 7),
  locomotion_stairs INTEGER NOT NULL CHECK(locomotion_stairs BETWEEN 1 AND 7),

  -- 認知項目：コミュニケーション
  comprehension     INTEGER NOT NULL CHECK(comprehension     BETWEEN 1 AND 7),
  expression        INTEGER NOT NULL CHECK(expression        BETWEEN 1 AND 7),

  -- 認知項目：社会的認知
  social_interaction INTEGER NOT NULL CHECK(social_interaction BETWEEN 1 AND 7),
  problem_solving    INTEGER NOT NULL CHECK(problem_solving    BETWEEN 1 AND 7),
  memory             INTEGER NOT NULL CHECK(memory             BETWEEN 1 AND 7),

  -- 合計
  motor_total     INTEGER NOT NULL,
  cognitive_total INTEGER NOT NULL,
  total_fim       INTEGER NOT NULL,

  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

-- 操作ログテーブル（誰が何をしたか記録）
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 初期施設データ（施設名は本番前に変更してください）
INSERT INTO facilities (name, type) VALUES
  ('回復期リハビリテーション病院', 'recovery'),
  ('生活期施設A', 'living'),
  ('生活期施設B', 'living'),
  ('生活期施設C', 'living'),
  ('生活期施設D', 'living');
