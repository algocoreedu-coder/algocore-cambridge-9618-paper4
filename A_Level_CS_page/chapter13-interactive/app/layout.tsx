import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlgoCore · Chapter 13 Lab",
  description: "Learn A Level data types, files and floating-point numbers. Practise Paper 3 with clear examples.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
