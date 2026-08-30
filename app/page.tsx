'use client';

import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building, CalendarCheck, Check,
  Camera, ChevronDown, ClipboardCheck, Clock, Heart, Loader2, Mail,
  MapPin, Menu, MessageCircle, Microscope, Phone, Play, Quote, ScanLine,
  Send, ShieldCheck, Smile, Sparkles, Star, Stethoscope, X,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';

const heroPhoto = 'https://images.unsplash.com/photo-1777331903190-341a3dd0441b?auto=format&fit=crop&w=1920&q=90';
const avatars = [
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=160&q=90',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=90',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=90',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=90',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=90',
];
const stats = [
  { value: 4200, suffix: '+', label: 'пациентов доверяют нам', trend: '+18% за год' },
  { value: 97, suffix: '%', label: 'рекомендуют близким', trend: 'NPS 76' },
  { value: 14, suffix: ' лет', label: 'средний стаж врачей', trend: '12 специалистов' },
  { value: 38, suffix: ' мин', label: 'занимает диагностика', trend: 'всё за 1 визит' },
];
const faqs = [
  { q: 'Мне очень страшно лечить зубы. Вы сможете помочь?', a: 'Да. Первый визит можно провести только как знакомство: без лечения и давления. Врач объяснит каждый шаг, согласует стоп-сигнал, а при необходимости мы предложим седацию под контролем анестезиолога.' },
  { q: 'Сколько стоит первичная диагностика?', a: 'Комплексная консультация с 3D-снимком, фотопротоколом и письменным планом стоит 3 900 ₽. Если начинаете лечение в течение 30 дней, эта сумма засчитывается в его стоимость.' },
  { q: 'Можно ли лечить зубы в рассрочку?', a: 'Да, для планов от 30 000 ₽ доступна внутренняя рассрочка на 3 месяца без процентов и банковская — до 24 месяцев. График фиксируем до начала лечения.' },
  { q: 'Вы лечите детей?', a: 'Принимаем детей с 4 лет. Детский врач использует адаптационные визиты, игровые объяснения и бережную анестезию. Родитель может находиться рядом всё время.' },
  { q: 'Какая гарантия на лечение?', a: 'На пломбы — до 2 лет, на коронки — до 5 лет, на импланты — пожизненная гарантия производителя. Срок действует при соблюдении персонального графика профилактики.' },
  { q: 'Что взять с собой на первый приём?', a: 'Только паспорт. Если есть недавние снимки, выписки или список лекарств — возьмите их, но это необязательно. Анкету можно заполнить онлайн заранее.' },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [lineActive, setLineActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const counterStarted = useRef(false);
  const typedWords = ['спокойно', 'точно', 'бережно'];

  useEffect(() => {
    const interval = window.setInterval(() => setWordIndex((current) => (current + 1) % typedWords.length), 2200);
    return () => window.clearInterval(interval);
  }, []);
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
        setCounts(stats.map((stat) => Math.round(stat.value * eased)));
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

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 1200);
  }, []);
  const price = (monthly: number, yearly: number) => new Intl.NumberFormat('ru-RU').format(annual ? yearly : monthly);

  return (
    <main className="aurora-page">
      <header className={'site-nav ' + (scrolled ? 'scrolled' : '')}>
        <div className="site-container flex h-full items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="АВРОРА — на главную">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#0EA5A4] to-[#2563EB] text-white shadow-[0_8px_22px_rgba(37,99,235,.22)]"><Sparkles size={18} aria-hidden="true" /></span>
            <span className="text-[15px] font-bold tracking-[.24em]">АВРОРА</span>
          </a>
          <nav className="hidden items-center gap-8 text-[13px] font-semibold lg:flex" aria-label="Основная навигация">
            <a className="nav-link" href="#services">Услуги</a><a className="nav-link" href="#process">Как мы лечим</a>
            <a className="nav-link" href="#reviews">Отзывы</a><a className="nav-link" href="#prices">Цены</a><a className="nav-link" href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#booking" className="primary-btn hidden px-5 py-3 text-[12px] font-bold sm:inline-flex">Записаться <ArrowUpRight size={15} aria-hidden="true" /></a>
            <button type="button" onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white/60 lg:hidden" aria-label="Открыть меню" aria-expanded={menuOpen}><Menu size={19} /></button>
          </div>
        </div>
      </header>

      <div className={'mobile-layer ' + (menuOpen ? 'open' : '')} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen}>
        <div className="mobile-drawer" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-black/10" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню"><X size={19} /></button>
          <div className="display mb-9 text-4xl font-semibold">Меню</div>
          <nav className="flex flex-col gap-1 text-xl font-semibold" aria-label="Мобильная навигация">
            {[['Услуги', '#services'], ['Как мы лечим', '#process'], ['Отзывы', '#reviews'], ['Цены', '#prices'], ['Вопросы и ответы', '#faq']].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between border-b border-black/[.07] py-4">{label}<ArrowUpRight size={18} /></a>
            ))}
          </nav>
          <a href="tel:+74951234567" className="mt-10 flex items-center gap-3 text-sm text-[#4B5563]"><Phone size={17} className="text-[#0EA5A4]" /> +7 (495) 123-45-67</a>
        </div>
      </div>

      <section id="top" className="hero">
        <div className="hero-photo-wrap"><img ref={heroImageRef} src={heroPhoto} alt="Стоматолог беседует с пациентом в современной светлой клинике" loading="lazy" decoding="async" className="hero-photo" /></div>
        <div className="hero-blob left-[-100px] top-[22%] h-[320px] w-[320px] bg-[#0EA5A4]/15 blur-2xl" />
        <div className="hero-blob right-[8%] top-[20%] h-[170px] w-[170px] border border-white/50 bg-[#2563EB]/10 backdrop-blur-sm" style={{ animationDelay: '-2s' }} />
        <div className="site-container hero-content">
          <div className="max-w-[910px]">
            <div className="hero-enter mb-7 inline-flex items-center gap-2 rounded-full border border-[#0EA5A4]/20 bg-white/70 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#0B7373] shadow-sm backdrop-blur" style={{ animationDelay: '0ms', animationDuration: '600ms' }}>
              <span className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_0_5px_rgba(16,185,129,.14)]" style={{ animation: 'badge-pulse 2s infinite' }} />Новые улыбки начинаются спокойно
            </div>
            <h1 className="hero-title">
              <span className="hero-enter block" style={{ animationDelay: '100ms', animationDuration: '800ms' }}>Стоматология,</span>
              <span className="hero-enter block" style={{ animationDelay: '200ms', animationDuration: '800ms' }}>где лечат <span key={wordIndex} className="typed-word gradient-text italic">{typedWords[wordIndex]}</span></span>
            </h1>
            <p className="hero-enter mt-8 max-w-[640px] text-[clamp(17px,2vw,21px)] leading-[1.65] text-[#4B5563]" style={{ animationDelay: '350ms', animationDuration: '700ms' }}>Диагностика за один визит, понятный план лечения и врачи, которые сначала слушают. Без боли, спешки и неожиданных счетов.</p>
            <div className="hero-actions hero-enter mt-9 flex flex-wrap gap-3" style={{ animationDelay: '500ms', animationDuration: '600ms' }}>
              <a href="#booking" className="primary-btn px-7 py-4 text-[13px] font-bold">Получить план лечения <ArrowUpRight size={18} /></a>
              <a href="#services" className="ghost-btn px-7 py-4 text-[13px] font-bold"><Play size={16} fill="currentColor" /> Посмотреть услуги</a>
            </div>
            <div className="hero-enter mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: '650ms', animationDuration: '600ms' }}>
              <div className="avatar-stack flex">{avatars.slice(0, 4).map((src, index) => <img key={src} src={src} alt={'Пациент клиники ' + (index + 1)} loading="lazy" decoding="async" />)}</div>
              <div><div className="flex items-center gap-1 text-[#F59E0B]" aria-label="Рейтинг 5 из 5">{[0,1,2,3,4].map((star) => <Star key={star} size={14} fill="currentColor" />)}</div><p className="mt-1 text-xs font-semibold text-[#3C474C]"><strong className="text-[#0F0F0F]">4200+ клиентов</strong> уже выбрали нас</p></div>
            </div>
          </div>
        </div>
        <div className="hero-note hidden xl:block">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#E7F7F5] text-[#0A8B89]"><Clock size={19} /></span><div><div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#708087]">Ближайшее окно</div><div className="mt-1 text-sm font-bold">Сегодня, 17:30</div></div></div>
          <div className="mt-4 border-t border-black/[.07] pt-4 text-xs leading-relaxed text-[#556269]">Диагностика + 3D-снимок за 3 900 ₽</div>
        </div>
      </section>

      <section className="border-y border-black/[.06] bg-white py-8" aria-label="Партнёры">
        <div className="site-container mb-7 text-center text-[10px] font-bold uppercase tracking-[.18em] text-[#7B858A]">Нам доверяют:</div>
        <div className="marquee-mask"><div className="marquee-track">{[0,1].map((copy) => <div key={copy} className="flex">{['Nobel Biocare','Straumann','Align','Planmeca','Leica','Curaprox'].map((brand) => <span className="logo-name" key={copy + brand}>{brand}</span>)}</div>)}</div></div>
      </section>

      <section id="services" className="section-space">
        <div className="site-container">
          <div data-reveal className="mb-14 grid gap-7 lg:grid-cols-[1fr_.65fr] lg:items-end">
            <div><span className="eyebrow">Точная стоматология</span><h2 className="section-title mt-5 max-w-[720px]">Современное лечение — без лишнего</h2></div>
            <p className="max-w-[470px] text-[15px] leading-7 text-[#667178] lg:justify-self-end">Соединяем цифровую диагностику, сильную врачебную команду и заботливый сервис, чтобы каждый визит был предсказуемым.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-12">
            <article data-reveal className="feature-card large lg:col-span-7" style={{ transitionDelay: '0ms' }}>
              <div className="feature-orb" /><div className="icon-box"><ScanLine size={24} /></div>
              <div className="relative mt-auto pt-16">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[.16em] text-[#0A8887]">Диагностика</span>
                <h3 className="card-title max-w-[420px]">Видим всю картину за 45 минут</h3>
                <p className="mt-4 max-w-[520px] text-sm leading-7 text-[#647077]">КТ, интраоральный скан и фотопротокол без слепков. На экране покажем проблему и 2–3 сценария лечения с точной сметой.</p>
                <a href="#booking" className="more-link mt-6 inline-flex items-center gap-2">Подробнее <ArrowRight size={15} /></a>
              </div>
            </article>
            <div className="grid gap-5 lg:col-span-5">
              <article data-reveal className="feature-card" style={{ transitionDelay: '80ms' }}>
                <div className="icon-box"><Microscope size={24} /></div><h3 className="card-title mt-8">Лечение под микроскопом</h3>
                <p className="mt-3 text-sm leading-6 text-[#647077]">Увеличение до ×25 помогает сохранить больше здоровых тканей.</p>
                <a href="#booking" className="more-link mt-auto inline-flex items-center gap-2 pt-5">Подробнее <ArrowRight size={15} /></a>
              </article>
              <article data-reveal className="feature-card" style={{ transitionDelay: '160ms' }}>
                <div className="icon-box"><Heart size={24} /></div><h3 className="card-title mt-8">Антистресс-протокол</h3>
                <p className="mt-3 text-sm leading-6 text-[#647077]">Стоп-сигнал, бесшумные наушники и седация, когда она действительно нужна.</p>
                <a href="#booking" className="more-link mt-auto inline-flex items-center gap-2 pt-5">Подробнее <ArrowRight size={15} /></a>
              </article>
            </div>
            <div className="grid gap-5 lg:col-span-5">
              <article data-reveal className="feature-card" style={{ transitionDelay: '240ms' }}>
                <div className="icon-box"><Smile size={24} /></div><h3 className="card-title mt-8">Элайнеры и эстетика</h3>
                <p className="mt-3 text-sm leading-6 text-[#647077]">Цифровой прогноз улыбки до начала коррекции.</p>
                <a href="#booking" className="more-link mt-auto inline-flex items-center gap-2 pt-5">Подробнее <ArrowRight size={15} /></a>
              </article>
              <article data-reveal className="feature-card" style={{ transitionDelay: '320ms' }}>
                <div className="icon-box"><ShieldCheck size={24} /></div><h3 className="card-title mt-8">Имплантация с навигацией</h3>
                <p className="mt-3 text-sm leading-6 text-[#647077]">Точный шаблон, малотравматичная установка и паспорт импланта.</p>
                <a href="#booking" className="more-link mt-auto inline-flex items-center gap-2 pt-5">Подробнее <ArrowRight size={15} /></a>
              </article>
            </div>
            <article data-reveal className="feature-card large lg:col-span-7" style={{ transitionDelay: '400ms' }}>
              <div className="feature-orb" /><div className="icon-box"><Stethoscope size={24} /></div>
              <div className="relative mt-auto pt-16">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[.16em] text-[#0A8887]">Команда</span>
                <h3 className="card-title max-w-[430px]">Один куратор на всём пути</h3>
                <p className="mt-4 max-w-[520px] text-sm leading-7 text-[#647077]">Терапевт, хирург и ортодонт работают по единому цифровому плану. Куратор координирует визиты и всегда на связи в мессенджере.</p>
                <a href="#booking" className="more-link mt-6 inline-flex items-center gap-2">Познакомиться с командой <ArrowRight size={15} /></a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section ref={statsRef} className="stats-panel py-[clamp(64px,8vw,100px)]">
        <div className="site-container relative z-10">
          <div data-reveal className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-y-0">
            {stats.map((stat, index) => (
              <div className="stat-item" key={stat.label}>
                <div className="stat-number">{counts[index].toLocaleString('ru-RU')}{stat.suffix}</div>
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
            <span className="eyebrow">Как всё устроено</span>
            <h2 className="section-title mt-5">От тревоги к ясному плану — за 3 шага</h2>
            <p className="mx-auto mt-5 max-w-[560px] text-sm leading-7 text-[#667178]">Никаких решений вслепую. Сначала видим, затем обсуждаем, и только потом начинаем лечение.</p>
          </div>
          <div className="relative grid gap-14 md:grid-cols-3 md:gap-5">
            <svg className={'process-line ' + (lineActive ? 'active' : '')} viewBox="0 0 800 30" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="processGradient" x1="0" x2="1"><stop offset="0" stopColor="#0EA5A4" /><stop offset="1" stopColor="#2563EB" /></linearGradient></defs>
              <path d="M0 15 C220 -8 580 38 800 15" fill="none" stroke="url(#processGradient)" strokeWidth="2" />
            </svg>
            {[
              { n: '01', icon: CalendarCheck, title: 'Знакомимся', text: 'Вы рассказываете, что беспокоит. Врач проводит бережный осмотр и уточняет ваши ожидания.' },
              { n: '02', icon: ScanLine, title: 'Диагностируем', text: 'Делаем 3D-снимок и сканирование, показываем всё на экране простым языком.' },
              { n: '03', icon: ClipboardCheck, title: 'Планируем', text: 'Получаете варианты, фиксированную смету и удобный график. Начинаем только после вашего согласия.' },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <article data-reveal key={step.n} className="step-card" style={{ transitionDelay: index * 150 + 'ms' }}>
                  <div className="step-badge"><Icon size={29} /></div><div className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#0A8887]">Шаг {step.n}</div>
                  <h3 className="card-title mt-4">{step.title}</h3><p className="mx-auto mt-4 max-w-[310px] text-sm leading-7 text-[#667178]">{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="reviews" className="section-space bg-[#F1F7F6]">
        <div className="site-container">
          <div data-reveal className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div><span className="eyebrow">Истории пациентов</span><h2 className="section-title mt-5">Результат, который ощущается</h2></div>
            <div className="flex items-center gap-3 text-sm font-semibold text-[#455258]"><span className="flex text-[#F59E0B]">{[0,1,2,3,4].map((star) => <Star key={star} size={16} fill="currentColor" />)}</span>4,9 на Яндекс Картах</div>
          </div>
          <div className="testimonials-scroll grid gap-5 md:grid-cols-2">
            <article data-reveal className="testimonial featured md:col-span-2">
              <Quote className="big-quote" size={92} fill="currentColor" />
              <div className="flex text-[#FFE285]">{[0,1,2,3,4].map((star) => <Star key={star} size={17} fill="currentColor" />)}</div>
              <blockquote className="display mt-7 max-w-[900px] text-[clamp(26px,4vw,42px)] font-medium leading-[1.08] tracking-[-.025em]">«Впервые я не хотела сбежать из кресла. Доктор показывал каждый этап, а куратор написал вечером и спросил о самочувствии. За четыре визита сделали то, что я откладывала пять лет».</blockquote>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <img src={avatars[0]} alt="Анна Ковалева" loading="lazy" decoding="async" className="testimonial-avatar" />
                <div><div className="font-bold">Анна Ковалева</div><div className="mt-1 text-xs text-white/68">Арт-директор · Sreda Studio</div></div>
                <time className="ml-auto text-xs text-white/60">12 мая 2026</time>
              </div>
            </article>
            <article data-reveal className="testimonial" style={{ transitionDelay: '80ms' }}>
              <Quote className="big-quote" size={70} fill="currentColor" /><div className="flex text-[#F59E0B]">{[0,1,2,3,4].map((star) => <Star key={star} size={15} fill="currentColor" />)}</div>
              <p className="mt-6 text-[17px] leading-8 text-[#3F4C51]">«Показали будущую улыбку ещё до установки элайнеров. Смета не изменилась ни на рубль, а встречи всегда начинались вовремя — для меня это редкость и огромный плюс».</p>
              <div className="mt-7 flex items-center gap-4">
                <img src={avatars[1]} alt="Михаил Орлов" loading="lazy" decoding="async" className="testimonial-avatar" />
                <div><div className="font-bold">Михаил Орлов</div><div className="mt-1 text-xs text-[#788389]">Product Lead · Northline</div></div>
                <time className="ml-auto text-[11px] text-[#9AA3A7]">28 апреля 2026</time>
              </div>
            </article>
            <article data-reveal className="testimonial" style={{ transitionDelay: '160ms' }}>
              <Quote className="big-quote" size={70} fill="currentColor" /><div className="flex text-[#F59E0B]">{[0,1,2,3,4].map((star) => <Star key={star} size={15} fill="currentColor" />)}</div>
              <p className="mt-6 text-[17px] leading-8 text-[#3F4C51]">«Привела сына после неудачного опыта в другой клинике. Первый приём был просто знакомством, без уговоров. Теперь он сам напоминает, когда пора на профилактику».</p>
              <div className="mt-7 flex items-center gap-4">
                <img src={avatars[2]} alt="Елена Романова" loading="lazy" decoding="async" className="testimonial-avatar" />
                <div><div className="font-bold">Елена Романова</div><div className="mt-1 text-xs text-[#788389]">Основатель · Mellow Kids</div></div>
                <time className="ml-auto text-[11px] text-[#9AA3A7]">7 апреля 2026</time>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="prices" className="section-space">
        <div className="site-container">
          <div data-reveal className="mx-auto mb-16 max-w-[760px] text-center">
            <span className="eyebrow">Программы заботы</span><h2 className="section-title mt-5">Профилактика выгоднее лечения</h2>
            <p className="mx-auto mt-5 max-w-[540px] text-sm leading-7 text-[#667178]">Подписка на регулярную заботу о здоровье зубов. Лечение по необходимости оплачивается отдельно со скидкой программы.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className={'toggle ' + (annual ? 'annual' : '')}>
                <button type="button" onClick={() => setAnnual(false)} aria-pressed={!annual}>Месяц</button><button type="button" onClick={() => setAnnual(true)} aria-pressed={annual}>Год</button>
              </div>
              <span className="rounded-full bg-[#DDF7F5] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#087F7E]">Скидка 20%</span>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <article data-reveal className="pricing-card">
              <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF4F3] text-[#087F7E]"><Smile size={23} /></span><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#899397]">Базовый</span></div>
              <h3 className="card-title mt-8">Базовый</h3><p className="mt-3 min-h-12 text-sm leading-6 text-[#69757A]">Для уверенной профилактики без лишнего.</p>
              <div className="mt-7 flex items-end gap-2"><span className="price">{price(2490, 1990)} ₽</span><span className="pb-2 text-xs text-[#7A858A]">/мес.</span></div>
              <ul className="mt-8 space-y-4 text-sm">
                {[[true,'2 профессиональные чистки в год'],[true,'2 контрольных осмотра'],[true,'Прицельные снимки по показаниям'],[true,'Скидка 5% на лечение'],[false,'3D-диагностика'],[false,'Семейный доступ']].map(([enabled,text]) => (
                  <li key={String(text)} className={'flex items-start gap-3 ' + (!enabled ? 'text-[#A6AEB1] line-through' : '')}>{enabled ? <Check size={17} className="mt-0.5 shrink-0 text-[#0EA5A4]" /> : <X size={17} className="mt-0.5 shrink-0" />} {text}</li>
                ))}
              </ul>
              <a href="#booking" className="ghost-btn mt-auto px-6 py-4 text-sm font-bold">Выбрать Базовый</a>
            </article>
            <article data-reveal className="pricing-card popular" style={{ transitionDelay: '80ms' }}>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#0EA5A4] to-[#2563EB] px-5 py-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-white shadow-lg">Популярный выбор</span>
              <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0EA5A4] to-[#2563EB] text-white shadow-[0_10px_25px_rgba(37,99,235,.2)]"><Sparkles size={23} /></span><BadgeCheck className="text-[#0EA5A4]" size={24} /></div>
              <h3 className="card-title mt-8">Популярный</h3><p className="mt-3 min-h-12 text-sm leading-6 text-[#69757A]">Максимум контроля для здоровой улыбки.</p>
              <div className="mt-7 flex items-end gap-2"><span className="price gradient-text">{price(4990, 3990)} ₽</span><span className="pb-2 text-xs text-[#7A858A]">/мес.</span></div>
              <ul className="mt-8 space-y-4 text-sm">{['3 профессиональные чистки в год','3 осмотра и фотопротокол','1 комплексная 3D-диагностика','Скидка 10% на лечение','Приоритетная запись','Чат с куратором 7 дней в неделю'].map((item) => <li key={item} className="flex items-start gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[#0EA5A4]" /> {item}</li>)}</ul>
              <a href="#booking" className="primary-btn mt-auto px-6 py-4 text-sm font-bold">Выбрать Популярный <ArrowUpRight size={17} /></a>
            </article>
            <article data-reveal className="pricing-card enterprise" style={{ transitionDelay: '160ms' }}>
              <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#7DE2D8]"><Building size={23} /></span><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/55">Энтерпрайз</span></div>
              <h3 className="card-title mt-8">Энтерпрайз</h3><p className="mt-3 min-h-12 text-sm leading-6 text-white/60">Корпоративная забота для команды от 15 человек.</p>
              <div className="mt-7 flex items-end gap-2"><span className="price">от {price(24900, 19900)} ₽</span><span className="pb-2 text-xs text-white/50">/мес.</span></div>
              <ul className="mt-8 space-y-4 text-sm text-white/82">{['Всё из тарифа «Популярный»','Персональный менеджер','Выездные скрининги в офисе','Единый корпоративный счёт','Отчёт для HR без медданных','Гибкая программа льгот'].map((item) => <li key={item} className="flex items-start gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[#70DCD4]" /> {item}</li>)}</ul>
              <a href="#booking" className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-[#0F171A] transition-transform hover:-translate-y-1">Обсудить программу <ArrowUpRight size={17} /></a>
            </article>
          </div>
          <p className="mt-9 text-center text-[11px] leading-5 text-[#8A9498]">При оплате за год сумма списывается одним платежом. Медицинские услуги оказываются при отсутствии противопоказаний.</p>
        </div>
      </section>

      <section id="faq" className="section-space bg-white">
        <div className="site-container">
          <div data-reveal className="mb-14 grid gap-7 lg:grid-cols-[.75fr_1fr] lg:items-end">
            <div><span className="eyebrow">Частые вопросы</span><h2 className="section-title mt-5">Честно о важном</h2></div>
            <p className="max-w-[520px] text-sm leading-7 text-[#667178]">Если не нашли ответ — напишите куратору. Он подскажет без медицинского канцелярита и навязчивых звонков.</p>
          </div>
          <div className="grid items-start gap-4 lg:grid-cols-2">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article key={faq.q} data-reveal className={'faq-item ' + (isOpen ? 'open' : '')} style={{ transitionDelay: (index % 2) * 80 + 'ms' }}>
                  <button type="button" className="flex w-full items-center justify-between gap-5 bg-transparent px-5 py-5 text-left text-sm font-bold" onClick={() => setOpenFaq(isOpen ? null : index)} aria-expanded={isOpen}>
                    <span>{faq.q}</span><span className="chevron grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#0A8887] shadow-sm"><ChevronDown size={17} /></span>
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
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-white/86 backdrop-blur"><Sparkles size={13} /> Первый шаг — без обязательств</span>
              <h2 className="display mt-6 text-[clamp(34px,5vw,56px)] font-semibold leading-[.98] tracking-[-.04em]">Получите понятный план лечения за один визит</h2>
              <p className="mx-auto mt-5 max-w-[610px] text-sm leading-7 text-white/76">Оставьте email — куратор пришлёт свободные окна, список врачей и подготовку к диагностике. Без звонка, если вам так комфортнее.</p>
              {submitted ? (
                <div className="mx-auto mt-8 max-w-[570px] rounded-full border border-white/25 bg-white/15 px-6 py-5 text-sm font-bold backdrop-blur">Готово! Письмо с вариантами времени уже в пути.</div>
              ) : (
                <form className="email-pill" onSubmit={handleSubmit}>
                  <label htmlFor="booking-email" className="sr-only">Ваш email</label>
                  <input id="booking-email" type="email" placeholder="name@email.ru" autoComplete="email" required />
                  <button type="submit" disabled={submitting}>{submitting ? <span className="inline-flex items-center gap-2"><Loader2 size={17} className="spinner" /> Отправляем</span> : 'Подобрать время'}</button>
                </form>
              )}
              <p className="mt-4 text-[10px] text-white/62">Без спама. Отписка в 1 клик.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[.07] bg-[#F4F5F3] pt-20">
        <div className="site-container">
          <div className="grid gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="#top" className="flex items-center gap-3" aria-label="АВРОРА — на главную"><span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#0EA5A4] to-[#2563EB] text-white"><Sparkles size={18} /></span><span className="text-[15px] font-bold tracking-[.24em]">АВРОРА</span></a>
              <p className="mt-5 max-w-[250px] text-sm leading-7 text-[#68747A]">Стоматология, где ясность и забота — часть лечения.</p>
              <div className="mt-6 flex gap-2"><a href="#" className="social-btn" aria-label="Фотографии АВРОРЫ"><Camera size={17} /></a><a href="#" className="social-btn" aria-label="АВРОРА в Telegram"><Send size={17} /></a><a href="#" className="social-btn" aria-label="Написать АВРОРЕ"><MessageCircle size={17} /></a></div>
            </div>
            <div><h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">Продукт</h3><div className="mt-6 flex flex-col gap-4"><a className="footer-link" href="#services">Лечение</a><a className="footer-link" href="#services">Имплантация</a><a className="footer-link" href="#services">Ортодонтия</a><a className="footer-link" href="#prices">Программы заботы</a></div></div>
            <div><h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">Компания</h3><div className="mt-6 flex flex-col gap-4"><a className="footer-link" href="#reviews">Отзывы</a><a className="footer-link" href="#process">Подход</a><a className="footer-link" href="#">Врачи</a><a className="footer-link" href="#">Вакансии</a></div></div>
            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">Поддержка</h3>
              <div className="mt-6 flex flex-col gap-4 text-sm text-[#647077]">
                <a href="tel:+74951234567" className="footer-link flex items-center gap-3"><Phone size={16} className="text-[#0EA5A4]" /> +7 (495) 123-45-67</a>
                <a href="mailto:hello@aurora-dental.ru" className="footer-link flex items-center gap-3"><Mail size={16} className="text-[#0EA5A4]" /> hello@aurora-dental.ru</a>
                <span className="flex items-start gap-3 leading-6"><MapPin size={16} className="mt-1 shrink-0 text-[#0EA5A4]" /> Москва, Ходынский бульвар, 20А</span>
                <span className="flex items-center gap-3"><Clock size={16} className="text-[#0EA5A4]" /> Ежедневно 09:00–21:00</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-black/[.07] py-7 text-[11px] text-[#8A9498] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Стоматология «АВРОРА». Лицензия Л041-01137-77/01234567.</span>
            <div className="flex flex-wrap gap-5"><a href="#" className="hover:text-[#0EA5A4]">Политика конфиденциальности</a><a href="#" className="hover:text-[#0EA5A4]">Правовая информация</a></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
