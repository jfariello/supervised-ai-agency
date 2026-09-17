import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agencia IA Supervisada",
  description: "Centro operativo para agentes comerciales supervisados"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
