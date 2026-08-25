import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
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
      className={`${outfit.variable} h-full antialiased`}
      data-theme="corporate"
    >
      <body className="min-h-full flex flex-col bg-base-100 text-base-content">{children}</body>
    </html>
  );
}
