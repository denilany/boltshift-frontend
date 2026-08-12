import { Metadata } from "next";
import { Navbar, NavbarMobile } from "@/components/navigation/navbar";
import { Footer } from "@/components/footer/footer-section";
import { AccountSidenav } from "@/components/accounts/account-sidenav";
import { SectionTitle } from "@/components/section-title";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),

  title: "Account",

  description: "User account details",

  openGraph: {
    url: "/account",
    title: "Account | Boltshift",
    description:
      "Explore a wide range of products on Boltshift. Find the best deals across multiple categories.",
    siteName: "Boltshift",
    images: [
      {
        url: "/opengraph-image.png",
        width: 7680,
        height: 4320,
        alt: "Boltshift Catalog",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Account | Boltshift",
    description:
      "Browse products across categories on Boltshift and find what you need.",
    images: ["/opengraph-image.png"],
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden">
      {/* Navbar */}
      <div>
        <div className="hidden md:block">
          <Navbar />
        </div>
        <div className="block md:hidden">
          <NavbarMobile />
        </div>
      </div>

      <SectionTitle
        title="Account"
        icon="/section-title-icons/Gear.svg"
        alt="Gear icon"
        className="py-4"
      />

      <div className="flex min-w-0 flex-col gap-4 pb-12 lg:flex-row">
        <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start lg:shrink-0">
          <AccountSidenav />
        </div>

        <main className="min-w-0 flex-1">
          <AuthGuard>{children}</AuthGuard>
        </main>
      </div>

      <Footer />
    </div>
  );
}
