import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  display: 'swap',
  variable: '--font-rubik',
});

export const metadata: Metadata = {
  title: 'אילן יוחסין | ניהול גנאלוגי מקצועי',
  description: 'מערכת מקצועית לניהול ותיעוד אילן יוחסין משפחתי',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/logo.png'],
  },
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
