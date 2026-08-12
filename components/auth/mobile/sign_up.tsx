"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import {
  AuthDivider,
  AuthField,
  AuthLayout,
  CheckedAgreement,
  AuthSocialButtons,
  PasswordField,
} from "@/components/auth/mobile/auth-form";
import { TermsAndPrivacy } from "@/components/terms-and-privacy/terms-and-privacy";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuth } from "@/components/auth/auth-provider";
import { handleAuthError, registerAccount } from "@/lib/auth/client";
import { signUpSchema } from "@/lib/auth/schemas";

type SignUpFieldErrors = Partial<
  Record<
    "firstName" | "lastName" | "email" | "phoneNumber" | "password" | "confirmPassword" | "termsAgreement",
    string
  >
>;

export const signUpAuthCopy = {
  title: "Create an account",
  subtitle: "Join other million shoppers in the country.",
};

type SignUpFormProps = {
  onTermsClick?: () => void;
};

function TermsAndPrivacyTrigger({
  onTermsClick,
}: {
  onTermsClick?: () => void;
}) {
  const trigger = (
    <button
      type="button"
      className="font-semibold text-primary"
      onClick={(event) => {
        if (!onTermsClick) return;

        event.preventDefault();
        event.stopPropagation();
        onTermsClick();
      }}
    >
      Ts&Cs and Privacy Policy
    </button>
  );

  if (onTermsClick) {
    return trigger;
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="w-full data-[vaul-drawer-direction=right]:w-full sm:max-w-110">
        <DrawerHeader className="py-4 px-8 text-left">
          <DrawerClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-ml-2 size-9"
              aria-label="Close terms and privacy drawer"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
          </DrawerClose>

          <DrawerTitle className="sr-only">Terms & Privacy</DrawerTitle>
        </DrawerHeader>

        <div className="no-scrollbar overflow-y-auto px-8 pb-12 pt-4">
          <TermsAndPrivacy />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function SignUpForm({ onTermsClick }: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const nextPath = searchParams.get("next") ?? "/account/profile";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreement, setTermsAgreement] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = useMemo(
    () =>
      [
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "Includes a lowercase letter", met: /[a-z]/.test(password) },
        { label: "Includes an uppercase letter", met: /[A-Z]/.test(password) },
        { label: "Includes a number", met: /\d/.test(password) },
        {
          label: "Includes a special character",
          met: /[!@#$%^&*(),.?":{}|<>_\-=[\]\\;/`~+]/.test(password),
        },
      ] as const,
    [password],
  );

  const applyValidation = () => {
    const result = signUpSchema.safeParse({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      termsAgreement,
    });

    if (result.success) {
      setFieldErrors({});
      return result.data;
    }

    const nextErrors: SignUpFieldErrors = {};

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0] as keyof SignUpFieldErrors | undefined;

      if (fieldName && !nextErrors[fieldName]) {
        nextErrors[fieldName] = issue.message;
      }
    }

    setFieldErrors(nextErrors);
    return null;
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setFormError(null);

        const values = applyValidation();

        if (!values) {
          return;
        }

        setIsSubmitting(true);

        try {
          const session = await registerAccount(values);
          signIn(session);
          router.replace(nextPath);
        } catch (error) {
          const normalized = handleAuthError(error);

          if (normalized.fieldErrors) {
            const nextErrors: SignUpFieldErrors = {};

            for (const [key, messages] of Object.entries(normalized.fieldErrors)) {
              if (messages?.[0]) {
                nextErrors[key as keyof SignUpFieldErrors] = messages[0];
              }
            }

            setFieldErrors((current) => ({ ...current, ...nextErrors }));
          }

          setFormError(normalized.message);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="grid gap-4">
        <AuthField
          id="first-name"
          name="firstName"
          label="First Name*"
          placeholder=""
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          error={fieldErrors.firstName}
        />
        <AuthField
          id="last-name"
          name="lastName"
          label="Last Name*"
          placeholder=""
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          error={fieldErrors.lastName}
        />
        <AuthField
          id="email"
          name="email"
          label="Email*"
          type="email"
          placeholder=""
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />
        <AuthField
          id="phone-number"
          name="phoneNumber"
          label="Phone Number*"
          type="tel"
          placeholder=""
          autoComplete="tel"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          error={fieldErrors.phoneNumber}
        />
        <PasswordField
          label="Password*"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
        />
        <PasswordField
          id="confirm-password"
          label="Confirm Password*"
          autoComplete="new-password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={fieldErrors.confirmPassword}
        />

        <CheckedAgreement
          id="terms-agreement"
          name="termsAgreement"
          checkboxPosition="end"
          checked={termsAgreement}
          onCheckedChange={(checked) => setTermsAgreement(Boolean(checked))}
          required
        >
          I have read and agree with{" "}
          <TermsAndPrivacyTrigger onTermsClick={onTermsClick} />
        </CheckedAgreement>
        {fieldErrors.termsAgreement ? (
          <p className="text-xs text-destructive">{fieldErrors.termsAgreement}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        {passwordRequirements.map((requirement) => (
          <p
            key={requirement.label}
            className={
              requirement.met
                ? "text-xs text-emerald-600"
                : "text-xs text-muted-foreground"
            }
          >
            {requirement.label}
          </p>
        ))}
      </div>

      {formError ? (
        <p className="text-xs text-destructive">{formError}</p>
      ) : null}

      <div className="grid gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Get Started"}
        </Button>
        <AuthDivider />
        <AuthSocialButtons />
      </div>
    </form>
  );
}

export function SignUpMobile() {
  return (
    <AuthLayout
      title={signUpAuthCopy.title}
      subtitle={signUpAuthCopy.subtitle}
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary"
            transitionTypes={["cross-fade"]}
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
