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
  authors: [{ name: "KulturalMente Team" }],
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
