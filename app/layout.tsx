import type { Metadata } from "next";
import { Outfit, Urbanist, Cairo } from "next/font/google";
import "./globals.css";
import { RouteProgressBar } from "@/components/layout/RouteProgressBar";
import { ScrollToTopOnNavigation } from "@/components/layout/ScrollToTopOnNavigation";
import { StorefrontChrome } from "@/components/layout/StorefrontChrome";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const urbanist = Urbanist({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ramillette Perfumes Qatar | Luxury & Inspired Fragrances",
  description:
    "Shop Ramillette's own-brand and inspired luxury perfumes in Qatar. Oud, amber & designer-inspired scents with 2-hour express delivery in Doha.",
  keywords: [
    "Ramillette",
    "Perfumes Qatar",
    "Luxury Fragrances Doha",
    "Amber Code",
    "Arabian Oud",
    "Inspired Perfumes Qatar",
    "Souq Al Wakra perfumes",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.ramillette.com"),
  openGraph: {
    title: "Ramillette Perfumes Qatar | Luxury & Inspired Fragrances",
    description:
      "Shop Ramillette's own-brand and inspired luxury perfumes in Qatar. Oud, amber & designer-inspired scents with 2-hour delivery in Doha.",
    url: "https://www.ramillette.com/",
    siteName: "Ramillette",
    locale: "en_QA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ramillette Perfumes Qatar | Luxury & Inspired Fragrances",
    description:
      "Shop Ramillette's own-brand and inspired luxury perfumes in Qatar. Oud, amber & designer-inspired scents with 2-hour delivery in Doha.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${outfit.variable} ${urbanist.variable} ${cairo.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-white text-[#1c1c1c] overflow-x-hidden"
      >
        {/* Luxury Top Navigation Progress Bar */}
        <RouteProgressBar />

        {/* Instant Scroll to Top on Page Changes */}
        <ScrollToTopOnNavigation />

        {/* Storefront Layout (Omits public header/footer on admin routes) */}
        <StorefrontChrome>{children}</StorefrontChrome>
      </body>
    </html>
  );
}
