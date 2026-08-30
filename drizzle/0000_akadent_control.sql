CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value_ru TEXT NOT NULL,
  value_kk TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_ru TEXT NOT NULL,
  title_kk TEXT NOT NULL,
  description_ru TEXT NOT NULL DEFAULT '',
  description_kk TEXT NOT NULL DEFAULT '',
  price_from INTEGER,
  price_to INTEGER,
  unit TEXT NOT NULL DEFAULT '₸',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS doctors (
  slug TEXT PRIMARY KEY,
  name_ru TEXT NOT NULL,
  name_kk TEXT NOT NULL,
  role_ru TEXT NOT NULL,
  role_kk TEXT NOT NULL,
  bio_ru TEXT NOT NULL,
  bio_kk TEXT NOT NULL,
  focus_ru TEXT NOT NULL,
  focus_kk TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK(rating BETWEEN 1 AND 5),
  body_ru TEXT NOT NULL,
  body_kk TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT '',
  published_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_slug TEXT NOT NULL DEFAULT '',
  doctor_slug TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'ru',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_doctors_active_sort ON doctors(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_reviews_active_date ON reviews(active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, created_at DESC);

PRAGMA optimize;
