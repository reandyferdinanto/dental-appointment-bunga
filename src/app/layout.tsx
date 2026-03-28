import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "drg. Bunga",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#EEF3F8",
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
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
