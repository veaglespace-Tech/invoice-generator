import { Montserrat } from 'next/font/google';
import './globals.css';
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  preload: false
});
export const metadata = {
  title: 'Veagle Space Technology | Invoice Generator',
  description:
    'Generate and manage invoices seamlessly with our premium SaaS solution.',
  icons: {
    icon: '/logo.webp'
  }
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
      <body className={`${montserrat.className} min-h-full flex flex-col bg-base-100 text-base-content`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
