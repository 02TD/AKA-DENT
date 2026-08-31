export type Appointment = {
  id: string;
  name: string;
  phone: string;
  service_slug: string;
  doctor_slug: string;
  language: string;
  notes: string;
  status: string;
  created_at: string;
  doctor_name_ru?: string | null;
  doctor_name_kk?: string | null;
  doctor_role_ru?: string | null;
  service_title_ru?: string | null;
  service_title_kk?: string | null;
};

export const ADMIN_APPOINTMENTS_QUERY = `SELECT appointments.*,
  doctors.name_ru AS doctor_name_ru, doctors.name_kk AS doctor_name_kk,
  doctors.role_ru AS doctor_role_ru,
  services.title_ru AS service_title_ru, services.title_kk AS service_title_kk
  FROM appointments
  LEFT JOIN doctors ON doctors.slug = appointments.doctor_slug
  LEFT JOIN services ON services.slug = appointments.service_slug
  ORDER BY appointments.created_at DESC, appointments.id DESC LIMIT 150`;

export type DoctorAppointmentGroup = {
  slug: string;
  name: string;
  role: string;
  appointments: Appointment[];
  newCount: number;
};

export function isDoctorAppointment(appointment: Appointment) {
  return Boolean(appointment.doctor_slug?.trim()) || appointment.service_slug === 'doctor-appointment';
}

export function appointmentServiceName(appointment: Appointment) {
  return appointment.service_title_ru?.trim() || appointment.service_title_kk?.trim()
    || (isDoctorAppointment(appointment) ? 'Приём у врача' : 'Консультация');
}

export function buildAppointmentInbox(appointments: readonly Appointment[]) {
  const siteAppointments: Appointment[] = [];
  const doctorAppointments: Appointment[] = [];
  const groups = new Map<string, DoctorAppointmentGroup>();

  for (const appointment of appointments) {
    if (!isDoctorAppointment(appointment)) {
      siteAppointments.push(appointment);
      continue;
    }

    doctorAppointments.push(appointment);
    const slug = appointment.doctor_slug?.trim() || '';
    let group = groups.get(slug);
    if (!group) {
      group = {
        slug,
        name: appointment.doctor_name_ru?.trim() || appointment.doctor_name_kk?.trim()
          || (slug ? 'Врач не найден' : 'Врач не указан'),
        role: appointment.doctor_role_ru?.trim() || (slug ? 'Профиль врача недоступен' : 'Уточните врача у пациента'),
        appointments: [],
        newCount: 0,
      };
      groups.set(slug, group);
    }
    group.appointments.push(appointment);
    if (appointment.status === 'new') group.newCount += 1;
  }

  return { siteAppointments, doctorAppointments, doctorGroups: [...groups.values()] };
}
