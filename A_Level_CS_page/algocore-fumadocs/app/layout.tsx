import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { AppProviders } from './AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'AlgoCore · Computer Science',
  description: 'Học Computer Science cùng AlgoCore — bài học, ví dụ và luyện tập.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await headers()).get('x-algocore-locale') === 'en' ? 'en' : 'vi';
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <AppProviders initialLocale={locale}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
