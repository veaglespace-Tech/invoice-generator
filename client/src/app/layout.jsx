import { Outfit } from 'next/font/google';
import './globals.css';
const outfit = Outfit({
  variable: '--font-outfit',
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
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
