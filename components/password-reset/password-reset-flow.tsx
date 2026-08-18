"use client";

import Link from "next/link";
import { ViewTransition } from "react";
import { useState } from "react";
import { CircleCheck, KeyRound, Mail, UserRoundPlus } from "lucide-react";

import { Logomark } from "@/components/brand/logomark";
import { Logotype } from "@/components/brand/logotype";
import { CheckYourEmail } from "@/components/password-reset/check-your-email";
import { ForgotPasswordStep } from "@/components/password-reset/forgot-password";
import { PasswordResetFooter } from "@/components/password-reset/password-reset-footer";
import { PasswordResetProgress } from "@/components/password-reset/password-reset-progress";
import { SetNewPassword } from "@/components/password-reset/set-new-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  confirmPasswordReset,
  handleAuthError,
  requestPasswordReset,
} from "@/lib/auth/client";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/auth/schemas";
import { cn } from "@/lib/utils";

type PasswordResetStep = 1 | 2 | 3 | 4;

type PasswordResetFlowProps = {
  step?: PasswordResetStep;
  email?: string;
  uid?: string;
  token?: string;
};

const sidebarSteps = [
  {
    title: "Forgot Password?",
    description: "We'll send you reset instructions.",
    icon: KeyRound,
  },
  {
    title: "Check your email",
    description: "We sent a password reset link to your email",
    icon: Mail,
  },
  {
    title: "Set new password",
    description:
      "Your new password must be different to previously used passwords.",
    icon: UserRoundPlus,
  },
  {
    title: "Password reset",
    description:
      "Your password has been successfully reset. Click below to log in magically.",
    icon: CircleCheck,
  },
] as const;

function PasswordResetSidebar({ step }: { step: PasswordResetStep }) {
  const activeIndex = step - 1;

  return (
    <aside className="hidden gap-20 bg-muted-foreground/5 pr-4 pl-12 pt-12 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:self-start">
      <Link href="/" transitionTypes={["cross-fade"]} className="inline-flex items-center gap-3">
        <Logomark className="size-10" aria-hidden="true" />
        <Logotype className="h-6 w-28" aria-hidden="true" />
        <span className="sr-only">Boltshift home</span>
      </Link>

      <div className="grid gap-8">
        {sidebarSteps.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;

          return (
            <div key={item.title} className="relative flex gap-4">
              {index < sidebarSteps.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-6 top-13 w-0.5 bg-border rounded-xs",
                    index === 2 ? "h-12" : "h-7",
                  )}
                />
              ) : null}

              <div
                className={cn(
                  "h-12 w-12 flex shrink-0 items-center justify-center rounded-xl border bg-background shadow-sm",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
              </div>

              <div className="grid gap-0.5 text-base">
                <p
                  className={cn(
                    "font-semibold",
                    isActive ? "text-foreground/90" : "text-muted-foreground",
                  )}
                >
                  {item.title}
                </p>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function PasswordResetComplete() {
  return (
    <section className="m-auto flex max-w-84 flex-col gap-20 text-foreground sm:w-84">
      <Card className="gap-8 border-0 bg-transparent p-0 shadow-none">
        <CardHeader className="items-center justify-center gap-6 p-0 text-center">
          <div className="m-auto flex h-14 w-14 items-center justify-center rounded-full text-primary">
            <CircleCheck size={28} />
          </div>

          <div className="grid gap-3">
            <CardTitle className="text-3xl font-semibold">
              Password reset
            </CardTitle>

            <CardDescription className="text-base">
              Your password has been successfully reset. Click below to log in
              magically.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Button asChild size="lg" className="w-full">
            <Link href="/sign-in" transitionTypes={["cross-fade"]}>
              Back to log in
            </Link>
          </Button>
        </CardContent>
      </Card>

      <PasswordResetProgress step={4} />

      <PasswordResetFooter className="mt-auto px-10" />
    </section>
  );
}

export function PasswordResetFlow({
  step = 1,
  email = "",
  uid = "",
  token = "",
}: PasswordResetFlowProps = {}) {
  const [currentStep, setCurrentStep] = useState(step);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentUid] = useState(uid);
  const [currentToken] = useState(token);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [isSendingSuccessEmail, setIsSendingSuccessEmail] = useState(false);
  const [sendError, setSendError] = useState<string | undefined>();
  const [successEmailError, setSuccessEmailError] = useState<string | undefined>();

  const handleForgotPasswordSubmit = async (submittedEmail: string) => {
    setCurrentEmail(submittedEmail);
    setSendError(undefined);
    setIsSendingResetEmail(true);

    try {
      const validation = forgotPasswordSchema.safeParse({
        email: submittedEmail,
      });

      if (!validation.success) {
        throw new Error(validation.error.issues[0]?.message ?? "Invalid email.");
      }

      await requestPasswordReset(validation.data.email);
      setCurrentStep(3);
    } catch (error) {
      const normalized = handleAuthError(error);
      setSendError(normalized.message);
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handlePasswordResetSubmit = async (
    password: string,
    confirmPassword: string,
  ) => {
    setSuccessEmailError(undefined);
    setIsSendingSuccessEmail(true);

    try {
      const validation = resetPasswordSchema.safeParse({
        password,
        confirmPassword,
      });

      if (!validation.success) {
        throw new Error(
          validation.error.issues[0]?.message ?? "Invalid password.",
        );
      }

      if (!currentUid || !currentToken) {
        throw new Error(
          "Your reset link is missing required token information. Please request a new link.",
        );
      }

      await confirmPasswordReset({
        uid: currentUid,
        token: currentToken,
        password: validation.data.password,
        confirmPassword: validation.data.confirmPassword,
      });
      setCurrentStep(4);
    } catch (error) {
      const normalized = handleAuthError(error);
      setSuccessEmailError(normalized.message);
    } finally {
      setIsSendingSuccessEmail(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-[calc(100vh-2rem)] bg-background lg:grid-cols-[30rem_minmax(0,1fr)] lg:items-start">
        <PasswordResetSidebar step={currentStep} />

        <div className="py-10">
          <ViewTransition
            key={currentStep}
            name="password-reset-step"
            share="auto"
            enter="auto"
            default="none"
          >
            {currentStep === 1 ? (
              <ForgotPasswordStep
                defaultEmail={currentEmail}
                onSubmit={handleForgotPasswordSubmit}
                isSubmitting={isSendingResetEmail}
                errorMessage={sendError}
              />
            ) : currentStep === 2 ? (
              <CheckYourEmail
                email={currentEmail}
                onSubmit={() => {
                  setCurrentStep(3);
                }}
              />
            ) : currentStep === 3 ? (
              <SetNewPassword
                onSubmit={handlePasswordResetSubmit}
                isSubmitting={isSendingSuccessEmail}
                errorMessage={successEmailError}
              />
            ) : (
              <PasswordResetComplete />
            )}
          </ViewTransition>
        </div>
      </div>
    </main>
  );
}
