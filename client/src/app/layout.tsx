import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Veagle Space Technology | Invoice Generator",
  description: "Generate and manage invoices seamlessly with our premium SaaS solution.",
  icons: {
    icon: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-theme="corporate"
    >
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">{children}</body>
    </html>
  );
}
