import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { EntryGate } from "@/components/EntryGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ForoTrix Desktop",
  description:
    "Stack unificado en Next.js para las pantallas de Anima reutilizando componentes compartidos.",
  metadataBase: new URL("https://forotrix.local"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#020404] text-white antialiased`}
      >
        <AuthProvider>
          <main className="min-h-screen bg-[#020404] overflow-x-auto">
            <div className="mx-auto flex min-w-[1440px] max-w-[1600px] flex-col pb-16">
              {children}
            </div>
          </main>
          <EntryGate />
        </AuthProvider>
      </body>
    </html>
  );
}
