import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import ScrollToTop from "../components/ScrollToTop"
import Navbar from "../components/Navbar"
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pariksha Path",
  description: "A platform for students to prepare for competitive exams.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <>
          <ScrollToTop />
          <AuthProvider>
            <Navbar />
            <div className="mt-24">
              {children}
            </div>
          </AuthProvider>
          <Footer />
          <FloatingContact />
        </>
      </body>
    </html >
  );
}
