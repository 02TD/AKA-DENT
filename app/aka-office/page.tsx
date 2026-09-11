import type { Metadata } from 'next';
import AdminDashboard from '@/app/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'AKA-DENT Office — демо',
  description: 'Тестовая панель управления сайтом AKA-DENT.',
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default function AkaOfficePage() {
  return <AdminDashboard user={{ email: 'данные сохраняются в браузере', name: 'Демо-доступ' }} />;
}
