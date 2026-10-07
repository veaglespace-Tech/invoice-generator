import { Montserrat } from 'next/font/google';
import './globals.css';
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  preload: false
});
export const metadata = {
  title: 'Veagle Space Technology | Invoice Generator',
  description: 'Generate and manage invoices seamlessly with our premium SaaS solution.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.webp',
    apple: '/icon.webp',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Invoice Generator',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};
import { Providers } from '@/components/Providers';
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className={`${montserrat.className} min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
