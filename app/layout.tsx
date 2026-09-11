import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Media Plan Diagnostic",
  description: "Upload your agency's ad report and get a plain-English diagnosis.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
