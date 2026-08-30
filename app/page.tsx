'use client';

import {
  ArrowRight, ArrowUpRight, BadgeCheck, Building, CalendarCheck, Check,
  Camera, ChevronDown, ClipboardCheck, Clock, Heart, Loader2, Mail,
  MapPin, Menu, MessageCircle, Microscope, Phone, Play, Quote, ScanLine,
  Send, ShieldCheck, Smile, Sparkles, Star, Stethoscope, X,
} from 'lucide-react';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';

const heroPhoto = '/akadent-media/clinic-01.jpg';
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
const faqs = [
  { q: 'Сколько стоит консультация?', a: 'В опубликованном прайсе 2GIS консультация стоит от 2 000 до 5 000 ₸. Точная стоимость зависит от специалиста и формата приёма — администратор уточнит её при записи.' },
  { q: 'Можно ли сразу сделать 3D-снимок?', a: 'Да. На том же адресе работает центр Aqyl-SCAN. В карточке указаны КТ зубов, ОПТГ и прицельные снимки — врач подскажет, какой формат нужен именно вам.' },
  { q: 'Когда работает клиника?', a: 'AKA-DENT принимает с понедельника по пятницу с 09:00 до 19:00, в субботу с 09:00 до 15:00. Воскресенье — выходной.' },
  { q: 'Какие способы оплаты доступны?', a: 'По данным 2GIS можно оплатить картой, наличными или QR-кодом. В отзывах пациенты также упоминают рассрочку; актуальные условия лучше уточнить у администратора.' },
  { q: 'Сколько стоит имплантация?', a: 'Опубликованная стартовая цена импланта — от 90 000 ₸. Итог зависит от снимка, системы импланта, объёма хирургии и будущей коронки.' },
  { q: 'Как подготовиться к первому визиту?', a: 'Возьмите удостоверение личности и имеющиеся снимки, если они сделаны недавно. Запишите лекарства и хронические заболевания — это поможет врачу безопасно составить план.' },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const [lineActive, setLineActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState('');
  const heroImageRef = useRef<HTMLImageElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const counterStarted = useRef(false);
  const typedWords = ['не переделывать', 'сохранить своё', 'вернуть уверенность'];

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

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      window.open('https://wa.me/77001215454?text=' + encodeURIComponent('Здравствуйте! Хочу записаться в AKA-DENT. Мой номер: ' + contact), '_blank', 'noopener,noreferrer');
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  }, [contact]);

  return (
    <main className="aurora-page">
      <header className={'site-nav ' + (scrolled ? 'scrolled' : '')}>
        <div className="site-container flex h-full items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="AKA-DENT — на главную">
            <span className="brand-mark"><span /><span /><span /></span>
            <span><span className="block text-[17px] font-extrabold tracking-[.18em] text-[#111E61]">AKA-DENT</span><span className="block text-[7px] font-bold uppercase tracking-[.28em] text-[#7580A8]">стоматология</span></span>
          </a>
          <nav className="hidden items-center gap-8 text-[13px] font-semibold lg:flex" aria-label="Основная навигация">
            <a className="nav-link" href="#services">Услуги</a><a className="nav-link" href="#process">Как мы лечим</a>
            <a className="nav-link" href="#reviews">Отзывы</a><a className="nav-link" href="#prices">Цены</a><a className="nav-link" href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="tel:+77001215454" className="hidden text-right md:block"><span className="block text-[10px] font-bold uppercase tracking-[.13em] text-[#7380A6]">Пн–Пт · 09:00–19:00</span><span className="mt-1 block text-sm font-extrabold text-[#111E61]">+7 700 121-54-54</span></a>
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
              <span className="h-2 w-2 rounded-full bg-[#3247C5] shadow-[0_0_0_5px_rgba(50,71,197,.14)]" style={{ animation: 'badge-pulse 2s infinite' }} />Стоматология полного цикла · Караганда
            </div>
            <h1 className="hero-title">
              <span className="hero-enter block" style={{ animationDelay: '100ms', animationDuration: '800ms' }}>Лечим так,</span>
              <span className="hero-enter block" style={{ animationDelay: '200ms', animationDuration: '800ms' }}>чтобы <span key={wordIndex} className="typed-word gradient-text italic">{typedWords[wordIndex]}</span></span>
            </h1>
            <p className="hero-enter mt-8 max-w-[620px] text-[clamp(17px,2vw,21px)] leading-[1.65] text-[#46506D]" style={{ animationDelay: '350ms', animationDuration: '700ms' }}>Команда AKA-DENT восстанавливает здоровье, эстетику и жевательную функцию — от 3D-диагностики до имплантации и протезирования в одном месте.</p>
            <div className="hero-actions hero-enter mt-9 flex flex-wrap gap-3" style={{ animationDelay: '500ms', animationDuration: '600ms' }}>
              <a href="https://wa.me/77001215454?text=Здравствуйте!%20Хочу%20записаться%20на%20консультацию%20в%20AKA-DENT" target="_blank" rel="noreferrer" className="primary-btn px-7 py-4 text-[13px] font-bold">Записаться в WhatsApp <ArrowUpRight size={18} /></a>
              <a href="#doctors" className="ghost-btn px-7 py-4 text-[13px] font-bold"><Play size={16} fill="currentColor" /> Познакомиться с врачами</a>
            </div>
            <div className="hero-enter mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: '650ms', animationDuration: '600ms' }}>
              <div className="avatar-stack flex">{avatars.slice(0, 4).map((src, index) => <img key={src} src={src} alt={'Пациент AKA-DENT ' + (index + 1)} loading="lazy" decoding="async" />)}</div>
              <div><div className="flex items-center gap-1 text-[#F4A629]" aria-label="Рейтинг 4,9 из 5">{[0,1,2,3,4].map((star) => <Star key={star} size={14} fill="currentColor" />)}<span className="ml-1 text-xs font-extrabold text-[#111E61]">4,9</span></div><p className="mt-1 text-xs font-semibold text-[#4A556D]"><strong className="text-[#0F0F0F]">338 оценок</strong> и 241 отзыв в 2GIS</p></div>
            </div>
          </div>
        </div>
        <div className="hero-note hidden xl:block">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#EEF1FF] text-[#3247C5]"><Clock size={19} /></span><div><div className="text-[11px] font-bold uppercase tracking-[.12em] text-[#708087]">Открыты для записи</div><div className="mt-1 text-sm font-bold">Пн–Пт · 09:00–19:00</div></div></div>
          <div className="mt-4 border-t border-black/[.07] pt-4 text-xs leading-relaxed text-[#556269]">Консультация от 2 000 ₸ · ул. Комиссарова, 28</div>
        </div>
      </section>

      <section className="border-y border-black/[.06] bg-white py-8" aria-label="Партнёры">
        <div className="site-container mb-7 text-center text-[10px] font-bold uppercase tracking-[.18em] text-[#7B858A]">В одной клинике:</div>
        <div className="marquee-mask"><div className="marquee-track">{[0,1].map((copy) => <div key={copy} className="flex">{['3D-диагностика','Имплантация','Ортопедия','Терапия','Хирургия','Пародонтология'].map((brand) => <span className="logo-name" key={copy + brand}>{brand}</span>)}</div>)}</div></div>
      </section>

      <section id="services" className="section-space">
        <div className="site-container">
          <div data-reveal className="mb-14 grid gap-7 lg:grid-cols-[1fr_.65fr] lg:items-end">
            <div><span className="eyebrow">Полный цикл</span><h2 className="section-title mt-5 max-w-[720px]">От причины — к результату</h2></div>
            <p className="max-w-[470px] text-[15px] leading-7 text-[#667178] lg:justify-self-end">Диагностика, лечение, хирургия и протезирование работают как единый маршрут. План объясняем до начала и не назначаем лишнего.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-12">
            <article data-reveal className="feature-card large lg:col-span-7" style={{ transitionDelay: '0ms' }}>
              <div className="feature-orb" /><div className="icon-box"><ScanLine size={24} /></div>
              <div className="relative mt-auto pt-16">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[.16em] text-[#3247C5]">Диагностика</span>
                <h3 className="card-title max-w-[420px]">КТ, ОПТГ и прицельный снимок</h3>
                <p className="mt-4 max-w-[520px] text-sm leading-7 text-[#647077]">Свой центр Aqyl-SCAN по тому же адресу помогает получить точную картину без поездок по городу. Врач показывает снимок и объясняет каждый этап простым языком.</p>
                <a href="#booking" className="more-link mt-6 inline-flex items-center gap-2">Подробнее <ArrowRight size={15} /></a>
              </div>
            </article>
            <div className="grid gap-5 lg:col-span-5">
              <article data-reveal className="feature-card" style={{ transitionDelay: '80ms' }}>
                <div className="icon-box"><Microscope size={24} /></div><h3 className="card-title mt-8">Терапия</h3>
                <p className="mt-3 text-sm leading-6 text-[#647077]">Лечение зубов от 25 000 ₸. По отзывам пациенты особенно ценят аккуратность, коффердам и понятные объяснения.</p>
                <a href="#booking" className="more-link mt-auto inline-flex items-center gap-2 pt-5">Подробнее <ArrowRight size={15} /></a>
              </article>
              <article data-reveal className="feature-card" style={{ transitionDelay: '160ms' }}>
                <div className="icon-box"><Heart size={24} /></div><h3 className="card-title mt-8">Хирургия</h3>
                <p className="mt-3 text-sm leading-6 text-[#647077]">Сложные случаи удаления зубов мудрости — от 20 000 ₸. Бережно, с контролем самочувствия после приёма.</p>
                <a href="#booking" className="more-link mt-auto inline-flex items-center gap-2 pt-5">Подробнее <ArrowRight size={15} /></a>
              </article>
            </div>
            <div className="grid gap-5 lg:col-span-5">
              <article data-reveal className="feature-card" style={{ transitionDelay: '240ms' }}>
                <div className="icon-box"><Smile size={24} /></div><h3 className="card-title mt-8">Ортопедия</h3>
                <p className="mt-3 text-sm leading-6 text-[#647077]">Съёмные и несъёмные протезы от 35 000 ₸, виниры — от 90 000 ₸.</p>
                <a href="#booking" className="more-link mt-auto inline-flex items-center gap-2 pt-5">Подробнее <ArrowRight size={15} /></a>
              </article>
              <article data-reveal className="feature-card" style={{ transitionDelay: '320ms' }}>
                <div className="icon-box"><ShieldCheck size={24} /></div><h3 className="card-title mt-8">Имплантация</h3>
                <p className="mt-3 text-sm leading-6 text-[#647077]">Импланты от 90 000 ₸. Восстанавливаем не только улыбку, но и полноценную жевательную функцию.</p>
                <a href="#booking" className="more-link mt-auto inline-flex items-center gap-2 pt-5">Подробнее <ArrowRight size={15} /></a>
              </article>
            </div>
            <article data-reveal className="feature-card large lg:col-span-7" style={{ transitionDelay: '400ms' }}>
              <div className="feature-orb" /><div className="icon-box"><Stethoscope size={24} /></div>
              <div className="relative mt-auto pt-16">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[.16em] text-[#3247C5]">Команда</span>
                <h3 className="card-title max-w-[430px]">Врачи одной клиники видят весь путь</h3>
                <p className="mt-4 max-w-[520px] text-sm leading-7 text-[#647077]">Терапевт, хирург, имплантолог и ортопед работают по одному плану — от сохранения зуба до восстановления прикуса.</p>
                <a href="#booking" className="more-link mt-6 inline-flex items-center gap-2">Познакомиться с командой <ArrowRight size={15} /></a>
              </div>
            </article>
          </div>
          <div id="doctors" data-reveal className="team-stage mt-20 grid overflow-hidden rounded-[32px] lg:grid-cols-12">
            <div className="relative min-h-[520px] lg:col-span-7">
              <img src="/akadent-media/clinic-04.jpg" alt="Команда врачей стоматологии AKA-DENT" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C164C]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-10">
                <div className="text-[10px] font-extrabold uppercase tracking-[.18em] text-white/68">9 фотографий сотрудников в 2GIS</div>
                <p className="display mt-3 max-w-[580px] text-[clamp(26px,4vw,44px)] font-bold leading-[1.03] tracking-[-.045em]">Не прячемся за красивыми словами. Вот наша команда.</p>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-[#111E61] p-7 text-white sm:p-10 lg:col-span-5">
              <div><span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[.13em]">Специалисты в прайсе 2GIS</span><h3 className="display mt-6 text-[clamp(28px,4vw,44px)] font-bold leading-[1.02] tracking-[-.045em]">Сильные руки.<br />Один план.</h3></div>
              <div className="mt-10 divide-y divide-white/12">
                {[['Бауржан Тайгуков','имплантолог · хирург · ортопед'],['Рустем Киздарбеков','стоматолог-ортопед'],['Мирамкуль Тайгукова','стоматолог-терапевт'],['Ермек Болигуб','стоматолог общего профиля']].map(([name,role]) => <div key={name} className="py-4"><div className="font-bold">{name}</div><div className="mt-1 text-xs text-white/55">{role}</div></div>)}
              </div>
              <a href="https://wa.me/77001215454?text=Здравствуйте!%20Помогите%20выбрать%20врача%20AKA-DENT" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center justify-between rounded-full bg-white px-6 py-4 text-sm font-extrabold text-[#111E61] transition-transform hover:-translate-y-1">Подобрать врача <ArrowUpRight size={18} /></a>
            </div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {[['/akadent-media/clinic-02.jpg','Терапия','Точность в деталях'],['/akadent-media/clinic-03.jpg','Ортопедия','Восстановление функции'],['/akadent-media/clinic-05.jpg','Команда','Специалисты рядом']].map(([src,label,title],index) => <figure data-reveal key={src} className="doctor-shot group" style={{ transitionDelay: index * 80 + 'ms' }}><img src={src} alt={title + ' в AKA-DENT'} loading="lazy" decoding="async" /><figcaption><span>{label}</span><strong>{title}</strong></figcaption></figure>)}
          </div>
        </div>
      </section>

      <section ref={statsRef} className="stats-panel py-[clamp(64px,8vw,100px)]">
        <div className="site-container relative z-10">
          <div data-reveal className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:gap-y-0">
            {stats.map((stat, index) => (
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
            <span className="eyebrow">Путь пациента</span>
            <h2 className="section-title mt-5">Сначала понимаем. Потом лечим.</h2>
            <p className="mx-auto mt-5 max-w-[560px] text-sm leading-7 text-[#667178]">Никаких решений вслепую: диагностика, понятный маршрут и лечение только после согласования.</p>
          </div>
          <div className="relative grid gap-14 md:grid-cols-3 md:gap-5">
            <svg className={'process-line ' + (lineActive ? 'active' : '')} viewBox="0 0 800 30" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="processGradient" x1="0" x2="1"><stop offset="0" stopColor="#182B82" /><stop offset="1" stopColor="#5368FF" /></linearGradient></defs>
              <path d="M0 15 C220 -8 580 38 800 15" fill="none" stroke="url(#processGradient)" strokeWidth="2" />
            </svg>
            {[
              { n: '01', icon: CalendarCheck, title: 'Консультация', text: 'Расскажите, что беспокоит. Консультация по опубликованному прайсу стоит 2 000–5 000 ₸.' },
              { n: '02', icon: ScanLine, title: '3D-диагностика', text: 'При необходимости делаем КТ, ОПТГ или прицельный снимок в Aqyl-SCAN по тому же адресу.' },
              { n: '03', icon: ClipboardCheck, title: 'План и лечение', text: 'Врач объясняет варианты и приоритеты. Вы выбираете темп — команда отвечает за согласованность этапов.' },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <article data-reveal key={step.n} className="step-card" style={{ transitionDelay: index * 150 + 'ms' }}>
                  <div className="step-badge"><Icon size={29} /></div><div className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#3247C5]">Шаг {step.n}</div>
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
            <div><span className="eyebrow">Говорят пациенты</span><h2 className="section-title mt-5">Репутация, которую можно проверить</h2></div>
            <a href="https://go.2gis.com/h3Mcu" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm font-semibold text-[#455258]"><span className="flex text-[#F4A629]">{[0,1,2,3,4].map((star) => <Star key={star} size={16} fill="currentColor" />)}</span>4,9 · 241 отзыв в 2GIS <ArrowUpRight size={15} /></a>
          </div>
          <div className="testimonials-scroll grid gap-5 md:grid-cols-2">
            <article data-reveal className="testimonial featured md:col-span-2">
              <Quote className="big-quote" size={92} fill="currentColor" />
              <div className="flex text-[#FFE285]">{[0,1,2,3,4].map((star) => <Star key={star} size={17} fill="currentColor" />)}</div>
              <blockquote className="display mt-7 max-w-[900px] text-[clamp(26px,4vw,42px)] font-medium leading-[1.08] tracking-[-.025em]">«Удаление сложного зуба мудрости прошло без боли. Всё зажило быстро, а ортопед довёл результат до идеала».</blockquote>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-white bg-white/12 font-extrabold">ОО</span>
                <div><div className="font-bold">Olga Olga</div><div className="mt-1 text-xs text-white/68">отзыв выбран клиникой · 2GIS</div></div>
                <time className="ml-auto text-xs text-white/60">4 августа 2025</time>
              </div>
            </article>
            <article data-reveal className="testimonial" style={{ transitionDelay: '80ms' }}>
              <Quote className="big-quote" size={70} fill="currentColor" /><div className="flex text-[#F59E0B]">{[0,1,2,3,4].map((star) => <Star key={star} size={15} fill="currentColor" />)}</div>
              <p className="mt-6 text-[17px] leading-8 text-[#3F4C51]">«Врач не назначает лишнего лечения, старается сохранить свои зубы и подробно объясняет каждый этап».</p>
              <div className="mt-7 flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#3247C5] bg-[#EEF1FF] font-extrabold text-[#182B82]">ГА</span>
                <div><div className="font-bold">Гульзира Акимбекова</div><div className="mt-1 text-xs text-[#788389]">отзыв пациента · 2GIS</div></div>
                <time className="ml-auto text-[11px] text-[#9AA3A7]">16 августа 2026</time>
              </div>
            </article>
            <article data-reveal className="testimonial" style={{ transitionDelay: '160ms' }}>
              <Quote className="big-quote" size={70} fill="currentColor" /><div className="flex text-[#F59E0B]">{[0,1,2,3,4].map((star) => <Star key={star} size={15} fill="currentColor" />)}</div>
              <p className="mt-6 text-[17px] leading-8 text-[#3F4C51]">«Исправили ошибки прежних клиник — всё прошло без боли и очень комфортно. Вы крутые».</p>
              <div className="mt-7 flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-[#3247C5] bg-[#EEF1FF] font-extrabold text-[#182B82]">ДЕ</span>
                <div><div className="font-bold">Дунай Еспаев</div><div className="mt-1 text-xs text-[#788389]">отзыв пациента · 2GIS</div></div>
                <time className="ml-auto text-[11px] text-[#9AA3A7]">23 апреля 2026</time>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="prices" className="section-space">
        <div className="site-container">
          <div data-reveal className="mx-auto mb-16 max-w-[760px] text-center">
            <span className="eyebrow">Открытый прайс</span><h2 className="section-title mt-5">Стоимость до визита, а не после</h2>
            <p className="mx-auto mt-5 max-w-[600px] text-sm leading-7 text-[#667178]">Показываем опубликованные в 2GIS стартовые цены. Точную сумму врач называет после диагностики — она зависит от клинической ситуации.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3"><span className="rounded-full bg-[#EEF1FF] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#263AAB]">Прайс обновлён 27 апреля 2026</span><span className="rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#5F687A]">Карта · наличные · QR</span></div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <article data-reveal className="pricing-card">
              <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EEF1FF] text-[#3247C5]"><ClipboardCheck size={23} /></span><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#899397]">Старт</span></div>
              <h3 className="card-title mt-8">Консультация</h3><p className="mt-3 min-h-12 text-sm leading-6 text-[#69757A]">Первичная оценка ситуации и выбор нужного специалиста.</p>
              <div className="mt-7 flex items-end gap-2"><span className="price">2–5 тыс.</span><span className="pb-2 text-xs text-[#7A858A]">₸</span></div>
              <ul className="mt-8 space-y-4 text-sm">{['Осмотр врача','Разбор жалоб и целей','Рекомендации по диагностике','Предварительный маршрут','Ответы на вопросы'].map((item) => <li key={item} className="flex items-start gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[#3247C5]" /> {item}</li>)}</ul>
              <a href="https://wa.me/77001215454?text=Здравствуйте!%20Хочу%20записаться%20на%20консультацию" target="_blank" rel="noreferrer" className="ghost-btn mt-auto px-6 py-4 text-sm font-bold">Записаться</a>
            </article>
            <article data-reveal className="pricing-card popular" style={{ transitionDelay: '80ms' }}>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#182B82] to-[#5368FF] px-5 py-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-white shadow-lg">Главное направление</span>
              <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#182B82] to-[#5368FF] text-white shadow-[0_10px_25px_rgba(37,99,235,.2)]"><Sparkles size={23} /></span><BadgeCheck className="text-[#3247C5]" size={24} /></div>
              <h3 className="card-title mt-8">Восстановление</h3><p className="mt-3 min-h-12 text-sm leading-6 text-[#69757A]">Возвращаем жевательную функцию и уверенность в улыбке.</p>
              <div className="mt-7 flex items-end gap-2"><span className="price gradient-text">от 35 тыс.</span><span className="pb-2 text-xs text-[#7A858A]">₸</span></div>
              <ul className="mt-8 space-y-4 text-sm">{['Протезы — от 35 000 ₸','Импланты — от 90 000 ₸','Виниры — от 90 000 ₸','Стоматолог-ортопед','Имплантолог и хирург','Единый план этапов'].map((item) => <li key={item} className="flex items-start gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[#3247C5]" /> {item}</li>)}</ul>
              <a href="https://wa.me/77001215454?text=Здравствуйте!%20Хочу%20узнать%20о%20восстановлении%20зубов" target="_blank" rel="noreferrer" className="primary-btn mt-auto px-6 py-4 text-sm font-bold">Обсудить случай <ArrowUpRight size={17} /></a>
            </article>
            <article data-reveal className="pricing-card enterprise" style={{ transitionDelay: '160ms' }}>
              <div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#A8B3FF]"><Stethoscope size={23} /></span><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/55">Лечение</span></div>
              <h3 className="card-title mt-8">Сохранение зубов</h3><p className="mt-3 min-h-12 text-sm leading-6 text-white/60">Терапия и хирургия — по показаниям, без лишних назначений.</p>
              <div className="mt-7 flex items-end gap-2"><span className="price">от 20 тыс.</span><span className="pb-2 text-xs text-white/50">₸</span></div>
              <ul className="mt-8 space-y-4 text-sm text-white/82">{['Лечение — от 25 000 ₸','Сложное удаление — от 20 000 ₸','КТ, ОПТГ, снимки','Терапевт и хирург','Цифровая стоматология','Неотложка для взрослых'].map((item) => <li key={item} className="flex items-start gap-3"><Check size={17} className="mt-0.5 shrink-0 text-[#A8B3FF]" /> {item}</li>)}</ul>
              <a href="tel:+77001215454" className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold text-[#111E61] transition-transform hover:-translate-y-1">Позвонить в клинику <Phone size={17} /></a>
            </article>
          </div>
          <p className="mt-9 text-center text-[11px] leading-5 text-[#8A9498]">Цены указаны «от» по данным 2GIS и не являются публичной офертой. Точная стоимость определяется после осмотра и диагностики.</p>
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
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-white/86 backdrop-blur"><Sparkles size={13} /> Көмектесуге дайынбыз · Готовы помочь</span>
              <h2 className="display mt-6 text-[clamp(34px,5vw,56px)] font-semibold leading-[.98] tracking-[-.04em]">Начните с разговора, а не с лечения</h2>
              <p className="mx-auto mt-5 max-w-[610px] text-sm leading-7 text-white/76">Оставьте номер — откроется WhatsApp с готовым сообщением. Администратор поможет выбрать врача и удобное время.</p>
              {submitted ? (
                <div className="mx-auto mt-8 max-w-[570px] rounded-full border border-white/25 bg-white/15 px-6 py-5 text-sm font-bold backdrop-blur">WhatsApp открыт — осталось отправить сообщение.</div>
              ) : (
                <form className="email-pill" onSubmit={handleSubmit}>
                  <label htmlFor="booking-phone" className="sr-only">Ваш номер телефона</label>
                  <input id="booking-phone" type="tel" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="+7 ___ ___ __ __" autoComplete="tel" required />
                  <button type="submit" disabled={submitting}>{submitting ? <span className="inline-flex items-center gap-2"><Loader2 size={17} className="spinner" /> Открываем</span> : 'Написать в WhatsApp'}</button>
                </form>
              )}
              <p className="mt-4 text-[10px] text-white/62">Без рассылок. Номер используется только для сообщения, которое отправляете вы.</p>
            </div>
          </div>
          <div data-reveal className="mt-5 grid gap-5 md:grid-cols-3">
            <a href="https://go.2gis.com/h3Mcu" target="_blank" rel="noreferrer" className="contact-card group"><span className="contact-icon"><MapPin size={21} /></span><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#7A849B]">Адрес</span><strong className="mt-2 block text-base text-[#111E61]">Комиссарова, 28</strong><span className="mt-1 block text-xs text-[#6B7489]">Новый город · Караганда</span></div><ArrowUpRight className="ml-auto text-[#3247C5] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={18} /></a>
            <a href="tel:+77001215454" className="contact-card group"><span className="contact-icon"><Phone size={21} /></span><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#7A849B]">Запись</span><strong className="mt-2 block text-base text-[#111E61]">+7 700 121-54-54</strong><span className="mt-1 block text-xs text-[#6B7489]">Звонок или WhatsApp</span></div><ArrowUpRight className="ml-auto text-[#3247C5] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" size={18} /></a>
            <div className="contact-card"><span className="contact-icon"><Clock size={21} /></span><div><span className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#7A849B]">График</span><strong className="mt-2 block text-base text-[#111E61]">Пн–Пт · 09:00–19:00</strong><span className="mt-1 block text-xs text-[#6B7489]">Сб 09:00–15:00 · Вс выходной</span></div></div>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/[.07] bg-[#F4F5F3] pt-20">
        <div className="site-container">
          <div className="grid gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <a href="#top" className="flex items-center gap-3" aria-label="AKA-DENT — на главную"><span className="brand-mark"><span /><span /><span /></span><span><span className="block text-[17px] font-extrabold tracking-[.18em] text-[#111E61]">AKA-DENT</span><span className="block text-[7px] font-bold uppercase tracking-[.28em] text-[#7580A8]">стоматология</span></span></a>
              <p className="mt-5 max-w-[250px] text-sm leading-7 text-[#68747A]">Стоматология полного цикла в Караганде. Лечим так, чтобы не переделывать.</p>
              <div className="mt-6 flex gap-2"><a href="https://instagram.com/akadent_stom" target="_blank" rel="noreferrer" className="social-btn" aria-label="AKA-DENT в Instagram"><Camera size={17} /></a><a href="https://go.2gis.com/h3Mcu" target="_blank" rel="noreferrer" className="social-btn" aria-label="AKA-DENT в 2GIS"><MapPin size={17} /></a><a href="https://wa.me/77001215454" target="_blank" rel="noreferrer" className="social-btn" aria-label="Написать AKA-DENT в WhatsApp"><MessageCircle size={17} /></a></div>
            </div>
            <div><h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">Услуги</h3><div className="mt-6 flex flex-col gap-4"><a className="footer-link" href="#services">Лечение</a><a className="footer-link" href="#services">Имплантация</a><a className="footer-link" href="#services">Протезирование</a><a className="footer-link" href="#services">3D-диагностика</a></div></div>
            <div><h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">О клинике</h3><div className="mt-6 flex flex-col gap-4"><a className="footer-link" href="#reviews">Отзывы</a><a className="footer-link" href="#process">Как проходит приём</a><a className="footer-link" href="#doctors">Врачи</a><a className="footer-link" href="#prices">Цены</a></div></div>
            <div>
              <h3 className="text-[11px] font-extrabold uppercase tracking-[.14em]">Поддержка</h3>
              <div className="mt-6 flex flex-col gap-4 text-sm text-[#647077]">
                <a href="tel:+77001215454" className="footer-link flex items-center gap-3"><Phone size={16} className="text-[#3247C5]" /> +7 700 121-54-54</a>
                <a href="https://wa.me/77001215454" target="_blank" rel="noreferrer" className="footer-link flex items-center gap-3"><MessageCircle size={16} className="text-[#3247C5]" /> WhatsApp</a>
                <span className="flex items-start gap-3 leading-6"><MapPin size={16} className="mt-1 shrink-0 text-[#3247C5]" /> Караганда, ул. Комиссарова, 28</span>
                <span className="flex items-center gap-3"><Clock size={16} className="text-[#3247C5]" /> Пн–Пт 09:00–19:00</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-black/[.07] py-7 text-[11px] text-[#8A9498] sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Стоматологический центр AKA-DENT. Караганда.</span>
            <div className="flex flex-wrap gap-5"><span>Информация на сайте не заменяет консультацию врача</span><a href="#faq" className="hover:text-[#3247C5]">Вопросы и ответы</a></div>
          </div>
        </div>
      </footer>
    </main>
  );
}
