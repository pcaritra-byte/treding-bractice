import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChartPilot — Pro Trading Dashboard Starter | বাংলা নির্দেশিকাসহ',
  description:
    'বাংলা নির্দেশনা সহ একটি পূর্ণাঙ্গ Next.js + TypeScript charting dashboard starter with Lightweight Charts, Paper Trading, Multi-charts, Volume Profile, and Rule-based Signals.',
  keywords: [
    'Trading Dashboard',
    'Next.js Trading',
    'Lightweight Charts',
    'TradingView Bengali',
    'Paper Trading Simulator',
    'Crypto Chart',
    'NIFTY Chart',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
