import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CircularOS — Circular Intelligence",
  description: "Convierte residuos en decisiones circulares trazables.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
