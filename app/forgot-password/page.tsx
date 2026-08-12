import type { Metadata } from "next";

import { PasswordResetFlow } from "@/components/password-reset/password-reset-flow";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset for your Boltshift account.",
};

type ForgotPasswordPageProps = {
  searchParams?: {
    step?: string;
    email?: string;
    uid?: string;
    token?: string;
  };
};

export default function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const step = Number(searchParams?.step);
  const email = searchParams?.email ?? "";
  const uid = searchParams?.uid ?? "";
  const token = searchParams?.token ?? "";

  return (
    <PasswordResetFlow
      step={step === 3 ? 3 : 1}
      email={email}
      uid={uid}
      token={token}
    />
  );
}
