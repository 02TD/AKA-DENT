import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aurora-dental-clinic.gdbhxxh.chatgpt.site'),
  title: 'АВРОРА — стоматология без тревоги',
  description: 'Современная стоматология: точная диагностика, понятный план лечения и забота без боли и спешки.',
  openGraph: {
    title: 'АВРОРА — стоматология без тревоги',
    description: 'Точная диагностика, понятный план лечения и врачи, которые сначала слушают.',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://aurora-dental-clinic.gdbhxxh.chatgpt.site',
    images: [{ url: 'https://aurora-dental-clinic.gdbhxxh.chatgpt.site/og.png', width: 1200, height: 630, alt: 'АВРОРА — стоматология без тревоги' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'АВРОРА — стоматология без тревоги',
    description: 'Точная диагностика, понятный план лечения и забота без боли и спешки.',
    images: ['https://aurora-dental-clinic.gdbhxxh.chatgpt.site/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
