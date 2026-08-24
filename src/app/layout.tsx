import { SiteChrome } from "@/components/layout/SiteChrome";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import { DM_Sans, League_Spartan } from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

const displayFont = League_Spartan({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GlowSync — Book Salon & Wellness Experiences",
  description:
    "Discover and book top-rated salons, spas, and wellness studios near you with GlowSync.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <QueryProvider>
          <AuthProvider>
            <SiteChrome>{children}</SiteChrome>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
