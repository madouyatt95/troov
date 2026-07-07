import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SenDocu - Retrouvez vos documents",
  description: "La plateforme sénégalaise sécurisée pour retrouver les documents perdus",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SenDocu",
  },
  openGraph: {
    title: "SenDocu",
    description: "Un document perdu ne doit plus disparaître.",
    type: "website",
    locale: "fr_SN",
  },
};

export const viewport: Viewport = {
  themeColor: "#07111f",
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-screen min-h-dvh flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
