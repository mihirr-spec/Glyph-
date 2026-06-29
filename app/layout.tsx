import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Glyph — Type real code, get faster",
  description:
    "A Monkeytype-style typing trainer where you type LeetCode-style solutions instead of random words.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geistMono.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
