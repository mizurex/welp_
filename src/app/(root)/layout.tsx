import type { Metadata } from "next";
import { JetBrains_Mono, DM_Sans } from "next/font/google";
import Script from "next/script";
import "@/app/globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Welp Analytics",
  description: "Simple, privacy-friendly website analytics",
  openGraph: {
    title: "Welp Analytics",
    description: "Simple, privacy-friendly website analytics",
    url: "https://www.trywelp.live",
    siteName: "Welp Analytics",
    images: [
      {
        url: "/welp.jpeg",
        width: 1200,
        height: 630,
        alt: "Welp Analytics dashboard preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Welp Analytics",
    description: "Simple, privacy-friendly website analytics",
    images: ["/file.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Script 
          src="/tracker.js" 
          data-project-id="prj_ihkl02ofrymlfcgx5l"
          strategy="afterInteractive"
        />

        {children}
      </body>
    </html>
  );
}
