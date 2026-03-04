import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Providers from "@/app/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CompareBible",
  description: "Parallel Bible reading with AI perspectives",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4a6fa5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <div className="flex flex-col min-h-screen">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
