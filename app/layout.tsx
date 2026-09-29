import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "File System Simulator",
  description:
    "Operating System File System Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}