import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ScrollButton } from "@/components/ui/scroll-button";
import ChatWidget from "@/components/ai/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://techwell.co.in"),
  title: {
    default: "TechWell - AI-Powered Learning & Career Platform",
    template: "%s | TechWell"
  },
  description: "Launch your tech career with AI-powered interviews, adaptive courses, and placement data. Join 10,000+ students landing dream jobs.",
  keywords: ["AI Courses", "Tech Career", "Mock Interviews", "Placement Support", "Coding Bootcamp", "Resume Builder", "TechWell"],
  authors: [{ name: "TechWell Team" }],
  creator: "TechWell",
  publisher: "TechWell Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://techwell.co.in",
    siteName: "TechWell",
    title: "TechWell - AI-Powered Learning",
    description: "Launch your tech career with AI-powered interviews, adaptive courses, and placement support.",
    images: [
      {
        url: "/og-image.jpg", // Needs to be added to public
        width: 1200,
        height: 630,
        alt: "TechWell Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechWell - AI-Powered Learning",
    description: "Master skills, ace interviews, and get placed.",
    images: ["/og-image.jpg"],
    creator: "@techwell_edu",
  },
  icons: {
    icon: "/favicon.ico",
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
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {/* Header - hidden on print */}
            <div className="print:hidden">
              <Header />
            </div>
            <main className="flex-1">
              {children}
            </main>
            {/* Footer - hidden on print */}
            <div className="print:hidden">
              <Footer />
            </div>
            {/* Scroll button - hidden on print */}
            <div className="print:hidden">
              <ScrollButton />
            </div>
            <div className="print:hidden fixed bottom-6 right-6 z-[9999]">
              <ChatWidget />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



