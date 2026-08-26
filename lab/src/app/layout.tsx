import type { Metadata } from "next";
import { Geist_Mono, Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const geistPixelSquare = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2",
  variable: "--font-pixel-square",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arpilab.tech"),
  title: {
    default: "ARPI Lab — Attribute-Rooted Personality Inference",
    template: "%s — ARPI Lab",
  },
  description:
    "A research lab deriving stable, grounded personalities from structured attribute data. Personality is computed, not generated.",
  openGraph: {
    title: "ARPI Lab — Attribute-Rooted Personality Inference",
    description:
      "A research lab deriving stable, grounded personalities from structured attribute data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`h-full ${instrumentSans.variable} ${geistMono.variable} ${geistPixelSquare.variable}`}
    >
      <body className="h-full flex flex-col bg-background text-foreground">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
