import type { Metadata, Viewport } from "next";
import { Fraunces, Newsreader, Figtree } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/Shell";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz", "SOFT"], display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"], display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Penny Feed",
  description: "A personal feed of things worth knowing.",
  manifest: `${base}/manifest.webmanifest`,
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Penny Feed", statusBarStyle: "black-translucent" },
  icons: { icon: `${base}/icons/icon.svg`, apple: `${base}/icons/apple-touch-icon.png` },
};

export const viewport: Viewport = {
  themeColor: "#f6efe3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${fraunces.variable} ${newsreader.variable} ${figtree.variable}`} suppressHydrationWarning>
      <body>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
