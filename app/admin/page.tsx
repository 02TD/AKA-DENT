import type { Metadata } from 'next';
import { LockKeyhole } from 'lucide-react';
import { chatgptSignInPath, isAdminUser } from '@/app/chatgpt-auth';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Управление AKA-DENT',
  description: 'Защищённая панель управления сайтом AKA-DENT.',
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function AdminPage() {
  const auth = await isAdminUser();
  if (!auth.ok) {
    return <main className="admin-gate"><div className="admin-gate-card"><span className="admin-gate-icon"><LockKeyhole /></span><div className="admin-kicker">AKA-DENT CONTROL</div><h1>{auth.reason === 'signed_out' ? 'Войдите, чтобы управлять сайтом' : 'Доступ только для владельца'}</h1><p>{auth.reason === 'not_configured' ? 'Адрес администратора ещё не настроен в защищённом окружении.' : 'Панель, заявки и редактирование цен защищены учётной записью владельца.'}</p>{auth.reason === 'signed_out' && <a className="admin-login" href={chatgptSignInPath('/admin')} target="_top">Войти с ChatGPT</a>}<a className="admin-back" href="/">← Вернуться на сайт</a></div></main>;
  }
  return <AdminDashboard user={{ email: auth.user.email, name: auth.user.name }} />;
}
