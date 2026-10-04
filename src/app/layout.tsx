import type { Metadata, Viewport } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";

import { BookAppProvider } from "@/components/book-app-provider";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { PwaRegister } from "@/components/pwa-register";

import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf6ef] text-[#1c1815] font-sans selection:bg-[#c59b27] selection:text-white">
        <BookAppProvider>
          <PwaRegister />
          <DesktopNav />
          <main className="flex-1">{children}</main>
          <MobileNav />
        </BookAppProvider>
      </body>
    </html>
  );
}
