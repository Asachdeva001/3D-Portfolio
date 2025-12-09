import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Aashish Sachdeva - Cyberpunk Portfolio 2077",
  description: "An immersive 3D cyberpunk-themed portfolio showcasing full-stack development skills in a futuristic city environment.",
  keywords: "3D Portfolio, Cyberpunk, WebGL, Three.js, Full Stack Developer, React, Next.js",
  authors: [{ name: "Aashish Sachdeva" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#00ffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
