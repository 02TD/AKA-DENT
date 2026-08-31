import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { ADMIN_APPOINTMENTS_QUERY, appointmentServiceName, buildAppointmentInbox } from '../lib/appointments.ts';
import { schemaStatements } from '../db/schema.ts';

function appointment(id, overrides = {}) {
  return { id, name: 'Тестовый пациент', phone: '0000000000', service_slug: '', doctor_slug: '', language: 'ru', notes: '', status: 'new', created_at: '2026-08-31 10:00:00', ...overrides };
}

test('separates general and doctor requests without losing or duplicating records', () => {
  const rows = [
    appointment('general'),
    appointment('first', { doctor_slug: 'doctor-a', doctor_name_ru: 'Доктор Тестов' }),
    appointment('second', { doctor_slug: 'doctor-a', doctor_name_ru: 'Доктор Тестов', status: 'done' }),
    appointment('unknown', { doctor_slug: 'removed-doctor' }),
    appointment('unassigned', { service_slug: 'doctor-appointment' }),
  ];
  const inbox = buildAppointmentInbox(rows);
  assert.deepEqual(inbox.siteAppointments.map((row) => row.id), ['general']);
  assert.equal(inbox.doctorAppointments.length, 4);
  assert.equal(inbox.doctorGroups.length, 3);
  assert.equal(inbox.doctorGroups[0].name, 'Доктор Тестов');
  assert.equal(inbox.doctorGroups[0].newCount, 1);
  assert.equal(inbox.doctorGroups[0].appointments.length, 2);
  assert.equal(inbox.doctorGroups[1].name, 'Врач не найден');
  assert.equal(inbox.doctorGroups[2].name, 'Врач не указан');
  assert.deepEqual([...inbox.siteAppointments, ...inbox.doctorAppointments].map((row) => row.id).sort(), rows.map((row) => row.id).sort());
});

test('uses Kazakh profile names as a fallback and tolerates old nullable values', () => {
  const inbox = buildAppointmentInbox([
    appointment('general', { doctor_slug: null }),
    appointment('doctor', { doctor_slug: 'doctor-b', doctor_name_ru: '', doctor_name_kk: 'Сынақ Дәрігер', doctor_role_ru: 'Терапевт' }),
  ]);
  assert.equal(inbox.siteAppointments.length, 1);
  assert.equal(inbox.doctorGroups[0].name, 'Сынақ Дәрігер');
  assert.equal(inbox.doctorGroups[0].role, 'Терапевт');
});

test('displays readable service names instead of internal route identifiers', () => {
  assert.equal(appointmentServiceName(appointment('a', { service_slug: 'doctor-appointment' })), 'Приём у врача');
  assert.equal(appointmentServiceName(appointment('b', { service_title_ru: 'Лечение зубов' })), 'Лечение зубов');
  assert.equal(appointmentServiceName(appointment('c')), 'Консультация');
  assert.deepEqual(buildAppointmentInbox([]), { siteAppointments: [], doctorAppointments: [], doctorGroups: [] });
});

test('joined query preserves general, inactive-doctor and missing-profile requests', () => {
  const db = new DatabaseSync(':memory:');
  try {
    for (const sql of schemaStatements) db.exec(sql);
    db.prepare(`INSERT INTO doctors (slug, name_ru, name_kk, role_ru, role_kk, bio_ru, bio_kk, focus_ru, focus_kk, image_url, active)
      VALUES (?, ?, ?, ?, ?, '', '', '', '', '', 0)`).run('doctor-a', 'Доктор Тестов', 'Сынақ Дәрігер', 'Терапевт', 'Терапевт');
    db.prepare(`INSERT INTO services (id, slug, title_ru, title_kk, active) VALUES ('s', 'treatment', 'Лечение зубов', 'Тіс емдеу', 0)`).run();
    const insert = db.prepare('INSERT INTO appointments (id, name, phone, doctor_slug, service_slug) VALUES (?, ?, ?, ?, ?)');
    insert.run('a-general', 'Test', '0000000000', '', '');
    insert.run('b-doctor', 'Test', '0000000000', 'doctor-a', 'treatment');
    insert.run('c-missing', 'Test', '0000000000', 'removed-doctor', 'doctor-appointment');
    const rows = db.prepare(ADMIN_APPOINTMENTS_QUERY).all();
    assert.equal(rows.length, 3);
    const assigned = rows.find((row) => row.id === 'b-doctor');
    assert.equal(assigned.doctor_name_ru, 'Доктор Тестов');
    assert.equal(assigned.service_title_ru, 'Лечение зубов');
    assert.equal(rows.find((row) => row.id === 'c-missing').doctor_name_ru, null);
    const inbox = buildAppointmentInbox(rows);
    assert.equal(inbox.siteAppointments.length, 1);
    assert.equal(inbox.doctorAppointments.length, 2);
  } finally { db.close(); }
});

test('joined query keeps the existing 150-request limit and latest-first order', () => {
  const db = new DatabaseSync(':memory:');
  try {
    for (const sql of schemaStatements) db.exec(sql);
    const insert = db.prepare('INSERT INTO appointments (id, name, phone, created_at) VALUES (?, ?, ?, ?)');
    for (let i = 0; i < 151; i += 1) insert.run(String(i).padStart(3, '0'), 'Test', '0000000000', '2026-08-31 10:00:00');
    const rows = db.prepare(ADMIN_APPOINTMENTS_QUERY).all();
    assert.equal(rows.length, 150);
    assert.equal(rows[0].id, '150');
    assert.equal(rows.at(-1).id, '001');
  } finally { db.close(); }
});
