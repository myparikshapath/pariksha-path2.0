import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import ScrollToTop from "../components/ScrollToTop";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { AuthProvider } from "@/context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Parikshapath",
  description: "A platform for students to prepare for competitive exams.",
  icons: "/favicon.ico",
  openGraph: {
    title: "My Pariksha Path",
    description:
      "Prepare for government exams with live classes, mock tests, and notes.",
    url: "https://www.myparikshapath.in",
    siteName: "My Pariksha Path",
    images: [
      {
        url: "https://www.myparikshapath.in/icon.png",
        width: 1200,
        height: 630,
        alt: "My Pariksha Path",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Add your JSON-LD Structured Data here */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: "My Pariksha Path",
              url: "https://www.myparikshapath.in",
              logo: "https://www.myparikshapath.in/icon.png",
              sameAs: [
                "https://www.instagram.com/myparikshapath/",
                "https://www.facebook.com/myparikshapath/",
                "https://www.linkedin.com/company/myparikshapath/",
              ],
              description:
                "India's smartest learning platform for government exams. Live classes, notes, and mock tests.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-XXXXXXXXXX",
                contactType: "Customer Support",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Delhi",
                addressCountry: "IN",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ScrollToTop />
        <AuthProvider>
          <Navbar />
          {/* yeh main content stretch karega */}
          <main className="flex-grow mt-20">{children}</main>
          <Footer />
          <FloatingContact />
        </AuthProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
