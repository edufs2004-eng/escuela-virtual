import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colegio Virtual Esencia",
  description: "Educación flexible, con estructura: clases en vivo de 1° básico a IV medio y preparación para exámenes libres del MINEDUC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}