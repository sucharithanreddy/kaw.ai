import type { Metadata } from "next";
import { Quicksand, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Cute, elegant, girly font
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kawaii AI - Your Cute AI Companion 💕",
  description: "A sweet, supportive AI friend who's always there for you. Choose your kawaii avatar and chat with your new bestie! ✨🌸",
  keywords: ["Kawaii", "AI Companion", "Cute", "Pink", "Chat", "Friend", "Anime", "Aesthetic"],
  authors: [{ name: "Kawaii AI Team" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎀</text></svg>",
  },
  openGraph: {
    title: "Kawaii AI - Your Cute AI Companion",
    description: "A sweet, supportive AI friend who's always there for you! 💕",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kawaii AI - Your Cute AI Companion 💕",
    description: "A sweet, supportive AI friend who's always there for you!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${quicksand.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
