import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escuela Virtual Chile",
  description: "Educación virtual con clases en vivo y acompañamiento docente.",
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