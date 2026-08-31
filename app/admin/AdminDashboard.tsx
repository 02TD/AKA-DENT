'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, CircleDollarSign, ExternalLink, Loader2, LogOut, MessageSquareText, RefreshCw, Save, Stethoscope, UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { appointmentServiceName, buildAppointmentInbox, type Appointment } from '@/lib/appointments';

type Service = { id: string; slug: string; title_ru: string; title_kk: string; description_ru: string; description_kk: string; price_from: number | null; price_to: number | null; active: number };
type Doctor = { slug: string; name_ru: string; name_kk: string; role_ru: string; role_kk: string; bio_ru: string; bio_kk: string; focus_ru: string; focus_kk: string; image_url: string; active: number };
type Review = { id: string; author: string; rating: number; body_ru: string; body_kk: string; source_url: string; published_at: string; active: number };
type Setting = { key: string; value_ru: string; value_kk: string };
type AdminData = { services: Service[]; doctors: Doctor[]; reviews: Review[]; settings: Setting[]; appointments: Appointment[] };

const statusLabels: Record<string, string> = { new: 'Новая', contacted: 'Связались', confirmed: 'Подтверждена', done: 'Завершена', cancelled: 'Отменена' };

function AppointmentsTable({ appointments, label, emptyText, saving, onStatusChange }: {
  appointments: Appointment[];
  label: string;
  emptyText: string;
  saving: string;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  return <div className="admin-table-wrap"><Table className="admin-table" aria-label={label}>
    <TableHeader><TableRow><TableHead>Клиент</TableHead><TableHead>Телефон</TableHead><TableHead>Запрос</TableHead><TableHead>Дата</TableHead><TableHead>Статус</TableHead></TableRow></TableHeader>
    <TableBody>{appointments.length ? appointments.map((item) => <TableRow key={item.id}>
      <TableCell><strong>{item.name}</strong><small>{item.language === 'kk' ? 'Қазақша' : 'Русский'}</small></TableCell>
      <TableCell><a href={'tel:' + item.phone}>{item.phone}</a></TableCell>
      <TableCell><span>{appointmentServiceName(item)}</span>{item.notes && <small>{item.notes}</small>}</TableCell>
      <TableCell>{new Date(item.created_at + 'Z').toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
      <TableCell><select value={item.status} disabled={Boolean(saving)} aria-label={'Статус заявки: ' + item.name} aria-busy={saving === 'appointment-' + item.id} onChange={(event) => void onStatusChange(item.id, event.target.value)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{saving === 'appointment-' + item.id && <small role="status">Сохраняем…</small>}</TableCell>
    </TableRow>) : <TableRow><TableCell colSpan={5} className="admin-empty">{emptyText}</TableCell></TableRow>}</TableBody>
  </Table></div>;
}

export default function AdminDashboard({ user }: { user: { email: string; name: string | null } }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [notice, setNotice] = useState('');
  const [loadError, setLoadError] = useState('');
  const [reviewDraft, setReviewDraft] = useState({ author: '', rating: 5, body_ru: '', body_kk: '', source_url: 'https://go.2gis.com/h3Mcu', published_at: new Date().toISOString().slice(0, 10) });

  const loadData = useCallback(async () => {
    setLoading(true); setLoadError('');
    try {
      const response = await fetch('/api/admin', { cache: 'no-store' });
      if (!response.ok) throw new Error('load');
      setData(await response.json());
    } catch { setLoadError('Не удалось загрузить данные. Нажмите «Обновить», чтобы попробовать снова.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const saveAction = useCallback(async (key: string, payload: Record<string, unknown>) => {
    setSaving(key); setNotice('');
    try {
      const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('save');
      setNotice('Изменения сохранены и уже доступны на сайте');
      return true;
    } catch { setNotice('Не удалось сохранить. Попробуйте ещё раз.'); return false; }
    finally { setSaving(''); }
  }, []);

  const newCount = useMemo(() => data?.appointments.filter((item) => item.status === 'new').length ?? 0, [data]);
  const inbox = useMemo(() => buildAppointmentInbox(data?.appointments ?? []), [data?.appointments]);

  async function updateAppointmentStatus(id: string, status: string) {
    const saved = await saveAction('appointment-' + id, { action: 'update_appointment_status', id, status });
    if (saved) setData((current) => current ? { ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, status } : item) } : current);
  }

  function patchService(id: string, patch: Partial<Service>) { setData((current) => current ? { ...current, services: current.services.map((item) => item.id === id ? { ...item, ...patch } : item) } : current); }
  function patchDoctor(slug: string, patch: Partial<Doctor>) { setData((current) => current ? { ...current, doctors: current.doctors.map((item) => item.slug === slug ? { ...item, ...patch } : item) } : current); }
  function patchSetting(key: string, patch: Partial<Setting>) { setData((current) => current ? { ...current, settings: current.settings.map((item) => item.key === key ? { ...item, ...patch } : item) } : current); }

  if (loading && !data) return <main className="admin-shell"><div className="admin-loading"><Loader2 className="spinner" /><span>Загружаем панель AKA-DENT…</span></div></main>;
  if (!data) return <main className="admin-shell"><div className="admin-loading"><p role="alert">{loadError}</p><Button variant="outline" onClick={() => void loadData()}><RefreshCw /> Обновить</Button></div></main>;

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div><div className="admin-kicker">AKA-DENT CONTROL</div><h1>Панель управления</h1><p>Сайт, цены, врачи, отзывы и записи — в одном месте.</p></div>
        <div className="admin-user"><span><strong>{user.name || 'Владелец'}</strong><small>{user.email}</small></span><a href="/" target="_blank" rel="noreferrer">Открыть сайт <ExternalLink /></a><a href="/signout-with-chatgpt?return_to=/" aria-label="Выйти"><LogOut /></a></div>
      </header>

      <section className="admin-metrics">
        <div><span className="metric-icon blue"><CalendarDays /></span><strong>{data.appointments.length}</strong><small>всего заявок</small></div>
        <div><span className="metric-icon coral"><MessageSquareText /></span><strong>{newCount}</strong><small>новых заявок</small></div>
        <div><span className="metric-icon mint"><CircleDollarSign /></span><strong>{data.services.length}</strong><small>позиций прайса</small></div>
        <div><span className="metric-icon violet"><UsersRound /></span><strong>{data.doctors.length}</strong><small>профилей врачей</small></div>
      </section>

      {notice && <div className="admin-notice"><Check /> {notice}</div>}
      {loadError && <div className="admin-load-error" role="alert">{loadError}</div>}

      <Tabs defaultValue="appointments" className="admin-tabs">
        <TabsList className="admin-tabs-list">
          <TabsTrigger value="appointments"><CalendarDays /> Заявки с сайта <Badge>{inbox.siteAppointments.length}</Badge></TabsTrigger>
          <TabsTrigger value="doctor-appointments"><Stethoscope /> Записи к врачам <Badge>{inbox.doctorAppointments.length}</Badge></TabsTrigger>
          <TabsTrigger value="prices"><CircleDollarSign /> Цены</TabsTrigger>
          <TabsTrigger value="doctors"><Stethoscope /> Врачи</TabsTrigger>
          <TabsTrigger value="reviews"><MessageSquareText /> Отзывы</TabsTrigger>
          <TabsTrigger value="content"><RefreshCw /> Контент</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="admin-panel">
          <div className="admin-panel-head"><div><span>CRM · Общие обращения</span><h2>Заявки с сайта</h2><p>Обращения без выбранного врача. Персональные записи находятся в разделе «Записи к врачам».</p></div><Button variant="outline" disabled={loading} onClick={() => void loadData()}><RefreshCw className={loading ? 'spinner' : ''} /> Обновить</Button></div>
          <AppointmentsTable appointments={inbox.siteAppointments} label="Общие заявки с сайта" emptyText="Общих заявок пока нет. Обращения с главной страницы появятся здесь." saving={saving} onStatusChange={updateAppointmentStatus} />
          {data.appointments.length >= 150 && <p className="admin-inbox-note">Показаны последние 150 заявок по всем разделам.</p>}
        </TabsContent>

        <TabsContent value="doctor-appointments" className="admin-panel">
          <div className="admin-panel-head"><div><span>CRM · Персональная запись</span><h2>Записи к врачам</h2><p>Заявки с персональных страниц сгруппированы по имени и фамилии врача.</p></div><Button variant="outline" disabled={loading} onClick={() => void loadData()}><RefreshCw className={loading ? 'spinner' : ''} /> Обновить</Button></div>
          <div className="admin-doctor-inboxes">{inbox.doctorGroups.length ? inbox.doctorGroups.map((group) => <section className="admin-doctor-inbox" key={group.slug} aria-label={'Записи: ' + group.name}>
            <header className="admin-doctor-inbox-head"><span className="metric-icon blue"><Stethoscope /></span><div><h3>{group.name}</h3><p>{group.role}</p></div><div className="admin-inbox-counts"><Badge>Всего: {group.appointments.length}</Badge><Badge>Новых: {group.newCount}</Badge></div></header>
            <AppointmentsTable appointments={group.appointments} label={'Записи к врачу: ' + group.name} emptyText="Записей пока нет." saving={saving} onStatusChange={updateAppointmentStatus} />
          </section>) : <div className="admin-empty">Записей к врачам пока нет. После отправки формы на странице врача заявка появится здесь с его именем.</div>}</div>
          {data.appointments.length >= 150 && <p className="admin-inbox-note">Показаны последние 150 заявок по всем разделам.</p>}
        </TabsContent>

        <TabsContent value="prices" className="admin-panel">
          <div className="admin-panel-head"><div><span>Прайс</span><h2>Цены и услуги</h2><p>Изменения сразу попадают в публичный прайс на главной странице.</p></div></div>
          <div className="admin-edit-grid">{data.services.map((service) => <article className="admin-edit-card" key={service.id}><div className="admin-card-title"><div><strong>{service.title_ru}</strong><small>/{service.slug}</small></div><label><input type="checkbox" checked={Boolean(service.active)} onChange={(event) => patchService(service.id, { active: event.target.checked ? 1 : 0 })} /> На сайте</label></div><div className="admin-fields two"><label>Название RU<Input value={service.title_ru} onChange={(event) => patchService(service.id, { title_ru: event.target.value })} /></label><label>Атауы KZ<Input value={service.title_kk} onChange={(event) => patchService(service.id, { title_kk: event.target.value })} /></label><label>Цена от<Input type="number" value={service.price_from ?? ''} onChange={(event) => patchService(service.id, { price_from: event.target.value ? Number(event.target.value) : null })} /></label><label>Цена до<Input type="number" value={service.price_to ?? ''} onChange={(event) => patchService(service.id, { price_to: event.target.value ? Number(event.target.value) : null })} /></label></div><div className="admin-fields two"><label>Описание RU<Textarea value={service.description_ru} onChange={(event) => patchService(service.id, { description_ru: event.target.value })} /></label><label>Сипаттама KZ<Textarea value={service.description_kk} onChange={(event) => patchService(service.id, { description_kk: event.target.value })} /></label></div><Button className="admin-save" disabled={saving === 'service-' + service.id} onClick={() => void saveAction('service-' + service.id, { action: 'update_service', ...service, active: Boolean(service.active) })}>{saving === 'service-' + service.id ? <Loader2 className="spinner" /> : <Save />} Сохранить</Button></article>)}</div>
        </TabsContent>

        <TabsContent value="doctors" className="admin-panel">
          <div className="admin-panel-head"><div><span>Команда</span><h2>Профили врачей</h2><p>Каждый профиль имеет свою публичную страницу на русском и казахском.</p></div></div>
          <div className="admin-doctor-list">{data.doctors.map((doctor) => <article className="admin-doctor-card" key={doctor.slug}><img src={doctor.image_url} alt={doctor.name_ru} /><div className="admin-doctor-form"><div className="admin-card-title"><div><strong>{doctor.name_ru}</strong><small>/doctors/{doctor.slug}</small></div><a href={'/doctors/' + doctor.slug} target="_blank" rel="noreferrer" aria-label="Открыть страницу врача"><ArrowUpRight /></a></div><div className="admin-fields two"><label>Имя RU<Input value={doctor.name_ru} onChange={(event) => patchDoctor(doctor.slug, { name_ru: event.target.value })} /></label><label>Аты KZ<Input value={doctor.name_kk} onChange={(event) => patchDoctor(doctor.slug, { name_kk: event.target.value })} /></label><label>Специализация RU<Input value={doctor.role_ru} onChange={(event) => patchDoctor(doctor.slug, { role_ru: event.target.value })} /></label><label>Мамандану KZ<Input value={doctor.role_kk} onChange={(event) => patchDoctor(doctor.slug, { role_kk: event.target.value })} /></label><label>Фокус RU<Input value={doctor.focus_ru} onChange={(event) => patchDoctor(doctor.slug, { focus_ru: event.target.value })} /></label><label>Фокус KZ<Input value={doctor.focus_kk} onChange={(event) => patchDoctor(doctor.slug, { focus_kk: event.target.value })} /></label></div><div className="admin-fields two"><label>О враче RU<Textarea value={doctor.bio_ru} onChange={(event) => patchDoctor(doctor.slug, { bio_ru: event.target.value })} /></label><label>Дәрігер туралы KZ<Textarea value={doctor.bio_kk} onChange={(event) => patchDoctor(doctor.slug, { bio_kk: event.target.value })} /></label></div><label className="admin-field-full">Путь или URL фотографии<Input value={doctor.image_url} onChange={(event) => patchDoctor(doctor.slug, { image_url: event.target.value })} /></label><Button className="admin-save" disabled={saving === 'doctor-' + doctor.slug} onClick={() => void saveAction('doctor-' + doctor.slug, { action: 'update_doctor', ...doctor, active: Boolean(doctor.active) })}>{saving === 'doctor-' + doctor.slug ? <Loader2 className="spinner" /> : <Save />} Сохранить профиль</Button></div></article>)}</div>
        </TabsContent>

        <TabsContent value="reviews" className="admin-panel">
          <div className="admin-panel-head"><div><span>Репутация</span><h2>Отзывы на сайте</h2><p>Официальный API 2GIS не отдаёт тексты отзывов. Добавьте свежий проверенный отзыв здесь — на сайте он появится автоматически.</p></div><a className="admin-source-link" href="https://go.2gis.com/h3Mcu" target="_blank" rel="noreferrer">Открыть 2GIS <ExternalLink /></a></div>
          <article className="admin-edit-card review-create"><h3>Добавить свежий отзыв</h3><div className="admin-fields two"><label>Автор<Input value={reviewDraft.author} onChange={(event) => setReviewDraft({ ...reviewDraft, author: event.target.value })} /></label><label>Дата<Input type="date" value={reviewDraft.published_at} onChange={(event) => setReviewDraft({ ...reviewDraft, published_at: event.target.value })} /></label><label>Текст RU<Textarea value={reviewDraft.body_ru} onChange={(event) => setReviewDraft({ ...reviewDraft, body_ru: event.target.value })} /></label><label>Мәтін KZ<Textarea value={reviewDraft.body_kk} onChange={(event) => setReviewDraft({ ...reviewDraft, body_kk: event.target.value })} /></label></div><Button className="admin-save" disabled={!reviewDraft.author || !reviewDraft.body_ru || saving === 'review-new'} onClick={async () => { const ok = await saveAction('review-new', { action: 'upsert_review', ...reviewDraft }); if (ok) { setReviewDraft({ ...reviewDraft, author: '', body_ru: '', body_kk: '' }); await loadData(); } }}>{saving === 'review-new' ? <Loader2 className="spinner" /> : <MessageSquareText />} Опубликовать отзыв</Button></article>
          <div className="admin-review-list">{data.reviews.map((review) => <article key={review.id}><div><strong>{review.author}</strong><span>{'★'.repeat(review.rating)}</span><time>{review.published_at}</time></div><p>{review.body_ru}</p><small>{review.body_kk}</small></article>)}</div>
        </TabsContent>

        <TabsContent value="content" className="admin-panel">
          <div className="admin-panel-head"><div><span>Контент</span><h2>Главные тексты и контакты</h2><p>Редактируйте русскую и казахскую версии независимо.</p></div></div>
          <div className="admin-edit-grid">{data.settings.map((setting) => <article className="admin-edit-card" key={setting.key}><div className="admin-card-title"><strong>{setting.key}</strong></div><div className="admin-fields two"><label>Русский<Textarea value={setting.value_ru} onChange={(event) => patchSetting(setting.key, { value_ru: event.target.value })} /></label><label>Қазақша<Textarea value={setting.value_kk} onChange={(event) => patchSetting(setting.key, { value_kk: event.target.value })} /></label></div><Button className="admin-save" disabled={saving === 'setting-' + setting.key} onClick={() => void saveAction('setting-' + setting.key, { action: 'update_setting', ...setting })}>{saving === 'setting-' + setting.key ? <Loader2 className="spinner" /> : <Save />} Сохранить</Button></article>)}</div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
