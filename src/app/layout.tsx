import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BookAppProvider } from "@/components/book-app-provider";
import { MobileNav } from "@/components/mobile-nav";
import { PwaRegister } from "@/components/pwa-register";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://booktrail.example"),
  title: "BookTrail",
  description:
    "A mobile-first PWA for building a readlist, organizing nested folders, tracking reading time, and reviewing finished books.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BookTrail",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#3a2d26",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <BookAppProvider>
          <PwaRegister />
          {children}
          <MobileNav />
        </BookAppProvider>
      </body>
    </html>
  );
}
