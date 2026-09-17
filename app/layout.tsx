import type { Metadata } from "next";
import { Source_Serif_4, Inter, Barlow_Semi_Condensed, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Used by the marketing landing page (/) and /signup, which share a distinct
// visual identity from the rest of the app.
const heading = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-heading",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Media Plan Diagnostic",
  description: "Upload your agency's ad report and get a plain-English diagnosis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
