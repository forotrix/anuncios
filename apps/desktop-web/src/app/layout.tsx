import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { EntryGate } from "@/components/EntryGate";
import { AuthModalProvider } from "@/hooks/useAuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ForoTrix",
  description:
    "ForoTrix conecta perfiles verificados y anuncios premium con herramientas seguras para descubrir, contactar y gestionar experiencias.",
  metadataBase: new URL("https://forotrix.com"),
  applicationName: "ForoTrix",
  creator: "ForoTrix",
  publisher: "ForoTrix",
  keywords: [
    "forotrix",
    "anuncios premium",
    "perfiles verificados",
    "companionship",
    "experiencias vip",
    "escorts",
    "citas privadas",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
    },
  },
  openGraph: {
    title: "ForoTrix",
    description:
      "ForoTrix conecta perfiles verificados y anuncios premium con herramientas seguras para descubrir, contactar y gestionar experiencias.",
    url: "https://forotrix.com",
    siteName: "ForoTrix",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ForoTrix",
    description:
      "ForoTrix conecta perfiles verificados y anuncios premium con herramientas seguras para descubrir, contactar y gestionar experiencias.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-black text-white antialiased`}
      >
        <AuthProvider>
          <AuthModalProvider>
            <main className="min-h-screen bg-black overflow-x-auto">
              <div className="mx-auto flex min-w-[1440px] max-w-[1600px] flex-col pb-16">
                {children}
              </div>
            </main>
            <EntryGate />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
