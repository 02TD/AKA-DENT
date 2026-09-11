import { doctorsSeed, reviewsSeed, servicesSeed, settingsSeed } from '@/db/schema';
import type { Appointment } from '@/lib/appointments';

export type DemoService = {
  id: string; slug: string; title_ru: string; title_kk: string;
  description_ru: string; description_kk: string; price_from: number | null;
  price_to: number | null; unit: string; sort_order: number; active: number;
};
export type DemoDoctor = {
  slug: string; name_ru: string; name_kk: string; role_ru: string; role_kk: string;
  bio_ru: string; bio_kk: string; focus_ru: string; focus_kk: string;
  image_url: string; sort_order: number; active: number;
};
export type DemoReview = {
  id: string; author: string; rating: number; body_ru: string; body_kk: string;
  source_url: string; published_at: string; active: number;
};
export type DemoSetting = { key: string; value_ru: string; value_kk: string };
export type DemoData = {
  services: DemoService[];
  doctors: DemoDoctor[];
  reviews: DemoReview[];
  settings: DemoSetting[];
  appointments: Appointment[];
};

const STORAGE_KEY = 'akadent-github-demo-v1';
export const DEMO_DATA_EVENT = 'akadent-demo-data-changed';

function defaults(): DemoData {
  return {
    services: servicesSeed.map((item) => ({ ...item, active: 1 })),
    doctors: doctorsSeed.map((item) => ({ ...item, active: 1 })),
    reviews: reviewsSeed.map((item) => ({ ...item, active: 1 })),
    settings: settingsSeed.map(([key, value_ru, value_kk]) => ({ key, value_ru, value_kk })),
    appointments: [],
  };
}

export function readDemoData(): DemoData {
  const fallback = defaults();
  if (typeof window === 'undefined') return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '') as Partial<DemoData>;
    return {
      services: Array.isArray(parsed.services) ? parsed.services : fallback.services,
      doctors: Array.isArray(parsed.doctors) ? parsed.doctors : fallback.doctors,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : fallback.reviews,
      settings: Array.isArray(parsed.settings) ? parsed.settings : fallback.settings,
      appointments: Array.isArray(parsed.appointments) ? parsed.appointments : fallback.appointments,
    };
  } catch {
    return fallback;
  }
}

function writeDemoData(data: DemoData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(DEMO_DATA_EVENT));
}

export function readDemoPublicData() {
  const data = readDemoData();
  return {
    settings: data.settings,
    services: data.services.filter((item) => item.active).sort((a, b) => a.sort_order - b.sort_order),
    doctors: data.doctors.filter((item) => item.active).sort((a, b) => a.sort_order - b.sort_order),
    reviews: data.reviews.filter((item) => item.active).sort((a, b) => b.published_at.localeCompare(a.published_at)),
  };
}

export function saveDemoAppointment(input: {
  name: string; phone: string; website?: string; serviceSlug?: string;
  doctorSlug?: string; language?: string; notes?: string;
}) {
  if (input.website) return null;
  const name = input.name.trim().slice(0, 80);
  const phone = input.phone.trim().slice(0, 40);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 10) throw new Error('invalid_contact');
  const data = readDemoData();
  const doctor = data.doctors.find((item) => item.slug === input.doctorSlug);
  const service = data.services.find((item) => item.slug === input.serviceSlug);
  const appointment: Appointment = {
    id: crypto.randomUUID(),
    name,
    phone,
    service_slug: input.serviceSlug || '',
    doctor_slug: input.doctorSlug || '',
    language: input.language === 'kk' ? 'kk' : 'ru',
    notes: (input.notes || '').trim().slice(0, 500),
    status: 'new',
    created_at: new Date().toISOString().slice(0, 19),
    doctor_name_ru: doctor?.name_ru || null,
    doctor_name_kk: doctor?.name_kk || null,
    doctor_role_ru: doctor?.role_ru || null,
    service_title_ru: service?.title_ru || null,
    service_title_kk: service?.title_kk || null,
  };
  data.appointments.unshift(appointment);
  writeDemoData(data);
  return appointment;
}

export function saveDemoAction(payload: Record<string, unknown>) {
  const data = readDemoData();
  const action = String(payload.action || '');
  if (action === 'update_service') {
    data.services = data.services.map((item) => item.id === payload.id ? { ...item, ...payload, active: payload.active === false ? 0 : 1 } as DemoService : item);
  } else if (action === 'update_doctor') {
    data.doctors = data.doctors.map((item) => item.slug === payload.slug ? { ...item, ...payload, active: payload.active === false ? 0 : 1 } as DemoDoctor : item);
  } else if (action === 'update_doctor_photo') {
    data.doctors = data.doctors.map((item) => item.slug === payload.slug ? { ...item, image_url: String(payload.image_url || item.image_url) } : item);
  } else if (action === 'upsert_review') {
    const id = String(payload.id || crypto.randomUUID());
    const review: DemoReview = {
      id,
      author: String(payload.author || '').slice(0, 120),
      rating: Math.max(1, Math.min(5, Number(payload.rating) || 5)),
      body_ru: String(payload.body_ru || '').slice(0, 1000),
      body_kk: String(payload.body_kk || '').slice(0, 1000),
      source_url: String(payload.source_url || '').slice(0, 400),
      published_at: String(payload.published_at || new Date().toISOString().slice(0, 10)),
      active: payload.active === false ? 0 : 1,
    };
    data.reviews = [review, ...data.reviews.filter((item) => item.id !== id)];
  } else if (action === 'update_setting') {
    const key = String(payload.key || '');
    const setting = { key, value_ru: String(payload.value_ru || ''), value_kk: String(payload.value_kk || '') };
    data.settings = [setting, ...data.settings.filter((item) => item.key !== key)];
  } else if (action === 'update_appointment_status') {
    const allowed = ['new', 'contacted', 'confirmed', 'done', 'cancelled'];
    const status = allowed.includes(String(payload.status)) ? String(payload.status) : 'new';
    data.appointments = data.appointments.map((item) => item.id === payload.id ? { ...item, status } : item);
  } else {
    throw new Error('unknown_action');
  }
  writeDemoData(data);
  return data;
}
