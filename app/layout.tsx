import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Repositorio REDS Colombia",
  description:
    "Repositorio de recursos digitales (REDS) de REDS Colombia",
  generator: "v0.app",
  manifest: "/favicon/manifest.json",
  icons: {
    icon: [
      {
        url: "/favicon/favicon.ico",
      },
      {
        url: "/favicon/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    apple: "/favicon/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-background" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased text-foreground`}>
        <Script id="accessibility-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var root = document.documentElement;
                var contrast = localStorage.getItem('reds-accessibility-contrast') || 'normal';
                var textSize = localStorage.getItem('reds-accessibility-text-size') || 'normal';
                root.dataset.contrast = contrast === 'high' ? 'high' : 'normal';
                root.dataset.textSize = (textSize === 'large' || textSize === 'xlarge') ? textSize : 'normal';
              } catch (error) {}
            })();
          `}
        </Script>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
