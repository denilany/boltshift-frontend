import { ThemeProvider } from "@/components/theme-provider";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import { Toaster } from "@/components/ui/sonner";
import InstallPrompt from "@/components/install-prompt";
import Script from "next/script";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ServiceWorkerBootstrap } from "@/components/service-worker-bootstrap";
import "./globals.css";

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

/* METADATA CONFIGURATION */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),

  title: {
    default: "Boltshift",
    template: "%s | Boltshift",
  },

  description:
    "Modern e-commerce platform designed to help stores showcase, manage, and sell their products seamlessly.",

  openGraph: {
    url: "/",
    title: "Boltshift",
    description:
      "Modern e-commerce platform designed to help stores showcase, manage, and sell their products seamlessly.",
    siteName: "Boltshift",
    images: [
      {
        url: "/opengraph-image.png",
        width: 7680,
        height: 4320,
        alt: "Boltshift",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Boltshift",
    description:
      "Modern e-commerce platform designed to help stores showcase, manage, and sell their products seamlessly.",
    images: ["/opengraph-image.png"],
  },
};

/* VIEWPORT CONFIGURATION */
export const viewport = {
  themeColor: "#ee2255",
};

/* ROOT LAYOUT COMPONENT */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>

      <body>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L40XS5KNBN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-L40XS5KNBN');
          `}
        </Script>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ServiceWorkerBootstrap />
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        <InstallPrompt />
      </body>
    </html>
  );
}
