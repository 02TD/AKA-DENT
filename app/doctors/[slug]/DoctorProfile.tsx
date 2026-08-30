'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, BadgeCheck, CalendarCheck, Check, Loader2, MessageCircle, Phone, ShieldCheck, Stethoscope } from 'lucide-react';

type DoctorRecord = { slug: string; name_ru: string; name_kk: string; role_ru: string; role_kk: string; bio_ru: string; bio_kk: string; focus_ru: string; focus_kk: string; image_url: string };

export default function DoctorProfile({ doctor }: { doctor: DoctorRecord }) {
  const [lang, setLang] = useState<'ru' | 'kk'>('ru');
  const [form, setForm] = useState({ name: '', phone: '', notes: '', website: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { const saved = window.localStorage.getItem('akadent-language'); if (saved === 'kk') setLang('kk'); }, []);
  const chooseLang = (next: 'ru' | 'kk') => { setLang(next); window.localStorage.setItem('akadent-language', next); document.documentElement.lang = next; };
  const copy = lang === 'ru' ? {
    back: 'На главную', verified: 'Профиль AKA-DENT', focus: 'Основные направления', about: 'О враче', title: 'Записаться к врачу', subtitle: 'Заявка сохранится в панели клиники и откроется в WhatsApp.', name: 'Ваше имя', phone: 'Телефон', notes: 'Что вас беспокоит?', submit: 'Записаться в WhatsApp', saving: 'Сохраняем', done: 'Заявка сохранена. WhatsApp открыт.', source: 'Имя и специализация опубликованы в прайсе AKA-DENT в 2GIS.', comfort: 'Единый план лечения', comfortText: 'При необходимости врач подключает коллег по терапии, хирургии и ортопедии.',
  } : {
    back: 'Басты бетке', verified: 'AKA-DENT профилі', focus: 'Негізгі бағыттар', about: 'Дәрігер туралы', title: 'Дәрігерге жазылу', subtitle: 'Өтінім клиника панелінде сақталып, WhatsApp-та ашылады.', name: 'Атыңыз', phone: 'Телефон', notes: 'Сізді не мазалайды?', submit: 'WhatsApp арқылы жазылу', saving: 'Сақталуда', done: 'Өтінім сақталды. WhatsApp ашылды.', source: 'Дәрігердің аты мен мамандануы AKA-DENT-тің 2GIS прайсінде жарияланған.', comfort: 'Біртұтас ем жоспары', comfortText: 'Қажет болса, дәрігер терапия, хирургия және ортопедия мамандарын қосады.',
  };
  const name = lang === 'ru' ? doctor.name_ru : doctor.name_kk;
  const role = lang === 'ru' ? doctor.role_ru : doctor.role_kk;
  const bio = lang === 'ru' ? doctor.bio_ru : doctor.bio_kk;
  const focus = (lang === 'ru' ? doctor.focus_ru : doctor.focus_kk).split('·').map((item) => item.trim());

  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true);
    try {
      const response = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, doctorSlug: doctor.slug, serviceSlug: 'doctor-appointment', language: lang }) });
      const result = await response.json() as { whatsappUrl?: string };
      if (!response.ok || !result.whatsappUrl) throw new Error('save');
      setDone(true); window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
    } finally { setSubmitting(false); }
  }

  return <main className="doctor-page">
    <header className="doctor-nav"><a href="/" className="doctor-back"><ArrowLeft /> {copy.back}</a><a href="/" className="doctor-brand">AKA-DENT</a><div className="lang-switch"><button className={lang === 'ru' ? 'active' : ''} onClick={() => chooseLang('ru')}>RU</button><button className={lang === 'kk' ? 'active' : ''} onClick={() => chooseLang('kk')}>KZ</button></div></header>
    <section className="doctor-hero"><div className="doctor-photo"><img src={doctor.image_url} alt={name} loading="eager" decoding="async" /><span><BadgeCheck /> {copy.verified}</span></div><div className="doctor-intro"><div className="doctor-index">AKA / DOCTOR</div><h1>{name}</h1><p className="doctor-role">{role}</p><p className="doctor-bio">{bio}</p><div className="doctor-focus"><small>{copy.focus}</small><div>{focus.map((item) => <span key={item}><Check /> {item}</span>)}</div></div><div className="doctor-proof"><span><ShieldCheck /></span><div><strong>{copy.comfort}</strong><p>{copy.comfortText}</p></div></div><p className="doctor-source">{copy.source}</p></div></section>
    <section className="doctor-booking"><div><span className="doctor-index">ONLINE / BOOKING</span><h2>{copy.title}</h2><p>{copy.subtitle}</p><div className="doctor-contact-row"><a href="tel:+77001215454"><Phone /> +7 700 121-54-54</a><a href="https://wa.me/77001215454" target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a></div></div>{done ? <div className="doctor-done"><CalendarCheck /><strong>{copy.done}</strong><a href="/">{copy.back} <ArrowUpRight /></a></div> : <form onSubmit={submit} className="doctor-form"><input className="form-honeypot" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} tabIndex={-1} autoComplete="off" aria-hidden="true" /><label>{copy.name}<input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>{copy.phone}<input required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+7 ___ ___ __ __" /></label><label>{copy.notes}<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label><button disabled={submitting}>{submitting ? <><Loader2 className="spinner" /> {copy.saving}</> : <>{copy.submit} <ArrowUpRight /></>}</button></form>}</section>
  </main>;
}
