'use client';

import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building, CalendarCheck, Check,
  Camera, ChevronDown, ClipboardCheck, Clock, Heart, Loader2, Mail,
  MapPin, Menu, MessageCircle, Microscope, Phone, Play, Quote, ScanLine,
  Send, ShieldCheck, Smile, Sparkles, Star, Stethoscope, X,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { doctorsSeed, reviewsSeed, servicesSeed } from '@/db/schema';

const heroPhoto = '/akadent-media/clinic-01.jpg';
type Lang = 'ru' | 'kk';
type ServiceItem = { id: string; slug: string; title_ru: string; title_kk: string; description_ru: string; description_kk: string; price_from: number; price_to: number | null; unit: string };
type DoctorItem = { slug: string; name_ru: string; name_kk: string; role_ru: string; role_kk: string; bio_ru: string; bio_kk: string; focus_ru: string; focus_kk: string; image_url: string };
type ReviewItem = { id: string; author: string; rating: number; body_ru: string; body_kk: string; source_url: string; published_at: string };
type PublicData = { settings: Array<{ key: string; value_ru: string; value_kk: string }>; services: ServiceItem[]; doctors: DoctorItem[]; reviews: ReviewItem[] };

const copy = {
  ru: {
    nav: ['Услуги', 'Как мы лечим', 'Отзывы', 'Цены', 'Вопросы'], menu: 'Меню', book: 'Записаться',
    schedule: 'Пн–Пт · 09:00–19:00', badge: 'Стоматология полного цикла · Караганда',
    hero1: 'Лечим так,', hero2: 'чтобы', words: ['не переделывать', 'сохранить своё', 'вернуть уверенность'],
    heroText: 'Команда AKA-DENT восстанавливает здоровье, эстетику и жевательную функцию — от 3D-диагностики до имплантации и протезирования в одном месте.',
    whatsapp: 'Записаться в WhatsApp', meet: 'Познакомиться с врачами', ratings: '338 оценок и 241 отзыв в 2GIS',
    open: 'Открыты для записи', consult: 'Консультация от 2 000 ₸ · ул. Комиссарова, 28',
    servicesEye: 'Полный цикл', servicesTitle: 'Всё лечение — по одному понятному плану', servicesText: 'Цены и описания обновляются из панели управления. Точную стоимость врач подтверждает после диагностики.', details: 'Подробнее',
    teamEye: 'Команда AKA-DENT', teamTitle: 'У каждого врача — своё направление и личная страница', teamText: 'Откройте профиль, узнайте специализацию и запишитесь к выбранному врачу.', chooseDoctor: 'Открыть профиль',
    processEye: 'Путь пациента', processTitle: 'Сначала понимаем. Потом лечим.', processText: 'Диагностика, прозрачный маршрут и лечение только после согласования.', step: 'Шаг',
    reviewsEye: 'Последние отзывы', reviewsTitle: 'Репутация, которую можно проверить', reviewsLink: 'Все отзывы в 2GIS', reviewSource: 'проверенный отзыв · 2GIS',
    pricesEye: 'Открытый прайс', pricesTitle: 'Стоимость до визита, а не после', pricesText: 'Актуальные стартовые цены управляются клиникой через защищённую админ-панель.', from: 'от', priceNote: 'Цены указаны «от» и не являются публичной офертой. Точная стоимость определяется после осмотра.',
    faqEye: 'Частые вопросы', faqTitle: 'Честно о важном', faqText: 'Если не нашли ответ — напишите администратору. Поможем выбрать врача и удобное время.',
    ctaBadge: 'Готовы помочь', ctaTitle: 'Начните с разговора, а не с лечения', ctaText: 'Оставьте имя и номер. Заявка сохранится в панели клиники, затем откроется WhatsApp с готовым сообщением.', name: 'Ваше имя', phone: '+7 ___ ___ __ __', send: 'Записаться', sending: 'Сохраняем', sent: 'Заявка сохранена. WhatsApp открыт — осталось отправить сообщение.', privacy: 'Без рассылок. Контакты используются только для связи по вашей записи.',
    address: 'Адрес', booking: 'Запись', hours: 'График', city: 'Новый город · Караганда', callWa: 'Звонок или WhatsApp', weekend: 'Сб 09:00–15:00 · Вс выходной',
    footerText: 'Стоматология полного цикла в Караганде. Лечим так, чтобы не переделывать.', clinic: 'О клинике', support: 'Поддержка', admin: 'Панель управления', disclaimer: 'Информация на сайте не заменяет консультацию врача', showAll: 'Показать все', showLess: 'Свернуть', mobileCall: 'Позвонить',
  },
  kk: {
    nav: ['Қызметтер', 'Қалай емдейміз', 'Пікірлер', 'Бағалар', 'Сұрақтар'], menu: 'Мәзір', book: 'Жазылу',
    schedule: 'Дс–Жм · 09:00–19:00', badge: 'Толық циклді стоматология · Қарағанды',
    hero1: 'Емдейміз,', hero2: 'қайта жасатпау үшін', words: ['табиғи тісті сақтау', 'сенімді қайтару', 'нәтижені бекіту'],
    heroText: 'AKA-DENT командасы денсаулықты, эстетиканы және шайнау қызметін бір жерде қалпына келтіреді: 3D-диагностикадан имплантация мен протездеуге дейін.',
    whatsapp: 'WhatsApp арқылы жазылу', meet: 'Дәрігерлермен танысу', ratings: '2GIS-та 338 баға және 241 пікір',
    open: 'Жазылуға ашықпыз', consult: 'Кеңес 2 000 ₸ бастап · Комиссаров көш., 28',
    servicesEye: 'Толық цикл', servicesTitle: 'Барлық ем — бір түсінікті жоспармен', servicesText: 'Бағалар мен сипаттамалар басқару панелінен жаңартылады. Нақты құнын дәрігер диагностикадан кейін растайды.', details: 'Толығырақ',
    teamEye: 'AKA-DENT командасы', teamTitle: 'Әр дәрігердің жеке бағыты және өз парақшасы бар', teamText: 'Профильді ашып, мамандануын біліп, таңдаған дәрігерге жазылыңыз.', chooseDoctor: 'Профильді ашу',
    processEye: 'Пациент жолы', processTitle: 'Алдымен түсінеміз. Содан кейін емдейміз.', processText: 'Диагностика, ашық жоспар және тек келісілгеннен кейінгі ем.', step: 'Қадам',
    reviewsEye: 'Соңғы пікірлер', reviewsTitle: 'Тексеруге болатын бедел', reviewsLink: '2GIS-тағы барлық пікір', reviewSource: 'тексерілген пікір · 2GIS',
    pricesEye: 'Ашық прайс', pricesTitle: 'Құны қабылдауға дейін белгілі', pricesText: 'Өзекті бастапқы бағаларды клиника қорғалған басқару панелі арқылы жаңартады.', from: 'бастап', priceNote: 'Бағалар бастапқы мәнде көрсетілген және жария оферта емес. Нақты құн тексеруден кейін анықталады.',
    faqEye: 'Жиі сұрақтар', faqTitle: 'Маңыздысы туралы ашық', faqText: 'Жауап табылмаса, әкімшіге жазыңыз. Дәрігер мен ыңғайлы уақытты таңдауға көмектесеміз.',
    ctaBadge: 'Көмектесуге дайынбыз', ctaTitle: 'Емнен емес, әңгімеден бастаңыз', ctaText: 'Атыңыз бен нөміріңізді қалдырыңыз. Өтінім клиника панеліне сақталып, WhatsApp-та дайын хабарлама ашылады.', name: 'Атыңыз', phone: '+7 ___ ___ __ __', send: 'Жазылу', sending: 'Сақталуда', sent: 'Өтінім сақталды. WhatsApp ашылды — хабарламаны жіберу ғана қалды.', privacy: 'Жарнама жібермейміз. Байланыс деректері тек жазылу үшін қолданылады.',
    address: 'Мекенжай', booking: 'Жазылу', hours: 'Жұмыс уақыты', city: 'Жаңа қала · Қарағанды', callWa: 'Қоңырау немесе WhatsApp', weekend: 'Сб 09:00–15:00 · Жс демалыс',
    footerText: 'Қарағандыдағы толық циклді стоматология. Қайта жасатпау үшін сапалы емдейміз.', clinic: 'Клиника туралы', support: 'Қолдау', admin: 'Басқару панелі', disclaimer: 'Сайттағы ақпарат дәрігер кеңесін алмастырмайды', showAll: 'Барлығын көру', showLess: 'Жинау', mobileCall: 'Қоңырау',
  },
} as const;
const avatars = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=160&q=90',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=90',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=90',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=90',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=90',
];
const stats = [
  { value: 4.9, suffix: '', label: 'рейтинг в 2GIS', trend: 'подтверждён' },
  { value: 338, suffix: '', label: 'оценок пациентов', trend: 'реальные визиты' },
  { value: 241, suffix: '', label: 'подробный отзыв', trend: 'открыты к диалогу' },
  { value: 18, suffix: '', label: 'фото в 2GIS', trend: 'без фотостоков' },
];
const faqsRu = [
  { q: 'Сколько стоит консультация?', a: 'В опубликованном прайсе 2GIS консультация стоит от 2 000 до 5 000 ₸. Точная стоимость зависит от специалиста и формата приёма — администратор уточнит её при записи.' },
  { q: 'Можно ли сразу сделать 3D-снимок?', a: 'Да. На том же адресе работает центр Aqyl-SCAN. В карточке указаны КТ зубов, ОПТГ и прицельные снимки — врач подскажет, какой формат нужен именно вам.' },
  { q: 'Когда работает клиника?', a: 'AKA-DENT принимает с понедельника по пятницу с 09:00 до 19:00, в субботу с 09:00 до 15:00. Воскресенье — выходной.' },
  { q: 'Какие способы оплаты доступны?', a: 'По данным 2GIS можно оплатить картой, наличными или QR-кодом. В отзывах пациенты также упоминают рассрочку; актуальные условия лучше уточнить у администратора.' },
  { q: 'Сколько стоит имплантация?', a: 'Опубликованная стартовая цена импланта — от 90 000 ₸. Итог зависит от снимка, системы импланта, объёма хирургии и будущей коронки.' },
  { q: 'Как подготовиться к первому визиту?', a: 'Возьмите удостоверение личности и имеющиеся снимки, если они сделаны недавно. Запишите лекарства и хронические заболевания — это поможет врачу безопасно составить план.' },
];
const faqsKk = [
  { q: 'Кеңес қанша тұрады?', a: '2GIS-та жарияланған прайс бойынша кеңес 2 000–5 000 ₸ тұрады. Нақты бағаны әкімші жазылу кезінде нақтылайды.' },
  { q: '3D-суретті бірден түсіруге бола ма?', a: 'Иә. Осы мекенжайда Aqyl-SCAN орталығы жұмыс істейді: КТ, ОПТГ және нысаналы суреттер.' },
  { q: 'Клиника қашан жұмыс істейді?', a: 'Дүйсенбі–жұма 09:00–19:00, сенбі 09:00–15:00. Жексенбі — демалыс.' },
  { q: 'Қандай төлем тәсілдері бар?', a: 'Картамен, қолма-қол немесе QR-кодпен төлеуге болады. Бөліп төлеудің өзекті шарттарын әкімшіден сұраңыз.' },
  { q: 'Имплантация қанша тұрады?', a: 'Импланттың бастапқы бағасы — 90 000 ₸. Қорытынды құн суретке, жүйеге, хирургия көлеміне және тәжге байланысты.' },
  { q: 'Алғашқы қабылдауға қалай дайындаламын?', a: 'Жеке куәлігіңізді және бар болса соңғы суреттерді әкеліңіз. Қабылдайтын дәрілер мен созылмалы ауруларды айтыңыз.' },
];

