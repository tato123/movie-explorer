import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";

import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: {
    default: "Movies Explorer",
    template: "%s | Movies Explorer",
  },
  description: "Search and view movies",
};

export default function RootLayout({
  children,
  header,
}: Readonly<{
  children: React.ReactNode;
  header: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={lexend.variable}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen overflow-x-hidden">
        <Providers>
          <div className="flex flex-col gap-3 w-full px-5">
            {header}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
