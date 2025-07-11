import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalFooter from "@/components/ConditionalFooter";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "MiteSnap - AI-Powered Dust Mite Detection for Your Bedding",
    template: "%s | MiteSnap"
  },
  description: "Track dust mites on your bedding, sheets, and duvets with AI visual analysis and real-time weather data. Get smart sun-drying recommendations and connect with community helpers.",
  keywords: [
    "dust mite detection",
    "bedding analysis",
    "AI mite scanner",
    "duvet cleaning tracker", 
    "bedding health monitoring",
    "smart drying",
    "mite prevention",
    "allergy prevention"
  ],
  authors: [{ name: "lantianlaoli", url: "https://x.com/lantianlaoli" }],
  creator: "lantianlaoli",
  publisher: "MiteSnap",
  category: "Health & Lifestyle",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: "NWWQXGdeSNhrfNE0ebGCK5S9UpLMFjnp_RMXhvo3Q3c",
  },
  metadataBase: new URL('https://mitesnap.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mitesnap.com',
    title: 'MiteSnap - AI-Powered Dust Mite Detection for Your Bedding',
    description: 'Track dust mites on your bedding with AI analysis and weather data. Get smart drying recommendations and community help.',
    siteName: 'MiteSnap',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'MiteSnap - Smart Bedding Health Monitoring',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiteSnap - AI-Powered Dust Mite Detection',
    description: 'Track dust mites on your bedding with AI analysis and weather data. Get smart drying recommendations.',
    creator: '@lantianlaoli',
    images: ['/twitter.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} antialiased min-h-screen bg-white`}
      >
        <ClerkProvider>
          {children}
          <ConditionalFooter />
        </ClerkProvider>
      </body>
    </html>
  );
}
