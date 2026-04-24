import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  display: 'swap',
  variable: '--font-rubik',
});

export const metadata: Metadata = {
  title: 'Family Roots CRM',
  description: 'Professional Genealogy Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning className={rubik.variable}>
      <body className="font-sans antialiased text-wood-dark overflow-hidden bg-parchment">
        {children}
      </body>
    </html>
  );
}
