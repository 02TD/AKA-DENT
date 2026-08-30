import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDoctorBySlug } from '@/lib/db';
import DoctorProfile from './DoctorProfile';

export const dynamic = 'force-dynamic';
const origin = 'https://aka-dent-karaganda.gdbhxxh.chatgpt.site';

type DoctorRecord = { slug: string; name_ru: string; name_kk: string; role_ru: string; role_kk: string; bio_ru: string; bio_kk: string; focus_ru: string; focus_kk: string; image_url: string };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug) as DoctorRecord | null;
  if (!doctor) return { title: 'Врач не найден — AKA-DENT', openGraph: { images: [] }, twitter: { images: [] } };
  const image = doctor.image_url.startsWith('http') ? doctor.image_url : origin + doctor.image_url;
  const title = doctor.name_ru + ' — ' + doctor.role_ru + ' | AKA-DENT';
  return { title, description: doctor.bio_ru, openGraph: { title, description: doctor.bio_ru, url: origin + '/doctors/' + doctor.slug, images: [{ url: image, alt: doctor.name_ru }] }, twitter: { card: 'summary_large_image', title, description: doctor.bio_ru, images: [image] } };
}

export default async function DoctorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug) as DoctorRecord | null;
  if (!doctor) notFound();
  return <DoctorProfile doctor={doctor} />;
}
