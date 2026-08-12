"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  AuthDivider,
  AuthField,
  AuthLayout,
  AuthSocialButtons,
  PasswordField,
} from "@/components/auth/mobile/auth-form";
import { Button } from "@/components/ui/button";
import { loginAccount } from "@/lib/auth/client";
import { useAuth } from "@/components/auth/auth-provider";
import { handleAuthError } from "@/lib/auth/client";
import { signInSchema } from "@/lib/auth/schemas";

type SignInFieldErrors = Partial<Record<"email" | "password", string>>;

export const signInAuthCopy = {
  title: "Welcome back",
  subtitle: "Please enter your details.",
};

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const nextPath = searchParams.get("next") ?? "/account/profile";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<SignInFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFieldErrors = useMemo(
    () => Object.keys(fieldErrors).length > 0,
    [fieldErrors],
  );

  const applyValidation = () => {
    const result = signInSchema.safeParse({
      email,
      password,
    });

    if (result.success) {
      setFieldErrors({});
      return result.data;
    }

    const nextErrors: SignInFieldErrors = {};

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0] as keyof SignInFieldErrors | undefined;

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
          const session = await loginAccount(values);
          signIn(session);
          router.replace(nextPath);
        } catch (error) {
          const normalized = handleAuthError(error);

          if (normalized.fieldErrors) {
            const nextErrors: SignInFieldErrors = {};

            for (const [key, messages] of Object.entries(normalized.fieldErrors)) {
              if (messages?.[0] && key in { email: true, password: true }) {
                nextErrors[key as keyof SignInFieldErrors] = messages[0];
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
      <div className="grid gap-3">
        <AuthField
          id="email"
          name="email"
          label="Email"
          placeholder=""
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />

        <PasswordField
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
        />
      </div>

      <div className="flex items-center justify-end gap-4">
        <Link
          href="/forgot-password"
          className="shrink-0 text-xs font-semibold text-primary"
          transitionTypes={["cross-fade"]}
        >
          Forgot password
        </Link>
      </div>

      {formError ? (
        <p className="text-xs text-destructive">{formError}</p>
      ) : null}

      {hasFieldErrors ? (
        <p className="text-xs text-muted-foreground">
          Please correct the highlighted fields.
        </p>
      ) : null}

      <div className="grid gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        <AuthDivider />
        <AuthSocialButtons />
      </div>
    </form>
  );
}

export function SignInMobile() {
  return (
    <AuthLayout
      title={signInAuthCopy.title}
      subtitle={signInAuthCopy.subtitle}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-primary"
            transitionTypes={["cross-fade"]}
          >
            Sign up
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthLayout>
  );
}
