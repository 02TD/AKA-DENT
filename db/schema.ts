export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value_ru TEXT NOT NULL,
    value_kk TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS services (
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
  )`,
  `CREATE TABLE IF NOT EXISTS doctors (
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
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK(rating BETWEEN 1 AND 5),
    body_ru TEXT NOT NULL,
    body_kk TEXT NOT NULL,
    source_url TEXT NOT NULL DEFAULT '',
    published_at TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS appointments (
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
  )`,
  `CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(active, sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_doctors_active_sort ON doctors(active, sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_active_date ON reviews(active, published_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_appointments_status_date ON appointments(status, created_at DESC)`,
];

export const settingsSeed = [
  ['hero_title', 'Лечим так, чтобы не переделывать', 'Қайта жасатпайтындай емдейміз'],
  ['hero_description', 'От 3D-диагностики до имплантации и протезирования — в одном месте и по единому плану.', '3D-диагностикадан имплантация мен протездеуге дейін — бір жерде, бір жоспармен.'],
  ['phone', '+7 700 121-54-54', '+7 700 121-54-54'],
  ['address', 'Караганда, ул. Комиссарова, 28', 'Қарағанды, Комиссаров көшесі, 28'],
  ['hours', 'Пн–Пт 09:00–19:00 · Сб 09:00–15:00', 'Дс–Жм 09:00–19:00 · Сб 09:00–15:00'],
  ['review_source', 'Отзывы публикуются из проверенной карточки 2GIS', 'Пікірлер тексерілген 2GIS парақшасынан жарияланады'],
] as const;

export const servicesSeed = [
  { id: 'consultation', slug: 'consultation', title_ru: 'Консультация', title_kk: 'Консультация', description_ru: 'Осмотр и выбор маршрута лечения', description_kk: 'Қарау және емдеу бағытын таңдау', price_from: 2000, price_to: 5000, unit: '₸', sort_order: 1 },
  { id: 'treatment', slug: 'treatment', title_ru: 'Лечение зубов', title_kk: 'Тіс емдеу', description_ru: 'Терапевтическое лечение по показаниям', description_kk: 'Көрсетілім бойынша терапиялық ем', price_from: 25000, price_to: null, unit: '₸', sort_order: 2 },
  { id: 'surgery', slug: 'surgery', title_ru: 'Сложное удаление', title_kk: 'Күрделі жұлу', description_ru: 'Включая сложные случаи зубов мудрости', description_kk: 'Ақыл тісінің күрделі жағдайларын қоса', price_from: 20000, price_to: null, unit: '₸', sort_order: 3 },
  { id: 'prosthetics', slug: 'prosthetics', title_ru: 'Протезирование', title_kk: 'Протездеу', description_ru: 'Съёмные и несъёмные конструкции', description_kk: 'Алынбалы және алынбайтын құрылымдар', price_from: 35000, price_to: null, unit: '₸', sort_order: 4 },
  { id: 'implants', slug: 'implants', title_ru: 'Имплантация', title_kk: 'Имплантация', description_ru: 'Восстановление жевательной функции', description_kk: 'Шайнау қызметін қалпына келтіру', price_from: 90000, price_to: null, unit: '₸', sort_order: 5 },
  { id: 'veneers', slug: 'veneers', title_ru: 'Виниры', title_kk: 'Винирлер', description_ru: 'Эстетическое восстановление улыбки', description_kk: 'Күлкіні эстетикалық қалпына келтіру', price_from: 90000, price_to: null, unit: '₸', sort_order: 6 },
] as const;

export const doctorsSeed = [
  { slug: 'bauyrzhan-taygukov', name_ru: 'Бауржан Тайгуков', name_kk: 'Бауыржан Тайгуков', role_ru: 'Врач-имплантолог, хирург, ортопед', role_kk: 'Имплантолог, хирург, ортопед дәрігер', bio_ru: 'Ведёт комплексные случаи, где хирургический и ортопедический этапы должны работать как единый план.', bio_kk: 'Хирургиялық және ортопедиялық кезеңдері бір жоспармен орындалатын кешенді жағдайларды жүргізеді.', focus_ru: 'Имплантация · хирургия · ортопедия', focus_kk: 'Имплантация · хирургия · ортопедия', image_url: '/akadent-media/clinic-01.jpg', sort_order: 1 },
  { slug: 'miramkul-taygukova', name_ru: 'Мирамкуль Тайгукова', name_kk: 'Мирамкүл Тайгукова', role_ru: 'Стоматолог-терапевт', role_kk: 'Стоматолог-терапевт', bio_ru: 'Занимается терапевтическим лечением и сохранением собственных зубов пациента.', bio_kk: 'Терапиялық еммен және пациенттің өз тістерін сақтаумен айналысады.', focus_ru: 'Терапия · сохранение зубов', focus_kk: 'Терапия · тістерді сақтау', image_url: '/akadent-media/clinic-02.jpg', sort_order: 2 },
  { slug: 'rustem-kizdarbekov', name_ru: 'Рустем Киздарбеков', name_kk: 'Рүстем Киздарбеков', role_ru: 'Стоматолог-ортопед', role_kk: 'Стоматолог-ортопед', bio_ru: 'Планирует и проводит ортопедическое восстановление съёмными и несъёмными конструкциями.', bio_kk: 'Алынбалы және алынбайтын құрылымдармен ортопедиялық қалпына келтіруді жоспарлап, жүргізеді.', focus_ru: 'Коронки · протезирование · виниры', focus_kk: 'Коронкалар · протездеу · винирлер', image_url: '/akadent-media/clinic-03.jpg', sort_order: 3 },
  { slug: 'ermek-boligub', name_ru: 'Ермек Болигуб', name_kk: 'Ермек Болигуб', role_ru: 'Стоматолог общего профиля', role_kk: 'Жалпы тәжірибедегі стоматолог', bio_ru: 'Проводит первичный приём и лечение по основным направлениям общей стоматологии.', bio_kk: 'Жалпы стоматологияның негізгі бағыттары бойынша алғашқы қабылдау мен емдеуді жүргізеді.', focus_ru: 'Диагностика · лечение · профилактика', focus_kk: 'Диагностика · емдеу · профилактика', image_url: '/akadent-media/clinic-05.jpg', sort_order: 4 },
] as const;

export const reviewsSeed = [
  { id: '2gis-olga-2025-08-04', author: 'Olga Olga', rating: 5, body_ru: 'Удаление сложного зуба мудрости прошло без боли. Всё зажило быстро, а ортопед довёл результат до идеала.', body_kk: 'Күрделі ақыл тісін ауыртпай алды. Жара тез жазылып, ортопед нәтижені мінсіз деңгейге жеткізді.', source_url: 'https://go.2gis.com/h3Mcu', published_at: '2025-08-04' },
  { id: '2gis-gulzira-2026-08-16', author: 'Гульзира Акимбекова', rating: 5, body_ru: 'Врач не назначает лишнего лечения, старается сохранить свои зубы и подробно объясняет каждый этап.', body_kk: 'Дәрігер артық ем тағайындамайды, өз тістерін сақтауға тырысады және әр кезеңді түсіндіреді.', source_url: 'https://go.2gis.com/h3Mcu', published_at: '2026-08-16' },
  { id: '2gis-dunai-2026-04-23', author: 'Дунай Еспаев', rating: 5, body_ru: 'Исправили ошибки прежних клиник — всё прошло без боли и очень комфортно.', body_kk: 'Алдыңғы клиникалардың қателерін түзеді — барлығы ауыртпай әрі жайлы өтті.', source_url: 'https://go.2gis.com/h3Mcu', published_at: '2026-04-23' },
] as const;
