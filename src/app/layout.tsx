import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "drg. Natasya Bunga Maureen - Dental Clinic",
  description:
    "Layanan perawatan gigi profesional oleh dokter gigi koas Natasya Bunga Maureen. Booking jadwal konsultasi dan perawatan gigi Anda.",
  keywords: [
    "dokter gigi",
    "koas",
    "dental",
    "perawatan gigi",
    "Natasya Bunga Maureen",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
