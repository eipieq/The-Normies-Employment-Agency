import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Plus_Jakarta_Sans, Geist_Mono, Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const geistPixelSquare = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2",
  variable: "--font-pixel-square",
  display: "swap",
});

export const metadata: Metadata = {
  title: "the normies employment agency",
  description:
    "an ai coworker for every normie holder. generated from on-chain data, unlocked by wallet ownership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} ${geistPixelSquare.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-foreground">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
