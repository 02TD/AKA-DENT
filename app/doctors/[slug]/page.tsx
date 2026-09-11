import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doctorsSeed } from '@/db/schema';
import { sitePath } from '@/lib/site-path';
import DoctorProfile from './DoctorProfile';

export const dynamicParams = false;
const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://02td.github.io/AKA-DENT';

type DoctorRecord = { slug: string; name_ru: string; name_kk: string; role_ru: string; role_kk: string; bio_ru: string; bio_kk: string; focus_ru: string; focus_kk: string; image_url: string };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doctor = doctorsSeed.find((item) => item.slug === slug) as DoctorRecord | undefined;
  if (!doctor) return { title: 'Врач не найден — AKA-DENT', openGraph: { images: [] }, twitter: { images: [] } };
  const image = doctor.image_url.startsWith('http') ? doctor.image_url : origin + sitePath(doctor.image_url);
  const title = doctor.name_ru + ' — ' + doctor.role_ru + ' | AKA-DENT';
  return { title, description: doctor.bio_ru, openGraph: { title, description: doctor.bio_ru, url: origin + sitePath('/doctors/' + doctor.slug + '/'), images: [{ url: image, alt: doctor.name_ru }] }, twitter: { card: 'summary_large_image', title, description: doctor.bio_ru, images: [image] } };
}

export function generateStaticParams() {
  return doctorsSeed.map((doctor) => ({ slug: doctor.slug }));
}

export default async function DoctorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doctor = doctorsSeed.find((item) => item.slug === slug) as DoctorRecord | undefined;
  if (!doctor) notFound();
  return <DoctorProfile doctor={doctor} />;
}
