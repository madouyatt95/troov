import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Troov - Retrouvez vos documents",
  description: "Application pour retrouver CNI et passeports perdus au Sénégal en toute sécurité",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Troov",
  },
  openGraph: {
    title: "Troov",
    description: "Retrouvez vos documents en toute sécurité",
    type: "website",
    locale: "fr_SN",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen min-h-dvh flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
