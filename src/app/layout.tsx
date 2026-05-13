import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Caveat } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-script',
  display: 'swap',
});

const flatlion = localFont({
  src: '../fonts/Flatlion.ttf',
  variable: '--font-names',
  display: 'swap',
});

const courierPS = localFont({
  src: '../fonts/CourierPS.ttf',
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Wedding Invitation',
  description: 'You are invited to our wedding celebration',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${caveat.variable} ${flatlion.variable} ${courierPS.variable}`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
