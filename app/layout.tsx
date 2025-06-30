import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Meal - AI Recipe Generator",
    template: "%s | Meal",
  },
  description:
    "Generate personalized recipes with AI based on your ingredients, dietary preferences, and cooking time. Your intelligent culinary assistant for home cooking.",
  keywords: [
    "recipe generator",
    "AI cooking",
    "meal planning",
    "dietary restrictions",
    "cooking assistant",
  ],
  authors: [{ name: "Meal App" }],
  creator: "Meal App",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Meal - AI Recipe Generator",
    description:
      "Generate personalized recipes with AI based on your ingredients, dietary preferences, and cooking time.",
    siteName: "Meal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meal - AI Recipe Generator",
    description:
      "Generate personalized recipes with AI based on your ingredients, dietary preferences, and cooking time.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>{children}</body>
    </html>
  );
}
