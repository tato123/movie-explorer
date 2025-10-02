import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import SerachablePage from "./searchable.page";
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
  description: "Discover and explore your favorite movies",
};

export default function RootLayout({
  children,
  topMovies,
  genres,
  header,
  modal,
}: Readonly<{
  children: React.ReactNode;
  topMovies: React.ReactNode;
  genres: React.ReactNode;
  header: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={lexend.variable}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen min-w-screen h-screen w-screen">
        <Providers>
          <SerachablePage topMovies={topMovies} genres={genres} header={header}>
            {children}
            {modal}
          </SerachablePage>
        </Providers>
      </body>
    </html>
  );
}
