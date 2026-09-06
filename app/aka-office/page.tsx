import type { Metadata } from 'next';
import { LockKeyhole } from 'lucide-react';
import { chatgptSignInPath, isAdminUser } from '@/app/chatgpt-auth';
import AdminDashboard from '@/app/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AKA-DENT Office',
  description: 'Защищённый кабинет управления сайтом AKA-DENT.',
  robots: { index: false, follow: false },
  openGraph: { images: [] },
  twitter: { images: [] },
};

export default async function AkaOfficePage() {
  const auth = await isAdminUser();
  if (!auth.ok) {
    return <main className="admin-gate"><div className="admin-gate-card"><span className="admin-gate-icon"><LockKeyhole /></span><div className="admin-kicker">AKA-DENT OFFICE</div><h1>{auth.reason === 'signed_out' ? 'Войдите, чтобы управлять сайтом' : 'Доступ только для владельца'}</h1><p>{auth.reason === 'not_configured' ? 'Адрес владельца ещё не настроен в защищённом окружении.' : 'Заявки и редактирование цен защищены учётной записью владельца.'}</p>{auth.reason === 'signed_out' && <a className="admin-login" href={chatgptSignInPath('/aka-office')} target="_top">Войти с ChatGPT</a>}<a className="admin-back" href="/">← Вернуться на сайт</a></div></main>;
  }
  return <AdminDashboard user={{ email: auth.user.email, name: auth.user.name }} />;
}
