// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KulturalMente - Your Mind. Your Culture. Your Story.",
  description:
    "Discover your unique cultural identity through AI-powered cultural intelligence.",
  keywords: [
    "cultural intelligence",
    "AI",
    "personalization",
    "cultural DNA",
    "recommendations",
  ],
  authors: [{ name: "Ajito Nelson Lucio da Costa" }],
  openGraph: {
    title: "KulturalMente - Cultural Intelligence Platform",
    description: "Discover your unique cultural DNA through AI analysis",
    images: ["/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KulturalMente - Your Cultural DNA",
    description: "AI-powered cultural intelligence platform",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add any additional head elements here */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {/* No navigation here - each page includes its own navigation */}
        {children}
      </body>
    </html>
  );
}
