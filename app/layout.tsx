import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "4Patriots",
  description: "4Patriots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="m-0 min-h-screen overflow-x-hidden bg-white text-black antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