export default function Home() {
  const [lang, setLang] = useState<Lang>('ru');
  const [publicData, setPublicData] = useState<PublicData | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [lineActive, setLineActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [pricesExpanded, setPricesExpanded] = useState(false);
  const [booking, setBooking] = useState({ name: '', phone: '', website: '' });
  const heroImageRef = useRef<HTMLImageElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const counterStarted = useRef(false);
  const t = copy[lang];
  const typedWords = t.words;
  const services: ServiceItem[] = publicData?.services ?? servicesSeed.map((item) => ({ ...item }));
  const doctors: DoctorItem[] = publicData?.doctors ?? doctorsSeed.map((item) => ({ ...item }));
  const reviews: ReviewItem[] = publicData?.reviews ?? reviewsSeed.map((item) => ({ ...item }));
  const localizedStats = lang === 'kk' ? [
    { ...stats[0], label: '2GIS рейтингі', trend: 'расталған' }, { ...stats[1], label: 'пациент бағасы', trend: 'нақты келулер' },
    { ...stats[2], label: 'толық пікір', trend: 'ашық диалог' }, { ...stats[3], label: '2GIS-тағы фото', trend: 'өз фотоларымыз' },
  ] : stats;
  const faqs = lang === 'kk' ? faqsKk : faqsRu;

  useEffect(() => {
    const stored = window.localStorage.getItem('akadent-language');
    if (stored === 'kk' || stored === 'ru') setLang(stored);
  }, []);
  const changeLanguage = useCallback((next: Lang) => {
    setLang(next);
    window.localStorage.setItem('akadent-language', next);
    document.documentElement.lang = next === 'kk' ? 'kk' : 'ru';
  }, []);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch('/api/public-data', { cache: 'no-store' });
        if (response.ok && active) setPublicData(await response.json() as PublicData);
      } catch { /* keep the static shell available */ }
    };
    void load();
    const interval = window.setInterval(load, 60_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setWordIndex((current) => (current + 1) % typedWords.length), 2200);
    return () => window.clearInterval(interval);
  }, [typedWords.length]);
  useEffect(() => {
    let raf = 0;
    const updateScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (heroImageRef.current) heroImageRef.current.style.transform = 'translateY(' + y * 0.3 + 'px) scale(1.06)';
    };
    const onScroll = () => { window.cancelAnimationFrame(raf); raf = window.requestAnimationFrame(updateScroll); };
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); window.cancelAnimationFrame(raf); };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-visible', 'true');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('[data-reveal]').forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || counterStarted.current) return;
      counterStarted.current = true;
      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / 2200, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCounts(stats.map((stat) => stat.value % 1 ? Math.round(stat.value * eased * 10) / 10 : Math.round(stat.value * eased)));
        if (progress < 1) window.requestAnimationFrame(animate);
      };
      window.requestAnimationFrame(animate);
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = processRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setLineActive(true); }, { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/appointments', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...booking, language: lang }) });
      const result = await response.json() as { whatsappUrl?: string };
      if (!response.ok || !result.whatsappUrl) throw new Error('save_failed');
      setSubmitted(true);
      window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setSubmitting(false);
    }
  }, [booking, lang]);

  return (
    <main className="aurora-page">
      <header className={'site-nav ' + (scrolled ? 'scrolled' : '')}>
        <div className="site-container flex h-full items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="AKA-DENT — на главную">
            <span className="brand-mark"><span /><span /><span /></span>
            <span><span className="block text-[17px] font-extrabold tracking-[.18em] text-[#111E61]">AKA-DENT</span><span className="block text-[7px] font-bold uppercase tracking-[.28em] text-[#7580A8]">стоматология</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-[13px] font-semibold lg:flex" aria-label={lang === 'kk' ? 'Негізгі навигация' : 'Основная навигация'}>
            {t.nav.map((label, index) => <a key={label} className="nav-link" href={['#services','#process','#reviews','#prices','#faq'][index]}>{label}</a>)}
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <div className="lang-switch" aria-label="Тіл / Язык"><button type="button" className={lang === 'ru' ? 'active' : ''} onClick={() => changeLanguage('ru')}>RU</button><button type="button" className={lang === 'kk' ? 'active' : ''} onClick={() => changeLanguage('kk')}>KZ</button></div>
            <a href="tel:+77001215454" className="hidden text-right md:block"><span className="block text-[10px] font-bold uppercase tracking-[.13em] text-[#7380A6]">{t.schedule}</span><span className="mt-1 block text-sm font-extrabold text-[#111E61]">+7 700 121-54-54</span></a>
            <a href="#booking" className="nav-booking-cta primary-btn px-5 py-3 text-[12px] font-bold">{t.book} <ArrowUpRight size={15} aria-hidden="true" /></a>
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="nav-menu-toggle relative z-20 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 bg-white/80" aria-label={menuOpen ? (lang === 'kk' ? 'Мәзірді жабу' : 'Закрыть меню') : t.menu} aria-controls="mobile-navigation" aria-expanded={menuOpen}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
      </header>

      <div id="mobile-navigation" className={'mobile-layer ' + (menuOpen ? 'open' : '')} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen}>
        <div className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-black/10" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню"><X size={19} /></button>
          <div className="display mb-9 text-4xl font-semibold">{t.menu}</div>
          <nav className="flex flex-col gap-1 text-xl font-semibold" aria-label="Мобильная навигация">
            {t.nav.map((label, index) => ([label, ['#services','#process','#reviews','#prices','#faq'][index]])).map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-black/[.07] py-4">{label}<ArrowUpRight size={18} /></a>
            ))}
          </nav>
          <a href="tel:+77001215454" className="mt-10 flex items-center gap-3 text-sm text-[#4B5563]"><Phone size={17} className="text-[#3247C5]" /> +7 700 121-54-54</a>
        </div>
      </div>

      <section id="top" className="hero">
        <div className="hero-photo-wrap"><img ref={heroImageRef} src={heroPhoto} alt="Врач AKA-DENT проводит осмотр пациента" loading="eager" decoding="async" className="hero-photo" /></div>
        <div className="hero-blob left-[-100px] top-[22%] h-[320px] w-[320px] bg-[#5368FF]/14 blur-2xl" />
        <div className="hero-blob right-[8%] top-[20%] h-[170px] w-[170px] border border-white/50 bg-[#1B2E88]/10 backdrop-blur-sm" style={{ animationDelay: '-2s' }} />
        <div className="site-container hero-content">
          <div className="max-w-[910px]">
            <div className="hero-enter mb-7 inline-flex items-center gap-2 rounded-full border border-[#3247C5]/20 bg-white/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#1D318D] shadow-sm backdrop-blur" style={{ animationDelay: '0ms', animationDuration: '600ms' }}>
              <span className="h-2 w-2 rounded-full bg-[#3247C5] shadow-[0_0_0_5px_rgba(50,71,197,.14)]" style={{ animation: 'badge-pulse 2s infinite' }} />{t.badge}
            </div>
            <h1 className="hero-title">
              <span className="hero-enter block" style={{ animationDelay: '100ms', animationDuration: '800ms' }}>{t.hero1}</span>
              <span className="hero-enter block" style={{ animationDelay: '200ms', animationDuration: '800ms' }}>{t.hero2} <span key={lang + wordIndex} className="typed-word gradient-text">{typedWords[wordIndex]}</span></span>
            </h1>
            <p className="hero-subtitle hero-enter mt-8 max-w-[620px] text-[clamp(17px,2vw,21px)] leading-[1.65] text-[#46506D]" style={{ animationDelay: '350ms', animationDuration: '700ms' }}>{t.heroText}</p>
            <div className="hero-actions hero-enter mt-9 flex flex-wrap gap-3" style={{ animationDelay: '500ms', animationDuration: '600ms' }}>
              <a href="#booking" className="primary-btn px-7 py-4 text-[13px] font-bold">{t.whatsapp} <ArrowUpRight size={18} /></a>
              <a href="#doctors" className="ghost-btn px-7 py-4 text-[13px] font-bold"><Play size={16} fill="currentColor" /> {t.meet}</a>
            </div>
            <div className="hero-social hero-enter mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: '650ms', animationDuration: '600ms' }}>
              <div className="avatar-stack flex">{avatars.slice(0, 4).map((src, index) => <img key={src} src={src} alt={'Пациент AKA-DENT ' + (index + 1)} loading="lazy" decoding="async" />)}</div>
              <div><div className="flex items-center gap-1 text-[#F4A629]" aria-label="4,9 / 5">{[0,1,2,3,4].map((star) => <Star key={star} size={14} fill="currentColor" />)}<span className="ml-1 text-xs font-extrabold text-[#111E61]">4,9</span></div><p className="mt-1 text-xs font-semibold text-[#4A556D]"><strong className="text-[#0F0F0F]">{t.ratings}</strong></p></div>
            </div>
          </div>
        </div>
        <div className="hero-note hidden xl:block">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#EEF1FF] text-[#3247C5]"><Clock size={19} /></span><div><div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#708087]">{t.open}</div><div className="mt-1 text-sm font-bold">{t.schedule}</div></div></div>
          <div className="mt-4 border-t border-black/[.07] pt-4 text-xs leading-relaxed text-[#556269]">{t.consult}</div>
        </div>
      </section>

      <section className="border-y border-black/[.06] bg-white py-8" aria-label="Партнёры">
        <div className="site-container mb-7 text-center text-[10px] font-bold uppercase tracking-[.18em] text-[#7B858A]">В одной клинике:</div>
        <div className="marquee-mask"><div className="marquee-track">{[0,1].map((copy) => <div key={copy} className="flex">{['3D-диагностика','Имплантация','Ортопедия','Терапия','Хирургия','Пародонтология'].map((brand) => <span className="logo-name" key={copy + brand}>{brand}</span>)}</div>)}</div></div>
      </section>

      <section id="services" className="section-space">
        <div className="site-container">
          <div data-reveal className="mb-14 grid gap-7 lg:grid-cols-[1fr_.65fr] lg:items-end">
            <div><span className="eyebrow">{t.servicesEye}</span><h2 className="section-title mt-5 max-w-[760px]">{t.servicesTitle}</h2></div>
            <p className="max-w-[470px] text-[15px] leading-7 text-[#667178] lg:justify-self-end">{t.servicesText}</p>
          </div>
          <div className={'services-live-grid ' + (servicesExpanded ? 'is-expanded' : '')}>
            {services.map((service, index) => {
              const Icon = [ScanLine, Microscope, Heart, Smile, ShieldCheck, Stethoscope][index % 6];
              return <article data-reveal key={service.id} className={'feature-card ' + (index === 0 || index === 5 ? 'large' : '')} style={{ transitionDelay: index * 80 + 'ms' }}>
                <div className="feature-orb" /><div className="icon-box"><Icon size={24} /></div>
                <div className="relative mt-auto pt-10"><span className="mb-3 block text-[10px] font-bold uppercase tracking-[.16em] text-[#3247C5]">{t.from} {service.price_from.toLocaleString(lang === 'kk' ? 'kk-KZ' : 'ru-RU')} ₸</span>
                  <h3 className="card-title">{lang === 'kk' ? service.title_kk : service.title_ru}</h3><p className="mt-4 text-sm leading-7 text-[#647077]">{lang === 'kk' ? service.description_kk : service.description_ru}</p>
                  <a href="#booking" className="more-link mt-6 inline-flex items-center gap-2">{t.details} <ArrowRight size={15} /></a></div>
              </article>;
            })}
          </div>
          <button type="button" className="mobile-expand" onClick={() => setServicesExpanded((current) => !current)} aria-expanded={servicesExpanded}>{servicesExpanded ? t.showLess : t.showAll}<ChevronDown size={17} /></button>
          <div id="doctors" data-reveal className="mt-20">
            <span className="eyebrow">{t.teamEye}</span><h2 className="section-title mt-5 max-w-[900px]">{t.teamTitle}</h2><p className="mt-5 max-w-[680px] text-sm leading-7 text-[#667178]">{t.teamText}</p>
            <div className="doctor-profile-grid mt-10">
              {doctors.map((doctor, index) => <a href={'/doctors/' + doctor.slug} key={doctor.slug} className="doctor-profile-card" style={{ transitionDelay: index * 80 + 'ms' }}>
                <div className="doctor-profile-image"><img src={doctor.image_url} alt={lang === 'kk' ? doctor.name_kk : doctor.name_ru} loading="lazy" decoding="async" /></div>
                <div className="doctor-profile-copy"><span>{lang === 'kk' ? doctor.role_kk : doctor.role_ru}</span><h3>{lang === 'kk' ? doctor.name_kk : doctor.name_ru}</h3><p>{lang === 'kk' ? doctor.focus_kk : doctor.focus_ru}</p><strong>{t.chooseDoctor} <ArrowUpRight size={16} /></strong></div>
              </a>)}
            </div>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="stats-panel py-[clamp(64px,8vw,100px)]">
        <div className="site-container relative z-10">
          <div data-reveal className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-y-0">
            {localizedStats.map((stat, index) => (
              <div className="stat-item" key={stat.label}>
                <div className="stat-number">{counts[index].toLocaleString('ru-RU', { maximumFractionDigits: 1 })}{stat.suffix}</div>
                <div className="mt-5 text-[10px] font-extrabold uppercase tracking-[.15em] text-white/70">{stat.label}</div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-bold text-white"><ArrowUpRight size={12} /> {stat.trend}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" ref={processRef} className="section-space">
        <div className="site-container">
          <div data-reveal className="mx-auto mb-16 max-w-[720px] text-center">
            <span className="eyebrow">{t.processEye}</span>
            <h2 className="section-title mt-5">{t.processTitle}</h2>
            <p className="mx-auto mt-5 max-w-[560px] text-sm leading-7 text-[#667178]">{t.processText}</p>
          </div>
          <div className="relative grid gap-14 md:grid-cols-3 md:gap-5">
            <svg className={'process-line ' + (lineActive ? 'active' : '')} viewBox="0 0 800 30" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="processGradient" x1="0" x2="1"><stop offset="0" stopColor="#182B82" /><stop offset="1" stopColor="#5368FF" /></linearGradient></defs>
              <path d="M0 15 C220 -8 580 38 800 15" fill="none" stroke="url(#processGradient)" strokeWidth="2" />
            </svg>
            {[
              { n: '01', icon: CalendarCheck, title: lang === 'kk' ? 'Кеңес' : 'Консультация', text: lang === 'kk' ? 'Не мазалайтынын айтыңыз. Алғашқы кеңестің бастапқы бағасы — 2 000–5 000 ₸.' : 'Расскажите, что беспокоит. Консультация по опубликованному прайсу стоит 2 000–5 000 ₸.' },
              { n: '02', icon: ScanLine, title: '3D-диагностика', text: lang === 'kk' ? 'Қажет болса, осы мекенжайдағы Aqyl-SCAN-да КТ, ОПТГ немесе нысаналы сурет түсіреміз.' : 'При необходимости делаем КТ, ОПТГ или прицельный снимок в Aqyl-SCAN по тому же адресу.' },
              { n: '03', icon: ClipboardCheck, title: lang === 'kk' ? 'Жоспар және ем' : 'План и лечение', text: lang === 'kk' ? 'Дәрігер нұсқалар мен басымдықтарды түсіндіреді. Ем тек сіздің келісіміңізбен басталады.' : 'Врач объясняет варианты и приоритеты. Вы выбираете темп — команда отвечает за согласованность этапов.' },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <article data-reveal key={step.n} className="step-card" style={{ transitionDelay: index * 150 + 'ms' }}>
                  <div className="step-badge"><Icon size={29} /></div><div className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#3247C5]">{t.step} {step.n}</div>
                  <h3 className="card-title mt-4">{step.title}</h3><p className="mx-auto mt-4 max-w-[310px] text-sm leading-7 text-[#667178]">{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="reviews" className="section-space bg-[#F1F3FA]">
        <div className="site-container">
          <div data-reveal className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div><span className="eyebrow">{t.reviewsEye}</span><h2 className="section-title mt-5">{t.reviewsTitle}</h2></div>
            <a href="https://go.2gis.com/h3Mcu" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-semibold text-[#455258]"><span className="flex text-[#F4A629]">{[0,1,2,3,4].map((star) => <Star key={star} size={16} fill="currentColor" />)}</span>{t.reviewsLink} <ArrowUpRight size={15} /></a>
          </div>
          <div className="testimonials-scroll grid gap-5 md:grid-cols-2">
            {reviews.slice(0, 3).map((review, index) => <article data-reveal key={review.id} className={'testimonial ' + (index === 0 ? 'featured md:col-span-2' : '')} style={{ transitionDelay: index * 80 + 'ms' }}>
              <Quote className="big-quote" size={index === 0 ? 92 : 70} fill="currentColor" /><div className={'flex ' + (index === 0 ? 'text-[#FFE285]' : 'text-[#F59E0B]')}>{Array.from({ length: review.rating }, (_, star) => <Star key={star} size={index === 0 ? 17 : 15} fill="currentColor" />)}</div>
              <blockquote className={index === 0 ? 'display mt-7 max-w-[900px] text-[clamp(26px,4vw,42px)] font-medium leading-[1.12]' : 'mt-6 text-[17px] leading-8 text-[#3F4C51]'}>«{lang === 'kk' ? review.body_kk : review.body_ru}»</blockquote>
              <div className="mt-8 flex flex-wrap items-center gap-4"><span className={'grid h-14 w-14 place-items-center rounded-full border-2 font-extrabold ' + (index === 0 ? 'border-white bg-white/12' : 'border-[#3247C5] bg-[#EEF1FF] text-[#182B82]')}>{review.author.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><div className="font-bold">{review.author}</div><div className={index === 0 ? 'mt-1 text-xs text-white/68' : 'mt-1 text-xs text-[#788389]'}>{t.reviewSource}</div></div><time className={'ml-auto text-xs ' + (index === 0 ? 'text-white/60' : 'text-[#9AA3A7]')}>{new Intl.DateTimeFormat(lang === 'kk' ? 'kk-KZ' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(review.published_at))}</time></div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="prices" className="section-space">
        <div className="site-container">
          <div data-reveal className="mx-auto mb-16 max-w-[760px] text-center">
            <span className="eyebrow">{t.pricesEye}</span><h2 className="section-title mt-5">{t.pricesTitle}</h2>
            <p className="mx-auto mt-5 max-w-[600px] text-sm leading-7 text-[#667178]">{t.pricesText}</p>
          </div>
          <div className={'price-live-grid ' + (pricesExpanded ? 'is-expanded' : '')}>
            {services.map((service, index) => <article data-reveal key={service.id} className="pricing-card" style={{ transitionDelay: (index % 3) * 80 + 'ms' }}>
              <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF1FF] text-[#3247C5]"><Check size={23} /></span><span className="text-[10px] font-bold uppercase tracking-[.14em] opacity-60">{service.slug}</span></div>
              <h3 className="card-title mt-8">{lang === 'kk' ? service.title_kk : service.title_ru}</h3><p className="mt-3 min-h-12 text-sm leading-6 opacity-70">{lang === 'kk' ? service.description_kk : service.description_ru}</p>
              <div className="price-block mt-7"><span className="price-prefix">{t.from}</span><div className="price-amount"><span className="price">{service.price_from.toLocaleString(lang === 'kk' ? 'kk-KZ' : 'ru-RU')}</span><span className="price-currency">₸</span></div></div>
              <a href="#booking" className="primary-btn mt-auto px-6 py-4 text-sm font-bold">{t.book} <ArrowUpRight size={17} /></a>
            </article>)}
          </div>
          <button type="button" className="mobile-expand" onClick={() => setPricesExpanded((current) => !current)} aria-expanded={pricesExpanded}>{pricesExpanded ? t.showLess : t.showAll}<ChevronDown size={17} /></button>
          <p className="mt-9 text-center text-[11px] leading-5 text-[#8A9498]">{t.priceNote}</p>
        </div>
      </section>

      <section id="faq" className="section-space bg-white">
        <div className="site-container">
          <div data-reveal className="mb-14 grid gap-7 lg:grid-cols-[.75fr_1fr] lg:items-end">
            <div><span className="eyebrow">{t.faqEye}</span><h2 className="section-title mt-5">{t.faqTitle}</h2></div>
            <p className="max-w-[520px] text-sm leading-7 text-[#667178]">{t.faqText}</p>
          </div>
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={faq.q} data-reveal className={'faq-item ' + (isOpen ? 'open' : '')} style={{ transitionDelay: (index % 2) * 80 + 'ms' }}>
                  <button type="button" className="flex w-full items-center justify-between gap-5 bg-transparent px-5 py-5 text-left text-sm font-bold" onClick={() => setOpenFaq(isOpen ? null : index)} aria-expanded={isOpen}>
                    <span>{faq.q}</span><span className="chevron grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#3247C5] shadow-sm"><ChevronDown size={17} /></span>
                  </button>
                  <div className="faq-answer"><p className="px-5 pb-6 pr-14 text-sm leading-7 text-[#647077]">{faq.a}</p></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="booking" className="section-space">
        <div className="site-container">
          <div data-reveal className="cta-banner px-[clamp(22px,6vw,76px)] py-[clamp(58px,8vw,94px)] text-center">
            <div className="relative z-10 mx-auto max-w-[820px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-white/86 backdrop-blur"><Sparkles size={13} /> {t.ctaBadge}</span>
              <h2 className="display mt-6 text-[clamp(34px,5vw,56px)] font-semibold leading-[.98] tracking-[-.04em]">{t.ctaTitle}</h2>
              <p className="mx-auto mt-5 max-w-[610px] text-sm leading-7 text-white/76">{t.ctaText}</p>
              {submitted ? (
                <div className="mx-auto mt-8 max-w-[670px] rounded-full border border-white/25 bg-white/15 px-6 py-5 text-sm font-bold backdrop-blur">{t.sent}</div>
              ) : (
                <form className="booking-pill" onSubmit={handleSubmit}>
                  <label htmlFor="booking-name" className="sr-only">{t.name}</label><input id="booking-name" type="text" value={booking.name} onChange={(event) => setBooking((current) => ({ ...current, name: event.target.value }))} placeholder={t.name} autoComplete="name" required />
                  <label htmlFor="booking-phone" className="sr-only">{t.phone}</label><input id="booking-phone" type="tel" value={booking.phone} onChange={(event) => setBooking((current) => ({ ...current, phone: event.target.value }))} placeholder={t.phone} autoComplete="tel" required />
                  <input className="form-honeypot" tabIndex={-1} aria-hidden="true" value={booking.website} onChange={(event) => setBooking((current) => ({ ...current, website: event.target.value }))} autoComplete="off" />
                  <button type="submit" disabled={submitting}>{submitting ? <span className="inline-flex items-center gap-2"><Loader2 size={17} className="spinner" /> {t.sending}</span> : t.send}</button>
                </form>
              )}
              <p className="mt-4 text-[10px] text-white/62">{t.privacy}</p>
            </div>
          </div>
          <div data-reveal className="mt-5 grid gap-5 md:grid-cols-3">
            <a href="https://go.2gis.com/h3Mcu" target="_blank" rel="noreferrer" className="contact-card group"><span className="contact-icon"><MapPin size={21} /></span><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#7A849B]">{t.address}</span><strong className="mt-2 block text-base text-[#111E61]">Комиссарова, 28</strong><span className="mt-1 block text-xs text-[#6B7489]">{t.city}</span></div><ArrowUpRight className="ml-auto text-[#3247C5] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={18} /></a>
            <a href="tel:+77001215454" className="contact-card group"><span className="contact-icon"><Phone size={21} /></span><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#7A849B]">{t.booking}</span><strong className="mt-2 block text-base text-[#111E61]">+7 700 121-54-54</strong><span className="mt-1 block text-xs text-[#6B7489]">{t.callWa}</span></div><ArrowUpRight className="ml-auto text-[#3247C5] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={18} /></a>
            <div className="contact-card"><span className="contact-icon"><Clock size={21} /></span><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#7A849B]">{t.hours}</span><strong className="mt-2 block text-base text-[#111E61]">{t.schedule}</strong><span className="mt-1 block text-xs text-[#6B7489]">{t.weekend}</span></div></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[.07] bg-[#F4F5F3] pt-20">
        <div className="site-container">
          <div className="grid gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="#top" className="flex items-center gap-3" aria-label="AKA-DENT — на главную"><span className="brand-mark"><span /><span /><span /></span><span><span className="block text-[17px] font-extrabold tracking-[.18em] text-[#111E61]">AKA-DENT</span><span className="block text-[7px] font-bold uppercase tracking-[.28em] text-[#7580A8]">стоматология</span></span></a>
              <p className="mt-5 max-w-[250px] text-sm leading-7 text-[#68747A]">{t.footerText}</p>
              <div className="mt-6 flex gap-2"><a href="https://instagram.com/akadent_stom" target="_blank" rel="noreferrer" className="social-btn" aria-label="AKA-DENT в Instagram"><Camera size={17} /></a><a href="https://go.2gis.com/h3Mcu" target="_blank" rel="noreferrer" className="social-btn" aria-label="AKA-DENT в 2GIS"><MapPin size={17} /></a><a href="https://wa.me/77001215454" target="_blank" rel="noreferrer" className="social-btn" aria-label="Написать AKA-DENT в WhatsApp"><MessageCircle size={17} /></a></div>
            </div>
            <div><h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">{t.nav[0]}</h3><div className="mt-6 flex flex-col gap-4">{services.slice(0,4).map((service) => <a key={service.id} className="footer-link" href="#services">{lang === 'kk' ? service.title_kk : service.title_ru}</a>)}</div></div>
            <div><h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">{t.clinic}</h3><div className="mt-6 flex flex-col gap-4"><a className="footer-link" href="#reviews">{t.nav[2]}</a><a className="footer-link" href="#process">{t.nav[1]}</a><a className="footer-link" href="#doctors">{t.meet}</a><a className="footer-link" href="#prices">{t.nav[3]}</a></div></div>
            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">{t.support}</h3>
              <div className="mt-6 flex flex-col gap-4 text-sm text-[#647077]">
                <a href="tel:+77001215454" className="footer-link flex items-center gap-3"><Phone size={16} className="text-[#3247C5]" /> +7 700 121-54-54</a>
                <a href="https://wa.me/77001215454" target="_blank" rel="noreferrer" className="footer-link flex items-center gap-3"><MessageCircle size={16} className="text-[#3247C5]" /> WhatsApp</a>
                <a href="/admin" className="footer-link flex items-center gap-3"><ShieldCheck size={16} className="text-[#3247C5]" /> {t.admin}</a>
                <span className="flex items-start gap-3 leading-6"><MapPin size={16} className="mt-1 shrink-0 text-[#3247C5]" /> Караганда, ул. Комиссарова, 28</span>
                <span className="flex items-center gap-3"><Clock size={16} className="text-[#3247C5]" /> Пн–Пт 09:00–19:00</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-black/[.07] py-7 text-[11px] text-[#8A9498] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 AKA-DENT · Қарағанды / Караганда</span>
            <div className="flex flex-wrap gap-5"><span>{t.disclaimer}</span><a href="/admin" className="hover:text-[#3247C5]">{t.admin}</a></div>
          </div>
        </div>
      </footer>
      <nav className="mobile-booking-dock" aria-label={lang === 'kk' ? 'Жылдам жазылу' : 'Быстрая запись'}>
        <a href="tel:+77001215454" aria-label={t.mobileCall}><Phone size={19} /><span>{t.mobileCall}</span></a>
        <a href="#booking" className="mobile-booking-main"><MessageCircle size={19} /><span>{t.book}</span></a>
      </nav>
    </main>
  );
}
