import type { Metadata } from "next";
import { Black_Han_Sans } from 'next/font/google';
import "./globals.css";
import Navbar from "@/components/navbar";

const blackHansSans = Black_Han_Sans({
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: "Clash of Colonies",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${blackHansSans.className} antialiased`}
      >
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
