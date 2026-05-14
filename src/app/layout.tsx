import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-script',
  display: 'swap',
});

const flatlion = localFont({
  src: '../fonts/Flatlion.ttf',
  variable: '--font-names',
  display: 'swap',
});

const fcColdwell = localFont({
  src: '../fonts/FC-Coldwell-Bridges.otf',
  variable: '--font-landing',
  display: 'swap',
});

const courierPS = localFont({
  src: '../fonts/CourierPS.ttf',
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

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
      <body className={`${playfairDisplay.variable} ${flatlion.variable} ${fcColdwell.variable} ${courierPS.variable}`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
