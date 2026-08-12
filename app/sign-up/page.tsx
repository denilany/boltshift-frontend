import { Metadata } from "next";
import { Suspense } from "react";

import { SignUpDesktop } from "@/components/auth/desktop/sign_up";
import { SignUpMobile } from "@/components/auth/mobile/sign_up";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Boltshift account.",
};

function SignUpPageFallback() {
  return (
    <div className="min-h-screen bg-background px-6 py-10 lg:p-12">
      <div className="grid h-full w-full gap-6 lg:grid-cols-2">
        <div className="hidden overflow-hidden rounded-3xl bg-muted/30 lg:block">
          <div className="h-full w-full animate-pulse bg-muted/40" />
        </div>

        <div className="flex min-h-[70vh] items-center justify-center lg:min-h-0">
          <div className="grid w-full max-w-90 gap-6 px-2 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto h-12 w-40 animate-pulse rounded-full bg-muted/40" />
            <div className="grid gap-3 text-center">
              <div className="mx-auto h-9 w-48 animate-pulse rounded bg-muted/40" />
              <div className="mx-auto h-5 w-64 animate-pulse rounded bg-muted/30" />
            </div>
            <div className="grid gap-4">
              <div className="h-12 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-12 animate-pulse rounded-2xl bg-muted/40" />
              <div className="h-12 animate-pulse rounded-2xl bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpPageFallback />}>
      <div className="lg:hidden">
        <SignUpMobile />
      </div>
      <div className="hidden lg:block">
        <SignUpDesktop />
      </div>
    </Suspense>
  );
}
