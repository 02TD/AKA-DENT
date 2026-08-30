import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aka-dent-karaganda.gdbhxxh.chatgpt.site'),
  title: 'AKA-DENT — стоматология полного цикла в Караганде',
  description: 'Лечение, имплантация, протезирование и 3D-диагностика. Караганда, ул. Комиссарова, 28. Запись: +7 700 121-54-54.',
  openGraph: {
    title: 'AKA-DENT — лечим так, чтобы не переделывать',
    description: 'Стоматология полного цикла в Караганде: диагностика, лечение, имплантация и протезирование.',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://aka-dent-karaganda.gdbhxxh.chatgpt.site',
    images: [{ url: 'https://aka-dent-karaganda.gdbhxxh.chatgpt.site/og.png', width: 1200, height: 630, alt: 'AKA-DENT — стоматология полного цикла в Караганде' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AKA-DENT — стоматология полного цикла',
    description: 'Лечим так, чтобы не переделывать. Караганда, ул. Комиссарова, 28.',
    images: ['https://aka-dent-karaganda.gdbhxxh.chatgpt.site/og.png'],
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
