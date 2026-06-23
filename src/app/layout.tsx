import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Using Inter as the primary font (similar rounded feel to Open Runde)
// Open Runde can be swapped in by adding the .woff2 files to public/fonts/
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-open-runde',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'KigaliClean — Illegal Dumping & Pollution Tracker',
  description: "Report, track, and monitor illegal dumping and pollution hotspots across Kigali's districts. Community-driven environmental accountability.",
  keywords: ['Kigali', 'pollution', 'illegal dumping', 'environmental', 'Rwanda', 'waste management'],
  openGraph: {
    title: 'KigaliClean — Pollution Tracker',
    description: 'Community-driven illegal dumping tracker for Kigali, Rwanda.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌿</text></svg>" />
      </head>
      <body className="font-sans antialiased bg-[#F9FAFB] text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
