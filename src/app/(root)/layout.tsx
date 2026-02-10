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
