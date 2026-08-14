import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getCurrentUserId } from "@/lib/auth";
import { getUserTheme } from "@/db/queries";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "break-point",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Seeds next-themes' initial value from the saved profile, so a fresh
  // browser/device renders in the right theme immediately rather than
  // flashing light before a client-side toggle would correct it. Once the
  // user has toggled on a given browser, its own localStorage takes over.
  const userId = await getCurrentUserId();
  const theme = await getUserTheme(userId);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        figtree.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme={theme}
          themes={["carpet", "clay", "hard"]}
          // "clay" keeps the literal `.dark` class so the dark: Tailwind
          // variant already used throughout the base components (select,
          // button, textarea, badge, input) keeps applying — only the
          // logical/stored theme name changed, not the CSS it maps to.
          value={{ carpet: "carpet", clay: "dark", hard: "hard" }}
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
